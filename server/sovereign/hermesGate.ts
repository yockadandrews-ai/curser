/**
 * Hermes Gate — inbound qualify matrix (3-question micro-conversation → route)
 * Score ≥7 → Ling · 4–6 → nurture · <4 → archive
 */

import type {
  HermesRoute,
  InboundChannel,
  QualifyAnswers,
  QualifyScoreBreakdown,
  SovereignVerticalId,
} from './schemas.js';
import { getVertical, SOVEREIGN_ACTIVE_VERTICAL } from './config.js';

export const HERMES_QUALIFY_QUESTIONS = [
  {
    id: 'q1_vertical',
    question: 'Are you a solar installer or sales org handling residential/commercial installs?',
    mapsTo: 'verticalMatch' as const,
  },
  {
    id: 'q2_volume',
    question: 'Roughly how many inbound leads do you get per month (web, phone, DMs)?',
    mapsTo: 'monthlyLeadVolume' as const,
  },
  {
    id: 'q3_urgency',
    question: 'If we could recover after-hours leads this month, is that urgent — or a Q4 initiative?',
    mapsTo: 'urgencyDays' as const,
  },
] as const;

const REVENUE_BANDS: Record<string, number> = {
  under_500k: 1,
  '500k_2m': 2,
  '2m_10m': 3,
  over_10m: 4,
};

function scoreVerticalMatch(answers: QualifyAnswers, vertical: SovereignVerticalId): number {
  if (answers.verticalMatch) return 3;
  const config = getVertical(vertical);
  const pain = (answers.painPoint || '').toLowerCase();
  const keywordHit = config.qualifyKeywords.some(k => pain.includes(k));
  return keywordHit ? 2 : 0;
}

function scoreRevenue(answers: QualifyAnswers): number {
  if (!answers.revenueBand) return 1;
  return REVENUE_BANDS[answers.revenueBand] ?? 1;
}

function scoreUrgency(answers: QualifyAnswers): number {
  const days = answers.urgencyDays;
  if (days == null) return 1;
  if (days <= 14) return 3;
  if (days <= 45) return 2;
  return 1;
}

function scoreBudget(answers: QualifyAnswers): number {
  if (answers.budgetConfirmed) return 2;
  const volume = answers.monthlyLeadVolume ?? 0;
  if (volume >= 200) return 2;
  if (volume >= 50) return 1;
  return 0;
}

function routeFromTotal(total: number): HermesRoute {
  if (total >= 7) return 'ling';
  if (total >= 4) return 'nurture';
  return 'archive';
}

export function scoreLead(
  answers: QualifyAnswers,
  vertical: SovereignVerticalId = SOVEREIGN_ACTIVE_VERTICAL,
): QualifyScoreBreakdown {
  const verticalMatch = scoreVerticalMatch(answers, vertical);
  const revenue = scoreRevenue(answers);
  const urgency = scoreUrgency(answers);
  const budget = scoreBudget(answers);
  const total = verticalMatch + revenue + urgency + budget;

  return {
    verticalMatch,
    revenue,
    urgency,
    budget,
    total,
    route: routeFromTotal(total),
  };
}

export function detectVerticalFromMessage(message: string): SovereignVerticalId {
  const lower = message.toLowerCase();
  for (const id of ['solar', 'dental', 'legal'] as SovereignVerticalId[]) {
    const config = getVertical(id);
    if (config.qualifyKeywords.some(k => lower.includes(k))) return id;
  }
  return SOVEREIGN_ACTIVE_VERTICAL;
}

export function buildQualifyConversation(channel: InboundChannel): {
  questions: typeof HERMES_QUALIFY_QUESTIONS;
  intro: string;
} {
  const intro =
    channel === 'dm' || channel === 'comment'
      ? "Thanks for reaching out — quick 3 questions so I can point you to the right resource (no pitch):"
      : 'Thanks for your application. Three quick questions to qualify fit:';

  return { questions: HERMES_QUALIFY_QUESTIONS, intro };
}

export function nurtureSequenceDays(): number {
  return 14;
}

export function archiveReengageDays(): number {
  return 90;
}

export function shouldHandToLing(score: QualifyScoreBreakdown): boolean {
  return score.route === 'ling';
}
