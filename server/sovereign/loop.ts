/**
 * Sovereign Sales Autopilot — SG3 → Hermes → Ling → K3 loop orchestrator
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { writeLedgerEntry } from '../hermes/chaosLedger.js';
import type {
  HermesHandoffTicket,
  HermesRoute,
  InboundChannel,
  K3DeploymentResult,
  LingDemoPackage,
  N8nSovereignHandoff,
  QualifyAnswers,
  Sg3Emission,
  SovereignLoopState,
  SovereignVerticalId,
  TicketStatus,
} from './schemas.js';
import { getActiveVertical, SOVEREIGN_ACTIVE_VERTICAL, VERTICALS } from './config.js';
import {
  buildQualifyConversation,
  scoreLead,
  detectVerticalFromMessage,
  archiveReengageDays,
  nurtureSequenceDays,
} from './hermesGate.js';
import {
  buildLingDemoPackage,
  buildContractEmailBody,
  parseYesReply,
} from './lingCloser.js';
import { deployK3, recordDeploymentMetrics, buildK3HandoffPayload } from './k3Engine.js';
import { generateWeeklyEmissions, triggerCaseStudyFromDeployment } from './sg3Pulse.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS sovereign_tickets (
    id TEXT PRIMARY KEY,
    vertical TEXT NOT NULL,
    status TEXT NOT NULL,
    channel TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    source_message TEXT,
    qualify_answers_json TEXT,
    score_json TEXT,
    route TEXT,
    ling_demo_path TEXT,
    contract_sent_at TEXT,
    signed_at TEXT,
    k3_deployment_id TEXT,
    payload_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sovereign_tickets_status ON sovereign_tickets(status);
  CREATE INDEX IF NOT EXISTS idx_sovereign_tickets_vertical ON sovereign_tickets(vertical);

  CREATE TABLE IF NOT EXISTS sovereign_deployments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT,
    vertical TEXT NOT NULL,
    client_company TEXT NOT NULL,
    status TEXT NOT NULL,
    metrics_json TEXT,
    live_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sovereign_emissions (
    id TEXT PRIMARY KEY,
    vertical TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body_markdown TEXT NOT NULL,
    platforms_json TEXT,
    trigger_ref TEXT,
    scheduled_at TEXT,
    sent INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

function mapTicket(row: Record<string, unknown>): HermesHandoffTicket {
  return {
    id: row.id as string,
    vertical: row.vertical as SovereignVerticalId,
    status: row.status as TicketStatus,
    channel: row.channel as InboundChannel,
    name: row.name as string,
    email: (row.email as string) || undefined,
    company: (row.company as string) || undefined,
    sourceMessage: (row.source_message as string) || undefined,
    qualifyAnswers: row.qualify_answers_json
      ? JSON.parse(row.qualify_answers_json as string) as QualifyAnswers
      : undefined,
    score: row.score_json
      ? JSON.parse(row.score_json as string)
      : undefined,
    route: (row.route as HermesRoute) || undefined,
    lingDemoPath: (row.ling_demo_path as string) || undefined,
    contractSentAt: (row.contract_sent_at as string) || undefined,
    signedAt: (row.signed_at as string) || undefined,
    k3DeploymentId: (row.k3_deployment_id as string) || undefined,
    payloadJson: (row.payload_json as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function saveTicket(ticket: HermesHandoffTicket): HermesHandoffTicket {
  db.prepare(`
    INSERT OR REPLACE INTO sovereign_tickets (
      id, vertical, status, channel, name, email, company, source_message,
      qualify_answers_json, score_json, route, ling_demo_path,
      contract_sent_at, signed_at, k3_deployment_id, payload_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ticket.id, ticket.vertical, ticket.status, ticket.channel, ticket.name,
    ticket.email ?? null, ticket.company ?? null, ticket.sourceMessage ?? null,
    ticket.qualifyAnswers ? JSON.stringify(ticket.qualifyAnswers) : null,
    ticket.score ? JSON.stringify(ticket.score) : null,
    ticket.route ?? null, ticket.lingDemoPath ?? null,
    ticket.contractSentAt ?? null, ticket.signedAt ?? null,
    ticket.k3DeploymentId ?? null, ticket.payloadJson ?? null,
    ticket.createdAt, ticket.updatedAt,
  );
  return ticket;
}

function n8nHandoff(from: 'sg3' | 'hermes' | 'ling' | 'k3', to: 'sg3' | 'hermes' | 'ling' | 'k3', ticketId: string, action: string, payload: Record<string, unknown>): N8nSovereignHandoff {
  return {
    from,
    to,
    ticketId,
    action,
    payload,
    note: 'Wire in n8n — docs/n8n/sovereign-loop.workflow.json',
  };
}

export function ingestInbound(input: {
  channel: InboundChannel;
  name: string;
  email?: string;
  company?: string;
  message?: string;
  vertical?: SovereignVerticalId;
}): { ticket: HermesHandoffTicket; conversation: ReturnType<typeof buildQualifyConversation>; handoff: N8nSovereignHandoff } {
  const now = new Date().toISOString();
  const vertical = input.vertical || detectVerticalFromMessage(input.message || '') || SOVEREIGN_ACTIVE_VERTICAL;

  const ticket: HermesHandoffTicket = {
    id: uuidv4(),
    vertical,
    status: 'received',
    channel: input.channel,
    name: input.name,
    email: input.email,
    company: input.company,
    sourceMessage: input.message,
    createdAt: now,
    updatedAt: now,
  };

  ticket.status = 'qualifying';
  ticket.updatedAt = new Date().toISOString();
  saveTicket(ticket);

  writeLedgerEntry({
    kind: 'task_received',
    taskId: ticket.id,
    agentId: 'field_decoder',
    actor: 'hermes',
    summary: `Inbound ${input.channel}: ${input.name}`,
    attribution: `sovereign · vertical=${vertical}`,
    payload: { channel: input.channel, message: input.message },
    sent: 0,
  });

  const conversation = buildQualifyConversation(input.channel);
  const handoff = n8nHandoff('hermes', 'hermes', ticket.id, 'start_qualify', { ticketId: ticket.id });

  return { ticket, conversation, handoff };
}

export function submitQualifyAnswers(
  ticketId: string,
  answers: QualifyAnswers,
): {
  ticket: HermesHandoffTicket;
  route: HermesRoute;
  handoffs: N8nSovereignHandoff[];
  lingPackage?: LingDemoPackage;
} {
  const row = db.prepare('SELECT * FROM sovereign_tickets WHERE id = ?').get(ticketId) as Record<string, unknown> | undefined;
  if (!row) throw new Error('Ticket not found');

  let ticket = mapTicket(row);
  ticket.qualifyAnswers = answers;
  ticket.score = scoreLead(answers, ticket.vertical);
  ticket.route = ticket.score.route;
  ticket.updatedAt = new Date().toISOString();

  const handoffs: N8nSovereignHandoff[] = [];

  switch (ticket.route) {
    case 'ling':
      ticket.status = 'handed_to_ling';
      saveTicket(ticket);
      handoffs.push(n8nHandoff('hermes', 'ling', ticket.id, 'qualify_pass', { score: ticket.score.total }));
      break;
    case 'nurture':
      ticket.status = 'nurturing';
      saveTicket(ticket);
      handoffs.push(n8nHandoff('hermes', 'hermes', ticket.id, 'nurture_14d', { days: nurtureSequenceDays() }));
      break;
    default: {
      ticket.status = 'archived';
      saveTicket(ticket);
      handoffs.push(n8nHandoff('hermes', 'hermes', ticket.id, 'archive_90d', { reengageDays: archiveReengageDays() }));
      break;
    }
  }

  writeLedgerEntry({
    kind: 'task_routed',
    taskId: ticket.id,
    agentId: 'field_decoder',
    actor: 'hermes',
    summary: `Qualified score=${ticket.score.total} → ${ticket.route}`,
    attribution: 'Hermes Gate · qualify matrix',
    payload: { score: ticket.score, route: ticket.route },
    sent: 0,
  });

  let lingPackage: LingDemoPackage | undefined;
  if (ticket.route === 'ling') {
    lingPackage = buildLingDemoPackage(ticket);
    ticket.status = 'demo_sent';
    ticket.updatedAt = new Date().toISOString();
    saveTicket(ticket);
    handoffs.push(n8nHandoff('ling', 'ling', ticket.id, 'demo_sent', { company: ticket.company || ticket.name }));
  }

  return { ticket, route: ticket.route!, handoffs, lingPackage };
}

export function handleLingReply(
  ticketId: string,
  message: string,
): { ticket: HermesHandoffTicket; contractSent: boolean; handoffs: N8nSovereignHandoff[] } {
  const row = db.prepare('SELECT * FROM sovereign_tickets WHERE id = ?').get(ticketId) as Record<string, unknown> | undefined;
  if (!row) throw new Error('Ticket not found');

  let ticket = mapTicket(row);
  const handoffs: N8nSovereignHandoff[] = [];
  let contractSent = false;

  if (parseYesReply(message)) {
    const pkg = buildLingDemoPackage(ticket);
    const body = buildContractEmailBody(pkg);
    ticket.status = 'contract_sent';
    ticket.contractSentAt = new Date().toISOString();
    ticket.payloadJson = JSON.stringify({ contractEmailBody: body, stripeLink: pkg.contractPackage.stripeLinkPlaceholder });
    ticket.updatedAt = new Date().toISOString();
    saveTicket(ticket);
    contractSent = true;
    handoffs.push(n8nHandoff('ling', 'ling', ticket.id, 'contract_sent', { depositUsd: pkg.contractPackage.depositUsd }));
  }

  return { ticket, contractSent, handoffs };
}

export function recordSignature(
  ticketId: string,
  input?: { brandVoiceNotes?: string; crmType?: string; calendarLink?: string },
): { ticket: HermesHandoffTicket; deployment: K3DeploymentResult; handoffs: N8nSovereignHandoff[]; emission: Sg3Emission } {
  const row = db.prepare('SELECT * FROM sovereign_tickets WHERE id = ?').get(ticketId) as Record<string, unknown> | undefined;
  if (!row) throw new Error('Ticket not found');

  let ticket = mapTicket(row);
  const now = new Date().toISOString();
  ticket.status = 'signed';
  ticket.signedAt = now;
  ticket.updatedAt = now;

  const deployment = deployK3({
    vertical: ticket.vertical,
    clientCompany: ticket.company || ticket.name,
    brandVoiceNotes: input?.brandVoiceNotes,
    crmType: input?.crmType,
    calendarLink: input?.calendarLink,
    ticketId: ticket.id,
  });

  ticket.k3DeploymentId = deployment.deploymentId;
  ticket.status = 'k3_deploying';
  saveTicket(ticket);

  db.prepare(`
    INSERT INTO sovereign_deployments (id, ticket_id, vertical, client_company, status, metrics_json, live_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    deployment.deploymentId, ticket.id, deployment.vertical, deployment.clientCompany,
    deployment.status, JSON.stringify(deployment.metricsFeedToSg3),
    deployment.liveEnvironmentUrl ?? null, now, now,
  );

  ticket.status = deployment.status === 'live' ? 'live' : 'k3_deploying';
  ticket.updatedAt = new Date().toISOString();
  saveTicket(ticket);

  const emission = triggerCaseStudyFromDeployment(deployment);
  db.prepare(`
    INSERT INTO sovereign_emissions (id, vertical, type, title, body_markdown, platforms_json, trigger_ref, scheduled_at, sent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    emission.id, ticket.vertical, emission.type, emission.title, emission.bodyMarkdown,
    JSON.stringify(emission.platforms), emission.trigger ?? null, emission.scheduledAt ?? null, now,
  );

  const handoffs = [
    n8nHandoff('ling', 'k3', ticket.id, 'signature_received', buildK3HandoffPayload(deployment)),
    n8nHandoff('k3', 'sg3', ticket.id, 'deployment_live', { deploymentId: deployment.deploymentId }),
  ];

  writeLedgerEntry({
    kind: 'execution_handoff',
    taskId: ticket.id,
    agentId: 'content_factory',
    actor: 'k3',
    summary: `K3 deployed · ${deployment.clientCompany}`,
    attribution: 'Sovereign loop · signature → deploy',
    payload: deployment,
    sent: 0,
  });

  return { ticket, deployment, handoffs, emission };
}

export function updateDeploymentMetrics(
  deploymentId: string,
  metrics: { appointmentsBooked?: number; hoursSaved?: number; revenueGenerated?: number },
): { deployment: K3DeploymentResult; emission?: Sg3Emission } {
  const row = db.prepare('SELECT * FROM sovereign_deployments WHERE id = ?').get(deploymentId) as Record<string, unknown> | undefined;
  if (!row) throw new Error('Deployment not found');

  const existing = JSON.parse((row.metrics_json as string) || '{}');
  const deployment: K3DeploymentResult = {
    deploymentId: row.id as string,
    vertical: row.vertical as SovereignVerticalId,
    clientCompany: row.client_company as string,
    simulatedConversationsPassed: 50,
    simulatedConversationsTotal: 50,
    liveEnvironmentUrl: (row.live_url as string) || undefined,
    metricsFeedToSg3: { ...existing, ...metrics },
    status: 'optimizing',
  };

  const updated = recordDeploymentMetrics(deployment, metrics);
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE sovereign_deployments SET metrics_json = ?, status = ?, updated_at = ? WHERE id = ?
  `).run(JSON.stringify(updated.metricsFeedToSg3), updated.status, now, deploymentId);

  let emission: Sg3Emission | undefined;
  if ((metrics.appointmentsBooked ?? 0) > 0) {
    emission = triggerCaseStudyFromDeployment(updated);
    db.prepare(`
      INSERT INTO sovereign_emissions (id, vertical, type, title, body_markdown, platforms_json, trigger_ref, scheduled_at, sent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      emission.id, updated.vertical, emission.type, emission.title, emission.bodyMarkdown,
      JSON.stringify(emission.platforms), emission.trigger ?? null, emission.scheduledAt ?? null, now,
    );
  }

  return { deployment: updated, emission };
}

export function getTickets(limit = 50): HermesHandoffTicket[] {
  return db.prepare('SELECT * FROM sovereign_tickets ORDER BY created_at DESC LIMIT ?')
    .all(limit)
    .map(r => mapTicket(r as Record<string, unknown>));
}

export function getTicket(id: string): HermesHandoffTicket | null {
  const row = db.prepare('SELECT * FROM sovereign_tickets WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapTicket(row) : null;
}

export function getEmissions(limit = 20): Sg3Emission[] {
  return db.prepare('SELECT * FROM sovereign_emissions ORDER BY created_at DESC LIMIT ?')
    .all(limit)
    .map(row => {
      const r = row as Record<string, unknown>;
      return {
        id: r.id as string,
        type: r.type as Sg3Emission['type'],
        title: r.title as string,
        bodyMarkdown: r.body_markdown as string,
        platforms: JSON.parse((r.platforms_json as string) || '[]') as Sg3Emission['platforms'],
        trigger: (r.trigger_ref as string) || undefined,
        scheduledAt: (r.scheduled_at as string) || undefined,
        sent: r.sent as number,
      };
    });
}

export function getLoopState(): SovereignLoopState {
  const tickets = getTickets(500);
  const ticketsByStatus: Partial<Record<TicketStatus, number>> = {};
  for (const t of tickets) {
    ticketsByStatus[t.status] = (ticketsByStatus[t.status] || 0) + 1;
  }

  const liveDeployments = db.prepare(`SELECT COUNT(*) as c FROM sovereign_deployments WHERE status = 'live'`).get() as { c: number };
  const pendingEmissions = db.prepare(`SELECT COUNT(*) as c FROM sovereign_emissions WHERE sent = 0`).get() as { c: number };

  return {
    activeVertical: SOVEREIGN_ACTIVE_VERTICAL,
    pricing: getActiveVertical().pricing,
    ticketsByStatus,
    totalTickets: tickets.length,
    liveDeployments: liveDeployments.c,
    pendingEmissions: pendingEmissions.c,
    scannedAt: new Date().toISOString(),
  };
}

export function runFakeLeadTest(): {
  steps: { step: string; result: unknown }[];
  finalTicket: HermesHandoffTicket;
} {
  const steps: { step: string; result: unknown }[] = [];

  const inbound = ingestInbound({
    channel: 'application',
    name: 'Mike Torres',
    email: 'mike@sunpeak-solar.com',
    company: 'SunPeak Solar',
    message: 'We are a residential solar installer in Phoenix doing 300+ leads/month. Need after-hours coverage.',
  });
  steps.push({ step: 'hermes.ingest', result: { ticketId: inbound.ticket.id, status: inbound.ticket.status } });

  const qualified = submitQualifyAnswers(inbound.ticket.id, {
    verticalMatch: true,
    monthlyLeadVolume: 300,
    revenueBand: '2m_10m',
    urgencyDays: 7,
    budgetConfirmed: true,
    painPoint: 'Leads die after 5pm',
  });
  steps.push({ step: 'hermes.qualify', result: { score: qualified.ticket.score, route: qualified.route } });

  const reply = handleLingReply(qualified.ticket.id, 'YES');
  steps.push({ step: 'ling.yes', result: { contractSent: reply.contractSent } });

  const signed = recordSignature(qualified.ticket.id, {
    brandVoiceNotes: 'Direct, local, no hype',
    crmType: 'HubSpot',
    calendarLink: 'https://calendly.com/sunpeak/inspection',
  });
  steps.push({ step: 'k3.deploy', result: { deploymentId: signed.deployment.deploymentId, status: signed.deployment.status } });
  steps.push({ step: 'sg3.emission', result: { title: signed.emission.title, sent: signed.emission.sent } });

  return { steps, finalTicket: signed.ticket };
}

export function getSovereignConfig() {
  return {
    activeVertical: SOVEREIGN_ACTIVE_VERTICAL,
    verticals: VERTICALS,
    loop: ['sg3', 'hermes', 'ling', 'k3'],
    governance: 'Inbound only · Hermes never chases · Publish gated Sent=0',
  };
}

export { generateWeeklyEmissions } from './sg3Pulse.js';
export { buildLingDemoPackage } from './lingCloser.js';
export { loadK3Template } from './k3Engine.js';
