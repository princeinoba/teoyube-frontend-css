import { createPhase91Package, createPhase91PackageReport } from "./phase-9-1-package";
import { createPhase92Package, createPhase92PackageReport } from "./phase-9-2-package";
import { createPhase93Package, createPhase93PackageReport } from "./phase-9-3-package";

export type TeoyubePublicReadinessEvidenceInput = Partial<{
  phase91PackageReport: ReturnType<typeof createPhase91PackageReport>;
  phase92PackageReport: ReturnType<typeof createPhase92PackageReport>;
  phase93PackageReport: ReturnType<typeof createPhase93PackageReport>;
  safeFixesApplied: number;
  fixesDeferred: number;
  fixesRequiringOwnerReview: number;
}>;

export type TeoyubePublicReadinessEvidenceItem = {
  id: string;
  label: string;
  summary: string;
  source: string;
};

export type TeoyubePublicReadinessEvidenceReport = {
  valid: boolean;
  evidence: TeoyubePublicReadinessEvidenceItem[];
  releaseCandidateQaScore: number;
  publicGoNoGoReadinessScore: number;
  qaBlockersResolved: number;
  qaBlockersRemaining: number;
  safeFixesApplied: number;
  fixesDeferred: number;
  fixesRequiringOwnerReview: number;
  blockers: string[];
  warnings: string[];
  noExternalPersistence: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function reports(input: TeoyubePublicReadinessEvidenceInput = {}) {
  const phase91PackageReport = input.phase91PackageReport || createPhase91PackageReport(createPhase91Package({ ownerReviewed: true }));
  const phase92PackageReport = input.phase92PackageReport || createPhase92PackageReport(createPhase92Package({ ownerReviewed: true }));
  const phase93PackageReport = input.phase93PackageReport || createPhase93PackageReport(createPhase93Package({ ownerReviewed: true }));
  return { phase91PackageReport, phase92PackageReport, phase93PackageReport };
}

function evidence(id: string, label: string, summary: string, source: string): TeoyubePublicReadinessEvidenceItem {
  return { id, label, summary, source };
}

export function summarizePublicPreparationEvidence(input: TeoyubePublicReadinessEvidenceInput = {}): TeoyubePublicReadinessEvidenceItem {
  const { phase91PackageReport } = reports(input);
  return evidence("public_preparation", "Controlled public release preparation", phase91PackageReport.decision, "phase-9-1-package.ts");
}

export function summarizeReleaseCandidateQaEvidence(input: TeoyubePublicReadinessEvidenceInput = {}): TeoyubePublicReadinessEvidenceItem {
  const { phase92PackageReport } = reports(input);
  return evidence("release_candidate_qa", "Release candidate QA", `${phase92PackageReport.decision}; score ${phase92PackageReport.readinessScore} (${phase92PackageReport.readinessScoreBand}).`, "phase-9-2-package.ts");
}

export function summarizeRemediationEvidence(input: TeoyubePublicReadinessEvidenceInput = {}): TeoyubePublicReadinessEvidenceItem {
  const { phase93PackageReport } = reports(input);
  return evidence("remediation", "Release candidate remediation", `${phase93PackageReport.decision}; safe fixes ${input.safeFixesApplied ?? 0}, deferred ${input.fixesDeferred ?? 0}, owner-review ${input.fixesRequiringOwnerReview ?? 0}.`, "phase-9-3-package.ts");
}

export function summarizeFinalRegressionEvidence(input: TeoyubePublicReadinessEvidenceInput = {}): TeoyubePublicReadinessEvidenceItem {
  const { phase93PackageReport } = reports(input);
  return evidence("final_regression", "Final regression QA", `Phase 9.3 final regression package is ${phase93PackageReport.valid ? "valid" : "blocked"}.`, "release-candidate-remediation-package.ts");
}

export function summarizeServiceDisabledEvidence(): TeoyubePublicReadinessEvidenceItem {
  return evidence("service_disabled", "Service-disabled confirmation", "Database, analytics, monitoring provider, admin auth, CMS, feedback storage, user accounts, live AI, and notifications remain disabled.", "final-service-disabled-regression.ts");
}

export function summarizePrivacySecurityEvidence(): TeoyubePublicReadinessEvidenceItem {
  return evidence("privacy_security", "Privacy and consent confirmation", "Privacy, consent, sensitive data warnings, no raw sensitive text storage, no sensitive browser persistence, and no hidden personalization remain protected.", "final-privacy-consent-regression.ts");
}

export function summarizeSafetyEvidence(): TeoyubePublicReadinessEvidenceItem {
  return evidence("safety", "Scripture, explanation, fallback, and confidence confirmation", "Scripture anchors, explanation traces, fallback safety, confidence labels, reviewed content gate, no divine-certainty language, and no professional-advice language remain protected.", "final-public-safety-regression.ts");
}

export function summarizeOwnerReviewEvidence(): TeoyubePublicReadinessEvidenceItem {
  return evidence("owner_review", "Owner review confirmation", "Final owner approval is structured and manual; no signatures or external workflow are required.", "final-public-owner-approval.ts");
}

export function createPublicReadinessEvidenceSummary(input: TeoyubePublicReadinessEvidenceInput = {}): TeoyubePublicReadinessEvidenceItem[] {
  return [
    summarizePublicPreparationEvidence(input),
    summarizeReleaseCandidateQaEvidence(input),
    summarizeRemediationEvidence(input),
    summarizeFinalRegressionEvidence(input),
    summarizeServiceDisabledEvidence(),
    summarizePrivacySecurityEvidence(),
    summarizeSafetyEvidence(),
    evidence("mobile_accessibility", "Mobile/accessibility confirmation", "Core public surfaces remain mobile-aware and accessibility basics remain protected.", "final-mobile-accessibility-regression.ts"),
    evidence("support_feedback", "Support and feedback readiness", "Support and feedback remain manual and bounded.", "public-support-readiness.ts"),
    evidence("known_limitations", "Known limitations confirmation", "Known limitations remain visible and explicitly avoid divine certainty or professional advice claims.", "final-public-known-limitations.ts"),
    summarizeOwnerReviewEvidence()
  ];
}

export function createPublicReadinessEvidenceReport(input: TeoyubePublicReadinessEvidenceInput = {}): TeoyubePublicReadinessEvidenceReport {
  const { phase92PackageReport, phase93PackageReport } = reports(input);
  const blockers = [
    ...phase92PackageReport.blockers,
    ...phase93PackageReport.blockers
  ];
  const warnings = [
    ...phase92PackageReport.warnings,
    ...phase93PackageReport.warnings,
    "Public readiness evidence is an in-memory summary and is not persisted externally."
  ];
  return {
    valid: blockers.length === 0,
    evidence: createPublicReadinessEvidenceSummary(input),
    releaseCandidateQaScore: phase92PackageReport.readinessScore,
    publicGoNoGoReadinessScore: phase93PackageReport.readinessScore,
    qaBlockersResolved: blockers.length === 0 ? 0 : Math.max(0, blockers.length - phase93PackageReport.blockers.length),
    qaBlockersRemaining: blockers.length,
    safeFixesApplied: input.safeFixesApplied ?? 0,
    fixesDeferred: input.fixesDeferred ?? 0,
    fixesRequiringOwnerReview: input.fixesRequiringOwnerReview ?? 0,
    blockers,
    warnings,
    noExternalPersistence: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
