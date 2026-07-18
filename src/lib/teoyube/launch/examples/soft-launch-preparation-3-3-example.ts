import { createFinalSoftLaunchExecutionHandoff, createSoftLaunchExecutionHandoffReport } from "../final-soft-launch-execution-handoff";
import { createFinalSoftLaunchGoNoGoReport } from "../final-soft-launch-go-no-go";
import { createKnownLimitationsReport } from "../final-soft-launch-known-limitations";
import { createFinalSoftLaunchOwnerGoNoGoRecord, createFinalSoftLaunchOwnerGoNoGoReport } from "../final-soft-launch-owner-go-no-go";
import { createFinalSoftLaunchQualityGateReport } from "../final-soft-launch-quality-gate-report";
import { createFinalSoftLaunchReadinessPackage, createFinalSoftLaunchReadinessPackageReport } from "../final-soft-launch-readiness-package";
import { runFinalSoftLaunchReadinessAudit } from "../final-soft-launch-readiness-audit";
import { createFinalSoftLaunchRiskRegister, createFinalSoftLaunchRiskRegisterReport } from "../final-soft-launch-risk-register";
import { createFinalSoftLaunchSafetyCertificationReport } from "../final-soft-launch-safety-certification";
import { createFinalSoftLaunchSurfaceCertificationReport } from "../final-soft-launch-surface-certification";

export function runSoftLaunchPreparation33Example() {
  const readinessPackage = createFinalSoftLaunchReadinessPackage();
  const readinessPackageReport = createFinalSoftLaunchReadinessPackageReport(readinessPackage);
  const safetyCertification = createFinalSoftLaunchSafetyCertificationReport();
  const surfaceCertification = createFinalSoftLaunchSurfaceCertificationReport();
  const qualityGateReport = createFinalSoftLaunchQualityGateReport();
  const riskRegister = createFinalSoftLaunchRiskRegister();
  const riskRegisterReport = createFinalSoftLaunchRiskRegisterReport(riskRegister);
  const knownLimitationsReport = createKnownLimitationsReport();
  const ownerGoNoGoRecord = createFinalSoftLaunchOwnerGoNoGoRecord();
  const ownerGoNoGoReport = createFinalSoftLaunchOwnerGoNoGoReport(ownerGoNoGoRecord);
  const goNoGoReport = createFinalSoftLaunchGoNoGoReport();
  const executionHandoff = createFinalSoftLaunchExecutionHandoff();
  const executionHandoffReport = createSoftLaunchExecutionHandoffReport(executionHandoff);
  const audit = runFinalSoftLaunchReadinessAudit();

  return {
    readinessPackage,
    readinessPackageReport,
    safetyCertification,
    surfaceCertification,
    qualityGateReport,
    riskRegister,
    riskRegisterReport,
    knownLimitationsReport,
    ownerGoNoGoRecord,
    ownerGoNoGoReport,
    goNoGoReport,
    executionHandoff,
    executionHandoffReport,
    audit
  };
}

export const SOFT_LAUNCH_PREPARATION_3_3_EXAMPLE = runSoftLaunchPreparation33Example();
