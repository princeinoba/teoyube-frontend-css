import type { JournalRecord } from "../../../domain/journal/journal-record";
import { getApprovedJournalGuardrails } from "../legacy-adapter";

export type JournalPageViewModel = Readonly<{
  entries: readonly JournalRecord[];
  guardrails: Readonly<{ title: string; points: readonly string[] }>;
  prompts: readonly string[];
  sessionOnly: true;
  rawPrivateTextLogged: false;
}>;

export function createJournalPageViewModel(): JournalPageViewModel {
  return Object.freeze({
    entries: Object.freeze([]),
    guardrails: getApprovedJournalGuardrails(),
    prompts: Object.freeze([
      "Where do I need God's light today?",
      "Which promise should shape my next faithful step?",
      "What prayer should I return to this week?"
    ]),
    sessionOnly: true,
    rawPrivateTextLogged: false
  });
}
