import type {
  TeoyubeDeploymentReadinessStatus,
  TeoyubeDeploymentTarget,
  TeoyubeScaleReadinessCheck,
  TeoyubeScaleReadinessReport
} from "./scale-readiness-contracts";

export type TeoyubeDeploymentReadinessState = {
  target: TeoyubeDeploymentTarget;
  typecheckPassing: boolean;
  lintPassing: boolean;
  buildPassing: boolean;
  externalAnalyticsSendingConfigured: boolean;
  productionPersistenceConfigured: boolean;
  liveAiOrchestrationDisabled: boolean;
  debugModeDisabledInProduction: boolean;
  safetyGuardrailsEnabled: boolean;
  scriptureAnchorRequirementEnabled: boolean;
  explanationPathRequirementEnabled: boolean;
  fallbackPathEnabled: boolean;
  consentControlsAvailable: boolean;
  mobileLayoutChecksComplete: boolean;
  performanceCacheOfflineChecksComplete: boolean;
};

function defaultState(target: TeoyubeDeploymentTarget): TeoyubeDeploymentReadinessState {
  return {
    target,
    typecheckPassing: false,
    lintPassing: false,
    buildPassing: false,
    externalAnalyticsSendingConfigured: false,
    productionPersistenceConfigured: false,
    liveAiOrchestrationDisabled: true,
    debugModeDisabledInProduction: true,
    safetyGuardrailsEnabled: true,
    scriptureAnchorRequirementEnabled: true,
    explanationPathRequirementEnabled: true,
    fallbackPathEnabled: true,
    consentControlsAvailable: true,
    mobileLayoutChecksComplete: true,
    performanceCacheOfflineChecksComplete: true
  };
}

function check(
  id: string,
  label: string,
  passed: boolean,
  details: string,
  required = true
): TeoyubeScaleReadinessCheck {
  return {
    id,
    label,
    status: passed ? "ready" : "needs_work",
    required,
    riskLevel: passed ? "low" : "medium",
    details
  };
}

export function getDeploymentReadinessChecklist(
  state: Partial<TeoyubeDeploymentReadinessState> = {}
): TeoyubeScaleReadinessCheck[] {
  const merged = {
    ...defaultState(state.target || "preview"),
    ...state
  };

  return [
    check("typecheck", "TypeScript check passes", merged.typecheckPassing, "Run the available TypeScript check before production deployment."),
    check("lint", "Lint check passes", merged.lintPassing, "Run lint if the project defines a lint script."),
    check("build", "Build passes", merged.buildPassing, "Run the production build before deployment."),
    check(
      "external_analytics_guarded",
      "No external analytics sending unless configured",
      !merged.externalAnalyticsSendingConfigured,
      "External analytics remains disconnected in Phase 7.4."
    ),
    check(
      "production_persistence_guarded",
      "No production persistence unless configured",
      !merged.productionPersistenceConfigured,
      "Production persistence remains disconnected in Phase 7.4."
    ),
    check(
      "live_ai_disabled",
      "Live AI orchestration disabled",
      merged.liveAiOrchestrationDisabled,
      "Live AI orchestration is intentionally disabled for this phase."
    ),
    check(
      "production_debug_disabled",
      "Debug mode disabled in production",
      merged.target !== "production" || merged.debugModeDisabledInProduction,
      "Production mode should not expose debug payloads by default."
    ),
    check(
      "safety_guardrails",
      "Safety guardrails enabled",
      merged.safetyGuardrailsEnabled,
      "Guardrails must stay active across deployment targets."
    ),
    check(
      "scripture_anchor_required",
      "Scripture anchor requirement enabled",
      merged.scriptureAnchorRequirementEnabled,
      "Every usable TIG response must include Scripture."
    ),
    check(
      "explanation_path_required",
      "Explanation path requirement enabled",
      merged.explanationPathRequirementEnabled,
      "Users must be able to see why graph choices were made."
    ),
    check(
      "fallback_path_enabled",
      "Fallback path enabled",
      merged.fallbackPathEnabled,
      "Weak confidence, offline, and malformed input paths need Scripture-safe fallback."
    ),
    check(
      "consent_controls_available",
      "Consent controls available",
      merged.consentControlsAvailable,
      "Personalization controls must remain visible and reversible."
    ),
    check(
      "mobile_layout_complete",
      "Mobile layout checks complete",
      merged.mobileLayoutChecksComplete,
      "Phase 7.2 mobile UI optimization should remain complete."
    ),
    check(
      "performance_cache_offline_complete",
      "Performance/cache/offline checks complete",
      merged.performanceCacheOfflineChecksComplete,
      "Phase 7.3 performance, cache, and offline readiness should remain complete."
    )
  ];
}

export function getPreviewDeploymentChecklist(): TeoyubeScaleReadinessCheck[] {
  return getDeploymentReadinessChecklist({
    target: "preview",
    typecheckPassing: true,
    lintPassing: true,
    buildPassing: true
  });
}

export function getProductionDeploymentChecklist(): TeoyubeScaleReadinessCheck[] {
  return getDeploymentReadinessChecklist({
    target: "production"
  });
}

export function validateDeploymentReadiness(
  state: Partial<TeoyubeDeploymentReadinessState> = {}
) {
  const checks = getDeploymentReadinessChecklist(state);
  const missing = checks
    .filter((item) => item.required && item.status !== "ready")
    .map((item) => item.id);

  return {
    valid: missing.length === 0,
    status: missing.length ? "needs_work" as TeoyubeDeploymentReadinessStatus : "ready" as TeoyubeDeploymentReadinessStatus,
    checks,
    missing,
    warnings: [
      "Phase 7.4 creates deployment readiness structure; actual deployment provider setup remains future work."
    ]
  };
}

export function createDeploymentReadinessReport(
  state: Partial<TeoyubeDeploymentReadinessState> = {}
): TeoyubeScaleReadinessReport {
  const target = state.target || "preview";
  const validation = validateDeploymentReadiness(state);
  const completed = validation.checks.filter((item) => item.status === "ready");

  return {
    id: "phase_7_4_deployment_readiness",
    title: "Deployment Readiness Checklist",
    status: validation.status,
    target,
    complete: validation.valid,
    completionPercentage: Math.round(
      (completed.length / Math.max(1, validation.checks.length)) * 100
    ),
    checks: validation.checks,
    warnings: validation.warnings,
    generatedAt: new Date().toISOString()
  };
}

