export type TeoyubeTheologicalTheme =
  | "calling"
  | "identity"
  | "promise"
  | "wisdom"
  | "healing"
  | "protection"
  | "growth"
  | "legacy"
  | "prayer"
  | "hope"
  | "unknown";

export type TeoyubeTheologyBoundaryReport = {
  valid: boolean;
  blockers: string[];
  warnings: string[];
  scriptureAnchoringRequired: true;
  explanationPathRequired: true;
  noDivineCertainty: true;
  noProfessionalAdvice: true;
  tigRecommendationsMustStayScriptureAnchored: true;
};

export type TeoyubeTheologyFramework = {
  id: "teoyube_phase_3_theology_framework";
  themes: TeoyubeTheologicalTheme[];
  scriptureAnchorRequirements: string[];
  promiseInterpretationBoundaries: string[];
  devotionalExplanationBoundaries: string[];
  noDivineCertaintyLanguageRules: string[];
  professionalAdviceBoundaries: string[];
  tigRecommendationRules: string[];
};

export type TeoyubeTheologyValidationInput = {
  scriptureReferences?: string[];
  explanationPath?: string[];
  text?: string;
  professionalAdviceRequested?: boolean;
};

export type TeoyubeTheologySafetyReport = TeoyubeTheologyBoundaryReport & {
  checks: {
    scriptureAnchoring: boolean;
    promiseInterpretation: boolean;
    devotionalLanguage: boolean;
    noDivineCertainty: boolean;
    noProfessionalAdvice: boolean;
  };
};

const DIVINE_CERTAINTY_PATTERNS = [
  /god (certainly|definitely) (says|told|commands)/i,
  /this is guaranteed from god/i,
  /your calling is certainly/i,
  /divine certainty/i
];

const PROFESSIONAL_ADVICE_PATTERNS = [
  /medical advice|diagnose|prescribe|clinical treatment/i,
  /legal advice|lawsuit|attorney|court strategy/i,
  /financial advice|investment advice|tax advice|bankruptcy/i
];

export function createTheologyFramework(): TeoyubeTheologyFramework {
  return {
    id: "teoyube_phase_3_theology_framework",
    themes: [
      "calling",
      "identity",
      "promise",
      "wisdom",
      "healing",
      "protection",
      "growth",
      "legacy",
      "prayer",
      "hope"
    ],
    scriptureAnchorRequirements: [
      "Every promise recommendation must expose at least one Scripture reference.",
      "TIG recommendations must preserve Scripture evidence and avoid unsupported spiritual claims.",
      "Adapters should pass Scripture anchors forward instead of hiding them in internal state."
    ],
    promiseInterpretationBoundaries: [
      "Promises are interpreted as Scripture-grounded assurance of God's character, not guaranteed personal outcomes.",
      "Promise clusters must not be created or recommended without Scripture support.",
      "Promise language should preserve context, humility, and pastoral care."
    ],
    devotionalExplanationBoundaries: [
      "Devotional explanations should explain why a word, promise, calling path, or prayer was selected.",
      "Explanation paths must stay visible and should name the Scripture or TIG graph basis.",
      "Fallback explanations should be honest when a match is broad or confidence is low."
    ],
    noDivineCertaintyLanguageRules: [
      "Do not claim divine certainty about a user's calling, future, health, money, legal outcome, or relationships.",
      "Use humble language such as 'may help you reflect' or 'is Scripture-anchored for this theme'.",
      "Confidence labels describe graph/data fit, not certainty about God's hidden will."
    ],
    professionalAdviceBoundaries: [
      "Do not provide medical, legal, financial, mental-health, or other professional advice.",
      "Route emergency, crisis, medical, legal, or financial concerns to manual/support review.",
      "Keep prayer and Scripture reflections pastoral and non-professional."
    ],
    tigRecommendationRules: [
      "TIG recommendations must include Scripture anchors.",
      "TIG recommendations must keep explanation paths and confidence/fallback boundaries.",
      "TIG recommendations must not enable hidden personalization, analytics, persistence, external providers, or live AI orchestration by themselves."
    ]
  };
}

export function getTheologicalThemes(): TeoyubeTheologicalTheme[] {
  return createTheologyFramework().themes;
}

export function getTheologyFrameworkRules(): TeoyubeTheologyFramework {
  return createTheologyFramework();
}

function createBoundaryReport(
  blockers: string[],
  warnings: string[] = []
): TeoyubeTheologyBoundaryReport {
  return {
    valid: blockers.length === 0,
    blockers,
    warnings,
    scriptureAnchoringRequired: true,
    explanationPathRequired: true,
    noDivineCertainty: true,
    noProfessionalAdvice: true,
    tigRecommendationsMustStayScriptureAnchored: true
  };
}

export function validateTheologyBoundaries(input: TeoyubeTheologyValidationInput): TeoyubeTheologyBoundaryReport {
  const scriptureReferences = input.scriptureReferences || [];
  const explanationPath = input.explanationPath || [];
  const text = input.text || "";
  const blockers = [
    scriptureReferences.length === 0 ? "Missing Scripture anchor." : undefined,
    DIVINE_CERTAINTY_PATTERNS.some((pattern) => pattern.test(text)) ? "Text appears to claim divine certainty." : undefined,
    input.professionalAdviceRequested || PROFESSIONAL_ADVICE_PATTERNS.some((pattern) => pattern.test(text))
      ? "Text enters medical, legal, financial, or professional-advice territory."
      : undefined
  ].filter(Boolean) as string[];
  const warnings = [
    explanationPath.length === 0 ? "Explanation path is missing or not yet connected." : undefined
  ].filter(Boolean) as string[];

  return createBoundaryReport(blockers, warnings);
}

export function validateTigRecommendationTheology(input: TeoyubeTheologyValidationInput): TeoyubeTheologyBoundaryReport {
  return validateTheologyBoundaries(input);
}

export function validateScriptureAnchoring(input: TeoyubeTheologyValidationInput): TeoyubeTheologyBoundaryReport {
  const blockers = [
    (input.scriptureReferences || []).length === 0 ? "Missing Scripture anchor." : undefined
  ].filter(Boolean) as string[];
  const warnings = [
    (input.explanationPath || []).length === 0 ? "Explanation path is missing or not yet connected." : undefined
  ].filter(Boolean) as string[];

  return createBoundaryReport(blockers, warnings);
}

export function validatePromiseInterpretation(input: TeoyubeTheologyValidationInput): TeoyubeTheologyBoundaryReport {
  const text = input.text || "";
  const anchoring = validateScriptureAnchoring(input);
  const blockers = [
    ...anchoring.blockers,
    /guaranteed personal outcome|guaranteed result|god will definitely give you/i.test(text)
      ? "Promise language appears to guarantee a personal outcome beyond the Scripture anchor."
      : undefined
  ].filter(Boolean) as string[];

  return createBoundaryReport(blockers, anchoring.warnings);
}

export function validateDevotionalLanguage(input: TeoyubeTheologyValidationInput): TeoyubeTheologyBoundaryReport {
  const divineCertainty = validateNoDivineCertaintyClaim(input);
  const professionalAdvice = validateNoProfessionalAdviceClaim(input);
  const warnings = [
    (input.explanationPath || []).length === 0 ? "Devotional explanation path is missing or not yet connected." : undefined
  ].filter(Boolean) as string[];

  return createBoundaryReport(
    [...divineCertainty.blockers, ...professionalAdvice.blockers],
    warnings
  );
}

export function validateNoDivineCertaintyClaim(input: TeoyubeTheologyValidationInput): TeoyubeTheologyBoundaryReport {
  const text = input.text || "";
  const blockers = [
    DIVINE_CERTAINTY_PATTERNS.some((pattern) => pattern.test(text)) ? "Text appears to claim divine certainty." : undefined
  ].filter(Boolean) as string[];

  return createBoundaryReport(blockers);
}

export function validateNoProfessionalAdviceClaim(input: TeoyubeTheologyValidationInput): TeoyubeTheologyBoundaryReport {
  const text = input.text || "";
  const blockers = [
    input.professionalAdviceRequested || PROFESSIONAL_ADVICE_PATTERNS.some((pattern) => pattern.test(text))
      ? "Text enters medical, legal, financial, emergency, or professional-advice territory."
      : undefined
  ].filter(Boolean) as string[];

  return createBoundaryReport(blockers);
}

export function createTheologySafetyReport(input: TeoyubeTheologyValidationInput): TeoyubeTheologySafetyReport {
  const scriptureAnchoring = validateScriptureAnchoring(input);
  const promiseInterpretation = validatePromiseInterpretation(input);
  const devotionalLanguage = validateDevotionalLanguage(input);
  const noDivineCertainty = validateNoDivineCertaintyClaim(input);
  const noProfessionalAdvice = validateNoProfessionalAdviceClaim(input);
  const reports = [
    scriptureAnchoring,
    promiseInterpretation,
    devotionalLanguage,
    noDivineCertainty,
    noProfessionalAdvice
  ];
  const blockers = reports.flatMap((report) => report.blockers);
  const warnings = reports.flatMap((report) => report.warnings);

  return {
    ...createBoundaryReport(blockers, warnings),
    checks: {
      scriptureAnchoring: scriptureAnchoring.valid,
      promiseInterpretation: promiseInterpretation.valid,
      devotionalLanguage: devotionalLanguage.valid,
      noDivineCertainty: noDivineCertainty.valid,
      noProfessionalAdvice: noProfessionalAdvice.valid
    }
  };
}
