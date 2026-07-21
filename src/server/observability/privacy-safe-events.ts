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
  | "persistence_fallback_used";

export type PrivacySafeEvent = Readonly<{
  name: PrivacySafeEventName;
  occurredAt: string;
  subjectHash?: string;
  purposeId?: string;
  layer?: string;
  result?: "allowed" | "denied" | "complete" | "fallback";
  count?: number;
}>;

export interface PrivacySafeEventSink { emit(event: PrivacySafeEvent): void }

export class InMemoryPrivacySafeEventSink implements PrivacySafeEventSink {
  readonly events: PrivacySafeEvent[] = [];
  emit(event: PrivacySafeEvent): void { this.events.push(Object.freeze({ ...event })); }
}

export const nullPrivacySafeEventSink: PrivacySafeEventSink = Object.freeze({ emit: () => undefined });
