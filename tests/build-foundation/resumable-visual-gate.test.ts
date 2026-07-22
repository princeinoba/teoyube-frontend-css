import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  checkpointMatches,
  checkpointSchemaVersion,
  identitiesMatch,
  thresholdMs,
} = require("../../scripts/recovery/resumableVisualGateState.cjs") as {
  checkpointMatches: (checkpoint: unknown, identity: unknown, runId: string, runOrdinal: number) => boolean;
  checkpointSchemaVersion: string;
  identitiesMatch: (left: unknown, right: unknown) => boolean;
  thresholdMs: number;
};

const identity = {
  gitCommit: "abc123",
  nodeVersion: "v24.18.0",
  npmVersion: "10.2.4",
  auditVersion: "audit-sha",
  thresholdMs: 5_000,
  baselineHashes: {
    visualBaselines: { sha256: "baseline-sha", files: 72, bytes: 100 },
    visualContracts: { sha256: "contract-sha", files: 12, bytes: 50 },
  },
  buildHashes: {
    static: { sha256: "static-sha", files: 10, bytes: 20 },
    next: { sha256: "next-sha", files: 30, bytes: 40 },
  },
};

describe("resumable visual gate identity", () => {
  it("accepts only the exact Git, toolchain, audit, threshold, baseline, and build identity", () => {
    expect(identitiesMatch(identity, structuredClone(identity))).toBe(true);

    for (const changed of [
      { ...identity, gitCommit: "different" },
      { ...identity, nodeVersion: "v24.18.1" },
      { ...identity, npmVersion: "10.2.5" },
      { ...identity, auditVersion: "different" },
      { ...identity, thresholdMs: 5_001 },
      { ...identity, baselineHashes: { ...identity.baselineHashes, visualBaselines: { sha256: "different" } } },
      { ...identity, buildHashes: { ...identity.buildHashes, next: { sha256: "different" } } },
    ]) {
      expect(identitiesMatch(identity, changed)).toBe(false);
    }
  });

  it("binds a checkpoint to its schema, run id, ordinal, and locked threshold", () => {
    const checkpoint = {
      schemaVersion: checkpointSchemaVersion,
      ...identity,
      runId: "logical-run-1",
      runOrdinal: 1,
      thresholdMs,
    };

    expect(checkpointMatches(checkpoint, identity, "logical-run-1", 1)).toBe(true);
    expect(checkpointMatches({ ...checkpoint, runId: "another" }, identity, "logical-run-1", 1)).toBe(false);
    expect(checkpointMatches({ ...checkpoint, runOrdinal: 2 }, identity, "logical-run-1", 1)).toBe(false);
    expect(checkpointMatches({ ...checkpoint, thresholdMs: 4_999 }, identity, "logical-run-1", 1)).toBe(false);
  });
});
