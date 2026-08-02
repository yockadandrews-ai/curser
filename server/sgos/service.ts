import type { Plate, TagEvent, SmsLog } from '@prisma/client';
import { prisma } from './prisma.js';
import { normalizePlateCode } from './normalize.js';
import {
  classifyPlate,
  buildBatchSummarySms,
  buildDispatchSms,
  buildAckConfirmationSms,
  parseAckFromText,
  type DispatchChannel,
  type AckCode,
} from './classifier.js';
import { buildFieldTagSms } from './templates.js';
import { sendSms, getSendblueConfig } from './sendblue.js';

export async function getOperatorPhone(): Promise<string> {
  const row = await prisma.appSetting.findUnique({ where: { key: 'operator_phone' } });
  return row?.value ?? process.env.SGOS_OPERATOR_PHONE ?? '+12025550147';
}

export async function setOperatorPhone(phone: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: 'operator_phone' },
    create: { key: 'operator_phone', value: phone },
    update: { value: phone },
  });
}

export async function findPlateByCode(raw: string): Promise<Plate | null> {
  const normalized = normalizePlateCode(raw);
  return prisma.plate.findFirst({
    where: { normalized, isActive: true },
  });
}

export async function searchPlates(query?: string, limit = 100): Promise<Plate[]> {
  if (!query?.trim()) {
    return prisma.plate.findMany({ where: { isActive: true }, take: limit, orderBy: { plate: 'asc' } });
  }
  const q = query.trim();
  return prisma.plate.findMany({
    where: {
      isActive: true,
      OR: [
        { plate: { contains: q, mode: 'insensitive' } },
        { normalized: { contains: normalizePlateCode(q) } },
        { callSign: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { zone: { contains: q, mode: 'insensitive' } },
        { ownerName: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: { plate: 'asc' },
  });
}

export async function getPlateCount(): Promise<number> {
  return prisma.plate.count({ where: { isActive: true } });
}

interface FieldTagOptions {
  plate: string;
  phone?: string;
  taggedBy?: string;
  source?: string;
  rawInput?: string;
}

export async function processFieldTag(opts: FieldTagOptions) {
  const record = await findPlateByCode(opts.plate);
  if (!record) {
    return { error: 'not_found' as const, normalized: normalizePlateCode(opts.plate) };
  }

  const classified = classifyPlate(record);
  const body = await buildFieldTagSms(record, classified);
  const phone = opts.phone ?? (await getOperatorPhone());

  const tagEvent = await prisma.tagEvent.create({
    data: {
      plateId: record.id,
      taggedBy: opts.taggedBy,
      source: opts.source ?? 'FIELD_TAG',
      scenario: classified.scenario,
      rawInput: opts.rawInput ?? opts.plate,
    },
  });

  const result = await sendSms(phone, body);

  const smsLog = await prisma.smsLog.create({
    data: {
      tagEventId: tagEvent.id,
      plateId: record.id,
      messageId: result.messageId || null,
      toNumber: phone,
      body,
      status: result.status === 'failed' ? 'failed' : result.status === 'mock' ? 'sent' : 'sent',
    },
  });

  return { record, classified, tagEvent, sms: result, smsLog };
}

export async function processBatchLog(plates: string[], phone?: string) {
  const results: Array<{ plate: string; found: boolean; scenario?: string; sms?: string }> = [];
  const decoded: Array<{ plate: Plate; scenario: string }> = [];
  const operatorPhone = phone ?? (await getOperatorPhone());

  for (const raw of plates) {
    const record = await findPlateByCode(raw);
    if (!record) {
      results.push({ plate: normalizePlateCode(raw), found: false });
      continue;
    }

    const classified = classifyPlate(record);
    const body = await buildFieldTagSms(record, classified);

    const tagEvent = await prisma.tagEvent.create({
      data: {
        plateId: record.id,
        source: 'BATCH',
        scenario: classified.scenario,
        rawInput: raw,
      },
    });

    const sendResult = await sendSms(operatorPhone, body);
    await prisma.smsLog.create({
      data: {
        tagEventId: tagEvent.id,
        plateId: record.id,
        messageId: sendResult.messageId || null,
        toNumber: operatorPhone,
        body,
        status: sendResult.status === 'failed' ? 'failed' : 'sent',
      },
    });

    decoded.push({ plate: record, scenario: classified.scenario });
    results.push({ plate: record.plate, found: true, scenario: classified.scenario, sms: body });
  }

  let summarySms: string | undefined;
  if (decoded.length > 0) {
    summarySms = buildBatchSummarySms(
      decoded.map((d) => ({ plate: d.plate.plate, scenario: d.scenario, location: d.plate.location })),
    );
    const summaryResult = await sendSms(operatorPhone, summarySms);
    await prisma.smsLog.create({
      data: {
        messageId: summaryResult.messageId || null,
        toNumber: operatorPhone,
        body: summarySms,
        status: summaryResult.status === 'failed' ? 'failed' : 'sent',
      },
    });
  }

  return { total: plates.length, found: decoded.length, results, summarySms };
}

export async function processDispatch(channel: DispatchChannel, etaMinutes: number, notes?: string, phone?: string) {
  const body = buildDispatchSms(channel, etaMinutes, notes);
  const operatorPhone = phone ?? (await getOperatorPhone());
  const result = await sendSms(operatorPhone, body);

  const smsLog = await prisma.smsLog.create({
    data: {
      messageId: result.messageId || null,
      toNumber: operatorPhone,
      body,
      status: result.status === 'failed' ? 'failed' : 'sent',
    },
  });

  return { channel, etaMinutes, sms: result, smsLog };
}

export async function processAck(code: AckCode, plateRaw?: string, phone?: string, receivedFrom?: string) {
  const operatorPhone = phone ?? (await getOperatorPhone());
  let tagEvent: TagEvent | null = null;

  if (plateRaw) {
    const record = await findPlateByCode(plateRaw);
    if (record) {
      tagEvent = await prisma.tagEvent.findFirst({
        where: { plateId: record.id },
        orderBy: { createdAt: 'desc' },
      });
      if (tagEvent) {
        await prisma.ack.create({
          data: { tagEventId: tagEvent.id, code, receivedFrom },
        });
      }
    }
  }

  const body = buildAckConfirmationSms(code, plateRaw ? normalizePlateCode(plateRaw) : undefined);
  const result = await sendSms(operatorPhone, body);

  const smsLog = await prisma.smsLog.create({
    data: {
      tagEventId: tagEvent?.id,
      plateId: tagEvent ? (await prisma.tagEvent.findUnique({ where: { id: tagEvent.id } }))?.plateId : undefined,
      messageId: result.messageId || null,
      toNumber: operatorPhone,
      body,
      status: result.status === 'failed' ? 'failed' : 'sent',
    },
  });

  return { code, sms: result, smsLog, tagEventId: tagEvent?.id };
}

export async function markSmsDelivered(messageId: string): Promise<SmsLog | null> {
  try {
    return await prisma.smsLog.update({
      where: { messageId },
      data: { status: 'delivered', deliveredAt: new Date() },
    });
  } catch {
    return null;
  }
}

export async function getRecentLogs(limit = 50) {
  return prisma.smsLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      plate: { select: { plate: true, tier: true } },
      tagEvent: { select: { source: true, scenario: true } },
    },
  });
}

export async function processInboundSms(content: string, from?: string) {
  const ack = parseAckFromText(content);
  if (!ack) return { parsed: null as AckCode | null };

  const result = await processAck(ack, undefined, undefined, from);
  return { parsed: ack, ...result };
}

export type { AckCode, DispatchChannel };
