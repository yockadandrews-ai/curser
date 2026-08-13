/**
 * Notion decision brief templates — SGOS Content Factory
 * Paste into Notion SGOS Content Factory page or consume via API.
 */

import { CONTENT_PRODUCTS } from './contentProducts.js';

export interface NotionBriefField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'url' | 'checkbox' | 'longtext';
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: string[];
}

export interface NotionBriefTemplate {
  id: string;
  title: string;
  productSlug?: string;
  eventType?: 'build_weekend' | 'launch_tuesday' | 'receipt_friday' | 'approval' | 'field_signal' | 'impact_receipt';
  status: 'DRAFTED';
  approvalRequired: true;
  owner: string;
  fields: NotionBriefField[];
  doneWhen: string;
  proofRequired: string;
  governanceNote: string;
  markdownBody: string;
}

const GOVERNANCE_NOTE =
  'Sent=0 until founder Approve on brief + L5 proof. Hermes does not publish or spend.';

function baseApprovalFields(): NotionBriefField[] {
  return [
    { key: 'owner', label: 'Owner', type: 'text', required: true, defaultValue: 'A.D.' },
    { key: 'lane', label: 'Founder Stack Lane', type: 'select', required: true, options: ['P0', 'Governance', 'Revenue', 'Integrity'] },
    { key: 'blocker', label: 'Blocker', type: 'text', required: false },
    { key: 'proof', label: 'Proof URL (required to execute)', type: 'url', required: false },
    { key: 'decision', label: 'Founder Decision', type: 'select', required: false, options: ['Pending', 'Approve', 'Reject', 'Modify'] },
    { key: 'risk_tag', label: 'AURELIUS Risk Tag', type: 'select', required: true, options: ['AURELIUS-P0', 'AURELIUS-P1', 'AURELIUS-P2', 'SPECTRA-REVIEW'] },
  ];
}

export function buildProductBriefTemplate(productSlug: string): NotionBriefTemplate {
  const product = CONTENT_PRODUCTS.find(p => p.slug === productSlug);
  if (!product) throw new Error(`Unknown product: ${productSlug}`);

  return {
    id: product.notionTemplateId,
    title: `Content Brief — ${product.name}`,
    productSlug: product.slug,
    eventType: 'build_weekend',
    status: 'DRAFTED',
    approvalRequired: true,
    owner: 'A.D.',
    fields: [
      ...baseApprovalFields(),
      { key: 'product', label: 'Product', type: 'text', required: true, defaultValue: product.name },
      { key: 'platforms', label: 'Platforms', type: 'text', required: true, defaultValue: product.platforms.join(', ') },
      { key: 'vault_path', label: 'Vault Path', type: 'text', required: true, defaultValue: product.vaultFolder },
      { key: 'build_outputs', label: 'Build Outputs', type: 'longtext', required: true, defaultValue: product.buildOutputs.join('\n') },
    ],
    doneWhen: 'PDF draft + Gumroad copy + receipt template in vault; brief status = DRAFTED',
    proofRequired: 'Link to vault folder + Notion brief URL before any publish handoff',
    governanceNote: GOVERNANCE_NOTE,
    markdownBody: `# ${product.name} — Build Weekend Brief

**Status:** DRAFTED · **Sent:** 0  
**Tagline:** ${product.tagline}

## Owner / Proof / Done When
- **Owner:** A.D.
- **Proof:** _vault link + brief URL_
- **Done When:** ${product.buildOutputs.join(', ')} complete in \`${product.vaultFolder}\`

## Risk
- **AURELIUS tag:** P1 (content draft — no external publish)

## Hermes routing
1. Calendar Build Weekend → Hermes → PDF Sprint agent
2. Draft to vault + this brief
3. APPROVAL calendar event created
4. Founder Approve → Publish Router n8n handoff (post-approval only)

${GOVERNANCE_NOTE}
`,
  };
}

export const NOTION_BRIEF_TEMPLATES: NotionBriefTemplate[] = [
  ...CONTENT_PRODUCTS.map(p => buildProductBriefTemplate(p.slug)),
  {
    id: 'brief-approval-gate',
    title: 'APPROVAL · Publish Gate',
    eventType: 'approval',
    status: 'DRAFTED',
    approvalRequired: true,
    owner: 'A.D.',
    fields: [
      ...baseApprovalFields(),
      { key: 'platform', label: 'Platform', type: 'select', required: true, options: ['X', 'Instagram', 'Facebook', 'LinkedIn', 'TikTok'] },
      { key: 'content_type', label: 'Content Type', type: 'select', required: true, options: ['Reel', 'Post', 'Thread', 'Story'] },
      { key: 'vault_asset', label: 'Vault Asset Path', type: 'text', required: true },
    ],
    doneWhen: 'Founder Approve recorded; proof URL attached; Sent still 0 until manual publish proof',
    proofRequired: 'Screenshot or post URL after manual publish (L5 proof)',
    governanceNote: GOVERNANCE_NOTE,
    markdownBody: `# APPROVAL · Publish Gate

**Hermes task:** publish_router  
**Sent:** 0 until L5 proof after manual publish

## Founder decision
- [ ] Approve
- [ ] Reject
- [ ] Modify (notes below)

## Notes
_Modify instructions return to Content Factory._

${GOVERNANCE_NOTE}
`,
  },
  {
    id: 'brief-field-signal',
    title: 'Field Signal — Decoder Brief',
    eventType: 'field_signal',
    status: 'DRAFTED',
    approvalRequired: true,
    owner: 'A.D.',
    fields: [
      ...baseApprovalFields(),
      { key: 'batch_id', label: 'Batch ID', type: 'text', required: true },
      { key: 'confidence', label: 'Confidence', type: 'select', required: true, options: ['low', 'medium', 'high'] },
      { key: 'pattern', label: 'Pattern Summary', type: 'longtext', required: true },
    ],
    doneWhen: 'High-confidence patterns escalated to Founder Stack P0 or rejected with notes',
    proofRequired: 'Decoder output path in vault',
    governanceNote: GOVERNANCE_NOTE,
    markdownBody: `# Field Signal Decoder Brief

**Agent:** field_decoder  
**Risk:** SPECTRA-REVIEW until human confirms

${GOVERNANCE_NOTE}
`,
  },
  {
    id: 'brief-impact-receipt',
    title: 'Impact Receipt — Pulse Engine',
    eventType: 'impact_receipt',
    status: 'DRAFTED',
    approvalRequired: true,
    owner: 'A.D.',
    fields: [
      ...baseApprovalFields(),
      { key: 'revenue_amount', label: 'Revenue (USD)', type: 'number', required: true },
      { key: 'source', label: 'Source', type: 'text', required: true, defaultValue: 'Gumroad' },
      { key: 'food_pct', label: 'Food %', type: 'number', required: true, defaultValue: 25 },
      { key: 'water_pct', label: 'Water %', type: 'number', required: true, defaultValue: 25 },
      { key: 'energy_pct', label: 'Energy %', type: 'number', required: true, defaultValue: 25 },
      { key: 'ops_pct', label: 'Ops %', type: 'number', required: true, defaultValue: 25 },
    ],
    doneWhen: 'Impact split logged to Chaos Ledger; receipt reel draft in vault',
    proofRequired: 'Gumroad sale webhook ID or manual entry reference',
    governanceNote: GOVERNANCE_NOTE,
    markdownBody: `# Impact Receipt Brief

**Agent:** pulse_engine → impact_allocator  
**5-Gem split:** food / water / energy / ops

${GOVERNANCE_NOTE}
`,
  },
];

export function getNotionBriefTemplate(id: string): NotionBriefTemplate | undefined {
  return NOTION_BRIEF_TEMPLATES.find(t => t.id === id);
}

export function renderNotionBriefPage(template: NotionBriefTemplate, overrides: Record<string, string> = {}): string {
  let body = template.markdownBody;
  for (const [key, val] of Object.entries(overrides)) {
    body = body.replace(new RegExp(`_${key}_`, 'g'), val);
  }
  return body;
}
