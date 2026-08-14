/**
 * SG3 Pulse — authority emissions (3/week) fed by K3 performance
 */

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type { K3DeploymentResult, Sg3Emission, SovereignVerticalId } from './schemas.js';
import { getVertical } from './config.js';

interface Sg3CalendarFile {
  vertical: string;
  emissionsPerWeek: number;
  platforms: string[];
  autoTriggers: Record<string, string>;
  weeklyEmissions: {
    type: Sg3Emission['type'];
    title: string;
    bodyTemplate: string;
    platforms: Sg3Emission['platforms'];
  }[];
}

function loadCalendar(vertical: SovereignVerticalId): Sg3CalendarFile {
  const config = getVertical(vertical);
  if (!fs.existsSync(config.sg3CalendarPath)) {
    return {
      vertical,
      emissionsPerWeek: 3,
      platforms: ['linkedin', 'twitter'],
      autoTriggers: {},
      weeklyEmissions: [],
    };
  }
  return JSON.parse(fs.readFileSync(config.sg3CalendarPath, 'utf-8')) as Sg3CalendarFile;
}

function fillEmissionBody(
  template: string,
  vars: Record<string, string | number>,
): string {
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }
  return out;
}

export function generateWeeklyEmissions(
  vertical: SovereignVerticalId,
  vars: Record<string, string | number> = {},
): Sg3Emission[] {
  const calendar = loadCalendar(vertical);
  const defaults: Record<string, string | number> = {
    company: 'A solar installer',
    appointments: 12,
    hours_saved: 40,
    cohort_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    spots: 5,
    apply_link: process.env.SOVEREIGN_APPLY_URL || 'https://example.com/apply',
    ...vars,
  };

  return calendar.weeklyEmissions.map(item => ({
    id: uuidv4(),
    type: item.type,
    title: fillEmissionBody(item.title, defaults),
    bodyMarkdown: fillEmissionBody(item.bodyTemplate, defaults),
    platforms: item.platforms,
    sent: 0,
  }));
}

export function triggerCaseStudyFromDeployment(
  deployment: K3DeploymentResult,
): Sg3Emission {
  const m = deployment.metricsFeedToSg3;
  const emissions = generateWeeklyEmissions(deployment.vertical, {
    company: deployment.clientCompany,
    appointments: m.appointmentsBooked || 8,
    hours_saved: m.hoursSaved || 24,
  });
  const caseStudy = emissions.find(e => e.type === 'case_study');
  if (caseStudy) {
    return {
      ...caseStudy,
      trigger: `new_deployment:${deployment.deploymentId}`,
      scheduledAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    };
  }
  return {
    id: uuidv4(),
    type: 'case_study',
    title: `${deployment.clientCompany} — deployment live`,
    bodyMarkdown: `K3 deployment ${deployment.deploymentId} is live for ${deployment.clientCompany}.`,
    platforms: ['linkedin', 'twitter'],
    trigger: `new_deployment:${deployment.deploymentId}`,
    sent: 0,
  };
}

export function getSg3AutoTriggers(vertical: SovereignVerticalId): Record<string, string> {
  return loadCalendar(vertical).autoTriggers;
}

export function getEmissionsPerWeek(vertical: SovereignVerticalId): number {
  return loadCalendar(vertical).emissionsPerWeek;
}
