/**
 * Pulse Engine — revenue → 5-Gem impact split → receipt draft
 */

import type { ChaosLedgerRow } from './chaosLedger.js';
import { writeLedgerEntry } from './chaosLedger.js';

export interface ImpactSplit {
  food: number;
  water: number;
  energy: number;
  ops: number;
}

export interface PulseEngineResult {
  amount: number;
  source: string;
  split: ImpactSplit;
  receiptDraftMarkdown: string;
  ledgerRows: ChaosLedgerRow[];
}

const DEFAULT_SPLIT_PCT = { food: 25, water: 25, energy: 25, ops: 25 };

export function computeImpactSplit(
  amount: number,
  pct: Partial<typeof DEFAULT_SPLIT_PCT> = {},
): ImpactSplit {
  const p = { ...DEFAULT_SPLIT_PCT, ...pct };
  const total = p.food + p.water + p.energy + p.ops;
  const norm = total === 100 ? 1 : 100 / total;
  return {
    food: round2(amount * (p.food * norm) / 100),
    water: round2(amount * (p.water * norm) / 100),
    energy: round2(amount * (p.energy * norm) / 100),
    ops: round2(amount * (p.ops * norm) / 100),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function processRevenueEvent(input: {
  taskId?: string;
  amount: number;
  source: string;
  productSlug?: string;
  splitPct?: Partial<typeof DEFAULT_SPLIT_PCT>;
}): PulseEngineResult {
  const split = computeImpactSplit(input.amount, input.splitPct);
  const receiptDraftMarkdown = buildReceiptDraft(input.amount, input.source, input.productSlug, split);

  const revenueRow = writeLedgerEntry({
    kind: 'revenue_recorded',
    taskId: input.taskId,
    agentId: 'pulse_engine',
    actor: 'hermes',
    summary: `${input.source} revenue $${input.amount.toFixed(2)}`,
    attribution: `Pulse Engine · ${input.productSlug || 'general'}`,
    payload: { amount: input.amount, source: input.source, productSlug: input.productSlug },
    sent: 0,
  });

  const splitRow = writeLedgerEntry({
    kind: 'impact_split',
    taskId: input.taskId,
    agentId: 'impact_allocator',
    actor: 'hermes',
    summary: `Impact split: food $${split.food} · water $${split.water} · energy $${split.energy} · ops $${split.ops}`,
    attribution: '5-Gem portfolio · Chaos Ledger',
    payload: split,
    sent: 0,
  });

  return {
    amount: input.amount,
    source: input.source,
    split,
    receiptDraftMarkdown,
    ledgerRows: [revenueRow, splitRow],
  };
}

function buildReceiptDraft(
  amount: number,
  source: string,
  productSlug: string | undefined,
  split: ImpactSplit,
): string {
  const date = new Date().toISOString().slice(0, 10);
  return `# Impact Receipt Draft — ${date}

**Status:** DRAFTED · **Sent:** 0  
**Source:** ${source} · **Amount:** $${amount.toFixed(2)}  
${productSlug ? `**Product:** ${productSlug}` : ''}

## 5-Gem vertical split
| Vertical | Amount |
|----------|--------|
| Food | $${split.food.toFixed(2)} |
| Water | $${split.water.toFixed(2)} |
| Energy | $${split.energy.toFixed(2)} |
| Ops | $${split.ops.toFixed(2)} |

## Public receipt post (draft)
> Receipt #${date.replace(/-/g, '')}: $${amount.toFixed(2)} from ${source}.  
> Impact: food/water/energy/ops split on file. Proof in vault.

**Governance:** Approve before public post. Hermes does not publish.
`;
}
