import type {
  StructuredTelemetryEvent,
  TelemetrySink
} from "../observability/observability-contracts";
import { createStructuredTelemetryEvent } from "../observability/telemetry-event";

const PROHIBITED_PRODUCT_METRICS = Object.freeze([
  "divine_favor_score",
  "faith_score",
  "guilt_streak",
  "holiness_score",
  "spiritual_rank",
  "spiritual_score",
  "time_in_app_objective"
]);

export type ProductAnalyticsConsent = Readonly<{
  granted: boolean;
  policyVersion: string;
  updatedAt: string;
}>;

export type ProductValueSummary = Readonly<{
  clarity: number;
  faithfulAction: number;
  reflectionContinuity: number;
  trustAndReversibility: number;
  crossModuleContinuity: number;
  communitySupport: number;
  safetyAndQuality: number;
  rawContentStored: false;
  spiritualScoreComputed: false;
}>;

const categoryByEvent = Object.freeze({
  source_explanation_inspected: "clarity",
  clarity_self_reported: "clarity",
  faithful_action_decision: "faithfulAction",
  reflection_continuity: "reflectionContinuity",
  trust_reversibility_action: "trustAndReversibility",
  cross_module_transition: "crossModuleContinuity",
  community_support_action: "communitySupport",
  user_quality_report: "safetyAndQuality"
} as const);

export class ConsentAwareProductValueRecorder {
  constructor(
    private readonly sink: TelemetrySink,
    private consent: ProductAnalyticsConsent
  ) {}

  updateConsent(consent: ProductAnalyticsConsent): void {
    this.consent = Object.freeze({ ...consent });
  }

  record(input: {
    name: keyof typeof categoryByEvent;
    occurredAt: string;
    fields?: Readonly<Record<string, unknown>>;
  }): boolean {
    if (!this.consent.granted) return false;
    const serializedKeys = Object.keys(input.fields || {}).join(" ").toLowerCase();
    if (PROHIBITED_PRODUCT_METRICS.some((metric) => serializedKeys.includes(metric))) {
      throw new Error("A prohibited product metric was requested.");
    }
    this.sink.emit(createStructuredTelemetryEvent(input));
    return true;
  }
}

export function summarizeProductValue(
  events: readonly StructuredTelemetryEvent[]
): ProductValueSummary {
  const summary = {
    clarity: 0,
    faithfulAction: 0,
    reflectionContinuity: 0,
    trustAndReversibility: 0,
    crossModuleContinuity: 0,
    communitySupport: 0,
    safetyAndQuality: 0
  };
  for (const event of events) {
    const category = categoryByEvent[event.name as keyof typeof categoryByEvent];
    if (category) summary[category] += 1;
  }
  return Object.freeze({
    ...summary,
    rawContentStored: false,
    spiritualScoreComputed: false
  });
}

export { PROHIBITED_PRODUCT_METRICS };
