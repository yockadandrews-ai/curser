/**
 * SGOS fail-closed attestation reference · 2026-10-25
 *
 * Reference only: this module verifies signed claims; it does not prove that a
 * claim came from a real TPM/TEE. Production integration must bind keys and
 * measurements to approved hardware and use an atomic shared replay store.
 * It never deletes, corrupts, or encrypts ledgers or customer data.
 */

import {
  createHash,
  randomUUID,
  timingSafeEqual,
  verify as verifySignature,
} from "node:crypto";

export const ATTESTATION_SCHEMA = "sgos-attestation/v1" as const;

export type AttestationReason =
  | "MALFORMED_EVIDENCE"
  | "UNSUPPORTED_SCHEMA"
  | "UNKNOWN_HARDWARE_KEY"
  | "INVALID_SIGNATURE"
  | "HARDWARE_MEASUREMENT_DENIED"
  | "CONSOLE_MEASUREMENT_DENIED"
  | "MODEL_JURISDICTION_DENIED"
  | "INVALID_TIME_WINDOW"
  | "EVIDENCE_EXPIRED"
  | "EVIDENCE_FROM_FUTURE"
  | "REPLAY_DETECTED"
  | "REPLAY_STORE_UNAVAILABLE"
  | "INTERNAL_DENIAL";

export interface AttestationEvidence {
  schemaVersion: typeof ATTESTATION_SCHEMA;
  keyId: string;
  hardwareMeasurement: string;
  consoleMeasurement: string;
  modelId: string;
  jurisdiction: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  signature: string; // base64 Ed25519 signature over all other fields
}

export interface TrustedHardware {
  publicKeyPem: string;
  allowedHardwareMeasurements: string[];
}

export interface AttestationPolicy {
  policyVersion: string;
  trustedHardware: Record<string, TrustedHardware>;
  allowedConsoleMeasurements: string[];
  allowedRoutes: Array<{ modelId: string; jurisdiction: string }>;
  maxClockSkewSeconds: number;
  maxValiditySeconds: number;
}

/** claim() must atomically return true only the first time a live nonce is seen. */
export interface ReplayStore {
  claim(keyId: string, nonce: string, expiresAt: string): boolean;
}

/** Reference/test store. Production requires a shared atomic store, not process memory. */
export class InMemoryReplayStore implements ReplayStore {
  private readonly entries = new Map<string, number>();

  claim(keyId: string, nonce: string, expiresAt: string): boolean {
    const key = `${keyId}:${nonce}`;
    const now = Date.now();
    for (const [storedKey, expiry] of this.entries) {
      if (expiry <= now) this.entries.delete(storedKey);
    }
    if (this.entries.has(key)) return false;
    this.entries.set(key, Date.parse(expiresAt));
    return true;
  }
}

export interface AttestationAuditRecord {
  decisionId: string;
  schemaVersion: typeof ATTESTATION_SCHEMA;
  policyVersion: string;
  evidenceHash: string;
  decision: "ALLOW" | "DENY";
  reasons: AttestationReason[];
  modelId?: string;
  jurisdiction?: string;
  decidedAt: string;
  // Downstream storage must attach the real ledger reference. This is not an L5 receipt.
  ledgerReference?: string;
}

export interface AttestationDecision {
  allowed: boolean;
  reasons: AttestationReason[];
  audit: AttestationAuditRecord;
}

export interface EvaluationOptions {
  now?: Date;
  replayStore: ReplayStore;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalize(record[key])}`).join(",")}}`;
}

export function attestationSigningBytes(evidence: AttestationEvidence): Buffer {
  const { signature: _signature, ...payload } = evidence;
  return Buffer.from(canonicalize(payload), "utf8");
}

export function hashAttestationEvidence(evidence: AttestationEvidence): string {
  return createHash("sha256").update(canonicalize(evidence), "utf8").digest("hex");
}

function isSha256Hex(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function equalHex(left: string, right: string): boolean {
  if (!isSha256Hex(left) || !isSha256Hex(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function shortText(value: unknown, max = 128): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function deny(
  policy: AttestationPolicy,
  evidence: AttestationEvidence,
  now: Date,
  reasons: AttestationReason[],
): AttestationDecision {
  const uniqueReasons = [...new Set(reasons)];
  return {
    allowed: false,
    reasons: uniqueReasons,
    audit: {
      decisionId: `att_${randomUUID()}`,
      schemaVersion: ATTESTATION_SCHEMA,
      policyVersion: policy.policyVersion || "invalid-policy",
      evidenceHash: hashAttestationEvidence(evidence),
      decision: "DENY",
      reasons: uniqueReasons,
      modelId: typeof evidence.modelId === "string" ? evidence.modelId : undefined,
      jurisdiction: typeof evidence.jurisdiction === "string" ? evidence.jurisdiction : undefined,
      decidedAt: now.toISOString(),
    },
  };
}

export function evaluateAttestation(
  evidence: AttestationEvidence,
  policy: AttestationPolicy,
  options: EvaluationOptions,
): AttestationDecision {
  const now = options.now ?? new Date();
  const reasons = new Set<AttestationReason>();

  try {
    if (!evidence || typeof evidence !== "object") {
      throw new TypeError("Evidence object required");
    }

    if (evidence.schemaVersion !== ATTESTATION_SCHEMA) reasons.add("UNSUPPORTED_SCHEMA");
    if (!shortText(evidence.keyId) || !shortText(evidence.nonce) || evidence.nonce.length < 8 ||
        !shortText(evidence.modelId) || !shortText(evidence.jurisdiction) ||
        !shortText(evidence.signature, 4096) || !isSha256Hex(evidence.hardwareMeasurement) ||
        !isSha256Hex(evidence.consoleMeasurement)) {
      reasons.add("MALFORMED_EVIDENCE");
    }

    const trusted = policy.trustedHardware?.[evidence.keyId];
    if (!trusted) reasons.add("UNKNOWN_HARDWARE_KEY");

    if (trusted && isSha256Hex(evidence.hardwareMeasurement) &&
        !trusted.allowedHardwareMeasurements.some((item) => equalHex(item, evidence.hardwareMeasurement))) {
      reasons.add("HARDWARE_MEASUREMENT_DENIED");
    }

    if (isSha256Hex(evidence.consoleMeasurement) &&
        !policy.allowedConsoleMeasurements.some((item) => equalHex(item, evidence.consoleMeasurement))) {
      reasons.add("CONSOLE_MEASUREMENT_DENIED");
    }

    if (!policy.allowedRoutes.some((route) =>
      route.modelId === evidence.modelId && route.jurisdiction === evidence.jurisdiction)) {
      reasons.add("MODEL_JURISDICTION_DENIED");
    }

    const issuedAt = Date.parse(evidence.issuedAt);
    const expiresAt = Date.parse(evidence.expiresAt);
    if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || expiresAt <= issuedAt ||
        expiresAt - issuedAt > policy.maxValiditySeconds * 1000) {
      reasons.add("INVALID_TIME_WINDOW");
    } else {
      if (issuedAt > now.getTime() + policy.maxClockSkewSeconds * 1000) {
        reasons.add("EVIDENCE_FROM_FUTURE");
      }
      if (expiresAt <= now.getTime()) reasons.add("EVIDENCE_EXPIRED");
    }

    if (trusted && shortText(evidence.signature, 4096)) {
      try {
        const valid = verifySignature(
          null,
          attestationSigningBytes(evidence),
          trusted.publicKeyPem,
          Buffer.from(evidence.signature, "base64"),
        );
        if (!valid) reasons.add("INVALID_SIGNATURE");
      } catch {
        reasons.add("INVALID_SIGNATURE");
      }
    }

    if (reasons.size > 0) return deny(policy, evidence, now, [...reasons]);

    try {
      if (!options.replayStore.claim(evidence.keyId, evidence.nonce, evidence.expiresAt)) {
        reasons.add("REPLAY_DETECTED");
      }
    } catch {
      reasons.add("REPLAY_STORE_UNAVAILABLE");
    }
    if (reasons.size > 0) return deny(policy, evidence, now, [...reasons]);

    return {
      allowed: true,
      reasons: [],
      audit: {
        decisionId: `att_${randomUUID()}`,
        schemaVersion: ATTESTATION_SCHEMA,
        policyVersion: policy.policyVersion,
        evidenceHash: hashAttestationEvidence(evidence),
        decision: "ALLOW",
        reasons: [],
        modelId: evidence.modelId,
        jurisdiction: evidence.jurisdiction,
        decidedAt: now.toISOString(),
      },
    };
  } catch {
    // Last-resort fail-closed path. Do not expose an externally successful result on error.
    const safeEvidence = evidence && typeof evidence === "object"
      ? evidence
      : ({ schemaVersion: ATTESTATION_SCHEMA } as AttestationEvidence);
    return deny(policy, safeEvidence, now, ["INTERNAL_DENIAL"]);
  }
}
