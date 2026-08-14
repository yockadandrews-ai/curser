/**
 * n8n integration config — Hermes calendar webhook
 */

const APP_BASE = (process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/$/, '');

export interface N8nHermesConfig {
  webhookUrl: string;
  configUrl: string;
  hermesReviewUrl: string;
  approveUrl: string;
  secretRequired: boolean;
  secretHeader: 'X-Hermes-Secret';
  titleFilters: string[];
  pollIntervalMinutes: number;
  governance: string;
  sampleBody: Record<string, string>;
  workflowImportPath: string;
}

export function getN8nHermesConfig(): N8nHermesConfig {
  return {
    webhookUrl: `${APP_BASE}/api/hermes/calendar/trigger`,
    configUrl: `${APP_BASE}/api/hermes/n8n/config`,
    hermesReviewUrl: `${APP_BASE}/hermes`,
    approveUrl: `${APP_BASE}/approve`,
    secretRequired: Boolean(process.env.HERMES_WEBHOOK_SECRET?.trim()),
    secretHeader: 'X-Hermes-Secret',
    titleFilters: [
      'SGOS Sprint',
      'LAUNCH · Sprint',
      'APPROVAL · Sprint',
      'SGOS Bundle Day',
    ],
    pollIntervalMinutes: 15,
    governance: 'Draft only · Sent=0 · No auto-publish · Human gate at /hermes',
    sampleBody: {
      title: 'SGOS Sprint 2 Build — Gas Station Snack Rankings',
      startDate: '2026-08-16',
      source: 'n8n',
    },
    workflowImportPath: 'docs/n8n/sgos-hermes-calendar.workflow.json',
  };
}

export function verifyN8nSecret(headerValue: string | undefined): boolean {
  const secret = process.env.HERMES_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  return headerValue === secret;
}
