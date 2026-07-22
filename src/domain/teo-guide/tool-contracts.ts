import type { TeoGuideActionProposal, TeoGuideSourceReference, TeoGuideToolName } from "./orchestration-contracts";

export type TeoGuideToolTrust = "trusted_system" | "untrusted_user" | "untrusted_retrieved" | "user_approved";

export type TeoGuideToolDescriptor = Readonly<{
  name: TeoGuideToolName;
  purpose: string;
  inputSchemaVersion: "1.0.0";
  outputSchemaVersion: "1.0.0";
  inputTrust: TeoGuideToolTrust;
  outputTrust: TeoGuideToolTrust;
  requiresAuthentication: boolean;
  requiresConsent: boolean;
  stateMutation: false;
  maxOutputCharacters: number;
}>;

export type TeoGuideToolInvocation =
  | Readonly<{ name: "searchScripture"; input: Readonly<{ query: string; limit: number }> }>
  | Readonly<{ name: "getScriptureContext"; input: Readonly<{ reference: string; versesBefore: number; versesAfter: number }> }>
  | Readonly<{ name: "searchPromises"; input: Readonly<{ query: string; limit: number }> }>
  | Readonly<{ name: "getPromiseCluster"; input: Readonly<{ clusterId: string }> }>
  | Readonly<{ name: "getCurrentJourney"; input: Readonly<{ conversationId: string }> }>
  | Readonly<{ name: "proposeJourneyAction"; input: Readonly<{ journeyId: string; stage: string; requestedAction: string }> }>
  | Readonly<{ name: "getCallingEvidence"; input: Readonly<{ query: string }> }>
  | Readonly<{ name: "buildPrayerOptions"; input: Readonly<{ query: string; scriptureReference: string }> }>
  | Readonly<{ name: "searchApprovedUserMemory"; input: Readonly<{ query: string; purpose: "preference_continuity" | "journey_continuity" }> }>
  | Readonly<{ name: "summarizeReflectionPattern"; input: Readonly<{ query: string; approvedRecordIds: readonly string[] }> }>
  | Readonly<{ name: "draftJournalEntry"; input: Readonly<{ query: string; scriptureReference: string }> }>
  | Readonly<{ name: "draftTestimonyCandidate"; input: Readonly<{ query: string; scriptureReference: string }> }>
  | Readonly<{ name: "createMentorDiscussionPrompt"; input: Readonly<{ query: string; scriptureReference: string }> }>;

export type TeoGuideToolOutput = Readonly<{
  tool: TeoGuideToolName;
  status: "complete" | "blocked" | "fallback";
  summary: string;
  items: readonly Readonly<Record<string, string | number | boolean | readonly string[]>>[];
  sources: readonly TeoGuideSourceReference[];
  limitations: readonly string[];
  proposals: readonly TeoGuideActionProposal[];
  outputTrust: TeoGuideToolTrust;
  outputCharacters: number;
}>;
