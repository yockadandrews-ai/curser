/** Hermes provenance block — prepended to every generated markdown file */

export interface ProvenanceMeta {
  batchDate: string;
  source?: string;
  folderPath?: string;
}

const POLICY =
  'Hermes — Grok default under SG3 policy; generates markdown only; no auto-send';

export function buildProvenanceBlock(meta: ProvenanceMeta): string {
  const source = meta.source ?? 'SGOS Daily Factory via SGOS Autopilot';
  return `---
<!-- SGOS Provenance -->
- **Status:** DRAFTED
- **Sent:** 0
- **Batch date:** ${meta.batchDate}
- **Generated at:** ${new Date().toISOString()}
- **Folder:** ${meta.folderPath ?? 'n/a'}
- **Policy:** ${POLICY}
- **Provenance:** File-Provenance: ${source}
---

`;
}

export function withProvenance(content: string, meta: ProvenanceMeta): string {
  if (content.includes('<!-- SGOS Provenance -->')) return content;
  return buildProvenanceBlock(meta) + content;
}
