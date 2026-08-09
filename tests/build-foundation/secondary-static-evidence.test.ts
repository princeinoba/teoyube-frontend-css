import { describe, expect, it } from "vitest";
import {
  assertImmutableBaselineHashes,
  classifyCurrentFunctionalDifference,
  classifyCurrentVisualDifference,
  classifyHistoricalDomDifference,
  classifyHistoricalVisualDifference,
} from "../visual/parity/secondary-static-evidence";

const base = {
  tag: "div",
  id: "",
  classes: ["canon-project-media"],
  role: "",
  ariaLabel: "",
  dataView: "",
  dataAction: "",
  src: "",
  href: "",
};

describe("secondary static evidence classification", () => {
  it("classifies the exact proposal-hash-bound A11Y-003 delta", () => {
    const result = classifyHistoricalDomDifference("canon", {
      kind: "element",
      index: 82,
      expected: base,
      actual: {
        ...base,
        role: "button",
        ariaLabel: "Play Rooted in His Word for The Chosen Sonship Journey",
      },
      semanticFields: ["role", "ariaLabel"],
    });
    expect(result).toMatchObject({
      classification: "OWNER_APPROVED_ACCESSIBILITY_DELTA",
      issueId: "A11Y-003",
      proposalHash:
        "512755ac81b5cf4961c9c548a8a7eea12c7677564762635d589d26de1656a1ca",
    });
  });

  it("fails closed for an unapproved ARIA change", () => {
    const result = classifyHistoricalDomDifference("canon", {
      kind: "element",
      index: 82,
      expected: base,
      actual: { ...base, role: "button", ariaLabel: "Unapproved replacement" },
      semanticFields: ["role", "ariaLabel"],
    });
    expect(result.classification).toBe("UNRESOLVED");
  });

  it("classifies a current same-environment visual difference as real", () => {
    expect(
      classifyCurrentVisualDifference({
        passed: false,
        environmentIdentityChanged: false,
      }),
    ).toBe("REAL_VISUAL_REGRESSION");
  });

  it("fails closed for a current functional difference", () => {
    expect(classifyCurrentFunctionalDifference(false)).toBe("UNRESOLVED");
  });

  it("reports environment noise separately", () => {
    expect(
      classifyCurrentVisualDifference({
        passed: false,
        environmentIdentityChanged: true,
      }),
    ).toBe("ENVIRONMENT_NONDETERMINISM");
  });

  it("treats the immutable July 18 raster only as historical evidence", () => {
    expect(
      classifyHistoricalVisualDifference({
        passed: false,
        baselineSourceTag: "teoyube-original-upload-2026-07-18",
        protectedVisualContractPassed: true,
      }),
    ).toBe("HISTORICAL_STATIC_RUNTIME_DIFFERENCE");
  });

  it("fails if any immutable baseline hash changes", () => {
    expect(() =>
      assertImmutableBaselineHashes({ a: "one" }, { a: "two" }),
    ).toThrow("Immutable baseline writes detected");
    expect(() =>
      assertImmutableBaselineHashes({ a: "one" }, { a: "one" }),
    ).not.toThrow();
  });
});
