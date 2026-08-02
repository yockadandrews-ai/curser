import { Router, type Request, type Response } from 'express';
import { isDatabaseConfigured, prisma } from './prisma.js';
import { normalizePlateCode } from './normalize.js';
import {
  processFieldTag,
  processBatchLog,
  processDispatch,
  processAck,
  markSmsDelivered,
  processInboundSms,
  getRecentLogs,
  getOperatorPhone,
  setOperatorPhone,
  searchPlates,
  findPlateByCode,
  getPlateCount,
  type AckCode,
  type DispatchChannel,
} from './service.js';
import { classifyPlate } from './classifier.js';
import { buildFieldTagSms } from './templates.js';
import { importPlates, parseCsvPlates, type ImportPlateRow } from './importPlates.js';
import { getSendblueConfig } from './sendblue.js';
import { seedDefaultTemplates } from './templates.js';

import { resolveLocale } from './i18n.js';

const router = Router();

function requestLocale(req: Request): import('./locales.js').SgosLocale {
  return resolveLocale(
    (req.body?.locale as string) ?? (req.query?.locale as string),
    req.headers['accept-language'],
  );
}

function requireDb(_req: Request, res: Response, next: () => void) {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({
      error: 'DATABASE_URL not configured. Start PostgreSQL: docker compose up -d',
    });
  }
  next();
}

router.use(requireDb);

function resolvePhone(req: Request): string | undefined {
  return (req.body?.phone as string) || undefined;
}

router.post('/field-tag', async (req: Request, res: Response) => {
  const rawPlate = req.body?.plate as string;
  if (!rawPlate?.trim()) return res.status(400).json({ error: 'plate required' });

  const result = await processFieldTag({
    plate: rawPlate,
    phone: resolvePhone(req),
    taggedBy: req.body?.taggedBy as string | undefined,
    source: 'FIELD_TAG',
    rawInput: rawPlate,
    locale: requestLocale(req),
  });

  if ('error' in result) {
    return res.status(404).json({ error: 'Plate not found in registry', plate: result.normalized });
  }

  res.json({
    ok: result.sms.status !== 'failed',
    plate: result.record,
    classified: result.classified,
    sms: result.sms,
    tagEvent: result.tagEvent,
    log: result.smsLog,
  });
});

router.post('/batch-log', async (req: Request, res: Response) => {
  const rawPlates = req.body?.plates as string[];
  if (!Array.isArray(rawPlates) || rawPlates.length === 0) {
    return res.status(400).json({ error: 'plates array required' });
  }

  const result = await processBatchLog(rawPlates, resolvePhone(req), requestLocale(req));
  res.json({ ok: true, ...result });
});

router.post('/dispatch', async (req: Request, res: Response) => {
  const channel = req.body?.channel as DispatchChannel;
  const etaMinutes = Number(req.body?.etaMinutes) || 15;
  const notes = req.body?.notes as string | undefined;

  const valid: DispatchChannel[] = ['HERMES', 'PORTAL', 'COURIER'];
  if (!valid.includes(channel)) {
    return res.status(400).json({ error: 'channel must be HERMES, PORTAL, or COURIER' });
  }

  const result = await processDispatch(channel, etaMinutes, notes, resolvePhone(req), requestLocale(req));
  res.json({ ok: result.sms.status !== 'failed', ...result });
});

router.post('/ack', async (req: Request, res: Response) => {
  const code = req.body?.code as AckCode;
  const plateCode = req.body?.plate as string | undefined;

  const valid: AckCode[] = ['PKG-OK', 'DRV-IN', 'HOLD', 'ABORT'];
  if (!valid.includes(code)) {
    return res.status(400).json({ error: 'code must be PKG-OK, DRV-IN, HOLD, or ABORT' });
  }

  const result = await processAck(code, plateCode, resolvePhone(req), req.body?.receivedFrom as string | undefined, requestLocale(req));
  res.json({ ok: result.sms.status !== 'failed', ...result });
});

router.get('/plates', async (req: Request, res: Response) => {
  const q = req.query.q as string | undefined;
  const limit = parseInt(req.query.limit as string) || 100;
  res.json(await searchPlates(q, limit));
});

router.get('/plates/:code', async (req: Request, res: Response) => {
  const record = await findPlateByCode(String(req.params.code));
  if (!record) return res.status(404).json({ error: 'Not found' });
  const classified = classifyPlate(record);
  const locale = requestLocale(req);
  const previewSms = await buildFieldTagSms(record, classified, undefined, locale);
  res.json({ plate: record, classified, previewSms });
});

router.get('/logs', async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(await getRecentLogs(limit));
});

router.get('/settings', async (_req: Request, res: Response) => {
  const sendblue = getSendblueConfig();
  res.json({
    operatorPhone: await getOperatorPhone(),
    mockSms: sendblue.mockMode,
    sendblueConfigured: !sendblue.mockMode,
    plateCount: await getPlateCount(),
    database: 'postgresql',
  });
});

router.put('/settings', async (req: Request, res: Response) => {
  const { operatorPhone } = req.body;
  if (operatorPhone) await setOperatorPhone(operatorPhone);
  res.json({
    operatorPhone: await getOperatorPhone(),
    mockSms: getSendblueConfig().mockMode,
  });
});

/** Import JSON array or CSV string — load 172+ plate master registry */
router.post('/import', async (req: Request, res: Response) => {
  const mode = (req.body?.mode as 'upsert' | 'replace') ?? 'upsert';

  let rows: ImportPlateRow[] = [];
  if (req.body?.plates && Array.isArray(req.body.plates)) {
    rows = req.body.plates as ImportPlateRow[];
  } else if (req.body?.csv && typeof req.body.csv === 'string') {
    rows = parseCsvPlates(req.body.csv);
  } else {
    return res.status(400).json({ error: 'Provide plates array or csv string' });
  }

  const result = await importPlates(rows, mode);
  res.json({ ok: true, ...result, plateCount: await getPlateCount() });
});

router.post('/seed', async (_req: Request, res: Response) => {
  const templates = await seedDefaultTemplates();
  res.json({ ok: true, templatesSeeded: templates });
});

router.post('/webhook/delivery', async (req: Request, res: Response) => {
  const messageId = req.body?.message_handle ?? req.body?.message_id;
  if (messageId) await markSmsDelivered(String(messageId));
  res.json({ ok: true });
});

router.post('/webhook/inbound', async (req: Request, res: Response) => {
  const content = (req.body?.content ?? req.body?.message ?? '') as string;
  const from = (req.body?.from_number ?? req.body?.from) as string | undefined;
  const result = await processInboundSms(content, from, requestLocale(req));
  res.json({ ok: true, ...result });
});

/** Health check for SGOS database */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, plates: await getPlateCount() });
  } catch (e) {
    res.status(503).json({ ok: false, error: String(e) });
  }
});

export default router;
