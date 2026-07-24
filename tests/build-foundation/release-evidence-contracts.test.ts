import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const readJson = <T>(relativePath: string): T =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as T;

function findRouteFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findRouteFiles(fullPath);
    return entry.name === "route.ts"
      ? [path.relative(root, fullPath).replace(/\\/g, "/")]
      : [];
  });
}

describe("Prompt 21 executable release contracts", () => {
  it("classifies the complete existing gate inventory without UNKNOWN", () => {
    const inventory = readJson<{
      entries: Array<{ classification: string }>;
      unknownCount: number;
    }>("docs/recovery/prompt-21-existing-gate-inventory.json");

    expect(inventory.entries.length).toBeGreaterThan(500);
    expect(inventory.entries.every((entry) => entry.classification !== "UNKNOWN")).toBe(true);
    expect(inventory.unknownCount).toBe(0);
  });

  it("classifies every API route in the security registry", () => {
    const registry = readJson<{
      routes: Array<{
        path: string;
        methods: string[];
        schema: string;
        limits: string;
      }>;
    }>("config/api-security-registry.json");
    const actualRoutes = findRouteFiles(path.join(root, "src", "app", "api")).sort();
    const registeredRoutes = registry.routes.map((route) => route.path).sort();

    expect(registeredRoutes).toEqual(actualRoutes);
    for (const route of registry.routes) {
      expect(route.methods.length).toBeGreaterThan(0);
      expect(route.schema.length).toBeGreaterThan(0);
      expect(route.limits.length).toBeGreaterThan(0);
    }
  });

  it("keeps telemetry allowlists disjoint from globally prohibited content", () => {
    const registry = readJson<{
      defaultState: string;
      prohibitedFields: string[];
      events: Array<{
        name: string;
        allowedFields: string[];
        prohibitedFields: string[];
        retentionDays: number;
      }>;
    }>("config/telemetry-event-registry.json");
    const prohibited = new Set(registry.prohibitedFields);

    expect(registry.defaultState).toBe("disabled_without_purpose_consent");
    expect(new Set(registry.events.map((event) => event.name)).size).toBe(
      registry.events.length
    );
    for (const event of registry.events) {
      expect(event.allowedFields.some((field) => prohibited.has(field))).toBe(false);
      expect(event.prohibitedFields.length).toBeGreaterThan(0);
      expect(event.retentionDays).toBeGreaterThanOrEqual(0);
    }
  });

  it("keeps release correctness invariants at zero-tolerance values", () => {
    const policy = readJson<{
      runtime: {
        nextStatus: string;
        liveAiCheckedIn: boolean;
        vectorRetrievalCheckedIn: boolean;
        gateBProduction: string;
      };
      coverage: { criticalContractPercent: number };
      performance: {
        routeReadinessMaximumMs: number;
        requiredPerformanceCells: number;
      };
      correctness: Record<string, number>;
    }>("config/release-gate-policy.json");

    expect(policy.runtime).toMatchObject({
      nextStatus: "preview_only",
      liveAiCheckedIn: false,
      vectorRetrievalCheckedIn: false,
      gateBProduction: "closed"
    });
    expect(policy.coverage.criticalContractPercent).toBe(100);
    expect(policy.performance.routeReadinessMaximumMs).toBe(5_000);
    expect(policy.performance.requiredPerformanceCells).toBe(216);
    expect(policy.correctness).toEqual({
      exactDisplayedWebCitationValidity: 1,
      criticalImmediateDangerRecall: 1,
      crossUserExposure: 0,
      unauthorizedMemoryToolStateActions: 0,
      fabricatedScriptureDisplayed: 0,
      protectedVisualBaselineDrift: 0
    });
  });
});
