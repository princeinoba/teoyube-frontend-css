export type CallingCompassQuestionDto = Readonly<{
  id: "burden" | "gift" | "season";
  prompt: string;
  options: readonly string[];
}>;

export type CallingMediaDto = Readonly<{
  id: string;
  title: string;
  description: string;
  duration: string;
  image: string;
}>;

export type CallingDiscernmentDto = Readonly<{
  title: string;
  summary: string;
  scriptureReference: string;
  relatedWords: readonly string[];
  prayer: string;
  actionStep: string;
  journeyRecommendation: string;
  confidenceLabel: "Strongest indicators suggest" | "Appears to be emerging" | "Needs further discernment";
  explanationPath: readonly string[];
  limitation: string;
}>;

export type CallingCompassViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  questions: readonly CallingCompassQuestionDto[];
  media: readonly CallingMediaDto[];
  discernment: CallingDiscernmentDto;
}>;

export type CallingCompassClientContextDto = Readonly<{
  initialSearchTerm: string;
  callingPath: Readonly<{
    archetype: Readonly<{ name: string; summary: string }>;
    confidenceLabel: string;
    scriptureAnchors: readonly string[];
    promises: readonly Readonly<{ title: string }>[];
    actionSteps: readonly string[];
  }>;
  explanationPath: readonly string[];
  fallbackUsed: boolean;
  warnings: readonly string[];
  blockers: readonly string[];
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
}>;
