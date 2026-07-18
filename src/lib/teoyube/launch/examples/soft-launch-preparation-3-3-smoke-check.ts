import { createFinalSoftLaunchExecutionHandoff, createSoftLaunchExecutionHandoffReport } from "../final-soft-launch-execution-handoff";
import { createFinalSoftLaunchGoNoGoReport } from "../final-soft-launch-go-no-go";
import { createKnownLimitationsReport } from "../final-soft-launch-known-limitations";
import { createFinalSoftLaunchOwnerGoNoGoChecklist, createFinalSoftLaunchOwnerGoNoGoReport } from "../final-soft-launch-owner-go-no-go";
import { createFinalSoftLaunchQualityGateReport } from "../final-soft-launch-quality-gate-report";
import { createFinalSoftLaunchReadinessPackage, createFinalSoftLaunchReadinessPackageReport } from "../final-soft-launch-readiness-package";
import { runFinalSoftLaunchReadinessAudit } from "../final-soft-launch-readiness-audit";
import { createFinalSoftLaunchRiskRegister, createFinalSoftLaunchRiskRegisterReport } from "../final-soft-launch-risk-register";
import { createFinalSoftLaunchSafetyCertificationReport } from "../final-soft-launch-safety-certification";
import { createFinalSoftLaunchSurfaceCertificationReport } from "../final-soft-launch-surface-certification";

export type SoftLaunchPreparation33SmokeCheckReport = {
  valid: boolean;
  errors: string[];
  readinessPackageDecision: string;
  goNoGoDecision: string;
  auditCompletionPercentage: number;
};

function assert(condition: boolean, message: string, errors: string[]): void {
  if (!condition) errors.push(message);
}

export function runSoftLaunchPreparation33SmokeCheck(): SoftLaunchPreparation33SmokeCheckReport {
  const errors: string[] = [];
  const readinessPackage = createFinalSoftLaunchReadinessPackage();
  const readinessPackageReport = createFinalSoftLaunchReadinessPackageReport(readinessPackage);
  const safety = createFinalSoftLaunchSafetyCertificationReport();
  const surfaces = createFinalSoftLaunchSurfaceCertificationReport();
  const quality = createFinalSoftLaunchQualityGateReport();
  const riskRegister = createFinalSoftLaunchRiskRegister();
  const riskRegisterReport = createFinalSoftLaunchRiskRegisterReport(riskRegister);
  const limitations = createKnownLimitationsReport();
  const ownerChecklist = createFinalSoftLaunchOwnerGoNoGoChecklist();
  const owner = createFinalSoftLaunchOwnerGoNoGoReport();
  const goNoGo = createFinalSoftLaunchGoNoGoReport();
  const handoff = createFinalSoftLaunchExecutionHandoff();
  const handoffReport = createSoftLaunchExecutionHandoffReport(handoff);
  const audit = runFinalSoftLaunchReadinessAudit();

  assert(readinessPackage.inMemoryOnly && readinessPackageReport.valid, "Final readiness package should be valid and in-memory only.", errors);
  assert(safety.valid && safety.scriptureAnchoringRequired && safety.explanationPathsRequired, "Safety certification should preserve Scripture anchoring and explanation paths.", errors);
  assert(surfaces.valid && surfaces.surfaceCount >= 15, "Surface certification should cover required final soft launch surfaces.", errors);
  assert(quality.valid && quality.gateCount >= 25, "Final quality gate report should exist and include required gates.", errors);
  assert(riskRegister.inMemoryOnly && riskRegisterReport.valid, "Risk register should work in memory only.", errors);
  assert(limitations.valid && limitations.limitationCount >= 8, "Known limitations should be generated.", errors);
  assert(ownerChecklist.length >= 12 && owner.valid, "Owner go/no-go checklist and report should be valid.", errors);
  assert(goNoGo.valid && goNoGo.decision === "go_for_limited_soft_launch_execution", "Final go/no-go should return a structured go decision.", errors);
  assert(handoffReport.valid && !handoff.launchExecuted && !handoff.usersContacted, "Execution handoff should perform no launch action.", errors);
  assert(audit.complete && audit.completionPercentage === 100, "Final soft launch readiness audit should be complete.", errors);
  assert(readinessPackage.launchPerformed === false, "No actual launch should be performed.", errors);
  assert(readinessPackage.usersContacted === false, "No users should be contacted.", errors);
  assert(readinessPackage.realFeedbackCollected === false, "No real feedback should be collected.", errors);
  assert(readinessPackage.previewUrlFetched === false, "No preview URL should be fetched.", errors);
  assert(readinessPackage.databaseWritten === false, "No database writes should be required.", errors);
  assert(readinessPackage.analyticsSent === false, "No analytics provider should be called.", errors);
  assert(readinessPackage.fileWritten === false, "No file writes should be performed by the package.", errors);
  assert(handoff.databaseWritten === false && handoff.analyticsSent === false && handoff.externalServicesCalled === false, "Handoff should avoid storage, analytics, and external services.", errors);

  return {
    valid: errors.length === 0,
    errors,
    readinessPackageDecision: readinessPackageReport.decision,
    goNoGoDecision: goNoGo.decision,
    auditCompletionPercentage: audit.completionPercentage
  };
}
