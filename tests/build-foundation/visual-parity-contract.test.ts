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
  it("keeps all 72 initial Next cells explicitly not verified", () => {
    assertParityMatrixIntegrity();
    expect(runtimeManifest.views.length * Object.keys(runtimeManifest.viewports).length).toBe(72);
    expect(nextRouteStatuses.every((status) => status.status === "NOT_VERIFIED")).toBe(true);
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

  it("refuses candidate writes inside the immutable baseline tree", () => {
    expect(() =>
      assertDisposableCandidatePath(path.join(immutableBaselineRoot, "desktop-wide", "today.png"))
    ).toThrow(/Refusing to write visual candidate/);
  });
});
