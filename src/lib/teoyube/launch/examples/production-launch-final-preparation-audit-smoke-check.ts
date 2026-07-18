import { createFinalLaunchBlockerRegister, addFinalLaunchBlocker, resolveFinalLaunchBlocker, createFinalLaunchBlockerReport } from "../final-launch-blocker-register";
import { createFinalLaunchOwnerReviewChecklist } from "../final-launch-owner-review";
import { runFinalLaunchPreparationAudit } from "../final-launch-preparation-audit";
import { createFinalLaunchPreparationSummaryReport } from "../final-launch-preparation-summary";
import { createFinalLaunchQualityGateReport } from "../final-launch-quality-gate-report";
import { createFinalLaunchReadinessPackage, createFinalLaunchReadinessPackageReport } from "../final-launch-readiness-package";
import { createFinalLaunchSafetyCertificationReport } from "../final-launch-safety-certification";
import { createFinalLaunchSurfaceCertificationReport } from "../final-launch-surface-certification";

export type ProductionLaunchFinalPreparationAuditSmokeCheckResult = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: boolean;
  noSoftLaunchPerformed: boolean;
  noUsersContacted: boolean;
  noExternalSystemsRequired: boolean;
  generatedAt: string;
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runProductionLaunchFinalPreparationAuditSmokeCheck(): ProductionLaunchFinalPreparationAuditSmokeCheckResult {
  const audit = runFinalLaunchPreparationAudit();
  const safety = createFinalLaunchSafetyCertificationReport();
  const gates = createFinalLaunchQualityGateReport();
  const surfaces = createFinalLaunchSurfaceCertificationReport();
  const register = createFinalLaunchBlockerRegister();
  const withBlocker = addFinalLaunchBlocker(register, {
    id: "sample_blocker",
    label: "Sample blocker",
    category: "qa",
    riskLevel: "high",
    reason: "Sample in-memory smoke blocker.",
    requiredAction: "Resolve the sample blocker."
  });
  const resolvedRegister = resolveFinalLaunchBlocker(withBlocker, "sample_blocker", "Resolved in smoke check.");
  const blockerReport = createFinalLaunchBlockerReport(resolvedRegister);
  const readinessPackage = createFinalLaunchReadinessPackage({ blockerRegister: register });
  const readinessPackageReport = createFinalLaunchReadinessPackageReport(readinessPackage);
  const ownerReviewChecklist = createFinalLaunchOwnerReviewChecklist();
  const summary = createFinalLaunchPreparationSummaryReport();

  const errors = clean([
    audit.ready && audit.completionPercentage === 100 ? "" : "Final launch preparation audit should be ready and 100% complete.",
    audit.decision === "ready_for_manual_preview_deployment" ? "" : "Final launch preparation audit should be ready for manual preview deployment.",
    safety.valid && safety.certification.scriptureAnchoringRequired ? "" : "Final safety certification should pass and require Scripture anchoring.",
    gates.ready && gates.gateCount > 0 ? "" : "Final quality gate report should be structured and ready.",
    surfaces.ready && surfaces.surfaceCount >= 12 ? "" : "Final surface certification should cover required launch surfaces.",
    blockerReport.summary.openCount === 0 && blockerReport.summary.inMemoryOnly ? "" : "Final blocker register should work in memory only.",
    readinessPackage.ready && readinessPackageReport.valid ? "" : "Final readiness package should be valid and ready.",
    ownerReviewChecklist.length > 0 ? "" : "Final owner review checklist should exist.",
    summary.productionLaunchPreparationStatus === "100% Complete" ? "" : "Final summary should mark Production Launch Preparation complete.",
    readinessPackage.deploymentPerformed === false ? "" : "Final readiness package must not deploy.",
    readinessPackage.sentExternally === false ? "" : "Final readiness package must not be sent externally.",
    readinessPackage.filesWritten === false ? "" : "Final readiness package must not write files."
  ]);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noSoftLaunchPerformed: true,
    noUsersContacted: true,
    noExternalSystemsRequired: true,
    generatedAt: new Date().toISOString()
  };
}
