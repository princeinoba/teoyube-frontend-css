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
    expect(nextRouteStatuses.filter((status) => status.gateStatus === "PASS")).toHaveLength(11);
    expect(nextRouteStatuses.filter((status) => status.gateStatus === "NOT_APPLICABLE_INTERNAL_ROUTE")).toHaveLength(1);
    expect(nextRouteStatuses.every((status) => status.paritySource === "IMMUTABLE_STATIC")).toBe(true);
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

  it("classifies every Next-only route with separate visibility, parity source, and gate status", () => {
    const supportStatuses = JSON.parse(
      fs.readFileSync(path.resolve("tests/visual/parity/support-route-status.json"), "utf8")
    ) as Array<{ route: string; visibility: string; paritySource: string; gateStatus: string; canonicalTarget: string | null }>;
    expect(supportStatuses).toHaveLength(26);
    expect(new Set(supportStatuses.map((entry) => entry.visibility))).toEqual(new Set(["RETAINED_PUBLIC", "INTERNAL_ONLY", "DEVELOPMENT_ONLY"]));
    expect(new Set(supportStatuses.map((entry) => entry.paritySource))).toEqual(new Set(["FROZEN_PRE_MIGRATION", "OWNER_APPROVED_NEXT_SUPPORT", "CANONICAL_REDIRECT", "NOT_APPLICABLE"]));
    expect(supportStatuses.every((entry) => entry.gateStatus !== "NOT_VERIFIED")).toBe(true);
    expect(
      supportStatuses.filter(
        (entry) =>
          entry.visibility === "RETAINED_PUBLIC" &&
          entry.paritySource === "OWNER_APPROVED_NEXT_SUPPORT" &&
          entry.gateStatus === "PASS"
      )
    ).toHaveLength(9);
    expect(
      supportStatuses
        .filter((entry) => entry.paritySource === "FROZEN_PRE_MIGRATION")
        .every((entry) => entry.visibility === "RETAINED_PUBLIC" && entry.gateStatus === "PASS")
    ).toBe(true);
    expect(
      supportStatuses.filter((entry) => entry.paritySource === "FROZEN_PRE_MIGRATION")
    ).toHaveLength(3);
    expect(supportStatuses.find((entry) => entry.route === "/compass")).toEqual({
      route: "/compass",
      visibility: "RETAINED_PUBLIC",
      paritySource: "CANONICAL_REDIRECT",
      gateStatus: "PASS",
      canonicalTarget: "/calling-compass"
    });
    expect(supportStatuses.find((entry) => entry.route === "/dashboard")).toMatchObject({
      visibility: "DEVELOPMENT_ONLY",
      paritySource: "NOT_APPLICABLE",
      gateStatus: "NOT_APPLICABLE_INTERNAL_ROUTE"
    });
  });

  it("refuses candidate writes inside the immutable baseline tree", () => {
    expect(() =>
      assertDisposableCandidatePath(path.join(immutableBaselineRoot, "desktop-wide", "today.png"))
    ).toThrow(/Refusing to write visual candidate/);
  });
});
