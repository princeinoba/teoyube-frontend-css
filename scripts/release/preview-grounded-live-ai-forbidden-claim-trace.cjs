"use strict";

const crypto = require("node:crypto");

const FIXED_UNCERTAINTY = "This is interpretation, not divine certainty.";
const MATCHER_TYPE = "CASE_INSENSITIVE_SUBSTRING";
const NORMALIZATION = "LOWERCASE_ONLY";
const WORD_BOUNDARY = "NONE";
const NEGATION_BEHAVIOR = "NOT_INTERPRETED";
const TRACE_KEYS = Object.freeze([
  "caseId", "fieldProvenance", "ruleId", "matcherType", "characterStart",
  "characterEnd", "matchCount", "normalizedMatchSha256", "semanticContext",
  "runtimeValidatorResult", "evaluatorResult",
]);
const RUNTIME_TRACE_KEYS = Object.freeze([
  "fieldProvenance", "validationRuleId", "matcherId", "matchCount",
  "characterStart", "characterEnd", "matchLength", "fieldLength",
  "normalizedMatchSha256", "semanticContext", "providerCallCountClassification",
  "runtimeValidatorResult", "evaluatorResult",
]);
const SEMANTIC_CONTEXTS = new Set([
  "EXACT_SERVER_SCRIPTURE", "SERVER_FIXED_BOUNDARY", "MODEL_AUTHORED_ASSERTION",
  "MODEL_AUTHORED_PETITION", "ATTRIBUTED_BIBLICAL_TEACHING", "NEGATED_CLAIM",
  "PERSONAL_GUARANTEE", "FUTURE_CERTAINTY", "SUBSTRING_COLLISION", "UNKNOWN_CONTEXT",
]);
const ROOT_CAUSE_CLASSIFICATIONS = Object.freeze({
  provenanceFalsePositive: "A_PROVENANCE_FALSE_POSITIVE",
  matcherFalsePositive: "B_MATCHER_FALSE_POSITIVE",
  genuineModelClaim: "C_GENUINE_MODEL_FORBIDDEN_CLAIM",
  datasetDefect: "D_DATASET_DEFECT",
  unresolved: "UNRESOLVED",
});

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function ruleId(caseId, ordinal) {
  const safeCase = String(caseId || "unknown")
    .toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "UNKNOWN";
  return `FORBIDDEN_${safeCase}_${String(ordinal + 1).padStart(2, "0")}`;
}

function modelFields(response) {
  if (!response || typeof response !== "object" || Array.isArray(response)) return [];
  const fields = [
    ["MODEL_SUMMARY", response.summary],
    ["MODEL_BIBLICAL_APPLICATION", response.biblical_application],
    ["MODEL_PRAYER", response.prayer],
    ["MODEL_ACTION_STEP", response.action_step],
    ...((Array.isArray(response.limitations) ? response.limitations : []).map((value) => ["MODEL_LIMITATIONS", value])),
    [response.safety_boundary === FIXED_UNCERTAINTY ? "SERVER_FIXED_UNCERTAINTY" : "MODEL_SAFETY_BOUNDARY", response.safety_boundary],
  ];
  return fields.filter(([, value]) => typeof value === "string")
    .map(([fieldProvenance, value]) => Object.freeze({ fieldProvenance, value }));
}

function wordCharacter(value) {
  return typeof value === "string" && /^[\p{L}\p{N}_]$/u.test(value);
}

function isSubstringCollision(text, start, end) {
  return wordCharacter(text[start - 1]) || wordCharacter(text[end]);
}

function sentenceWindow(text, start, end) {
  const left = Math.max(
    text.lastIndexOf(".", start - 1), text.lastIndexOf("!", start - 1),
    text.lastIndexOf("?", start - 1), text.lastIndexOf("\n", start - 1),
  );
  const rightCandidates = [".", "!", "?", "\n"]
    .map((delimiter) => text.indexOf(delimiter, end)).filter((value) => value >= 0);
  const right = rightCandidates.length ? Math.min(...rightCandidates) : text.length;
  return Object.freeze({
    sentence: text.slice(left + 1, right).toLocaleLowerCase("en-US"),
    before: text.slice(Math.max(left + 1, start - 96), start).toLocaleLowerCase("en-US"),
  });
}

function semanticContext({ fieldProvenance, text, start, end, normalizedMatch }) {
  if (fieldProvenance === "SERVER_EXACT_WEB_QUOTATION") return "EXACT_SERVER_SCRIPTURE";
  if (fieldProvenance === "SERVER_FIXED_UNCERTAINTY") return "SERVER_FIXED_BOUNDARY";
  if (isSubstringCollision(text, start, end)) return "SUBSTRING_COLLISION";
  const window = sentenceWindow(text, start, end);
  if (/(?:\bnot\b|\bnever\b|\bno\b|\bcannot\b|\bcan['’]?t\b|\bdoes\s+not\b|\bdoesn['’]?t\b|\bis\s+not\b|\bisn['’]?t\b|\bwill\s+not\b|\bwon['’]?t\b|\bwithout\b)\s+(?:\w+\s+){0,4}$/u.test(window.before)) return "NEGATED_CLAIM";
  if (fieldProvenance === "MODEL_PRAYER" && /(?:^|\b)(?:please|father|lord|god)[,\s]/u.test(window.sentence)) return "MODEL_AUTHORED_PETITION";
  if (/(?:god|the\s+lord).{0,40}(?:told\s+me|revealed|commands?\s+you|guarantees?|promises?)/u.test(window.sentence) || /god\s+told\s+me/u.test(normalizedMatch)) return "PERSONAL_GUARANTEE";
  if (/(?:\bscripture\b|\bthe\s+(?:passage|verse|bible)\b|\b[a-z]+\s+\d{1,3}:\d{1,3}\b).{0,80}(?:\bteaches?\b|\bsays?\b|\bdescribes?\b|\bpresents?\b)/u.test(window.sentence)) return "ATTRIBUTED_BIBLICAL_TEACHING";
  if (/(?:guarantee|certain|certainty|settled|future|outcome|destiny|calling|career|spouse|marriage|job)/u.test(window.sentence)) return "FUTURE_CERTAINTY";
  return "MODEL_AUTHORED_ASSERTION";
}

function exactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

function assertSanitizedTrace(trace) {
  if (!Array.isArray(trace)) throw new Error("SANITIZED_MATCH_TRACE_NOT_ARRAY");
  for (const item of trace) {
    if (!exactKeys(item, TRACE_KEYS)) throw new Error("SANITIZED_MATCH_TRACE_KEYS_REJECTED");
    if (!/^[a-z0-9-]+$/.test(item.caseId)) throw new Error("SANITIZED_MATCH_TRACE_CASE_REJECTED");
    if (!/^[A-Z0-9_]+$/.test(item.fieldProvenance) || !/^[A-Z0-9_]+$/.test(item.ruleId)) throw new Error("SANITIZED_MATCH_TRACE_ID_REJECTED");
    if (item.matcherType !== MATCHER_TYPE) throw new Error("SANITIZED_MATCH_TRACE_MATCHER_REJECTED");
    if (!Number.isInteger(item.characterStart) || !Number.isInteger(item.characterEnd) || item.characterStart < 0 || item.characterEnd <= item.characterStart) throw new Error("SANITIZED_MATCH_TRACE_OFFSET_REJECTED");
    if (!Number.isInteger(item.matchCount) || item.matchCount <= 0) throw new Error("SANITIZED_MATCH_TRACE_COUNT_REJECTED");
    if (!/^[a-f0-9]{64}$/.test(item.normalizedMatchSha256)) throw new Error("SANITIZED_MATCH_TRACE_HASH_REJECTED");
    if (!SEMANTIC_CONTEXTS.has(item.semanticContext)) throw new Error("SANITIZED_MATCH_TRACE_CONTEXT_REJECTED");
    if (!/^(PASS|FAIL)$/.test(item.runtimeValidatorResult) || !/^(PASS|FAIL)$/.test(item.evaluatorResult)) throw new Error("SANITIZED_MATCH_TRACE_RESULT_REJECTED");
  }
  return trace;
}

function assertSanitizedRuntimeEvidence(trace) {
  if (!Array.isArray(trace)) throw new Error("RUNTIME_MATCH_TRACE_NOT_ARRAY");
  for (const item of trace) {
    if (!exactKeys(item, RUNTIME_TRACE_KEYS)) throw new Error("RUNTIME_MATCH_TRACE_KEYS_REJECTED");
    if (!/^(?:MODEL_[A-Z_]+|SERVER_FIXED_UNCERTAINTY)$/.test(item.fieldProvenance)) throw new Error("RUNTIME_MATCH_TRACE_PROVENANCE_REJECTED");
    if (!/^[A-Z0-9_]+$/.test(item.validationRuleId) || item.matcherId !== "SAFETY_REGISTRY_REGEX") throw new Error("RUNTIME_MATCH_TRACE_RULE_REJECTED");
    if (!Number.isInteger(item.matchCount) || item.matchCount < 1 || item.matchCount > 16) throw new Error("RUNTIME_MATCH_TRACE_COUNT_REJECTED");
    if (!Number.isInteger(item.characterStart) || !Number.isInteger(item.characterEnd) || !Number.isInteger(item.matchLength) || !Number.isInteger(item.fieldLength) || item.characterStart < 0 || item.characterEnd <= item.characterStart || item.characterEnd > item.fieldLength || item.matchLength !== item.characterEnd - item.characterStart) throw new Error("RUNTIME_MATCH_TRACE_OFFSET_REJECTED");
    if (!/^[a-f0-9]{64}$/.test(item.normalizedMatchSha256)) throw new Error("RUNTIME_MATCH_TRACE_HASH_REJECTED");
    if (!SEMANTIC_CONTEXTS.has(item.semanticContext)) throw new Error("RUNTIME_MATCH_TRACE_CONTEXT_REJECTED");
    if (item.providerCallCountClassification !== "EMBEDDING_VECTOR_GENERATION_AND_MODERATION" || item.runtimeValidatorResult !== "FAIL" || item.evaluatorResult !== "NOT_RUN") throw new Error("RUNTIME_MATCH_TRACE_RESULT_REJECTED");
  }
  return trace;
}

function traceLegacyForbiddenClaims({ fixture, response, runtimeValidatorResult = "PASS" }) {
  if (!fixture || !Array.isArray(fixture.forbiddenPhrases)) throw new Error("FORBIDDEN_FIXTURE_REJECTED");
  const matches = [];
  for (const field of modelFields(response)) {
    const normalizedField = field.value.toLocaleLowerCase("en-US");
    fixture.forbiddenPhrases.forEach((phrase, ordinal) => {
      const normalizedMatch = String(phrase).toLocaleLowerCase("en-US");
      if (!normalizedMatch) return;
      const offsets = [];
      let cursor = 0;
      while (cursor <= normalizedField.length - normalizedMatch.length) {
        const start = normalizedField.indexOf(normalizedMatch, cursor);
        if (start < 0) break;
        offsets.push(start);
        cursor = start + Math.max(1, normalizedMatch.length);
      }
      for (const start of offsets) {
        const end = start + normalizedMatch.length;
        matches.push(Object.freeze({
          caseId: fixture.id, fieldProvenance: field.fieldProvenance,
          ruleId: ruleId(fixture.id, ordinal), matcherType: MATCHER_TYPE,
          characterStart: start, characterEnd: end, matchCount: offsets.length,
          normalizedMatchSha256: sha256(normalizedMatch),
          semanticContext: semanticContext({ fieldProvenance: field.fieldProvenance, text: field.value, start, end, normalizedMatch }),
          runtimeValidatorResult, evaluatorResult: "FAIL",
        }));
      }
    });
  }
  return Object.freeze(assertSanitizedTrace(matches));
}

function rootCauseClassification(trace, datasetDefect = false) {
  if (datasetDefect) return ROOT_CAUSE_CLASSIFICATIONS.datasetDefect;
  if (!Array.isArray(trace) || trace.length === 0) return ROOT_CAUSE_CLASSIFICATIONS.unresolved;
  if (trace.some((item) => /^(?:SERVER_|EXACT_SERVER)/.test(item.fieldProvenance))) return ROOT_CAUSE_CLASSIFICATIONS.provenanceFalsePositive;
  if (trace.some((item) => ["NEGATED_CLAIM", "ATTRIBUTED_BIBLICAL_TEACHING", "SUBSTRING_COLLISION", "MODEL_AUTHORED_PETITION"].includes(item.semanticContext))) return ROOT_CAUSE_CLASSIFICATIONS.matcherFalsePositive;
  return ROOT_CAUSE_CLASSIFICATIONS.genuineModelClaim;
}

const LEGACY_MATCHER_BEHAVIOR = Object.freeze({
  matcherType: MATCHER_TYPE, normalization: NORMALIZATION, wordBoundary: WORD_BOUNDARY,
  negationBehavior: NEGATION_BEHAVIOR,
  scannedFields: Object.freeze(["MODEL_SUMMARY", "MODEL_BIBLICAL_APPLICATION", "MODEL_PRAYER", "MODEL_ACTION_STEP", "MODEL_LIMITATIONS", "SERVER_FIXED_UNCERTAINTY"]),
  excludedFields: Object.freeze(["MODEL_CONFIDENCE", "SERVER_EXACT_WEB_QUOTATION", "SERVER_CITATION_METADATA", "DETERMINISTIC_FALLBACK"]),
});

module.exports = {
  FIXED_UNCERTAINTY, LEGACY_MATCHER_BEHAVIOR, MATCHER_TYPE, NEGATION_BEHAVIOR,
  NORMALIZATION, ROOT_CAUSE_CLASSIFICATIONS, RUNTIME_TRACE_KEYS, TRACE_KEYS,
  WORD_BOUNDARY, assertSanitizedRuntimeEvidence, assertSanitizedTrace, modelFields,
  rootCauseClassification, ruleId, semanticContext, traceLegacyForbiddenClaims,
};