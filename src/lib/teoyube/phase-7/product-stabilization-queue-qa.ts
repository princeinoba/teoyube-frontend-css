import {
  createProductStabilizationQueue
} from "./product-stabilization-queue-manager";
import type { TeoyubeProductStabilizationQueue } from "./product-stabilization-queue-contracts";
import {
  createProductStabilizationSafetyReport,
  validateProductStabilizationQueueSafety as validateQueueSafetyReport
} from "./product-stabilization-safety-validator";
import type { TeoyubePhase72QaCheck } from "./feedback-review-simulation-qa";

export type TeoyubeProductStabilizationQueueQaReport = {
  valid: boolean;
  checks: TeoyubePhase72QaCheck[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noUnsafeFixes: boolean;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noHiddenPersonalizationCreated: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase72QaCheck {
  return { id, passed, details };
}

function queueFromInput(input?: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationQueue {
  return input || createProductStabilizationQueue();
}

export function validateProductStabilizationQueueSafety(input?: TeoyubeProductStabilizationQueue): TeoyubePhase72QaCheck {
  const report = validateQueueSafetyReport(queueFromInput(input));
  return check("product_stabilization_queue_safety", report.valid && report.noUnsafeFixes, `${report.blockers.length} safety blocker(s).`);
}

export function validateProductStabilizationNoUnsafeFixes(input?: TeoyubeProductStabilizationQueue): TeoyubePhase72QaCheck {
  const report = createProductStabilizationSafetyReport(queueFromInput(input));
  return check("product_stabilization_no_unsafe_fixes", report.noUnsafeFixes, "Safety validator blocks unsafe stabilization items.");
}

export function validateProductStabilizationScriptureProtection(input?: TeoyubeProductStabilizationQueue): TeoyubePhase72QaCheck {
  const queue = queueFromInput(input);
  return check("product_stabilization_scripture_protection", queue.items.every((item) => item.preservesScriptureAnchors), "Queue items preserve Scripture anchors.");
}

export function validateProductStabilizationExplanationProtection(input?: TeoyubeProductStabilizationQueue): TeoyubePhase72QaCheck {
  const queue = queueFromInput(input);
  return check("product_stabilization_explanation_protection", queue.items.every((item) => item.preservesExplanationTraces), "Queue items preserve explanation traces.");
}

export function validateProductStabilizationFallbackProtection(input?: TeoyubeProductStabilizationQueue): TeoyubePhase72QaCheck {
  const queue = queueFromInput(input);
  return check("product_stabilization_fallback_protection", queue.items.every((item) => item.preservesFallbackSafety), "Queue items preserve fallback safety.");
}

export function validateProductStabilizationServiceDisabledProtection(input?: TeoyubeProductStabilizationQueue): TeoyubePhase72QaCheck {
  const queue = queueFromInput(input);
  return check("product_stabilization_service_disabled_protection", queue.noExternalServicesRequired && queue.noDatabasePersistenceEnabled && queue.noAnalyticsEnabled && queue.noMonitoringProviderConnected && queue.noLiveAiOrchestrationEnabled && queue.noAdminAuthAdded && queue.noCmsConnected, "Services remain disabled across the queue.");
}

export function validateProductStabilizationNoHiddenPersonalization(input?: TeoyubeProductStabilizationQueue): TeoyubePhase72QaCheck {
  const queue = queueFromInput(input);
  return check("product_stabilization_no_hidden_personalization", queue.noBrowserPersistenceRequired && queue.items.every((item) => item.noBrowserPersistenceRequired), "Queue requires no browser persistence or hidden personalization.");
}

export function createProductStabilizationQueueQaReport(input?: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationQueueQaReport {
  const safetyReport = createProductStabilizationSafetyReport(queueFromInput(input));
  const checks = [
    validateProductStabilizationQueueSafety(input),
    validateProductStabilizationNoUnsafeFixes(input),
    validateProductStabilizationScriptureProtection(input),
    validateProductStabilizationExplanationProtection(input),
    validateProductStabilizationFallbackProtection(input),
    validateProductStabilizationServiceDisabledProtection(input),
    validateProductStabilizationNoHiddenPersonalization(input)
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: safetyReport.warnings.map((entry) => entry.message),
    manualOnly: true,
    inMemoryOnly: true,
    noUnsafeFixes: safetyReport.noUnsafeFixes,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noHiddenPersonalizationCreated: true,
    generatedAt: new Date().toISOString()
  };
}
