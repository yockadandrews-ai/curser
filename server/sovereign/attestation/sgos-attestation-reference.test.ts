import test from "node:test";
import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import {
  ATTESTATION_SCHEMA,
  InMemoryReplayStore,
  attestationSigningBytes,
  evaluateAttestation,
  type AttestationEvidence,
  type AttestationPolicy,
  type ReplayStore,
} from "./sgos-attestation-reference.ts";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const hardwareMeasurement = hash("approved-hardware-v1");
const consoleMeasurement = hash("approved-console-v1");
const now = new Date();

const policy: AttestationPolicy = {
  policyVersion: "policy-2026-10-25.v1",
  trustedHardware: {
    "hardware-key-1": { publicKeyPem, allowedHardwareMeasurements: [hardwareMeasurement] },
  },
  allowedConsoleMeasurements: [consoleMeasurement],
  allowedRoutes: [{ modelId: "k3-api", jurisdiction: "us-commercial" }],
  maxClockSkewSeconds: 30,
  maxValiditySeconds: 300,
};

function signedEvidence(overrides: Partial<AttestationEvidence> = {}): AttestationEvidence {
  const evidence = {
    schemaVersion: ATTESTATION_SCHEMA,
    keyId: "hardware-key-1",
    hardwareMeasurement,
    consoleMeasurement,
    modelId: "k3-api",
    jurisdiction: "us-commercial",
    nonce: crypto.randomUUID(),
    issuedAt: new Date(now.getTime() - 1_000).toISOString(),
    expiresAt: new Date(now.getTime() + 60_000).toISOString(),
    signature: "",
    ...overrides,
  } as AttestationEvidence;
  evidence.signature = sign(null, attestationSigningBytes(evidence), privateKey).toString("base64");
  return evidence;
}

function evaluate(evidence: AttestationEvidence, replayStore: ReplayStore = new InMemoryReplayStore()) {
  return evaluateAttestation(evidence, policy, { now, replayStore });
}

test("allows a valid signed hardware, console, and route attestation", () => {
  const result = evaluate(signedEvidence());
  assert.equal(result.allowed, true);
  assert.equal(result.audit.decision, "ALLOW");
  assert.equal(result.audit.ledgerReference, undefined);
});

test("denies an unapproved hardware measurement", () => {
  const result = evaluate(signedEvidence({ hardwareMeasurement: hash("other-hardware") }));
  assert.equal(result.allowed, false);
  assert.ok(result.reasons.includes("HARDWARE_MEASUREMENT_DENIED"));
});

test("denies an unapproved console measurement", () => {
  const result = evaluate(signedEvidence({ consoleMeasurement: hash("other-console") }));
  assert.equal(result.allowed, false);
  assert.ok(result.reasons.includes("CONSOLE_MEASUREMENT_DENIED"));
});

test("denies a disallowed model-jurisdiction route", () => {
  const result = evaluate(signedEvidence({ jurisdiction: "unsupported-region" }));
  assert.equal(result.allowed, false);
  assert.ok(result.reasons.includes("MODEL_JURISDICTION_DENIED"));
});

test("denies expired evidence", () => {
  const result = evaluate(signedEvidence({
    issuedAt: new Date(now.getTime() - 120_000).toISOString(),
    expiresAt: new Date(now.getTime() - 60_000).toISOString(),
  }));
  assert.equal(result.allowed, false);
  assert.ok(result.reasons.includes("EVIDENCE_EXPIRED"));
});

test("denies a bad signature", () => {
  const evidence = signedEvidence();
  evidence.signature = `${evidence.signature.slice(0, -2)}AA`;
  const result = evaluate(evidence);
  assert.equal(result.allowed, false);
  assert.ok(result.reasons.includes("INVALID_SIGNATURE"));
});

test("denies an unknown hardware key", () => {
  const result = evaluate(signedEvidence({ keyId: "unknown-key" }));
  assert.equal(result.allowed, false);
  assert.ok(result.reasons.includes("UNKNOWN_HARDWARE_KEY"));
});

test("denies replay of the same signed nonce", () => {
  const store = new InMemoryReplayStore();
  const evidence = signedEvidence();
  assert.equal(evaluate(evidence, store).allowed, true);
  const replay = evaluate(evidence, store);
  assert.equal(replay.allowed, false);
  assert.ok(replay.reasons.includes("REPLAY_DETECTED"));
});

test("fails closed when the replay store fails", () => {
  const result = evaluate(signedEvidence(), { claim: () => { throw new Error("offline"); } });
  assert.equal(result.allowed, false);
  assert.ok(result.reasons.includes("REPLAY_STORE_UNAVAILABLE"));
});

test("denial preserves the input and writes no ledger reference", () => {
  const evidence = signedEvidence({ hardwareMeasurement: hash("denied-hardware") });
  const before = JSON.stringify(evidence);
  const result = evaluate(evidence);
  assert.equal(result.allowed, false);
  assert.equal(JSON.stringify(evidence), before);
  assert.equal(result.audit.ledgerReference, undefined);
});
