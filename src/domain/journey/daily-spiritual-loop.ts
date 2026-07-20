export const DAILY_SPIRITUAL_LOOP_STAGES = Object.freeze([
  "check_in",
  "scripture",
  "promise",
  "prayer",
  "calling_discernment",
  "daily_assignment",
  "reflection",
  "testimony_candidate",
  "book_review",
  "tomorrow"
] as const);

export type DailySpiritualLoopStage = (typeof DAILY_SPIRITUAL_LOOP_STAGES)[number];
export type DailySpiritualLoopArtifactStatus = "pending" | "accepted" | "rejected" | "skipped";
export type DailySpiritualLoopActionType = "accept" | "skip" | "reject" | "edit" | "revisit" | "undo";

export type DailySpiritualLoopSourceReference = Readonly<{
  kind: "scripture" | "tig" | "promise" | "user_session";
  reference: string;
  authority: "Scripture" | "Teoyube interpretation" | "User reflection";
}>;

export type DailySpiritualLoopTraceStep = Readonly<{
  id: string;
  summary: string;
  source: string;
  scriptureReferences: readonly string[];
}>;

export type DailySpiritualLoopTigTrace = Readonly<{
  id: string;
  deterministic: true;
  externalModelUsed: false;
  steps: readonly DailySpiritualLoopTraceStep[];
}>;

export type DailySpiritualLoopConfidence = Readonly<{
  score: number;
  label: "strong_scripture_match" | "good_contextual_match" | "partial_match" | "fallback_match";
  explanation: string;
}>;

export type DailySpiritualLoopUserEdit = Readonly<{
  editedAt: string;
  summary: string;
  rawPrivateTextLogged: false;
  durableWritePerformed: false;
}>;

export type DailySpiritualLoopReversibleMetadata = Readonly<{
  revision: number;
  reversible: true;
  previousStatus: DailySpiritualLoopArtifactStatus | null;
  lastAction: DailySpiritualLoopActionType | null;
  undoAvailable: boolean;
}>;

type DailySpiritualLoopArtifactBase<Kind extends DailySpiritualLoopStage, Payload> = Readonly<{
  id: string;
  kind: Kind;
  payload: Readonly<Payload>;
  sourceReferences: readonly DailySpiritualLoopSourceReference[];
  tigExplanationTrace: DailySpiritualLoopTigTrace;
  confidence: DailySpiritualLoopConfidence;
  limitations: readonly string[];
  creationTime: string;
  userEdits: readonly DailySpiritualLoopUserEdit[];
  status: DailySpiritualLoopArtifactStatus;
  reversibleTransitionMetadata: DailySpiritualLoopReversibleMetadata;
}>;

export type CheckInSummaryArtifact = DailySpiritualLoopArtifactBase<"check_in", {
  summary: string;
  privateInputPersisted: false;
}>;

export type ScriptureSelectionArtifact = DailySpiritualLoopArtifactBase<"scripture", {
  references: readonly string[];
  selectionReason: string;
  scriptureIsPrimaryAuthority: true;
}>;

export type PromiseSelectionArtifact = DailySpiritualLoopArtifactBase<"promise", {
  title: string;
  level: "A" | "B" | "C";
  explanation: string;
  fulfillmentDeclared: false;
}>;

export type PrayerDraftArtifact = DailySpiritualLoopArtifactBase<"prayer", {
  text: string;
  generatedLanguageIsDivineSpeech: false;
  scriptureTraceable: true;
}>;

export type DiscernmentRecordArtifact = DailySpiritualLoopArtifactBase<"calling_discernment", {
  summary: string;
  evidence: readonly string[];
  finalCallingDeclared: false;
}>;

export type DailyAssignmentArtifact = DailySpiritualLoopArtifactBase<"daily_assignment", {
  action: string;
  voluntary: true;
  spiritualWorthScored: false;
}>;

export type ReflectionRecordArtifact = DailySpiritualLoopArtifactBase<"reflection", {
  summary: string;
  privateInputPersisted: false;
}>;

export type TestimonyCandidateArtifact = DailySpiritualLoopArtifactBase<"testimony_candidate", {
  title: string;
  bodySummary: string;
  userReviewed: boolean;
  published: false;
  promiseFulfillmentDeclared: false;
  divineActionDeclaredBySystem: false;
}>;

export type BookPromotionDecisionArtifact = DailySpiritualLoopArtifactBase<"book_review", {
  sourceTestimonyTitle: string;
  sourceTestimonySummary: string;
  explicitConfirmationRequired: true;
  promoted: boolean;
}>;

export type TomorrowCarryForwardArtifact = DailySpiritualLoopArtifactBase<"tomorrow", {
  summary: string;
  editable: true;
  hiddenProfilingUsed: false;
}>;

export type DailySpiritualLoopArtifacts = Readonly<{
  check_in: CheckInSummaryArtifact;
  scripture: ScriptureSelectionArtifact;
  promise: PromiseSelectionArtifact;
  prayer: PrayerDraftArtifact;
  calling_discernment: DiscernmentRecordArtifact;
  daily_assignment: DailyAssignmentArtifact;
  reflection: ReflectionRecordArtifact;
  testimony_candidate: TestimonyCandidateArtifact;
  book_review: BookPromotionDecisionArtifact;
  tomorrow: TomorrowCarryForwardArtifact;
}>;

export type DailySpiritualLoopArtifact = DailySpiritualLoopArtifacts[DailySpiritualLoopStage];

export type DailySpiritualLoopSeed = Readonly<{
  id: string;
  scriptureReferences: readonly string[];
  promise: Readonly<{ title: string; level: "A" | "B" | "C"; explanation: string }>;
  prayerDraft: string;
  callingDiscernment: Readonly<{ summary: string; evidence: readonly string[] }>;
  dailyAssignment: string;
  trace: DailySpiritualLoopTigTrace;
  confidence: DailySpiritualLoopConfidence;
  limitations: readonly string[];
  tigValid: boolean;
}>;

export type DailySpiritualLoopTransition = Readonly<{
  id: string;
  action: DailySpiritualLoopActionType;
  fromStage: DailySpiritualLoopStage;
  toStage: DailySpiritualLoopStage;
  artifactStatus: DailySpiritualLoopArtifactStatus;
  createdAt: string;
  reversible: true;
}>;

type DailySpiritualLoopSnapshot = Readonly<{
  active: boolean;
  currentStage: DailySpiritualLoopStage;
  artifacts: DailySpiritualLoopArtifacts;
  completedAt: string | null;
}>;

export type DailySpiritualLoopState = Readonly<{
  id: string;
  active: boolean;
  currentStage: DailySpiritualLoopStage;
  artifacts: DailySpiritualLoopArtifacts;
  transitions: readonly DailySpiritualLoopTransition[];
  undoStack: readonly DailySpiritualLoopSnapshot[];
  startedAt: string;
  completedAt: string | null;
  safety: Readonly<{
    sessionOnly: true;
    durableWritePerformed: false;
    browserPersistenceUsed: false;
    rawPrivateTextLogged: false;
    liveAiUsed: false;
    externalServiceUsed: false;
    automaticTestimonyPublished: false;
    automaticBookPromotionPerformed: false;
    automaticCallingDeclared: false;
    automaticPromiseFulfillmentDeclared: false;
  }>;
}>;

export type DailySpiritualLoopAction = Readonly<{
  type: DailySpiritualLoopActionType;
  stage?: DailySpiritualLoopStage;
  userInput?: string;
  createdAt: string;
}>;

export type DailySpiritualLoopActionPolicy = Readonly<{
  primary: Readonly<{ type: "accept"; label: string }>;
  secondary: readonly Readonly<{ type: "skip" | "reject" | "revisit" | "undo"; label: string }>[];
}>;

export type DailySpiritualLoopOutcomeMeasures = Readonly<{
  userClarity: boolean;
  faithfulActionSelected: boolean;
  reflectionContinuity: boolean;
  safety: boolean;
  trust: boolean;
  reversibility: boolean;
  crossModuleContinuity: boolean;
}>;

const COMMON_LIMITATIONS = Object.freeze([
  "This is a deterministic Teoyube suggestion, not divine speech or certainty.",
  "Review Scripture in context and seek prayer, wise counsel, community, and appropriate professional care for major decisions.",
  "Private text remains in this in-memory session and is not written to browser or durable storage."
]);

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values.map((value) => value.trim()).filter(Boolean))]);
}

export function summarizeDailySpiritualLoopInput(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const redacted = trimmed
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted phone]");
  return redacted.length > 240 ? `${redacted.slice(0, 237)}...` : redacted;
}

function sourceReferences(seed: DailySpiritualLoopSeed): readonly DailySpiritualLoopSourceReference[] {
  return Object.freeze([
    ...seed.scriptureReferences.map((reference) => Object.freeze({
      kind: "scripture" as const,
      reference,
      authority: "Scripture" as const
    })),
    Object.freeze({ kind: "tig" as const, reference: seed.trace.id, authority: "Teoyube interpretation" as const })
  ]);
}

function userSessionSource(reference: string): DailySpiritualLoopSourceReference {
  return Object.freeze({ kind: "user_session", reference, authority: "User reflection" });
}

function pendingMetadata(): DailySpiritualLoopReversibleMetadata {
  return Object.freeze({ revision: 1, reversible: true, previousStatus: null, lastAction: null, undoAvailable: false });
}

function artifactBase<Kind extends DailySpiritualLoopStage, Payload>(
  seed: DailySpiritualLoopSeed,
  kind: Kind,
  payload: Payload,
  creationTime: string,
  sources = sourceReferences(seed)
): DailySpiritualLoopArtifactBase<Kind, Payload> {
  return Object.freeze({
    id: `${seed.id}:${kind}`,
    kind,
    payload: Object.freeze(payload),
    sourceReferences: sources,
    tigExplanationTrace: seed.trace,
    confidence: seed.confidence,
    limitations: Object.freeze(unique([...COMMON_LIMITATIONS, ...seed.limitations])),
    creationTime,
    userEdits: Object.freeze([]),
    status: "pending" as const,
    reversibleTransitionMetadata: pendingMetadata()
  });
}

export function createDailySpiritualLoopState(seed: DailySpiritualLoopSeed, startedAt: string): DailySpiritualLoopState {
  const sources = sourceReferences(seed);
  const checkInSources = Object.freeze([...sources, userSessionSource("session:check-in")]);
  const reflectionSources = Object.freeze([...sources, userSessionSource("session:reflection")]);
  const testimonySources = Object.freeze([...reflectionSources, userSessionSource(`${seed.id}:reflection`)]);
  const bookSources = Object.freeze([...testimonySources, userSessionSource(`${seed.id}:testimony_candidate`)]);
  const tomorrowSources = Object.freeze([...bookSources, userSessionSource(`${seed.id}:book_review`)]);
  const primaryScripture = seed.scriptureReferences[0] || "Ephesians 1:18";
  const artifacts: DailySpiritualLoopArtifacts = Object.freeze({
    check_in: artifactBase(seed, "check_in", { summary: "Check-in awaiting the user's words.", privateInputPersisted: false as const }, startedAt, checkInSources),
    scripture: artifactBase(seed, "scripture", {
      references: Object.freeze([...seed.scriptureReferences]),
      selectionReason: "Selected by deterministic TIG with Scripture retained as the primary authority.",
      scriptureIsPrimaryAuthority: true as const
    }, startedAt, sources),
    promise: artifactBase(seed, "promise", {
      ...seed.promise,
      fulfillmentDeclared: false as const
    }, startedAt, sources),
    prayer: artifactBase(seed, "prayer", {
      text: seed.prayerDraft,
      generatedLanguageIsDivineSpeech: false as const,
      scriptureTraceable: true as const
    }, startedAt, sources),
    calling_discernment: artifactBase(seed, "calling_discernment", {
      summary: seed.callingDiscernment.summary,
      evidence: Object.freeze([...seed.callingDiscernment.evidence]),
      finalCallingDeclared: false as const
    }, startedAt, sources),
    daily_assignment: artifactBase(seed, "daily_assignment", {
      action: seed.dailyAssignment,
      voluntary: true as const,
      spiritualWorthScored: false as const
    }, startedAt, sources),
    reflection: artifactBase(seed, "reflection", {
      summary: `Reflection awaiting user review beside ${primaryScripture}.`,
      privateInputPersisted: false as const
    }, startedAt, reflectionSources),
    testimony_candidate: artifactBase(seed, "testimony_candidate", {
      title: "Daily journey testimony candidate",
      bodySummary: "A reflection may be proposed here only after the user records it.",
      userReviewed: false,
      published: false as const,
      promiseFulfillmentDeclared: false as const,
      divineActionDeclaredBySystem: false as const
    }, startedAt, testimonySources),
    book_review: artifactBase(seed, "book_review", {
      sourceTestimonyTitle: "Daily journey testimony candidate",
      sourceTestimonySummary: "No testimony has been promoted.",
      explicitConfirmationRequired: true as const,
      promoted: false
    }, startedAt, bookSources),
    tomorrow: artifactBase(seed, "tomorrow", {
      summary: `Revisit ${primaryScripture} tomorrow and review the next faithful step without hidden profiling.`,
      editable: true as const,
      hiddenProfilingUsed: false as const
    }, startedAt, tomorrowSources)
  });

  return Object.freeze({
    id: seed.id,
    active: true,
    currentStage: "check_in",
    artifacts,
    transitions: Object.freeze([]),
    undoStack: Object.freeze([]),
    startedAt,
    completedAt: null,
    safety: Object.freeze({
      sessionOnly: true,
      durableWritePerformed: false,
      browserPersistenceUsed: false,
      rawPrivateTextLogged: false,
      liveAiUsed: false,
      externalServiceUsed: false,
      automaticTestimonyPublished: false,
      automaticBookPromotionPerformed: false,
      automaticCallingDeclared: false,
      automaticPromiseFulfillmentDeclared: false
    })
  });
}

function stageAfter(stage: DailySpiritualLoopStage): DailySpiritualLoopStage {
  const index = DAILY_SPIRITUAL_LOOP_STAGES.indexOf(stage);
  return DAILY_SPIRITUAL_LOOP_STAGES[Math.min(index + 1, DAILY_SPIRITUAL_LOOP_STAGES.length - 1)];
}

function snapshot(state: DailySpiritualLoopState): DailySpiritualLoopSnapshot {
  return Object.freeze({ active: state.active, currentStage: state.currentStage, artifacts: state.artifacts, completedAt: state.completedAt });
}

function updateArtifact<Stage extends DailySpiritualLoopStage>(
  artifacts: DailySpiritualLoopArtifacts,
  stage: Stage,
  action: DailySpiritualLoopAction,
  status: DailySpiritualLoopArtifactStatus = artifacts[stage].status
): DailySpiritualLoopArtifacts {
  const current = artifacts[stage];
  const edit = action.userInput
    ? Object.freeze({
        editedAt: action.createdAt,
        summary: summarizeDailySpiritualLoopInput(action.userInput, "User reviewed this journey moment."),
        rawPrivateTextLogged: false as const,
        durableWritePerformed: false as const
      })
    : null;
  const next = Object.freeze({
    ...current,
    userEdits: Object.freeze(edit ? [...current.userEdits, edit] : [...current.userEdits]),
    status,
    reversibleTransitionMetadata: Object.freeze({
      revision: current.reversibleTransitionMetadata.revision + 1,
      reversible: true as const,
      previousStatus: current.status,
      lastAction: action.type,
      undoAvailable: true
    })
  });
  return Object.freeze({ ...artifacts, [stage]: next }) as DailySpiritualLoopArtifacts;
}

function lastEdit(artifact: DailySpiritualLoopArtifact, fallback: string): string {
  return artifact.userEdits[artifact.userEdits.length - 1]?.summary || fallback;
}

function propagateAcceptedArtifact(artifacts: DailySpiritualLoopArtifacts, stage: DailySpiritualLoopStage): DailySpiritualLoopArtifacts {
  if (stage === "reflection") {
    const summary = lastEdit(artifacts.reflection, artifacts.reflection.payload.summary);
    return Object.freeze({
      ...artifacts,
      testimony_candidate: Object.freeze({
        ...artifacts.testimony_candidate,
        payload: Object.freeze({ ...artifacts.testimony_candidate.payload, bodySummary: summary })
      })
    });
  }
  if (stage === "testimony_candidate") {
    const summary = lastEdit(artifacts.testimony_candidate, artifacts.testimony_candidate.payload.bodySummary);
    return Object.freeze({
      ...artifacts,
      testimony_candidate: Object.freeze({
        ...artifacts.testimony_candidate,
        payload: Object.freeze({ ...artifacts.testimony_candidate.payload, bodySummary: summary, userReviewed: true })
      }),
      book_review: Object.freeze({
        ...artifacts.book_review,
        payload: Object.freeze({
          ...artifacts.book_review.payload,
          sourceTestimonyTitle: artifacts.testimony_candidate.payload.title,
          sourceTestimonySummary: summary
        })
      })
    });
  }
  if (stage === "book_review") {
    return Object.freeze({
      ...artifacts,
      book_review: Object.freeze({
        ...artifacts.book_review,
        payload: Object.freeze({ ...artifacts.book_review.payload, promoted: true })
      })
    });
  }
  return artifacts;
}

function transition(
  state: DailySpiritualLoopState,
  action: DailySpiritualLoopAction,
  artifacts: DailySpiritualLoopArtifacts,
  nextStage: DailySpiritualLoopStage,
  active = state.active,
  completedAt = state.completedAt
): DailySpiritualLoopState {
  const record: DailySpiritualLoopTransition = Object.freeze({
    id: `${state.id}:transition:${state.transitions.length + 1}`,
    action: action.type,
    fromStage: state.currentStage,
    toStage: nextStage,
    artifactStatus: artifacts[state.currentStage].status,
    createdAt: action.createdAt,
    reversible: true
  });
  return Object.freeze({
    ...state,
    active,
    currentStage: nextStage,
    artifacts,
    transitions: Object.freeze([...state.transitions, record]),
    undoStack: Object.freeze([...state.undoStack, snapshot(state)]),
    completedAt
  });
}

export function applyDailySpiritualLoopAction(
  state: DailySpiritualLoopState,
  action: DailySpiritualLoopAction
): DailySpiritualLoopState {
  if (action.type === "undo") {
    const previous = state.undoStack[state.undoStack.length - 1];
    if (!previous) return state;
    const record: DailySpiritualLoopTransition = Object.freeze({
      id: `${state.id}:transition:${state.transitions.length + 1}`,
      action: "undo",
      fromStage: state.currentStage,
      toStage: previous.currentStage,
      artifactStatus: previous.artifacts[previous.currentStage].status,
      createdAt: action.createdAt,
      reversible: true
    });
    return Object.freeze({
      ...state,
      ...previous,
      transitions: Object.freeze([...state.transitions, record]),
      undoStack: Object.freeze(state.undoStack.slice(0, -1))
    });
  }

  if (action.type === "revisit") {
    const target = action.stage || state.currentStage;
    return transition(state, action, state.artifacts, target);
  }

  const stage = state.currentStage;
  if (action.type === "edit") {
    return transition(state, action, updateArtifact(state.artifacts, stage, action), stage);
  }

  const status: DailySpiritualLoopArtifactStatus = action.type === "accept"
    ? "accepted"
    : action.type === "reject"
      ? "rejected"
      : "skipped";
  let artifacts = updateArtifact(state.artifacts, stage, action, status);
  if (action.type === "accept") artifacts = propagateAcceptedArtifact(artifacts, stage);
  const isComplete = stage === "tomorrow";
  return transition(
    state,
    action,
    artifacts,
    isComplete ? "tomorrow" : stageAfter(stage),
    !isComplete,
    isComplete ? action.createdAt : state.completedAt
  );
}

export function getDailySpiritualLoopActionPolicy(state: DailySpiritualLoopState): DailySpiritualLoopActionPolicy {
  const primaryLabels: Readonly<Record<DailySpiritualLoopStage, string>> = {
    check_in: "Continue with check-in",
    scripture: "Accept Scripture selection",
    promise: "Accept promise for prayer",
    prayer: "Accept prayer draft",
    calling_discernment: "Accept emerging discernment",
    daily_assignment: "Choose this faithful action",
    reflection: "Save reflection for review",
    testimony_candidate: "Create reviewed testimony draft",
    book_review: "Confirm Book promotion",
    tomorrow: "Carry this forward to tomorrow"
  };
  const secondaries: Array<Readonly<{ type: "skip" | "reject" | "revisit" | "undo"; label: string }>> = [];
  if (state.currentStage === "testimony_candidate" || state.currentStage === "book_review") {
    secondaries.push(Object.freeze({ type: "reject", label: state.currentStage === "testimony_candidate" ? "Reject candidate" : "Do not promote" }));
  } else {
    secondaries.push(Object.freeze({ type: "skip", label: "Skip this moment" }));
  }
  if (state.undoStack.length) secondaries.push(Object.freeze({ type: "undo", label: "Undo last change" }));
  else secondaries.push(Object.freeze({ type: "revisit", label: "Revisit this moment" }));
  return Object.freeze({
    primary: Object.freeze({ type: "accept", label: primaryLabels[state.currentStage] }),
    secondary: Object.freeze(secondaries.slice(0, 2))
  });
}

export function getDailySpiritualLoopProgress(state: DailySpiritualLoopState): number {
  const resolved = DAILY_SPIRITUAL_LOOP_STAGES.filter((stage) => state.artifacts[stage].status !== "pending").length;
  return Math.round((resolved / DAILY_SPIRITUAL_LOOP_STAGES.length) * 100);
}

export function measureDailySpiritualLoopOutcomes(state: DailySpiritualLoopState): DailySpiritualLoopOutcomeMeasures {
  const sourcesPresent = DAILY_SPIRITUAL_LOOP_STAGES.every((stage) => state.artifacts[stage].sourceReferences.length > 0);
  const safety = state.safety.sessionOnly
    && !state.safety.durableWritePerformed
    && !state.safety.browserPersistenceUsed
    && !state.safety.rawPrivateTextLogged
    && !state.safety.liveAiUsed
    && !state.safety.externalServiceUsed
    && !state.safety.automaticTestimonyPublished
    && !state.safety.automaticBookPromotionPerformed
    && !state.safety.automaticCallingDeclared
    && !state.safety.automaticPromiseFulfillmentDeclared;
  return Object.freeze({
    userClarity: sourcesPresent && state.artifacts.scripture.payload.scriptureIsPrimaryAuthority,
    faithfulActionSelected: state.artifacts.daily_assignment.status === "accepted",
    reflectionContinuity: state.artifacts.reflection.status === "accepted"
      && state.artifacts.testimony_candidate.payload.userReviewed
      && state.artifacts.testimony_candidate.payload.bodySummary.length > 0,
    safety,
    trust: DAILY_SPIRITUAL_LOOP_STAGES.every((stage) => state.artifacts[stage].limitations.length > 0 && state.artifacts[stage].tigExplanationTrace.steps.length > 0),
    reversibility: DAILY_SPIRITUAL_LOOP_STAGES.every((stage) => state.artifacts[stage].reversibleTransitionMetadata.reversible),
    crossModuleContinuity: state.artifacts.scripture.payload.references.some((reference) => state.artifacts.promise.sourceReferences.some((source) => source.reference === reference))
  });
}
