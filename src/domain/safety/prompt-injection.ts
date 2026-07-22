import type { PromptInjectionFinding } from "./safety-contracts";

const INJECTION_RULES: readonly Readonly<{ category: PromptInjectionFinding["category"]; pattern: RegExp }>[] = Object.freeze([
  { category: "policy_override", pattern: /\b(?:ignore|override|disable|replace) (?:all |the )?(?:previous |prior )?(?:instructions|policy|safety|guardrails)\b/i },
  { category: "consent_override", pattern: /\b(?:pretend|assume|mark) (?:that )?(?:consent|permission) (?:is|was) (?:granted|approved)\b/i },
  { category: "tool_expansion", pattern: /\b(?:enable|authorize|call|use) (?:(?:all|hidden|unauthorized) )*(?:tools?|admin tool|state-changing tool)\b/i },
  { category: "secret_exfiltration", pattern: /\b(?:reveal|print|return|show) (?:the )?(?:system prompt|developer prompt|secret|api key|credentials?)\b/i },
  { category: "cross_user_access", pattern: /\b(?:read|retrieve|export|show) (?:another|other) user(?:'s)? (?:private )?(?:memory|journal|prayer|data)\b/i },
  { category: "scripture_fabrication", pattern: /\b(?:invent|fabricate|make up|rewrite) (?:a )?(?:bible verse|scripture|citation)\b/i },
  { category: "crisis_bypass", pattern: /\b(?:skip|bypass|disable|ignore) (?:the )?(?:crisis|emergency|self-harm|safety) (?:policy|response|check|handling)\b/i },
  { category: "durable_write", pattern: /\b(?:save|store|persist|write) (?:this|everything|the crisis|private text)(?: private text)? (?:(?:silently|without consent|automatically|permanently)(?: and)? ?)+\b/i }
]);

export function detectPromptInjection(...values: readonly string[]): readonly PromptInjectionFinding[] {
  const categories = new Set<PromptInjectionFinding["category"]>();
  for (const value of values) {
    for (const rule of INJECTION_RULES) if (rule.pattern.test(value)) categories.add(rule.category);
  }
  return Object.freeze([...categories].sort().map((category) => Object.freeze({ category, blocked: true as const })));
}
