export type TeoGuideSource = Readonly<{
  kind: "scripture";
  reference: string;
  authority: "Scripture";
}>;

export type TeoGuideMessage = Readonly<{
  id: string;
  role: "user" | "teo-guide";
  text: string;
  sources: readonly TeoGuideSource[];
  interpretation: string;
  suggestedApplication: string;
  confidence: "deterministic_scripture_match";
  limitation: string;
}>;

const GUIDE_PATHS = Object.freeze([
  Object.freeze({ terms: Object.freeze(["wisdom", "decision", "confusion"]), reference: "James 1:5", theme: "wisdom and patient discernment", action: "write down the decision, pray, and review it with wise counsel" }),
  Object.freeze({ terms: Object.freeze(["calling", "purpose", "assignment"]), reference: "Ephesians 2:10", theme: "purpose expressed through faithful service", action: "name one present gift, one burden, and one humble act of service" }),
  Object.freeze({ terms: Object.freeze(["prayer", "anxious", "peace"]), reference: "Philippians 4:6-7", theme: "prayerful trust rather than anxious certainty", action: "pray honestly and identify one concern to entrust to God" }),
  Object.freeze({ terms: Object.freeze(["trust", "direction", "plan"]), reference: "Proverbs 3:5-6", theme: "trust and submitted direction", action: "pause before deciding and seek Scripture, prayer, and wise counsel" })
]);

function stableMessageId(prompt: string) {
  let value = 2166136261;
  for (const character of prompt) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return `teo-local-${(value >>> 0).toString(16)}`;
}

export function createDeterministicTeoGuideMessage(promptValue: string): TeoGuideMessage {
  const prompt = promptValue.trim() || "Help me take a Scripture-grounded next step.";
  const normalized = prompt.toLowerCase();
  const selected = GUIDE_PATHS.find((path) => path.terms.some((term) => normalized.includes(term))) || Object.freeze({
    reference: "Psalm 119:105",
    theme: "Scripture-guided faithfulness",
    action: "read the passage in context, pray, and choose one realistic next step"
  });
  return Object.freeze({
    id: stableMessageId(prompt),
    role: "teo-guide",
    text: `This local deterministic preview may connect your question to ${selected.theme}. Begin with ${selected.reference}; this is an interpretation and suggested application, not divine speech or certainty.`,
    sources: Object.freeze([Object.freeze({ kind: "scripture", reference: selected.reference, authority: "Scripture" })]),
    interpretation: `Teoyube interpretation: the prompt appears related to ${selected.theme}.`,
    suggestedApplication: `Suggested action: ${selected.action}.`,
    confidence: "deterministic_scripture_match",
    limitation: "For major decisions, pray, read Scripture in context, seek wise counsel and community, and use appropriate professional care."
  });
}
