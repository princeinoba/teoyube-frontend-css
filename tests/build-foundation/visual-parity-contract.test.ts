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
    expect(nextRouteStatuses.filter((status) => status.status === "PASS")).toHaveLength(11);
    expect(nextRouteStatuses.filter((status) => status.status === "NOT_APPLICABLE_INTERNAL_ROUTE")).toHaveLength(1);
    expect(
      nextRouteStatuses.every(
        (status) =>
          status.ownerApproved &&
          status.ownerApprovalId === "TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8"
      )
    ).toBe(true);
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
        "OWNER_APPROVED_PUBLIC_ROUTE",
        "REDIRECT_TO_CANONICAL_PUBLIC_ROUTE",
        "RETAINED_PUBLIC_ROUTE_REQUIRES_SOURCE_BASELINE"
      ])
    );
    expect(supportStatuses.every((entry) => entry.status !== "NOT_VERIFIED")).toBe(true);
    expect(
      supportStatuses.filter(
        (entry) =>
          entry.classification === "OWNER_APPROVED_PUBLIC_ROUTE" &&
          entry.status === "OWNER_APPROVED_SOURCE_BASELINE"
      )
    ).toHaveLength(10);
    expect(
      supportStatuses
        .filter((entry) => entry.classification === "RETAINED_PUBLIC_ROUTE_REQUIRES_SOURCE_BASELINE")
        .every((entry) => entry.status === "BLOCKED_MISSING_STATIC_COUNTERPART")
    ).toBe(true);
    expect(
      supportStatuses.filter(
        (entry) => entry.classification === "RETAINED_PUBLIC_ROUTE_REQUIRES_SOURCE_BASELINE"
      )
    ).toHaveLength(3);
    expect(supportStatuses.find((entry) => entry.route === "/compass")).toEqual({
      route: "/compass",
      classification: "REDIRECT_TO_CANONICAL_PUBLIC_ROUTE",
      status: "REDIRECT_TO_CANONICAL_PUBLIC_ROUTE",
      canonicalTarget: "/calling-compass"
    });
  });

  it("refuses candidate writes inside the immutable baseline tree", () => {
    expect(() =>
      assertDisposableCandidatePath(path.join(immutableBaselineRoot, "desktop-wide", "today.png"))
    ).toThrow(/Refusing to write visual candidate/);
  });
});
