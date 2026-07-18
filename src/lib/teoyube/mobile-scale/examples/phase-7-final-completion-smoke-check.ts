import { createAnalyticsProviderReadinessReport } from "../analytics-provider-readiness";
import { createPersistenceAdapterReadinessReport } from "../persistence-adapter-readiness";
import { runPhase7MobileScaleCompletionAudit } from "../phase-7-mobile-scale-completion-audit";
import { runPhase7MobileScaleSafetyCheck } from "../phase-7-mobile-scale-safety-check";
import { createPhase7SurfaceReadinessReport } from "../phase-7-surface-readiness-report";
import { createProductionLaunchPreparationReport } from "../production-launch-preparation-plan";
import { getSafeDefaultRuntimeConfig } from "../runtime-config-readiness";
import { createOfflineReadonlyResponseFallback } from "../offline-readonly-strategy";
import { getTeoyubeRoadmapCompletionSummary } from "../teoyube-roadmap-completion-summary";
import { runPhase7FinalCompletionExample } from "./phase-7-final-completion-example";

export type Phase7FinalCompletionSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase7FinalCompletionSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase7FinalCompletionSmokeCheckResult[];
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

function result(name: string, errors: string[]): Phase7FinalCompletionSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function containsActiveForbiddenRuntimeRequirement(value: unknown): boolean {
  const serialized = JSON.stringify(value ?? {}).toLowerCase();
  return [
    "\"productionservicesconnected\":true",
    "\"activeprovidersconnected\":true",
    "\"connected\":true",
    "\"sendsexternally\":true",
    "\"writestoexternally\":true",
    "\"writestodatabase\":true",
    "\"externaleventsendingenabled\":true",
    "\"productionpersistenceenabled\":true",
    "\"liveaiorchestrationenabled\":true",
    "\"rawtextstorageenabled\":true",
    "\"hiddenpersonalizationenabled\":true"
  ].some((pattern) => serialized.includes(pattern));
}

export function runPhase7FinalCompletionSmokeCheck(): Phase7FinalCompletionSmokeCheckReport {
  const audit = runPhase7MobileScaleCompletionAudit();
  const safety = runPhase7MobileScaleSafetyCheck();
  const surfaces = createPhase7SurfaceReadinessReport();
  const launchPrep = createProductionLaunchPreparationReport();
  const roadmap = getTeoyubeRoadmapCompletionSummary();
  const analytics = createAnalyticsProviderReadinessReport();
  const persistence = createPersistenceAdapterReadinessReport();
  const config = getSafeDefaultRuntimeConfig();
  const offlineFallback = createOfflineReadonlyResponseFallback("daily_word");
  const example = runPhase7FinalCompletionExample();

  const results = [
    result("Phase 7 completion audit returns structured report", clean([
      audit.phase === "Phase 7.5 - Final Mobile & Scale Completion Audit" ? "" : "Completion audit has wrong phase.",
      audit.complete ? "" : "Completion audit should be complete.",
      audit.completionPercentage === 100 ? "" : "Completion audit should be 100%.",
      audit.nextStep === "Production Launch Preparation" ? "" : "Completion audit should point to Production Launch Preparation."
    ])),
    result("Phase 7 safety check returns structured report", clean([
      safety.valid ? "" : safety.errors.join("; "),
      safety.completionPercentage === 100 ? "" : "Safety check should be 100%."
    ])),
    result("surface readiness report covers required surfaces", clean([
      surfaces.complete ? "" : "Surface readiness report should be complete.",
      surfaces.surfaceCount >= 12 ? "" : "Surface readiness should cover at least 12 surfaces."
    ])),
    result("production launch preparation plan exists", clean([
      launchPrep.readyToBegin ? "" : "Production Launch Preparation should be ready to begin.",
      launchPrep.productionServicesConnected ? "Production services should not be connected yet." : "",
      launchPrep.activeProvidersConnected ? "External providers should not be connected yet." : ""
    ])),
    result("roadmap completion summary exists", clean([
      roadmap.completedPhaseCount >= 4 ? "" : "Roadmap summary should include completed phases.",
      roadmap.nextRecommendedStage === "Soft Launch Preparation" ? "" : "Next stage should be Soft Launch Preparation."
    ])),
    result("external systems remain disconnected", clean([
      analytics.plans.some((plan) => plan.sendsExternally || plan.connected)
        ? "Analytics plans should not send externally or be connected."
        : "",
      persistence.plans.some((plan) => plan.writesToDatabase || plan.connected)
        ? "Persistence plans should not write to a database or be connected."
        : "",
      config.featureFlags.liveAiOrchestrationEnabled ? "Live AI orchestration should be disabled." : ""
    ])),
    result("offline fallback and explanation remain Scripture-safe", clean([
      offlineFallback.scriptureReference ? "" : "Offline fallback should include a Scripture reference.",
      offlineFallback.explanationPath.length ? "" : "Offline fallback should include explanation path.",
      config.featureFlags.explanationPathRequired ? "" : "Explanation path should remain required.",
      config.featureFlags.consentControlsRequired ? "" : "Consent controls should remain required."
    ])),
    result("no prohibited runtime dependencies are required", clean([
      containsActiveForbiddenRuntimeRequirement({
        audit,
        safety,
        surfaces,
        launchPrep,
        roadmap
      })
        ? "Phase 7.5 should not require database writes, external APIs, analytics providers, service workers, localStorage, cookies, IndexedDB, or file writes."
        : ""
    ])),
    result("Phase 7.5 example confirms launch readiness", clean([
      example.launchPreparationReady ? "" : "Phase 7.5 example should confirm launch preparation readiness.",
      example.completionAudit.complete ? "" : "Example should include completed audit.",
      example.safetyCheck.valid ? "" : "Example should include valid safety check."
    ]))
  ];
  const errors = results.flatMap((entry) =>
    entry.errors.map((error) => `${entry.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
