/**
 * Content Factory agent — produces vault assets from product registry schema
 */

import fs from 'fs';
import path from 'path';
import type { ContentFactoryTaskInput, ContentFactoryTaskOutput } from '../schemas/contentFactoryTask.js';
import { getRegistryProduct, type ProductRegistryEntry } from '../data/productRegistry.js';
import { HERMES_GOVERNANCE } from '../schemas/hermes.js';

const VAULT_ROOT = path.join(process.cwd(), 'data', 'hermes');

export interface ContentFactoryRunResult extends ContentFactoryTaskOutput {
  product: ProductRegistryEntry;
  filesWritten: string[];
}

export function runContentFactory(input: ContentFactoryTaskInput): ContentFactoryRunResult {
  const product = getRegistryProduct(input.productId);
  if (!product) throw new Error(`Unknown product_id: ${input.productId}`);

  const vaultRel = product.vaultFolder.replace(/^vault\//, '');
  const vaultAbs = path.join(VAULT_ROOT, vaultRel);
  fs.mkdirSync(vaultAbs, { recursive: true });

  const output = product.id === 'sprint-2-gas-station'
    ? buildSprint2GasStation(product)
    : product.id === 'sprint-3-too-late'
      ? buildSprint3TooLate(product)
      : buildGenericFactoryOutput(product);

  const filesWritten: string[] = [];

  const write = (name: string, body: string) => {
    const fp = path.join(vaultAbs, name);
    fs.writeFileSync(fp, body, 'utf8');
    filesWritten.push(path.relative(process.cwd(), fp));
  };

  write('reel-scripts.md', output.reelScripts.map((s, i) => `## Reel ${i + 1}\n\n${s}`).join('\n\n---\n\n'));
  write('captions.md', output.captions.map((c, i) => `### Reel ${i + 1}\n${c}`).join('\n\n'));
  write('gumroad-description.md', output.gumroadDescription);
  write('receipt-template.md', output.receiptTemplate);
  if (output.pdfOutline) write('pdf-outline.md', output.pdfOutline);
  write('factory-manifest.json', JSON.stringify({
    product_id: product.id,
    status: 'DRAFTED',
    sent: 0,
    trigger: input.trigger,
    assets_folder: product.vaultFolder,
    governance: HERMES_GOVERNANCE.rule,
    generated_at: new Date().toISOString(),
  }, null, 2));

  return { ...output, product, filesWritten };
}

function buildSprint2GasStation(product: ProductRegistryEntry): ContentFactoryTaskOutput {
  return {
    assetsFolder: product.vaultFolder,
    gumroadDescription: `# Gas Station Snack Rankings — $${product.price}

**The bracket PDF for people who take road snacks seriously.**

What's inside:
- 5 regional brackets (NE / South / Midwest / West / Wildcard)
- Scoring rubric: exclusivity · crunch · regional pride · hot take slot
- Blank ranking page you fill on your next fill-up
- Receipt footer for public proof posts

*DRAFTED · Sent=0 until founder approval*

${product.schemaNotes}
`,
    receiptTemplate: `# Receipt Footer — Gas Station Snack Rankings

**Public receipt post (draft):**
> Sprint 2 receipt: Gas Station Snack Rankings PDF shipped.
> Brackets locked: [region]. Hot take: [one line].
> Proof in vault · Sent=0 until A.D. posts with L5 link.

Log engagement baseline to Chaos Ledger after Day Review (Tue 19 Aug 18:00 ET block).
`,
    pdfOutline: `# PDF Outline — Gas Station Snack Rankings

1. **Cover** — title + "rank your road stop"
2. **How to score** — exclusivity / crunch / regional pride / hot take weights
3. **Northeast bracket** — 8 slots + write-in
4. **South bracket**
5. **Midwest bracket**
6. **West bracket**
7. **Road Trip Wildcard** — national gas chain exclusives
8. **Blank master ranking page**
9. **Receipt footer** — copy block for IG/X proof post

Schema: ${JSON.stringify(product.schema, null, 2)}
`,
    reelScripts: [
      `[REEL 1 — 08:00 ET · Hook: regional fight]
VISUAL: Split screen — four gas station logos blurred
VO: "Every region thinks THEIR gas station snack is undefeated."
TEXT ON SCREEN: "We made a bracket for it."
VO: "Exclusivity. Crunch. Regional pride. One hot take slot."
CTA: "PDF in bio — rank your stop before your next fill-up."
STATUS: DRAFTED · APPROVAL required before post`,

      `[REEL 2 — 12:00 ET · Scoring rubric]
VISUAL: Hand filling blank bracket, pen taps on "crunch" column
VO: "Most snack rankings are vibes. This one scores exclusivity first — can you ONLY get it here?"
TEXT: "35% exclusivity · 25% crunch · 25% regional pride · 15% hot take"
CTA: "Save this — you'll need it at the pump."
STATUS: DRAFTED · Sent=0`,

      `[REEL 3 + DAY REVIEW — 18:00 ET · Hot take + metrics]
VISUAL: You pointing at wildcard bracket
VO: "Wildcard slot is for the national chain item that shouldn't hit this hard."
VO: "Drop your hot take in comments — top 3 go in the next receipt post."
DAY REVIEW: Log views/saves/comments to Chaos Ledger · baseline for Receipt Fri
CTA: "Comment your region's #1 — receipt post Friday."
STATUS: DRAFTED · Founder Stack records proof`,
    ],
    captions: [
      `Your region's gas station snack is not automatically elite. We built brackets. 🛣️\n\nGas Station Snack Rankings PDF — $${product.price} · link in bio\n\n#gasstation #roadtrip #snackrankings\n\n[DRAFTED — do not post until APPROVAL brief signed]`,

      `Scoring road snacks like adults:\n→ Exclusivity (35%)\n→ Crunch (25%)\n→ Regional pride (25%)\n→ Hot take (15%)\n\nBlank ranking page inside. Fill it on your next stop.\n\n[DRAFTED · Sent=0]`,

      `Wildcard bracket is live. Comment your #1 — top takes make the Receipt Reel Friday. 📋\n\nDay Review: baseline metrics → Chaos Ledger → Founder Stack proof.\n\n[DRAFTED — human gate before publish]`,
    ],
  };
}

function buildSprint3TooLate(product: ProductRegistryEntry): ContentFactoryTaskOutput {
  return {
    assetsFolder: product.vaultFolder,
    gumroadDescription: `# Is It Too Late to Reply? — $${product.price}\n\nSingle-page flowchart. Time since text → exact verdict.\n\n${product.schemaNotes}\n\nDRAFTED · Sent=0`,
    receiptTemplate: `Receipt: Sprint 3 flowchart shipped. Verdict distribution: [stats]. Proof in Founder Stack.`,
    pdfOutline: `# PDF — decision tree by hours since message\n\n${JSON.stringify(product.schema.timeBands, null, 2)}`,
    reelScripts: [
      `[REEL 1] Hook: "Read at 2pm. Replied at midnight. Was that insane?" → Flowchart PDF`,
      `[REEL 2] Walk one branch: 24–72h band · self-deprecate then value`,
      `[REEL 3] Worst case branch + Day Review → Ledger`,
    ],
    captions: [
      `The reply window flowchart nobody gave you. $${product.price} · DRAFTED`,
      `24–72 hours? There's a script for that. DRAFTED · Sent=0`,
      `Day Review → Chaos Ledger. DRAFTED`,
    ],
  };
}

function buildGenericFactoryOutput(product: ProductRegistryEntry): ContentFactoryTaskOutput {
  return {
    assetsFolder: product.vaultFolder,
    gumroadDescription: `# ${product.name} — $${product.price}\n\n${product.schemaNotes}`,
    receiptTemplate: `# Receipt — ${product.name}\n\nDRAFTED · Sent=0`,
    reelScripts: [`[REEL 1] ${product.name}`, `[REEL 2] ${product.name}`, `[REEL 3] ${product.name}`],
    captions: [`Caption 1 — DRAFTED`, `Caption 2 — DRAFTED`, `Caption 3 — DRAFTED`],
  };
}

export function seedSprint2VaultIfMissing(): { seeded: boolean; path: string } {
  const result = runContentFactory({
    productId: 'sprint-2-gas-station',
    schema: getRegistryProduct('sprint-2-gas-station')!.schema,
    trigger: 'manual',
  });
  return { seeded: true, path: result.assetsFolder };
}
