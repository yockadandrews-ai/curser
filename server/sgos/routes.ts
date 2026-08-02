import { Router, type Request, type Response } from 'express';
import { findPlate, searchPlates, normalizePlateCode, PLATE_REGISTRY } from './plateRegistry.js';
import {
  classifyPlate,
  buildFieldTagSms,
  buildBatchSummarySms,
  buildDispatchSms,
  buildAckConfirmationSms,
  parseAckFromText,
  type DispatchChannel,
  type AckCode,
} from './smsTemplates.js';
import { sendSms, getSendblueConfig } from './sendblue.js';
import {
  logSms,
  getRecentLogs,
  markDelivered,
  updateAck,
  getOperatorPhone,
  setSetting,
  getSetting,
} from './sgosDb.js';

const router = Router();

function resolvePhone(req: Request): string {
  return (req.body?.phone as string) || getOperatorPhone();
}

/** Field Tag — single plate lookup + SMS */
router.post('/field-tag', async (req: Request, res: Response) => {
  const rawPlate = req.body?.plate as string;
  if (!rawPlate?.trim()) {
    return res.status(400).json({ error: 'plate required' });
  }

  const plate = findPlate(rawPlate);
  if (!plate) {
    return res.status(404).json({
      error: 'Plate not found in registry',
      plate: normalizePlateCode(rawPlate),
    });
  }

  const classified = classifyPlate(plate);
  const body = buildFieldTagSms({ plate, classified });
  const phone = resolvePhone(req);
  const result = await sendSms(phone, body);

  const log = logSms({
    messageId: result.messageId || undefined,
    plateCode: plate.plateCode,
    scenario: classified.scenario,
    body,
    toNumber: phone,
    status: result.status,
    source: 'field-tag',
  });

  res.json({
    ok: result.status !== 'failed',
    plate,
    classified,
    sms: result,
    log,
  });
});

/** Batch Log — multiple plates */
router.post('/batch-log', async (req: Request, res: Response) => {
  const rawPlates = req.body?.plates as string[];
  if (!Array.isArray(rawPlates) || rawPlates.length === 0) {
    return res.status(400).json({ error: 'plates array required' });
  }

  const results: Array<{ plate: string; found: boolean; scenario?: string; sms?: string }> = [];
  const decoded: Array<{ plate: ReturnType<typeof findPlate>; classified: ReturnType<typeof classifyPlate> }> = [];

  for (const raw of rawPlates) {
    const plate = findPlate(raw);
    if (!plate) {
      results.push({ plate: normalizePlateCode(raw), found: false });
      continue;
    }
    const classified = classifyPlate(plate);
    decoded.push({ plate, classified });
    const sms = buildFieldTagSms({ plate, classified });
    results.push({ plate: plate.plateCode, found: true, scenario: classified.scenario, sms });

    const phone = resolvePhone(req);
    const sendResult = await sendSms(phone, sms);
    logSms({
      messageId: sendResult.messageId || undefined,
      plateCode: plate.plateCode,
      scenario: classified.scenario,
      body: sms,
      toNumber: phone,
      status: sendResult.status,
      source: 'batch-log',
    });
  }

  const phone = resolvePhone(req);
  let summarySms: string | undefined;
  if (decoded.length > 0) {
    const valid = decoded.filter((d): d is { plate: NonNullable<typeof d.plate>; classified: typeof d.classified } => !!d.plate);
    summarySms = buildBatchSummarySms(valid);
    const summaryResult = await sendSms(phone, summarySms);
    logSms({
      messageId: summaryResult.messageId || undefined,
      body: summarySms,
      toNumber: phone,
      status: summaryResult.status,
      source: 'batch-summary',
      scenario: 'BATCH',
    });
  }

  res.json({
    ok: true,
    total: rawPlates.length,
    found: decoded.length,
    results,
    summarySms,
  });
});

/** Dispatch — HERMES / PORTAL / COURIER */
router.post('/dispatch', async (req: Request, res: Response) => {
  const channel = req.body?.channel as DispatchChannel;
  const etaMinutes = Number(req.body?.etaMinutes) || 15;
  const notes = req.body?.notes as string | undefined;

  const valid: DispatchChannel[] = ['HERMES', 'PORTAL', 'COURIER'];
  if (!valid.includes(channel)) {
    return res.status(400).json({ error: 'channel must be HERMES, PORTAL, or COURIER' });
  }

  const body = buildDispatchSms(channel, etaMinutes, notes);
  const phone = resolvePhone(req);
  const result = await sendSms(phone, body);

  const log = logSms({
    messageId: result.messageId || undefined,
    body,
    toNumber: phone,
    status: result.status,
    source: 'dispatch',
    scenario: 'DISPATCH',
  });

  res.json({ ok: result.status !== 'failed', channel, etaMinutes, sms: result, log });
});

/** ACK — PKG-OK, DRV-IN, HOLD, ABORT */
router.post('/ack', async (req: Request, res: Response) => {
  const code = req.body?.code as AckCode;
  const plateCode = req.body?.plate as string | undefined;

  const valid: AckCode[] = ['PKG-OK', 'DRV-IN', 'HOLD', 'ABORT'];
  if (!valid.includes(code)) {
    return res.status(400).json({ error: 'code must be PKG-OK, DRV-IN, HOLD, or ABORT' });
  }

  if (plateCode) {
    updateAck(normalizePlateCode(plateCode), code);
  }

  const body = buildAckConfirmationSms(code, plateCode ? normalizePlateCode(plateCode) : undefined);
  const phone = resolvePhone(req);
  const result = await sendSms(phone, body);

  const log = logSms({
    messageId: result.messageId || undefined,
    plateCode: plateCode ? normalizePlateCode(plateCode) : undefined,
    body,
    toNumber: phone,
    status: result.status,
    source: 'ack',
    scenario: 'ACK',
  });

  res.json({ ok: result.status !== 'failed', code, sms: result, log });
});

/** Plate lookup */
router.get('/plates', (req: Request, res: Response) => {
  const q = req.query.q as string | undefined;
  res.json(searchPlates(q));
});

router.get('/plates/:code', (req: Request, res: Response) => {
  const code = String(req.params.code);
  const plate = findPlate(code);
  if (!plate) return res.status(404).json({ error: 'Not found' });
  const classified = classifyPlate(plate);
  res.json({ plate, classified, previewSms: buildFieldTagSms({ plate, classified }) });
});

/** SMS logs */
router.get('/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(getRecentLogs(limit));
});

/** Settings */
router.get('/settings', (_req: Request, res: Response) => {
  const sendblue = getSendblueConfig();
  res.json({
    operatorPhone: getOperatorPhone(),
    mockSms: sendblue.mockMode,
    sendblueConfigured: !sendblue.mockMode,
    plateCount: PLATE_REGISTRY.length,
  });
});

router.put('/settings', (req: Request, res: Response) => {
  const { operatorPhone } = req.body;
  if (operatorPhone) setSetting('operator_phone', operatorPhone);
  res.json({
    operatorPhone: getOperatorPhone(),
    mockSms: getSendblueConfig().mockMode,
  });
});

/** Webhooks — delivery confirmation & incoming ACK SMS */
router.post('/webhook/delivery', (req: Request, res: Response) => {
  const messageId = req.body?.message_handle ?? req.body?.message_id;
  if (messageId) markDelivered(String(messageId));
  res.json({ ok: true });
});

router.post('/webhook/inbound', async (req: Request, res: Response) => {
  const content = (req.body?.content ?? req.body?.message ?? '') as string;
  const ack = parseAckFromText(content);
  if (ack) {
    const phone = resolvePhone(req);
    const body = buildAckConfirmationSms(ack);
    await sendSms(phone, body);
    logSms({ body, toNumber: phone, status: 'sent', source: 'inbound-ack', scenario: 'ACK' });
  }
  res.json({ ok: true, parsed: ack });
});

export default router;
