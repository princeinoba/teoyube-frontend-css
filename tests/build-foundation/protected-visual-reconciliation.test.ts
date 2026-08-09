import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

const localRequire = createRequire(import.meta.url);
const { verifyProtectedVisualReconciliation } = localRequire("../../scripts/recovery/protectedVisualReconciliation.cjs") as {
  verifyProtectedVisualReconciliation(options?: { overrideBytesByPath?: Map<string, Buffer> }): {
    valid: boolean;
    failures: string[];
    attestationSha256?: string;
  };
};

describe("protected visual evidence reconciliation", () => {
  it("binds every protected source, immutable baseline and owner reference to the approved lineage", () => {
    const result = verifyProtectedVisualReconciliation();
    expect(result.valid, result.failures.join("\n")).toBe(true);
    expect(result.attestationSha256).toBe("50bd8d02ff745cd2478caf745bb5f8230168b022e9f22c52f31c38d13b12757f");
  });

  it("fails closed when any protected byte changes without writing a baseline", () => {
    const relativePath = "app.js";
    const original = readFileSync(path.join(process.cwd(), relativePath));
    const altered = Buffer.from(original);
    altered[0] ^= 1;
    const result = verifyProtectedVisualReconciliation({
      overrideBytesByPath: new Map([[relativePath, altered]])
    });
    expect(result.valid).toBe(false);
    expect(result.failures).toContain("app.js: current bytes differ from the attested approved counterpart.");
  });
});
