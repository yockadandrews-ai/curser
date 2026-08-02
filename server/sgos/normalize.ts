export function normalizePlateCode(raw: string): string {
  return raw.replace(/[\s\-]/g, '').toUpperCase();
}
