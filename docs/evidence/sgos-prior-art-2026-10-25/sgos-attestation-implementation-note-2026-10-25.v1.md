# SGOS — FAIL-CLOSED ATTESTATION IMPLEMENTATION NOTE · 2026-10-25
**Status:** FILED — tested reference implementation; not deployed  
**Seat:** Kimi · **Source base:** SGOS hardware/governance canon and new TypeScript reference code  
**Lineage:** v1 (Kimi 2026-10-25)

## DELIVERED CONTROL

The reference module evaluates signed attestation evidence before allowing a model–jurisdiction route. It checks:

1. Schema and required-field validity.
2. Hardware key against a trusted-key registry.
3. Ed25519 signature over the canonical evidence payload.
4. Hardware measurement against the approved measurement set.
5. Console measurement against the approved console-build set.
6. Model and jurisdiction against the allowed-route policy.
7. Issue/expiry window, maximum validity, and future-issued evidence.
8. Atomic nonce claiming for replay rejection.
9. Fail-closed behavior when verification or the replay store fails.
10. A structured audit decision with evidence hash and policy version.

**Safety invariant:** denial affects only the requested new action. The module has no delete, update, corruption, encryption, exfiltration, or remote-destruction path. It does not mutate the evidence object and does not claim an L5 receipt or ledger write.

## VERIFICATION RESULT

- Runtime: Node.js `v20.20.2`; test runner `tsx v4.23.15`.
- Tests: **10 passed, 0 failed**.
- TypeScript: `tsc --noEmit` completed successfully with Node types.
- Covered cases: valid allow; denied hardware; denied console; denied model–jurisdiction route; expiry; bad signature; unknown key; replay; replay-store outage; denial preserving input and omitting a ledger reference.

The raw test output is preserved in `sgos-attestation-test-results-2026-10-25.txt`.

## SOURCE FILES

- `sgos-attestation-reference-2026-10-25.v1.txt` — TypeScript source.
- `sgos-attestation-tests-2026-10-25.v1.txt` — Node test suite.

To rerun locally, place both files in one directory and rename them:

```text
sgos-attestation-reference-2026-10-25.v1.txt → sgos-attestation-reference.ts
sgos-attestation-tests-2026-10-25.v1.txt     → sgos-attestation-reference.test.ts
```

Then run:

```bash
tsx --test sgos-attestation-reference.test.ts
```

## PRODUCTION BOUNDARY

This is a tested policy-verification module, **not** proof of hardware-rooted attestation. A signature proves possession of a private key; it does not prove that the key or measurement is trustworthy unless the integration anchors both to approved hardware.

Before any “live hardware attestation” claim:

1. Bind the attestation private key to an approved TPM/TEE or equivalent hardware root; keep it non-exportable.
2. Define how hardware and console measurements are measured, signed, versioned, revoked, and independently reproduced.
3. Replace `InMemoryReplayStore` with a shared atomic replay store across all enforcement replicas.
4. Protect and version policy updates; require authorized sign-off and preserve rollback evidence.
5. Write decisions to the append-only audit path and attach the actual ledger reference downstream. Do not label this module’s audit object as L5 by itself.
6. Test denial recovery: read-only access, data export, credential rotation, policy correction, and authorized reactivation.
7. Produce one live verification receipt on approved hardware, then register that receipt in the prior-art/evidence packet.

## INTEGRATION POSITION

Use this module as a pre-execution policy gate around the model gateway or deployment router. Keep AURELIUS/SPECTRA/EQUINOX as the unified governance layer: Spectra supplies signal/context, Aurelius owns policy and authority, and Equinox executes the approved route and captures proof. This module is a control inside that path, not a replacement for it.
