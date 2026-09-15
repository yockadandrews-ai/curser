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
    bridgeClock: string;
    queueCheck: string;
    leadScoring: string;
    continuity: string;
    connectionMove: string;
    spiritReflection: string;
  };
  workflowImportPath: string;
  bridgeWorkflowImportPath: string;
  schedule: Record<string, string>;
  bridgeSchedule: Record<string, string>;
  envVars: string[];
  bridgeEnvVars: string[];
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
      bridgeClock: `${APP_BASE}/api/33333/bridge/clock`,
      queueCheck: `${APP_BASE}/api/33333/n8n/queue-check`,
      leadScoring: `${APP_BASE}/api/33333/n8n/lead-scoring`,
      continuity: `${APP_BASE}/api/33333/n8n/continuity`,
      connectionMove: `${APP_BASE}/api/33333/bridge/connection-move`,
      spiritReflection: `${APP_BASE}/api/33333/bridge/spirit-reflection`,
    },
    workflowImportPath: 'docs/n8n/33333-autopilot-revenue-engine.workflow.json',
    bridgeWorkflowImportPath: 'docs/n8n/bridge-33333.workflow.json',
    schedule: {
      air: '07:00 — trends → Gemini → Content Queue',
      fire: '10:00 — publish approved → YouTube/IG/Blog',
      water: '14:00 — engage + abandoned cart',
      earth: '18:00 — syndicate top performer',
      lockdown: '21:00 — revenue + health check',
    },
    bridgeSchedule: {
      air: '07:00 ET — W1 content ideas + W3 scripts + queue check',
      fire: '10:10 ET — W6-W10 side hustle execution',
      water: '14:22 ET — W4 LinkedIn + connection move',
      earth: '18:00 ET — W2 publish + W5 newsletter + metrics',
      spirit: '21:33 ET — queue verify + archive + lockdown',
      flow: 'Background — lead scoring, CRM sync, shortform prep',
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
    bridgeEnvVars: [
      'N8N_WEBHOOK_URL',
      'RESUME_API_WEBHOOK',
      'CHATBOT_WEBHOOK',
      'GHOSTWRITING_WEBHOOK',
      'SLACK_WEBHOOK_URL',
    ],
    governance: '33333 consumer lane only · SGOS/Hermes governance stays separate',
  };
}

export function verify33333Secret(headerValue: string | undefined): boolean {
  const secret = process.env.N33333_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  return headerValue === secret;
}
