export type TeoyubeFinalPublicReleaseBoundaryLockInput = Partial<{
  publicLaunchFromCode: boolean;
  automaticUserContact: boolean;
  automaticFeedbackCollection: boolean;
  publicUrlFetching: boolean;
  externalServiceConnection: boolean;
  reviewOnlyContentPublished: boolean;
  hiddenPersonalization: boolean;
  divineCertaintyClaims: boolean;
  professionalAdviceClaims: boolean;
}>;

export type TeoyubeFinalPublicReleaseBoundaryLockDecision =
  | "public_release_boundaries_locked"
  | "blocked"
  | "unknown";

export type TeoyubeFinalPublicReleaseBoundaryLockRule = {
  id: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeFinalPublicReleaseBoundaryLockReport = {
  valid: boolean;
  decision: TeoyubeFinalPublicReleaseBoundaryLockDecision;
  rules: TeoyubeFinalPublicReleaseBoundaryLockRule[];
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noReviewOnlyContentPublished: true;
  noHiddenPersonalization: true;
  noDivineCertaintyClaims: true;
  noProfessionalAdviceClaims: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function rule(id: string, label: string, passed: boolean, details: string): TeoyubeFinalPublicReleaseBoundaryLockRule {
  return { id, label, passed, details };
}

export function validateFinalNoPublicLaunchFromCode(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.publicLaunchFromCode;
}

export function validateFinalNoAutomaticUserContact(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.automaticUserContact;
}

export function validateFinalNoAutomaticFeedbackCollection(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.automaticFeedbackCollection;
}

export function validateFinalNoPublicUrlFetching(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.publicUrlFetching;
}

export function validateFinalNoExternalServiceConnection(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.externalServiceConnection;
}

export function validateFinalNoReviewOnlyContentPublished(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.reviewOnlyContentPublished;
}

export function validateFinalNoHiddenPersonalization(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.hiddenPersonalization;
}

export function validateFinalNoDivineCertaintyClaims(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.divineCertaintyClaims;
}

export function validateFinalNoProfessionalAdviceClaims(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): boolean {
  return !input.professionalAdviceClaims;
}

export function createFinalPublicReleaseBoundaryLock(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): TeoyubeFinalPublicReleaseBoundaryLockRule[] {
  return [
    rule("no_public_launch", "No public launch from code", validateFinalNoPublicLaunchFromCode(input), "This step does not launch publicly."),
    rule("no_user_contact", "No automatic user contact", validateFinalNoAutomaticUserContact(input), "This step does not contact users."),
    rule("no_auto_feedback", "No automatic feedback collection", validateFinalNoAutomaticFeedbackCollection(input), "This step does not collect feedback automatically."),
    rule("no_public_url_fetching", "No public URL fetching", validateFinalNoPublicUrlFetching(input), "This step does not fetch public URLs."),
    rule("no_external_service_connection", "No external service connection", validateFinalNoExternalServiceConnection(input), "This step does not connect services."),
    rule("no_review_only_publish", "No review-only content published", validateFinalNoReviewOnlyContentPublished(input), "This step does not publish review-only content."),
    rule("no_hidden_personalization", "No hidden personalization", validateFinalNoHiddenPersonalization(input), "This step does not add hidden personalization."),
    rule("no_divine_certainty", "No divine-certainty claims", validateFinalNoDivineCertaintyClaims(input), "This step does not introduce divine-certainty claims."),
    rule("no_professional_advice", "No professional-advice claims", validateFinalNoProfessionalAdviceClaims(input), "This step does not introduce medical, legal, financial, emergency, or counseling advice claims.")
  ];
}

export function createFinalPublicReleaseBoundaryLockDecision(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): TeoyubeFinalPublicReleaseBoundaryLockDecision {
  return createFinalPublicReleaseBoundaryLock(input).some((entry) => !entry.passed) ? "blocked" : "public_release_boundaries_locked";
}

export function createFinalPublicReleaseBoundaryLockReport(input: TeoyubeFinalPublicReleaseBoundaryLockInput = {}): TeoyubeFinalPublicReleaseBoundaryLockReport {
  const rules = createFinalPublicReleaseBoundaryLock(input);
  const blockers = rules.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    decision: createFinalPublicReleaseBoundaryLockDecision(input),
    rules,
    blockers,
    warnings: ["Final public release boundary lock is planning-only and performs no launch, contact, feedback collection, URL fetching, publishing, or service connection."],
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noReviewOnlyContentPublished: true,
    noHiddenPersonalization: true,
    noDivineCertaintyClaims: true,
    noProfessionalAdviceClaims: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
