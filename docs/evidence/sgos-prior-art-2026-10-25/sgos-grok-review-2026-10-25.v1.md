# SGOS — GROK SEAT REVIEW · 2026-10-25
**Status:** REVIEW BRANCH ONLY. Not merged. Not sent. Not a live deployment.
**Seat:** Grok · **Base:** `yockadandrews-ai/curser` @ `84e1a3e47bbb77d25e42542f1a579c7a5caa4679` (`main` as inspected)
**Lineage:** preserves the Kimi packet of 2026-10-25 unchanged, then records this seat's re-check.

## What this seat executed

- Recomputed sha256/16 on the preserved packet. Matched the Kimi register for the verification note (`ce40b52cff77165f`), prior-art record (`8295a075df2bd797`), license draft (`7983e43c195b8648`), attestation reference (`d4fe6e7b81ed8a28`), corrected tests (`1a32ab4d2e4b625b`), preserved TAP output (`cb6cb49f47762dc0`), implementation note (`c0ab497aa019dd93`), and session ledger (`9ed79a7010bc40c9`).
- The test file on disk after Kimi's two type-annotation edits is the hashed file (4776 bytes). The pre-edit write does not match and was not committed.
- Re-ran `tsx --test sgos-attestation-reference.test.ts` on 2026-10-25. Result: **10 passed, 0 failed**.
- Placed the packet under `docs/evidence/sgos-prior-art-2026-10-25/` and the runnable module under `server/sovereign/attestation/`. Did not modify `main`.

## Boundaries held

- No Notion export. Those five pages remain an open preservation gap.
- No counsel review. `sgos-sovereign-license-sections-2026-10-25.v1.md` stays a draft.
- No TPM/TEE binding, no shared replay store, no production receipt. The module verifies a signature and a policy. It does not prove a hardware root of trust.
- No ledger corruption path. Denial does not write, delete, or alter a ledger.
- No outbound send. No copying allegation, no "only," no revenue figure, no live-hardware claim in this note.

## Partner-safe line

Agent Skills structures how coding agents do engineering work. SGOS is designed to govern how a deployment is authorized, routed, stopped, and evidenced. Hardware-backed attestation stays a tested reference until one live verification receipt is attached.

## Not this lane

Spark-X2.5 (iFlytek, on-device 4B / 1.7B, claimed 1,000,000-token context, 2026-09-01) is a model release. The K3 deployment lane on record is a governed model-gateway business line around Moonshot's K3. They are not the same artifact.
