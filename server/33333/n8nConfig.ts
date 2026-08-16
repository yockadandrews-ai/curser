const APP_BASE = (process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/$/, '');

export interface N8n33333Config {
  webhookSecretRequired: boolean;
  secretHeader: 'X-33333-Secret';
  endpoints: {
    publish: string;
    engagement: string;
    syndicate: string;
    leadCapture: string;
    stripeWebhook: string;
    dashboard: string;
    config: string;
  };
  workflowImportPath: string;
  schedule: Record<string, string>;
  envVars: string[];
  governance: string;
}

export function getN8n33333Config(): N8n33333Config {
  return {
    webhookSecretRequired: Boolean(process.env.N33333_WEBHOOK_SECRET?.trim()),
    secretHeader: 'X-33333-Secret',
    endpoints: {
      publish: `${APP_BASE}/api/content/publish`,
      engagement: `${APP_BASE}/api/engagement/pending`,
      syndicate: `${APP_BASE}/api/content/syndicate`,
      leadCapture: `${APP_BASE}/api/33333/leads`,
      stripeWebhook: `${APP_BASE}/api/webhooks/stripe`,
      dashboard: `${APP_BASE}/33333`,
      config: `${APP_BASE}/api/33333/n8n/config`,
    },
    workflowImportPath: 'docs/n8n/33333-autopilot-revenue-engine.workflow.json',
    schedule: {
      air: '07:00 — trends → Gemini → Content Queue',
      fire: '10:00 — publish approved → YouTube/IG/Blog',
      water: '14:00 — engage + abandoned cart',
      earth: '18:00 — syndicate top performer',
      lockdown: '21:00 — revenue + health check',
    },
    envVars: [
      'GEMINI_API_KEY',
      'GOOGLE_SHEET_ID',
      'GOOGLE_DRIVE_VAULT_FOLDER',
      'LEAD_MAGNET_BASE_URL',
      'FOUNDER_EMAIL',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'N33333_WEBHOOK_SECRET',
    ],
    governance: '33333 consumer lane only · SGOS/Hermes governance stays separate',
  };
}

export function verify33333Secret(headerValue: string | undefined): boolean {
  const secret = process.env.N33333_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  return headerValue === secret;
}
