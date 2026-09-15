import type { Express, Request, Response } from 'express';
import { getBrandLeads } from './db.js';
import { verify33333Secret } from './n8nConfig.js';
import {
  appendContinuity,
  buildSpiritReflection,
  determineElementBlock,
  getBackgroundOpsFlags,
  getConnectionMove,
  getContinuityReport,
  runQueueCheck,
  scoreLead,
  type ElementBlock,
} from './bridge.js';

function require33333Secret(req: Request, res: Response): boolean {
  if (!verify33333Secret(req.headers['x-33333-secret'] as string | undefined)) {
    res.status(401).json({ error: 'Invalid X-33333-Secret' });
    return false;
  }
  return true;
}

export function register33333BridgeRoutes(app: Express): void {
  /** Current elemental clock block (ET). Used by n8n Clock Watcher. */
  app.get('/api/33333/bridge/clock', (_req, res) => {
    const clock = determineElementBlock();
    res.json({ ...clock, backgroundOps: getBackgroundOpsFlags(clock) });
  });

  /** POST /api/33333/n8n/queue-check — verify daily draft payloads exist. */
  app.post('/api/33333/n8n/queue-check', (req, res) => {
    if (!require33333Secret(req, res)) return;
    const result = runQueueCheck({
      checkDay: req.body.checkDay,
      triggered_by: req.body.triggered_by,
      auraflow_exists: req.body.auraflow_exists,
      vaultverse_exists: req.body.vaultverse_exists,
    });
    if (!result.ok) {
      appendContinuity({
        time: 'queue-check',
        element: 'Spirit',
        action: 'Queue Check',
        detail: result.message,
        status: 'ALERT',
      });
    }
    res.json(result);
  });

  /** Webhook alias matching doc spec path segment. */
  app.post('/api/33333/webhook/queue-check-33333', (req, res) => {
    if (!require33333Secret(req, res)) return;
    res.json(runQueueCheck(req.body));
  });

  /** Water block — daily connection move. */
  app.get('/api/33333/bridge/connection-move', (_req, res) => {
    res.json(getConnectionMove());
  });

  /** Background ops — score all captured/nurtured leads. */
  app.post('/api/33333/n8n/lead-scoring', (req, res) => {
    if (!require33333Secret(req, res)) return;
    const leads = getBrandLeads(200).filter((l) => l.funnelStage !== 'churned');
    const scored = leads.map((lead) => ({
      id: lead.id,
      email: lead.email,
      brand: lead.brand,
      funnelStage: lead.funnelStage,
      ...scoreLead({
        email: lead.email,
        brand: lead.brand,
        funnelStage: lead.funnelStage,
        utmSource: lead.utmSource,
        revenueCents: lead.revenueCents,
      }),
    }));
    res.json({ count: scored.length, leads: scored });
  });

  /** Spirit block — end-of-day reflection. */
  app.get('/api/33333/bridge/spirit-reflection', (req, res) => {
    const errors = Number(req.query.errors ?? 0);
    res.json(buildSpiritReflection(Number.isFinite(errors) ? errors : 0));
  });

  /** Append + read _CONTINUITY_REPORT (server-side mirror). */
  app.post('/api/33333/n8n/continuity', (req, res) => {
    if (!require33333Secret(req, res)) return;
    const { time, element, action, detail, status, date } = req.body;
    if (!time || !element || !action) {
      return res.status(400).json({ error: 'time, element, action required' });
    }
    const row = appendContinuity({
      date,
      time: String(time),
      element: element as ElementBlock,
      action: String(action),
      detail: String(detail ?? ''),
      status: String(status ?? 'DONE'),
    });
    res.status(201).json(row);
  });

  app.get('/api/33333/bridge/continuity', (_req, res) => {
    res.json({ entries: getContinuityReport(100) });
  });
}
