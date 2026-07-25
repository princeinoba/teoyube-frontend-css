import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  CLASSIFICATIONS,
  evaluateLineage
}: {
  CLASSIFICATIONS: Record<string, string>;
  evaluateLineage: (input: {
    runtimeSourceIsAncestor: boolean;
    gateExecutionIsDescendant: boolean;
    evidenceCommitIsDescendant: boolean;
    artifactsValid: boolean;
    runtimeMetadataVerified: boolean;
    runtimeSourceDigestMatches: boolean;
    changedPaths: Array<{
      path: string;
      classification: string;
      boundHashMatches?: boolean | null;
    }>;
  }) => { result: string; evidenceMode: string; failures: string[] };
} = require("../../scripts/release/release-lineage.cjs");

const base = {
  runtimeSourceIsAncestor: true,
  gateExecutionIsDescendant: true,
  evidenceCommitIsDescendant: true,
  artifactsValid: true,
  runtimeMetadataVerified: true,
  runtimeSourceDigestMatches: true
};

const evaluate = (
  path: string,
  classification: string,
  overrides: Partial<typeof base> & { boundHashMatches?: boolean } = {}
) =>
  evaluateLineage({
    ...base,
    ...overrides,
    changedPaths: [{ path, classification, boundHashMatches: overrides.boundHashMatches }]
  });

describe("strict release-evidence lineage", () => {
  it("accepts an exact report-only descendant", () => {
    expect(
      evaluate(
        "docs/recovery/prompt-23a-archive-inventory-report.md",
        CLASSIFICATIONS.REPORT_ONLY
      )
    ).toMatchObject({
      result: "PASS",
      evidenceMode: "STRICT_EVIDENCE_ONLY_DESCENDANT_REUSE"
    });
  });

  it("accepts an exact owner record descendant", () => {
    expect(
      evaluate(
        "docs/owner-approvals/runtime/TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24.md",
        CLASSIFICATIONS.OWNER_APPROVAL
      ).result
    ).toBe("PASS");
  });

  it("requires runtime verification for runtime-manifest metadata", () => {
    expect(
      evaluate(
        "config/runtime/canonical-runtime-manifest.json",
        CLASSIFICATIONS.RUNTIME_MANIFEST_METADATA,
        { runtimeMetadataVerified: false }
      ).result
    ).toBe("BLOCKED");
  });

  it.each([
    ["src/domain/tig/service.ts", "RUNTIME_AFFECTING"],
    ["package.json", "BUILD_OR_DEPENDENCY_AFFECTING"],
    ["package-lock.json", "BUILD_OR_DEPENDENCY_AFFECTING"],
    ["scripts/runtime/start-next.cjs", "RUNTIME_AFFECTING"],
    ["src/app/api/teoyube/teo-guide/route.ts", "ROUTE_OR_API_AFFECTING"],
    ["styles/components.css", "VISUAL_OR_ASSET_AFFECTING"],
    ["tests/build-foundation/runtime.test.ts", "GATE_OR_TEST_AFFECTING"],
    ["unexpected/new-file.txt", "UNKNOWN_BLOCKED"]
  ])("blocks %s classified as %s", (path, classification) => {
    expect(evaluate(path, CLASSIFICATIONS[classification]).result).toBe("BLOCKED");
  });

  it("blocks a modified hash-bound descendant record", () => {
    expect(
      evaluate(
        "docs/recovery/prompt-23a-release-lineage-repair-report.json",
        CLASSIFICATIONS.EVIDENCE_ARTIFACT,
        { boundHashMatches: false }
      ).result
    ).toBe("BLOCKED");
  });

  it("blocks a modified release artifact", () => {
    expect(
      evaluateLineage({
        ...base,
        artifactsValid: false,
        changedPaths: []
      }).result
    ).toBe("BLOCKED");
  });

  it("blocks a non-ancestor runtime source", () => {
    expect(
      evaluateLineage({
        ...base,
        runtimeSourceIsAncestor: false,
        changedPaths: []
      }).result
    ).toBe("BLOCKED");
  });

  it("blocks a stale runtime-source digest", () => {
    expect(
      evaluateLineage({
        ...base,
        runtimeSourceDigestMatches: false,
        changedPaths: []
      }).result
    ).toBe("BLOCKED");
  });
});
