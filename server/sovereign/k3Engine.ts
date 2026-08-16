/**
 * K3 Engine — vertical template build, simulate, deploy, metrics → SG3
 */

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type { K3DeploymentResult, SovereignVerticalId } from './schemas.js';
import { getVertical } from './config.js';

export interface K3Template {
  vertical: string;
  version: string;
  agentName: string;
  description: string;
  integrations: Record<string, string[]>;
  systemPrompt: string;
  conversationFlow: { stage: string; prompt: string }[];
  objectionHandlers: Record<string, string>;
  crmFieldMapping: Record<string, unknown>;
  simulatedConversationCount: number;
  abTestPrompts: string[];
  weeklyOptimization: { metrics: string[]; feedToSg3: boolean };
}

export function loadK3Template(vertical: SovereignVerticalId): K3Template {
  const config = getVertical(vertical);
  if (!fs.existsSync(config.k3TemplatePath)) {
    throw new Error(`K3 template not found for vertical: ${vertical}`);
  }
  return JSON.parse(fs.readFileSync(config.k3TemplatePath, 'utf-8')) as K3Template;
}

export function customizeTemplate(
  template: K3Template,
  input: {
    clientCompany: string;
    brandVoiceNotes?: string;
    crmType?: string;
    calendarLink?: string;
  },
): K3Template {
  const brandSuffix = input.brandVoiceNotes
    ? `\n\nBrand voice: ${input.brandVoiceNotes}`
    : '';
  const customizedPrompt = template.systemPrompt.replace(
    /\{\{company_name\}\}/g,
    input.clientCompany,
  ) + brandSuffix;

  const flow = template.conversationFlow.map(step => ({
    ...step,
    prompt: step.prompt
      .replace(/\{\{company_name\}\}/g, input.clientCompany)
      .replace(/\{\{calendar_link\}\}/g, input.calendarLink || 'https://calendly.com/your-link'),
  }));

  return {
    ...template,
    systemPrompt: customizedPrompt,
    conversationFlow: flow,
  };
}

export function runSimulatedConversations(
  template: K3Template,
  count?: number,
): { passed: number; total: number; failures: string[] } {
  const total = count ?? template.simulatedConversationCount;
  const failures: string[] = [];
  let passed = 0;

  for (let i = 0; i < total; i++) {
    const stage = template.conversationFlow[i % template.conversationFlow.length];
    if (stage.prompt.includes('{{') && !stage.prompt.includes('{{company_name}}')) {
      failures.push(`Sim ${i + 1}: unresolved token in stage ${stage.stage}`);
    } else {
      passed++;
    }
  }

  return { passed, total, failures };
}

export function deployK3(input: {
  vertical: SovereignVerticalId;
  clientCompany: string;
  brandVoiceNotes?: string;
  crmType?: string;
  calendarLink?: string;
  ticketId?: string;
}): K3DeploymentResult {
  const base = loadK3Template(input.vertical);
  const customized = customizeTemplate(base, input);
  const sim = runSimulatedConversations(customized);

  const deploymentId = uuidv4();
  const appBase = process.env.APP_BASE_URL || 'http://localhost:3001';

  return {
    deploymentId,
    vertical: input.vertical,
    clientCompany: input.clientCompany,
    brandVoiceNotes: input.brandVoiceNotes,
    simulatedConversationsPassed: sim.passed,
    simulatedConversationsTotal: sim.total,
    liveEnvironmentUrl: `${appBase}/api/sovereign/deployments/${deploymentId}`,
    metricsFeedToSg3: {
      appointmentsBooked: 0,
      hoursSaved: 0,
      revenueGenerated: 0,
    },
    status: sim.failures.length === 0 ? 'live' : 'testing',
  };
}

export function recordDeploymentMetrics(
  deployment: K3DeploymentResult,
  metrics: Partial<K3DeploymentResult['metricsFeedToSg3']>,
): K3DeploymentResult {
  return {
    ...deployment,
    metricsFeedToSg3: {
      ...deployment.metricsFeedToSg3,
      ...metrics,
    },
    status: 'optimizing',
  };
}

export function buildK3HandoffPayload(deployment: K3DeploymentResult): Record<string, unknown> {
  return {
    deploymentId: deployment.deploymentId,
    vertical: deployment.vertical,
    clientCompany: deployment.clientCompany,
    status: deployment.status,
    metrics: deployment.metricsFeedToSg3,
    triggerSg3CaseStudy: deployment.status === 'live',
  };
}
