import { db } from '../db.js';
import type { SupportedLocale } from './languages.js';
import { DEFAULT_LOCALE, normalizeLocale } from './languages.js';

const LOCALE_SETTING_KEY = 'user_locale';

function getSetting<T>(key: string, defaultValue: T): T {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  if (!row) return defaultValue;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return defaultValue;
  }
}

function setSetting(key: string, value: unknown): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
}

export function getLocalePreference(): SupportedLocale {
  return normalizeLocale(getSetting<string | null>(LOCALE_SETTING_KEY, null));
}

export function setLocalePreference(locale: string): SupportedLocale {
  const normalized = normalizeLocale(locale);
  setSetting(LOCALE_SETTING_KEY, normalized);
  return normalized;
}

export function getDefaultLocale(): SupportedLocale {
  return DEFAULT_LOCALE;
}
