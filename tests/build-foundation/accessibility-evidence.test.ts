import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("release accessibility evidence", () => {
  it("uses only the authoritative consecutive logical runs", () => {
    const source = fs.readFileSync(
      path.join(root, "scripts", "release", "accessibility-gate.cjs"),
      "utf8"
    );

    expect(source).toContain("controller.summary?.logicalRuns");
    expect(source).toContain("authoritativeRunIds.has(run.runId)");
    expect(source).toContain(
      "authoritativeRunIds.size === controller.requiredLogicalRuns"
    );
  });
});
