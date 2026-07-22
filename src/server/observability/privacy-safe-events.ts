export type PrivacySafeEventName =
  | "consent_granted"
  | "consent_revoked"
  | "memory_created_by_layer"
  | "memory_deleted"
  | "export_requested"
  | "export_completed"
  | "authorization_denied"
  | "deletion_completed"
  | "journey_resumed"
  | "persistence_fallback_used"
  | "safety_topic_detected"
  | "safety_mode_selected"
  | "safety_prohibited_claim_blocked"
  | "safety_citation_failure"
  | "safety_injection_blocked"
  | "safety_memory_denied"
  | "safety_tool_denied"
  | "safety_fallback_used"
  | "safety_gate_failed"
  | "teo_guide_request_started"
  | "teo_guide_intent_selected"
  | "teo_guide_tool_allowed"
  | "teo_guide_tool_blocked"
  | "teo_guide_tool_timeout"
  | "teo_guide_tool_partial_result"
  | "teo_guide_fallback_used"
  | "teo_guide_response_validated"
  | "teo_guide_action_proposed"
  | "teo_guide_action_confirmed"
  | "teo_guide_action_rejected";

export type PrivacySafeEvent = Readonly<{
  name: PrivacySafeEventName;
  occurredAt: string;
  subjectHash?: string;
  purposeId?: string;
  layer?: string;
  result?: "allowed" | "denied" | "complete" | "fallback" | "blocked" | "failed" | "partial" | "timeout";
  count?: number;
  topic?: string;
  mode?: string;
  policyVersion?: string;
  datasetVersion?: string;
  responseVersion?: string;
  traceId?: string;
  route?: string;
  latencyMs?: number;
  tokenCount?: 0;
}>;

export interface PrivacySafeEventSink { emit(event: PrivacySafeEvent): void }

export class InMemoryPrivacySafeEventSink implements PrivacySafeEventSink {
  readonly events: PrivacySafeEvent[] = [];
  emit(event: PrivacySafeEvent): void { this.events.push(Object.freeze({ ...event })); }
}

export const nullPrivacySafeEventSink: PrivacySafeEventSink = Object.freeze({ emit: () => undefined });
