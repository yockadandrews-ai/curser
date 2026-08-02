/** Client-side language metadata — Phase 1 + Phase 2 */
export interface ClientLanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  phase: 1 | 2;
  rtl?: boolean;
}

export const CLIENT_LANGUAGES: ClientLanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', phase: 1 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', phase: 1 },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', phase: 1 },
  { code: 'fr', name: 'French', nativeName: 'Français', phase: 1 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', phase: 1 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', phase: 1 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', phase: 1 },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', phase: 1 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', phase: 1, rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', phase: 1 },
];

export const CLIENT_LANGUAGES_PHASE2: ClientLanguageMeta[] = [
  { code: 'it', name: 'Italian', nativeName: 'Italiano', phase: 2 },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', phase: 2 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', phase: 2 },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', phase: 2 },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', phase: 2 },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', phase: 2 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', phase: 2 },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', phase: 2 },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', phase: 2 },
];

export const ALL_CLIENT_LANGUAGES = [...CLIENT_LANGUAGES, ...CLIENT_LANGUAGES_PHASE2];

export function isRtlLocale(code: string): boolean {
  return ALL_CLIENT_LANGUAGES.find(l => l.code === code)?.rtl === true;
}
