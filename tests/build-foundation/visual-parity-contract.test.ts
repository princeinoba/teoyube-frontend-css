import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertDisposableCandidatePath,
  assertParityMatrixIntegrity,
  immutableBaselineRoot,
  nextRouteStatuses,
  runtimeManifest
} from "../visual/parity/config";
import { functionalScenarios } from "../visual/parity/functional-scenarios";

describe("visual parity gate", () => {
  it("assigns an explicit evidence-backed status to all 72 Next cells", () => {
    assertParityMatrixIntegrity();
    expect(runtimeManifest.views.length * Object.keys(runtimeManifest.viewports).length).toBe(72);
    expect(nextRouteStatuses.some((status) => status.status === "BLOCKED_OWNER_DECISION")).toBe(true);
    expect(nextRouteStatuses.some((status) => status.status === "PASS")).toBe(true);
    expect(nextRouteStatuses.some((status) => status.status === "NOT_APPLICABLE_INTERNAL_ROUTE")).toBe(true);
    expect(nextRouteStatuses.every((status) => !status.ownerApproved && status.ownerApprovalId === null)).toBe(true);
  });

  it("defines every required functional parity category", () => {
    expect(new Set(functionalScenarios.map((scenario) => scenario.category))).toEqual(
      new Set([
        "navigation",
        "carousel",
        "search",
        "filters",
        "tabs",
        "pagination",
        "modal-drawer",
        "primary-action",
        "media-controls",
        "keyboard-navigation",
        "responsive-navigation"
      ])
    );
  });

  it("classifies every Next-only support route without inventing a baseline", () => {
    const supportStatuses = JSON.parse(
      fs.readFileSync(path.resolve("tests/visual/parity/support-route-status.json"), "utf8")
    ) as Array<{ route: string; classification: string; status: string; canonicalTarget: string | null }>;
    expect(supportStatuses).toHaveLength(26);
    expect(new Set(supportStatuses.map((entry) => entry.classification))).toEqual(
      new Set([
        "INTERNAL_ONLY",
        "DEVELOPMENT_ONLY",
        "REDIRECT_TO_CANONICAL_PUBLIC_ROUTE",
        "RETAINED_PUBLIC_ROUTE_REQUIRES_SOURCE_BASELINE"
      ])
    );
    expect(supportStatuses.every((entry) => entry.status !== "NOT_VERIFIED")).toBe(true);
    expect(
      supportStatuses
        .filter((entry) => entry.classification === "RETAINED_PUBLIC_ROUTE_REQUIRES_SOURCE_BASELINE")
        .every((entry) => entry.status === "BLOCKED_MISSING_STATIC_COUNTERPART")
    ).toBe(true);
  });

  it("refuses candidate writes inside the immutable baseline tree", () => {
    expect(() =>
      assertDisposableCandidatePath(path.join(immutableBaselineRoot, "desktop-wide", "today.png"))
    ).toThrow(/Refusing to write visual candidate/);
  });
});
