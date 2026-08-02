/** Revised Daily Factory workflow — multilingual as default quality gate */

export const FACTORY_WORKFLOW_I18N = `# Daily Factory Workflow — Multilingual Edition

Every factory run must produce language-ready output. Multilingual is a **non-negotiable quality gate**, not an afterthought.

---

## Daily Process (Updated)

### 1. Cluster Selection (20 min)
- Pick theme from Sovereign Growth OS clusters
- Note **primary target language(s)** for today's outreach (default: user locale + English)
- Flag any language-specific UX (RTL for Arabic demos, formal vs informal tone for DE/JA)

### 2. App Definitions (40 min)
- Full template per app **plus Language & Accessibility section**
- Document Phase 1 supported languages and per-app AI localization notes
- No hard-coded English in UI specs — all strings keyed

### 3. Proposals (45 min)
- Generate **5 singles + 1 suite** in primary language
- For high-priority themes (Conversion & Revenue): add **parallel EN + ES + PT-BR** suite versions when selling globally
- Include localized taglines and CTA copy

### 4. Packaging (15 min)
- Standard folder structure for Cursor handoff
- \`04_Notes_for_Cursor.md\` must include i18n scaffolding requirements
- \`Language_Accessibility.md\` per theme when Conversion cluster
- Store generated assets with \`locale\` tag metadata

---

## Quality Gate Checklist

- [ ] App definition includes Language & Accessibility section
- [ ] Proposals note supported languages
- [ ] Master Notes include react-i18next + AI locale routing
- [ ] RTL called out for Arabic (and future Hebrew)
- [ ] Per-lead language override documented for Bridge-Builder & Echo-Scale
- [ ] Fallback strategy: English + user-visible note for edge languages

---

## Phase 1 Launch Languages

English · Español · Português (BR) · Français · Deutsch · 日本語 · 한국어 · 简体中文 · العربية · हिन्दी

---

## Sales Positioning (use in every proposal)

> "Built for global service businesses — full experience in English, Spanish, Portuguese, French, German, Japanese, Korean, Chinese, Arabic, Hindi, and more."

> "Your AI pricing engine, live closer, and referral system speak your clients' language."

> "One Conversion OS that works as powerfully in São Paulo, Madrid, Tokyo, or Dubai as it does in New York."

---

*Non-negotiable product requirement · ${new Date().toISOString().split('T')[0]}*
`;

export function generateFactoryWorkflowDoc(): string {
  return FACTORY_WORKFLOW_I18N;
}
