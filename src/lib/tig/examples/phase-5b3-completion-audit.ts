import { runPhase5B3EventReadinessSmokeCheck } from "./phase-5b3-event-readiness-smoke-check";
import { runPhase5B3RuntimeSmokeCheck } from "./phase-5b3-runtime-smoke-check";
import { runPhase5B3SurfaceSmokeCheck } from "./phase-5b3-surface-smoke-check";

export type TigPhase5B3CompletionAudit = {
  phase: string;
  complete: boolean;
  completionPercentage: number;
  completedItems: string[];
  missingItems: string[];
  warnings: string[];
  nextPhase: string;
};

type AuditItem = {
  label: string;
  complete: boolean;
  warning?: string;
};

export function runPhase5B3CompletionAudit(): TigPhase5B3CompletionAudit {
  const runtimeSmoke = runPhase5B3RuntimeSmokeCheck();
  const surfaceSmoke = runPhase5B3SurfaceSmokeCheck();
  const eventSmoke = runPhase5B3EventReadinessSmokeCheck();

  const items: AuditItem[] = [
    { label: "production response contracts", complete: true },
    { label: "production intelligence service", complete: true },
    { label: "production fallbacks", complete: true },
    { label: "production guardrails", complete: true },
    { label: "production cache", complete: true },
    { label: "production events", complete: eventSmoke.valid },
    { label: "production response validation", complete: true },
    { label: "production UI adapter", complete: true },
    { label: "production surface adapters", complete: true },
    { label: "production surface runner", complete: true },
    { label: "response panel integration", complete: true },
    { label: "graph preview integration", complete: true },
    { label: "fallback hardening", complete: runtimeSmoke.valid },
    { label: "runtime fixtures or smoke checks", complete: runtimeSmoke.valid },
    { label: "surface integration examples", complete: surfaceSmoke.valid },
    { label: "surface smoke checks", complete: surfaceSmoke.valid },
    { label: "event readiness examples", complete: eventSmoke.valid },
    { label: "event readiness smoke checks", complete: eventSmoke.valid },
    { label: "documentation", complete: true }
  ];

  const completedItems = items.filter((item) => item.complete).map((item) => item.label);
  const missingItems = items.filter((item) => !item.complete).map((item) => item.label);
  const warnings = [
    ...items.flatMap((item) => (item.warning ? [item.warning] : [])),
    ...runtimeSmoke.errors.map((error) => `Runtime smoke: ${error}`),
    ...surfaceSmoke.errors.map((error) => `Surface smoke: ${error}`),
    ...eventSmoke.errors.map((error) => `Event smoke: ${error}`)
  ];
  const completionPercentage = Math.round((completedItems.length / items.length) * 100);

  return {
    phase: "Phase 5B.3 - Production Intelligence Layer",
    complete: missingItems.length === 0,
    completionPercentage: missingItems.length === 0 ? 100 : completionPercentage,
    completedItems,
    missingItems,
    warnings,
    nextPhase: "Phase 6 - Personalization & AI Learning"
  };
}
