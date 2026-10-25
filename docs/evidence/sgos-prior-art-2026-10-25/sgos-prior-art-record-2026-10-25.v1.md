# SGOS — TIMESTAMPED ARCHITECTURE & DEFENSIVE DISCLOSURE RECORD (PA-2026-10-25) · 2026-10-25
**Status:** FILED — local evidence record; no send, filing, or legal action implied  
**Seat:** Kimi · **Source base:** inspected SGOS Notion canon; public `yockadandrews-ai/curser` Git history; relayed Agent Skills paste  
**Lineage:** v1 (Kimi 2026-10-25)

## 1. PURPOSE AND BOUNDARY

This record preserves a dated account of SGOS’s documented governance architecture and identifies the artifacts that support each element. It is a **defensive evidence record**, not a patentability opinion, a legal priority determination, or evidence that another party copied SGOS.

**Entity check:** SGOS here means **Sovereign Growth OS / SGOS by Sovereign Growth AI**. It does not mean Scholarship Granting Organizations or any other same-acronym entity. Agent Skills means `addyosmani/agent-skills`, the coding-agent workflow library.

## 2. EXECUTIVE FINDINGS

- SGOS’s governance-and-proof position was documented in Notion by **2026-07-11**: model-neutral routing, approval authority, Sentinel stop controls, fallback paths, evidence capture, and audit-ready recovery.
- A Notion page last edited **2026-06-12** documents a model-provenance control set: model inventory → allowed-use policy → approval gates → trace ledger → vendor attestations → review cadence.
- The public SGOS repository preserves an approval-gated draft/send rule by **2026-08-10** and the unified AURELIUS/SPECTRA/EQUINOX + Chaos Ledger architecture by **2026-08-13**.
- The public SGOS repository’s first commit is **2026-07-31**. Agent Skills’ repository was created **2026-02-15**. These SGOS artifacts therefore **do not establish public priority over Agent Skills**.
- Hardware-backed enforcement is not proven production-complete. Current canon labels `SOVEREIGN_HARDWARE` as `profile_defined`; the tested module accompanying this record is a reference implementation only.
- No supplied evidence proves copying, absorption, or theft by Addy Osmani, Google, Microsoft, or any Agent Skills contributor. That claim stays **ALLEGATION** and is excluded from partner-facing language.

## 3. TIMESTAMPED EVIDENCE CHAIN

| Date / timestamp | Evidence inspected | What the artifact establishes | Tier |
|---|---|---|---|
| 2026-06-12T05:23:47.939Z (Notion last-edited state) | [AI training-data provenance risk](https://app.notion.com/p/35ddef76bd298155b645f1db1221cb6c) | Spectra signal intake; Aurelius policy and model-approval judgment; Equinox approved-control outputs; model inventory, allowed-use policy, trace ledger, vendor attestations, and review cadence. | CONFIRMED — page inspected |
| 2026-07-09T15:19:53.647Z (Notion last-edited state) | [SGOS vs Mickai / SIOS — Internal Competitive One-Pager](https://app.notion.com/p/398def76bd2981828a11fa20cdcbac73) | Spectra → Aurelius → Equinox architecture; governance ledger + Equinox audit receipt; connected control-plane deployment posture. Internal-only document; competitor statements inside it are not independently verified here. | CONFIRMED — page inspected |
| 2026-07-11T14:08:26.593Z (Notion last-edited state) | [SGOS Repositioning One-Pager — Governance + Proof for Multi-Agent Execution](https://app.notion.com/p/39adef76bd298199933ce38253fe7042) | “Governance and proof layer for multi-agent execution”; model neutrality; approval gates; Sentinel stop logic; fallback paths; ledgered audit trails; proof-before-live; no unapproved send/bind/publish/merge/deploy. | CONFIRMED — page inspected |
| 2026-07-31T04:38:57-04:00 | Git commit `19268dfc72e891c6d7258ee6b17eee409385522f` | First commit in the inspected public SGOS `curser` repository history. | CONFIRMED — git history inspected |
| 2026-08-10T00:22:30+00:00 | Git commit `d25bff9794d2d58d54d79c7bfae507547d377412`, `docs/SGOS_COMMAND.md` | Approval Queue; `DRAFTED` status; provenance block on every file; “Does not send. Send only after Approval Queue + L5 proof.” Content checked at that commit. | CONFIRMED — historical blob inspected |
| 2026-08-13T20:53:17+00:00 | Git commit `001f7b5978b296c05c578781526794adc9f6f8b1`, `docs/HERMES_ARCHITECTURE.md` | Unified AURELIUS/SPECTRA/EQUINOX governance layer; Chaos Ledger; approval state; `Sent=0` until L5 proof; every step attributed. Content checked at that commit. | CONFIRMED — historical blob inspected |
| 2026-09-23T09:46:46.733Z (Notion last-edited state) | [L5 — Proof / Receipts](https://app.notion.com/p/3e4def76bd29810d82aff58a4041d4ff) | Five-field L5 rule with reply-ID + ledger reference minimum; `Linear Done ≠ Sent`; a self-send test receipt is distinguished from external sends. | CONFIRMED — page inspected |
| 2026-09-30T07:44:48+00:00 | Git commit `aa31db9828018ca231d86da571be3c0a68966d96`, `docs/SOVEREIGN_GROWTH_OS_MASTER_BLUEPRINT.md` | Documented provenance and ledger portals, cryptographic hashes for creation proof, approval-gate concepts, and unauthorized-update blocking concepts. A blueprint is not proof that every portal is implemented. | CONFIRMED — historical blob inspected |
| 2026-10-02T00:27:52+00:00 | Git commit `84e1a3e47bbb77d25e42542f1a579c7a5caa4679` | Inspected repository tip at capture: 410 files including `.git` metadata; current governance schema and Chaos Ledger code. | CONFIRMED — repository inspected |
| 2026-10-19T05:40:47.063Z (Notion last-edited state) | [Edge Sandbox Canon — SOVEREIGN_HARDWARE](https://app.notion.com/p/3fedef76bd2981b3942ec6a13aba18ee) | Hardware profile is explicitly `profile_defined`; OpenSandbox profile is `spec_ingested`; Merkle audit appears as strategic moat language. This is design evidence, not deployment proof. | CONFIRMED — page inspected |

**Timestamp caution:** Notion last-edited timestamps establish the state returned by the connected workspace, not independent notarization or first-publication time. Git commit timestamps establish repository history, not authorship, legal priority, or originality by themselves. For stronger evidence, export the relevant Notion pages with metadata and commit this packet to the canonical repository.

## 4. ARCHITECTURE CLAIMS REGISTER

| ID | Claim statement | Tier | Evidence on record | Gap / next single action | Owner |
|---|---|---|---|---|---|
| GOV-01 | SGOS is documented as a model-neutral governance and proof layer for multi-agent execution. | CONFIRMED | 2026-07-11 repositioning one-pager | Preserve an exported, hashed copy in the canonical repo. | Dev |
| GOV-02 | Spectra, Aurelius, and Equinox form one governance layer: signal → authority → execution/proof. | CONFIRMED | 2026-07-09 and 2026-07-11 Notion artifacts; 2026-08-13 Hermes doc | Keep all system docs on this unified framing. | Kimi |
| GOV-03 | External action is approval-gated and promotion requires proof. | CONFIRMED | 2026-08-10 command doc; current `HERMES_GOVERNANCE`; L5 canon | Preserve end-to-end runtime receipts for each promoted route. | Dev |
| GOV-04 | Chaos Ledger records task/action attribution and proof URLs. | CONFIRMED | `server/hermes/chaosLedger.ts` at commit `84e1a3e…` | Add append-only/hash-chained storage if tamper evidence is required. | Dev |
| GOV-05 | SGOS has a documented model-provenance diligence workflow. | CONFIRMED | 2026-06-12 Notion artifact | Convert the workflow into a versioned schema and sample evidence pack. | Dev |
| GOV-06 | SGOS has live hardware-level attestation across production deployments. | PENDING | `SOVEREIGN_HARDWARE` is `profile_defined`; reference module supplied with this packet | Produce a live TPM/TEE-backed verification receipt on approved hardware. | Dev |
| GOV-07 | SGOS has production console detection. | PENDING | Console measurement appears in the new reference design; no deployed detector inspected | Bind a measured console build to a signed attestation and test it live. | Dev |
| GOV-08 | SGOS has cryptographic receipt anchoring in production. | PENDING | Blueprint and Merkle-audit design language inspected; no production anchor receipt inspected | Generate one externally verifiable anchor receipt with ledger reference. | Dev |
| GOV-09 | SGOS is the only infrastructure combining hardware attestation, console detection, and cryptographic receipts. | OPEN | No market-wide evidence supplied | Remove “only” unless counsel accepts a substantiated claim. | A.D. / counsel |
| GOV-10 | Agent Skills or Google copied SGOS. | OPEN | No access, similarity analysis, or copying evidence supplied | Do not publish; commission evidence review only if concrete artifacts emerge. | A.D. / counsel |
| FIN-01 | The 5-gem model projects $25M–$35M Year 1 revenue. | REPORTED | Internal model referenced in canon | Keep labeled as projection; attach assumptions and actual receipts separately. | A.D. |
| FIN-02 | This packet creates revenue, a partnership, or a signed deployment. | OPEN | No such event asserted or evidenced | Leave out of revenue totals and deal-status reporting. | All seats |

## 5. DIFFERENTIATION THAT THE EVIDENCE SUPPORTS

| Dimension | Agent Skills | SGOS documented lane |
|---|---|---|
| Primary unit | Portable coding-agent `SKILL.md` workflows | Governance policy, approval authority, execution route, and evidence record |
| Main lifecycle | Define → Plan → Build → Verify → Review → Ship | Signal → judgment/authority → approved execution → proof/recovery |
| Verification emphasis | Engineering process evidence, tests, reviews, launch checks | Authorization evidence, route control, attribution, L5 receipts, audit/recovery |
| Model/provider posture | Works across many coding-agent hosts | Model-neutral governing authority retained above providers |
| Hardware posture | Not the library’s stated focus | Hardware profile documented; production attestation still pending |
| Evidence boundary | Repository documentation inspected | Canon + repository inspected; production claims remain gated |

**Defensible category line:**  
> Agent Skills structures how coding agents perform engineering work. SGOS is designed to govern how AI work is authorized, routed, stopped, and evidenced across models and tools.

## 6. MOONSHOT COUNTER-TERMS INSERT — DRAFTED · NOT SENT

> **Governance boundary.** SGOS by Sovereign Growth AI is designed to provide a partner-neutral governance layer for model deployment: jurisdiction- and policy-constrained routing, explicit approval where required, stop authority, and audit-ready evidence of governed actions. SGOS retains ownership of its control plane, policy definitions, receipt schemas, provenance artifacts, and governance branding. Any production claim concerning hardware-backed attestation, measured-console enforcement, or cryptographic receipt anchoring will be made only after the corresponding live verification evidence is attached to the deployment record. No partnership, deployment, revenue, exclusivity, or market-unique status is implied by this language.

## 7. PRESERVATION ACTIONS

1. Export the four Notion artifacts listed above, including page metadata, and store the exports with this packet.
2. Commit this packet and the attestation reference module to the canonical SGOS repository on a review branch; do not merge without the required review.
3. Record the resulting commit hash and Notion export hashes in the evidence packet.
4. Have counsel assess any provisional patent, defensive publication, trademark, copyright, or license strategy before public assertion or filing.
5. Keep “copying,” “only,” production-hardware, revenue, and partnership claims out of outbound material until their specific evidence gaps close.
