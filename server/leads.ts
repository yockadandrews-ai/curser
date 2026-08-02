import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import type { SupportedLocale } from './i18n/languages.js';
import { DEFAULT_LOCALE, detectLocaleFromHeader, normalizeLocale } from './i18n/languages.js';
import { getLocalePreference } from './i18n/preferences.js';

export type LeadSourceApp = 'bridge-builder' | 'echo-scale';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  company?: string;
  preferredLocale: SupportedLocale | null;
  sourceApp: LeadSourceApp;
  acceptLanguage?: string;
  createdAt: string;
  updatedAt: string;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    preferred_locale TEXT,
    source_app TEXT NOT NULL,
    accept_language TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function mapLead(row: Record<string, unknown>): Lead {
  const pref = row.preferred_locale as string | null;
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) || undefined,
    company: (row.company as string) || undefined,
    preferredLocale: pref ? normalizeLocale(pref) : null,
    sourceApp: row.source_app as LeadSourceApp,
    acceptLanguage: (row.accept_language as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function getLeads(sourceApp?: LeadSourceApp): Lead[] {
  if (sourceApp) {
    return db.prepare('SELECT * FROM leads WHERE source_app = ? ORDER BY updated_at DESC')
      .all(sourceApp).map(r => mapLead(r as Record<string, unknown>));
  }
  return db.prepare('SELECT * FROM leads ORDER BY updated_at DESC')
    .all().map(r => mapLead(r as Record<string, unknown>));
}

export function getLead(id: string): Lead | undefined {
  const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapLead(row) : undefined;
}

export function addLead(input: {
  name: string;
  email?: string;
  company?: string;
  preferredLocale?: SupportedLocale | string | null;
  sourceApp: LeadSourceApp;
  acceptLanguage?: string;
}): Lead {
  const now = new Date().toISOString();
  const locale = input.preferredLocale != null && input.preferredLocale !== '' && input.preferredLocale !== 'auto'
    ? normalizeLocale(input.preferredLocale)
    : null;
  const lead: Lead = {
    id: uuidv4(),
    name: input.name,
    email: input.email,
    company: input.company,
    preferredLocale: locale,
    sourceApp: input.sourceApp,
    acceptLanguage: input.acceptLanguage,
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(`
    INSERT INTO leads (id, name, email, company, preferred_locale, source_app, accept_language, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    lead.id, lead.name, lead.email || null, lead.company || null,
    lead.preferredLocale, lead.sourceApp, lead.acceptLanguage || null,
    lead.createdAt, lead.updatedAt,
  );
  return lead;
}

export function updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>): Lead | undefined {
  const existing = getLead(id);
  if (!existing) return undefined;
  const merged: Lead = {
    ...existing,
    ...updates,
    id,
    preferredLocale: updates.preferredLocale !== undefined
      ? (updates.preferredLocale ? normalizeLocale(String(updates.preferredLocale)) : null)
      : existing.preferredLocale,
    updatedAt: new Date().toISOString(),
  };
  db.prepare(`
    UPDATE leads SET name=?, email=?, company=?, preferred_locale=?, source_app=?, accept_language=?, updated_at=?
    WHERE id=?
  `).run(
    merged.name, merged.email || null, merged.company || null,
    merged.preferredLocale, merged.sourceApp, merged.acceptLanguage || null,
    merged.updatedAt, id,
  );
  return merged;
}

export function setLeadLocale(id: string, locale: string | null): Lead | undefined {
  if (locale === null || locale === '' || locale === 'auto') {
    return updateLead(id, { preferredLocale: null });
  }
  return updateLead(id, { preferredLocale: normalizeLocale(locale) });
}

export function enrichLeadWithLocale(lead: Lead, acceptLanguage?: string): Lead & {
  resolvedLocale: SupportedLocale;
  localeSource: 'lead' | 'browser' | 'account' | 'default';
} {
  const { locale, source } = resolveLeadLocale(lead.id, { acceptLanguage });
  return { ...lead, resolvedLocale: locale, localeSource: source };
}

/** Resolve effective locale for a lead — explicit > browser > account > default */
export function resolveLeadLocale(
  leadId: string,
  options?: { acceptLanguage?: string; accountLocale?: SupportedLocale },
): { locale: SupportedLocale; source: 'lead' | 'browser' | 'account' | 'default' } {
  const lead = getLead(leadId);
  if (!lead) {
    const account = options?.accountLocale ?? getLocalePreference();
    if (account !== DEFAULT_LOCALE) return { locale: account, source: 'account' };
    const browser = detectLocaleFromHeader(options?.acceptLanguage);
    if (browser !== DEFAULT_LOCALE) return { locale: browser, source: 'browser' };
    return { locale: DEFAULT_LOCALE, source: 'default' };
  }

  if (lead.preferredLocale) {
    return { locale: lead.preferredLocale, source: 'lead' };
  }

  const browserHeader = options?.acceptLanguage ?? lead.acceptLanguage;
  const fromBrowser = detectLocaleFromHeader(browserHeader);
  if (fromBrowser !== DEFAULT_LOCALE) {
    return { locale: fromBrowser, source: 'browser' };
  }

  const account = options?.accountLocale ?? getLocalePreference();
  if (account !== DEFAULT_LOCALE) {
    return { locale: account, source: 'account' };
  }

  return { locale: DEFAULT_LOCALE, source: 'default' };
}
