import { SAFETY_LIMITS } from "./safety-policy";
import type { ProhibitedClaimFinding, TheologicalClaimType } from "./safety-contracts";

type ClaimRule = Readonly<{
  id: string;
  type: TheologicalClaimType;
  patterns: readonly RegExp[];
}>;

export const PROHIBITED_CLAIM_REGISTRY_VERSION = "teoyube-prohibited-claims-1.0.0" as const;

export const PROHIBITED_CLAIM_REGISTRY: readonly ClaimRule[] = Object.freeze([
  { id: "divine-authority-direct", type: "divine_authority", patterns: Object.freeze([
    /\b(?:god|the lord) (?:told|revealed to|showed|said to|commands?) (?:me )?(?:that )?you (?:must|should|will|are|have to)\b/gi,
    /\bi (?:speak|am speaking) (?:for|as) god\b/gi,
    /\bthis (?:message|answer|guidance) is (?:a )?direct (?:word|command) from god\b/gi
  ]) },
  { id: "final-calling", type: "final_calling_or_destiny", patterns: Object.freeze([
    /\bthis is definitely your (?:calling|destiny|purpose)\b/gi,
    /\byour (?:calling|destiny) is (?:certainly|definitely|finally settled)\b/gi
  ]) },
  { id: "guaranteed-outcome", type: "guaranteed_outcome", patterns: Object.freeze([
    /\b(?:this|healing|wealth|the relationship|your career|your legal case|the prophecy) is guaranteed\b/gi,
    /\bgod (?:will|guarantees? to) (?:heal|make you rich|restore your relationship|win your case|give you the job)\b/gi
  ]) },
  { id: "weak-faith-blame", type: "weak_faith_or_spiritual_blame", patterns: Object.freeze([
    /\byour suffering (?:shows|proves|means) (?:that )?your faith is weak\b/gi,
    /\bif you had enough faith,? you would not be (?:sick|suffering|traumatized)\b/gi
  ]) },
  { id: "sin-demon-causation", type: "demonic_or_sin_causation", patterns: Object.freeze([
    /\b(?:your illness|your trauma|this disease) (?:is|was) (?:caused by|proof of) (?:your )?(?:sin|a demon|demonic activity)\b/gi,
    /\byou are definitely (?:possessed|under demonic control)\b/gi
  ]) },
  { id: "care-replacement", type: "care_replacement", patterns: Object.freeze([
    /\bpray instead of (?:calling|contacting|seeing|going to) (?:emergency services|a doctor|a therapist|a lawyer|the police)\b/gi,
    /\byou do not need (?:medical|mental-health|legal|emergency) help;? (?:just|only) pray\b/gi,
    /\bstop (?:your )?medication and pray\b/gi
  ]) },
  { id: "abuse-submission", type: "abuse_submission", patterns: Object.freeze([
    /\bgod requires you to (?:stay|remain) (?:with|in) (?:your abuser|the abuse|danger)\b/gi,
    /\bsubmit to the abuse\b/gi,
    /\bconfront your abuser alone\b/gi
  ]) },
  { id: "coercion-urgency", type: "coercion_or_fabricated_urgency", patterns: Object.freeze([
    /\b(?:obey|act) immediately because (?:god|i) (?:said|commanded) so\b/gi,
    /\bkeep this secret from (?:everyone|your family|your doctor|the police)\b/gi,
    /\bcut off (?:everyone|your family|your friends) who questions this\b/gi,
    /\bif you do not comply,? god will punish you\b/gi
  ]) },
  { id: "automatic-fulfillment", type: "automatic_fulfillment", patterns: Object.freeze([
    /\b(?:this|your) promise (?:is|has been) fulfilled\b/gi,
    /\bgod has guaranteed fulfillment\b/gi
  ]) },
  { id: "automatic-testimony", type: "automatic_testimony", patterns: Object.freeze([
    /\bi (?:have )?(?:published|recorded|finalized) your testimony\b/gi,
    /\bthis is now your (?:final|published) testimony\b/gi
  ]) },
  { id: "automatic-divine-attribution", type: "automatic_divine_attribution", patterns: Object.freeze([
    /\bthis event definitely was god(?:'s)? (?:action|intervention)\b/gi,
    /\bgod caused this exact event to teach you\b/gi
  ]) }
]);

function insideQuote(text: string, index: number): boolean {
  const before = text.slice(0, index);
  const straight = (before.match(/"/g) || []).length % 2 === 1;
  const curlyOpen = before.lastIndexOf("“");
  const curlyClose = before.lastIndexOf("”");
  return straight || curlyOpen > curlyClose;
}

function isDiscussionOrNegation(text: string, start: number): Readonly<{ quoted: boolean; negated: boolean }> {
  const quoted = insideQuote(text, start);
  const context = text.slice(Math.max(0, start - 100), start).toLowerCase();
  const negated = /(?:must|should|can|could|may|will)?\s*(?:not|never)\s+(?:say|claim|tell|write|present|assert)?[^.!?]{0,45}$/.test(context)
    || /(?:avoid|forbid|prohibit|block|reject)(?:ed|s|ing)?[^.!?]{0,45}$/.test(context)
    || /(?:example|discussion|phrase|quote|policy|rule)[^.!?]{0,45}$/.test(context);
  return Object.freeze({ quoted, negated });
}

export function detectProhibitedClaims(value: string): readonly ProhibitedClaimFinding[] {
  const text = value.slice(0, SAFETY_LIMITS.claimScanCharacters);
  const findings: ProhibitedClaimFinding[] = [];
  for (const rule of PROHIBITED_CLAIM_REGISTRY) {
    for (const sourcePattern of rule.patterns) {
      const pattern = new RegExp(sourcePattern.source, sourcePattern.flags);
      for (const match of text.matchAll(pattern)) {
        const start = match.index || 0;
        const context = isDiscussionOrNegation(text, start);
        if (context.quoted || context.negated) continue;
        findings.push(Object.freeze({
          type: rule.type,
          registryRuleId: rule.id,
          start,
          end: start + match[0].length,
          blocked: true,
          quotedDiscussion: false,
          negatedDiscussion: false
        }));
      }
    }
  }
  return Object.freeze(findings.sort((left, right) => left.start - right.start || left.type.localeCompare(right.type)));
}
