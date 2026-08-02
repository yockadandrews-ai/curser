import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_LOCALE, normalizeLocale, type SgosLocale } from './locales.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, '../../messages');

type MessageTree = Record<string, unknown>;

const cache = new Map<string, MessageTree>();

function loadMessages(locale: SgosLocale): MessageTree {
  const cached = cache.get(locale);
  if (cached) return cached;

  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  let data: MessageTree;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf-8')) as MessageTree;
  } catch {
    data = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'en.json'), 'utf-8')) as MessageTree;
  }
  cache.set(locale, data);
  return data;
}

function getNested(obj: MessageTree, keyPath: string): string | undefined {
  const parts = keyPath.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as MessageTree)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function resolveLocale(
  explicit?: string | null,
  acceptLanguage?: string | null,
): SgosLocale {
  if (explicit) return normalizeLocale(explicit);
  if (acceptLanguage) {
    const parts = acceptLanguage.split(',').map((p) => p.split(';')[0].trim());
    for (const p of parts) {
      const n = normalizeLocale(p);
      if (n) return n;
    }
  }
  return DEFAULT_LOCALE;
}

export function t(locale: SgosLocale, key: string, vars?: Record<string, string | number>): string {
  const messages = loadMessages(locale);
  let str = getNested(messages, key) ?? getNested(loadMessages(DEFAULT_LOCALE), key) ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return str;
}

export function buildLocalizedSmsTemplate(
  locale: SgosLocale,
  scenario: string,
): string {
  const L = (k: string) => t(locale, `sms.labels.${k}`);
  const reply = t(locale, 'sms.replyHint');

  const templates: Record<string, string> = {
    'DRV-PICKUP': `${L('alert')} {{scenario}}
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('callsign')} {{callSign}}
${L('loc')} {{location}}
${L('contact')} {{contact}}
${L('action')} {{instructions}}
${L('zone')} {{zone}}
${L('time')} {{time}} ${L('utc')}
${reply}`,

    'PKG-DELIVERY': `${L('alert')} {{scenario}}
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('loc')} {{location}}
${L('contact')} {{contact}}
${L('action')} {{instructions}}
${L('zone')} {{zone}}
${L('time')} {{time}} ${L('utc')}
${reply}`,

    MTG: `${L('alert')} {{scenario}}
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('decode')} {{notes}}
${L('action')} {{instructions}}
${L('time')} {{time}} ${L('utc')}
${reply}`,

    GIFT: `${L('alert')} {{scenario}}
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('decode')} {{notes}}
${L('action')} {{instructions}}
${L('time')} {{time}} ${L('utc')}
${reply}`,

    WITNESS: `${L('alert')} {{scenario}}
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('decode')} {{notes}}
${L('action')} {{instructions}}
${L('time')} {{time}} ${L('utc')}`,

    'PKG-MTG': `${L('alert')} {{scenario}}
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('decode')} {{notes}}
${L('action')} {{instructions}}
${L('time')} {{time}} ${L('utc')}
${reply}`,

    FREEZE: `${L('alert')} FREEZE
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('loc')} {{location}}
${L('action')} {{instructions}}
${t(locale, 'sms.labels.freezeHold')}
${L('time')} {{time}} ${L('utc')}`,

    HOLD: `${L('alert')} HOLD
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('loc')} {{location}}
${L('action')} {{instructions}}
${t(locale, 'sms.labels.holdWait')}
${L('time')} {{time}} ${L('utc')}`,

    STANDARD: `${L('alert')} {{scenario}}
${L('plate')} {{plate}} | ${L('tier')}{{tier}}
${L('loc')} {{location}}
${L('action')} {{instructions}}
${L('time')} {{time}} ${L('utc')}`,
  };

  return templates[scenario] ?? templates.STANDARD;
}

export function buildLocalizedDispatchSms(
  locale: SgosLocale,
  channel: string,
  etaMinutes: number,
  notes?: string,
): string {
  const lines = [
    `${t(locale, 'sms.dispatch.header')} ${channel}`,
    t(locale, 'sms.dispatch.eta', { minutes: etaMinutes }),
  ];
  if (notes) lines.push(`${t(locale, 'sms.dispatch.notes')} ${notes}`);
  lines.push(t(locale, 'sms.dispatch.standby'));
  return lines.join('\n');
}

export function buildLocalizedAckSms(locale: SgosLocale, code: string, plateCode?: string): string {
  const keyMap: Record<string, string> = {
    'PKG-OK': 'sms.ack.pkgOk',
    'DRV-IN': 'sms.ack.drvIn',
    HOLD: 'sms.ack.hold',
    ABORT: 'sms.ack.abort',
  };
  const msg = t(locale, keyMap[code] ?? 'sms.ack.pkgOk');
  const prefix = t(locale, 'sms.ack.prefix');
  return plateCode ? `${prefix} ${plateCode} — ${msg}` : `${prefix} ${msg}`;
}

export function buildLocalizedBatchSummary(
  locale: SgosLocale,
  items: Array<{ plate: string; scenario: string; location?: string | null }>,
): string {
  const lines = [
    t(locale, 'sms.batch.header', { count: items.length }),
    '---',
  ];
  for (const item of items) {
    lines.push(`${item.plate} → ${item.scenario} @ ${item.location ?? '—'}`);
  }
  lines.push('---', t(locale, 'sms.batch.footer'));
  return lines.join('\n');
}

export { loadMessages };
