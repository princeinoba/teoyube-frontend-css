import { createHash } from "node:crypto";
import { z } from "zod";
import promiseClustersJson from "../../data/promiseClusters.json";
import type { UserMemoryRecord } from "../../domain/memory/memory-contracts";
import type { ScripturePassage, ScriptureReference } from "../../domain/scripture/scripture-repository";
import {
  TEO_GUIDE_LIMITS,
  TEO_GUIDE_TOOL_REGISTRY_VERSION,
  type TeoGuideActionProposal,
  type TeoGuideContext,
  type TeoGuideSourceReference,
  type TeoGuideToolName
} from "../../domain/teo-guide/orchestration-contracts";
import type { TeoGuideToolDescriptor, TeoGuideToolInvocation, TeoGuideToolOutput } from "../../domain/teo-guide/tool-contracts";
import { TeoGuideAuthorizedMemoryReader } from "../../features/teo-guide/application/authorized-memory-reader";
import { canonicalScriptureRepository } from "../scripture/canonical-scripture-repository";
import { canonicalTigService, TIG_DATASET_VERSION, TIG_RULESET_VERSION } from "../tig/canonical-tig-service";
import { getMemoryRuntime } from "../memory/memory-runtime";
import { TeoGuideActionProposalRepository, teoGuideActionProposals } from "./action-proposal-repository";

type PromiseClusterSource = Readonly<{
  cluster_id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
  promise_level?: string;
  promise_category?: string;
  scripture_references?: readonly string[];
  related_teoyube_words?: readonly string[];
  prayer_framework?: string;
  calling_connection?: string;
  divine_assignment?: string;
}>;

const promiseClusters: readonly PromiseClusterSource[] = Object.freeze(promiseClustersJson.map((item) => Object.freeze(item)));

const textSchema = z.string().trim().min(1).max(TEO_GUIDE_LIMITS.inputCharacters);
const referenceSchema = z.string().trim().min(3).max(128);
const identifierSchema = z.string().trim().min(1).max(160);

const inputSchemas = Object.freeze({
  searchScripture: z.object({ query: textSchema, limit: z.number().int().min(1).max(5) }).strict(),
  getScriptureContext: z.object({ reference: referenceSchema, versesBefore: z.number().int().min(0).max(12), versesAfter: z.number().int().min(0).max(12) }).strict(),
  searchPromises: z.object({ query: textSchema, limit: z.number().int().min(1).max(10) }).strict(),
  getPromiseCluster: z.object({ clusterId: identifierSchema }).strict(),
  getCurrentJourney: z.object({ conversationId: identifierSchema }).strict(),
  proposeJourneyAction: z.object({ journeyId: identifierSchema, stage: identifierSchema, requestedAction: textSchema }).strict(),
  getCallingEvidence: z.object({ query: textSchema }).strict(),
  buildPrayerOptions: z.object({ query: textSchema, scriptureReference: referenceSchema }).strict(),
  searchApprovedUserMemory: z.object({ query: textSchema, purpose: z.enum(["preference_continuity", "journey_continuity"]) }).strict(),
  summarizeReflectionPattern: z.object({ query: textSchema, approvedRecordIds: z.array(identifierSchema).max(25) }).strict(),
  draftJournalEntry: z.object({ query: textSchema, scriptureReference: referenceSchema }).strict(),
  draftTestimonyCandidate: z.object({ query: textSchema, scriptureReference: referenceSchema }).strict(),
  createMentorDiscussionPrompt: z.object({ query: textSchema, scriptureReference: referenceSchema }).strict()
});

function descriptor(name: TeoGuideToolName, purpose: string, requiresAuthentication = false, requiresConsent = false): TeoGuideToolDescriptor {
  return Object.freeze({
    name,
    purpose,
    inputSchemaVersion: "1.0.0",
    outputSchemaVersion: "1.0.0",
    inputTrust: "untrusted_user",
    outputTrust: name === "searchApprovedUserMemory" ? "user_approved" : name === "searchScripture" || name === "getScriptureContext" ? "trusted_system" : "untrusted_retrieved",
    requiresAuthentication,
    requiresConsent,
    stateMutation: false,
    maxOutputCharacters: TEO_GUIDE_LIMITS.toolOutputCharacters
  });
}

export const TEO_GUIDE_TOOL_REGISTRY: readonly TeoGuideToolDescriptor[] = Object.freeze([
  descriptor("searchScripture", "Search or retrieve exact approved WEB Scripture."),
  descriptor("getScriptureContext", "Read canonical context around an exact Scripture reference."),
  descriptor("searchPromises", "Search local Promise Clusters with source provenance."),
  descriptor("getPromiseCluster", "Read one local Promise Cluster."),
  descriptor("getCurrentJourney", "Read authenticated current journey state.", true, true),
  descriptor("proposeJourneyAction", "Create a reversible journey action proposal without mutation.", true, true),
  descriptor("getCallingEvidence", "Read deterministic TIG calling indicators and limitations."),
  descriptor("buildPrayerOptions", "Build editable prayer options anchored to Scripture."),
  descriptor("searchApprovedUserMemory", "Read explicitly approved structured memory.", true, true),
  descriptor("summarizeReflectionPattern", "Summarize approved reflection record metadata without storage.", true, true),
  descriptor("draftJournalEntry", "Create an editable session-only journal draft."),
  descriptor("draftTestimonyCandidate", "Create an editable testimony candidate that only the user may finalize."),
  descriptor("createMentorDiscussionPrompt", "Create a Scripture-grounded prompt for wise counsel and community.")
]);

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function source(input: Omit<TeoGuideSourceReference, "id">): TeoGuideSourceReference {
  return Object.freeze({ id: `source-${hash(JSON.stringify(input)).slice(0, 18)}`, ...input });
}

function exactReferenceForQuery(query: string): string {
  const normalized = query.toLowerCase();
  if (["wisdom", "decision", "confusion"].some((term) => normalized.includes(term))) return "James 1:5";
  if (["calling", "purpose", "assignment"].some((term) => normalized.includes(term))) return "Ephesians 2:10";
  if (["prayer", "pray", "anxious", "anxiety", "peace"].some((term) => normalized.includes(term))) return "Philippians 4:6-7";
  if (["trust", "direction", "plan"].some((term) => normalized.includes(term))) return "Proverbs 3:5-6";
  const parsed = canonicalScriptureRepository.parseReferences(query).find((candidate) => candidate.valid);
  return parsed?.valid ? parsed.canonicalLabel : "Psalm 119:105";
}

function parseReference(value: string): ScriptureReference | null {
  const parsed = canonicalScriptureRepository.parseReferences(value).find((candidate) => candidate.valid);
  return parsed?.valid ? parsed.reference : null;
}

function passageText(passage: ScripturePassage): string {
  return passage.verses.map((verse) => verse.text).join(" ");
}

function scriptureSource(passage: ScripturePassage): TeoGuideSourceReference {
  return source({
    kind: "scripture",
    label: `${passage.citation.canonicalLabel} (WEB)`,
    authority: "Scripture",
    path: passage.citation.sourceId,
    version: passage.citation.corpusVersion,
    scriptureReference: passage.citation.canonicalLabel
  });
}

function output(input: Omit<TeoGuideToolOutput, "outputCharacters">): TeoGuideToolOutput {
  const computed = JSON.stringify(input).length;
  if (computed > TEO_GUIDE_LIMITS.toolOutputCharacters) {
    return Object.freeze({
      tool: input.tool,
      status: "fallback",
      summary: "The deterministic tool output exceeded its safe size limit.",
      items: Object.freeze([]),
      sources: Object.freeze(input.sources.slice(0, 1)),
      limitations: Object.freeze([...input.limitations, "Tool output was reduced to stay within the safe output limit."]),
      proposals: Object.freeze([]),
      outputTrust: input.outputTrust,
      outputCharacters: 0
    });
  }
  return Object.freeze({ ...input, outputCharacters: computed });
}

function empty(tool: TeoGuideToolName, summary: string, limitation: string): TeoGuideToolOutput {
  return output({ tool, status: "fallback", summary, items: Object.freeze([]), sources: Object.freeze([]), limitations: Object.freeze([limitation]), proposals: Object.freeze([]), outputTrust: "trusted_system" });
}

function memorySource(record: UserMemoryRecord): TeoGuideSourceReference {
  return source({ kind: "approved_memory", label: `User-approved ${record.layer} record`, authority: "User-approved record", path: record.id, version: String(record.version) });
}

export class TeoGuideToolRegistry {
  readonly version = TEO_GUIDE_TOOL_REGISTRY_VERSION;
  readonly descriptors = TEO_GUIDE_TOOL_REGISTRY;

  constructor(private readonly proposals: TeoGuideActionProposalRepository = teoGuideActionProposals) {}

  descriptor(name: TeoGuideToolName): TeoGuideToolDescriptor {
    const found = this.descriptors.find((item) => item.name === name);
    if (!found) throw new Error("The requested Teo Guide tool is not registered.");
    return found;
  }

  async execute(invocation: TeoGuideToolInvocation, context: TeoGuideContext): Promise<TeoGuideToolOutput> {
    const schema = inputSchemas[invocation.name];
    schema.parse(invocation.input);

    switch (invocation.name) {
      case "searchScripture": {
        const referenceLabel = exactReferenceForQuery(invocation.input.query);
        const reference = parseReference(referenceLabel);
        if (!reference) return empty(invocation.name, "No exact Scripture reference could be resolved.", "The query was not matched to an approved WEB corpus reference.");
        const passage = await canonicalScriptureRepository.getByReference(reference);
        if (!passage) return empty(invocation.name, "The Scripture passage is unavailable.", "No approved WEB text was returned for the resolved reference.");
        const citationSource = scriptureSource(passage);
        return output({
          tool: invocation.name,
          status: "complete",
          summary: `Exact WEB Scripture retrieved for ${passage.citation.canonicalLabel}.`,
          items: Object.freeze([Object.freeze({ reference: passage.citation.canonicalLabel, text: passageText(passage), translation: "WEB", validationStatus: passage.citation.validationStatus })]),
          sources: Object.freeze([citationSource]),
          limitations: Object.freeze([]),
          proposals: Object.freeze([]),
          outputTrust: "trusted_system"
        });
      }
      case "getScriptureContext": {
        const reference = parseReference(invocation.input.reference);
        if (!reference) return empty(invocation.name, "Scripture context could not be resolved.", "The requested reference is invalid.");
        const found = await canonicalScriptureRepository.getContext(reference, { versesBefore: invocation.input.versesBefore, versesAfter: invocation.input.versesAfter });
        if (!found) return empty(invocation.name, "Scripture context is unavailable.", "No approved context was returned.");
        const citationSource = source({ kind: "scripture_context", label: `${found.requested.citation.canonicalLabel} context (WEB)`, authority: "Scripture", path: found.requested.citation.sourceId, version: found.requested.citation.corpusVersion, scriptureReference: found.requested.citation.canonicalLabel });
        return output({
          tool: invocation.name,
          status: "complete",
          summary: `Canonical context retrieved for ${found.requested.citation.canonicalLabel}.`,
          items: Object.freeze([Object.freeze({ reference: found.requested.citation.canonicalLabel, before: found.before.map((verse) => `${verse.verse}: ${verse.text}`), passage: passageText(found.requested), after: found.after.map((verse) => `${verse.verse}: ${verse.text}`), contextKind: found.contextKind, boundarySource: found.boundarySource })]),
          sources: Object.freeze([citationSource]),
          limitations: Object.freeze([...found.limitations]),
          proposals: Object.freeze([]),
          outputTrust: "trusted_system"
        });
      }
      case "searchPromises": {
        const terms = invocation.input.query.toLowerCase().split(/\W+/).filter((term) => term.length > 2);
        const ranked = promiseClusters.map((cluster) => ({ cluster, score: terms.filter((term) => JSON.stringify(cluster).toLowerCase().includes(term)).length })).sort((a, b) => b.score - a.score || String(a.cluster.cluster_id).localeCompare(String(b.cluster.cluster_id))).slice(0, invocation.input.limit);
        const items = ranked.map(({ cluster, score }) => Object.freeze({ clusterId: cluster.cluster_id || cluster.id || "unknown", title: cluster.title || cluster.name || "Promise Cluster", summary: cluster.summary || cluster.description || "", promiseLevel: cluster.promise_level || "C", category: cluster.promise_category || "", scriptureReferences: Object.freeze([...(cluster.scripture_references || [])]), score }));
        const sources = ranked.map(({ cluster }) => source({ kind: "promise_cluster", label: cluster.title || cluster.name || "Promise Cluster", authority: "Teoyube interpretation", path: `src/data/promiseClusters.json#${cluster.cluster_id || cluster.id}`, version: "local-promise-clusters-2026-07-18", scriptureReference: cluster.scripture_references?.[0] }));
        return output({ tool: invocation.name, status: items.length ? "complete" : "fallback", summary: items.length ? `${items.length} deterministic Promise Cluster match(es).` : "No Promise Cluster matched.", items: Object.freeze(items), sources: Object.freeze(sources), limitations: Object.freeze(["Promise Clusters are Scripture-derived aids and are not Scripture."]), proposals: Object.freeze([]), outputTrust: "untrusted_retrieved" });
      }
      case "getPromiseCluster": {
        const cluster = promiseClusters.find((item) => (item.cluster_id || item.id) === invocation.input.clusterId) || promiseClusters[0];
        if (!cluster) return empty(invocation.name, "Promise Cluster is unavailable.", "The local Promise Cluster dataset is empty.");
        const clusterSource = source({ kind: "promise_cluster", label: cluster.title || cluster.name || "Promise Cluster", authority: "Teoyube interpretation", path: `src/data/promiseClusters.json#${cluster.cluster_id || cluster.id}`, version: "local-promise-clusters-2026-07-18", scriptureReference: cluster.scripture_references?.[0] });
        return output({ tool: invocation.name, status: "complete", summary: cluster.summary || cluster.description || "Local Promise Cluster", items: Object.freeze([Object.freeze({ clusterId: cluster.cluster_id || cluster.id || "unknown", title: cluster.title || cluster.name || "Promise Cluster", promiseLevel: cluster.promise_level || "C", scriptureReferences: Object.freeze([...(cluster.scripture_references || [])]), teoyubeWords: Object.freeze([...(cluster.related_teoyube_words || [])]), prayerFramework: cluster.prayer_framework || "", callingConnection: cluster.calling_connection || "", assignment: cluster.divine_assignment || "" })]), sources: Object.freeze([clusterSource]), limitations: Object.freeze(["The cluster is an interpretive aid; Scripture remains primary."]), proposals: Object.freeze([]), outputTrust: "untrusted_retrieved" });
      }
      case "getCurrentJourney": {
        if (!context.currentJourney) return empty(invocation.name, "No active journey was supplied to this authenticated request.", "Teo Guide did not infer or create journey state.");
        const journeySource = source({ kind: "journey", label: "Current user journey", authority: "User-approved record", path: context.currentJourney.journeyId, version: String(context.currentJourney.revision), scriptureReference: context.currentJourney.scriptureReferences[0] });
        return output({ tool: invocation.name, status: "complete", summary: `Current journey stage: ${context.currentJourney.stage}.`, items: Object.freeze([Object.freeze({ journeyId: context.currentJourney.journeyId, stage: context.currentJourney.stage, revision: context.currentJourney.revision, status: context.currentJourney.status, scriptureReferences: context.currentJourney.scriptureReferences })]), sources: Object.freeze([journeySource]), limitations: Object.freeze(["Journey state is read-only in Teo Guide tools."]), proposals: Object.freeze([]), outputTrust: "user_approved" });
      }
      case "proposeJourneyAction": {
        const journeySource = source({ kind: "journey", label: "Current user journey", authority: "User-approved record", path: invocation.input.journeyId, version: invocation.input.stage });
        const proposal = this.proposals.create({ kind: "journey_action", label: "Review journey action", summary: `Review the proposed ${invocation.input.requestedAction} action for ${invocation.input.stage}.`, sourceIds: Object.freeze([journeySource.id]), payload: Object.freeze({ journeyId: invocation.input.journeyId, expectedStage: invocation.input.stage, action: invocation.input.requestedAction }) });
        return output({ tool: invocation.name, status: "complete", summary: "A reversible journey action was proposed for explicit review.", items: Object.freeze([Object.freeze({ proposalId: proposal.id, status: proposal.status, requiresExplicitConfirmation: true })]), sources: Object.freeze([journeySource]), limitations: Object.freeze(["No journey state changed. Authentication, CSRF, reauthorization, and explicit confirmation remain required."]), proposals: Object.freeze([proposal]), outputTrust: "trusted_system" });
      }
      case "getCallingEvidence": {
        const result = await canonicalTigService.recommend({ query: invocation.input.query, intent: "calling", surface: "calling", callingInput: invocation.input.query, privacy: { containsPrivatePrayerText: false, containsPrivateReflectionText: false } });
        const tigSource = source({ kind: "tig", label: result.selectedCandidate.label, authority: "Teoyube interpretation", path: result.selectedCandidate.graphPath.id, version: `${TIG_DATASET_VERSION}/${TIG_RULESET_VERSION}`, scriptureReference: result.selectedCandidate.scriptureAnchors[0]?.reference });
        return output({ tool: invocation.name, status: result.fallback.used ? "fallback" : "complete", summary: `The strongest deterministic indicators suggest ${result.selectedCandidate.label} may be emerging.`, items: Object.freeze([Object.freeze({ recommendationId: result.recommendationId, candidate: result.selectedCandidate.label, confidenceLabel: result.confidence.label, confidenceScore: result.confidence.score, explanationPath: result.explanation.steps.map((item) => item.summary), scriptureReferences: result.selectedCandidate.scriptureAnchors.map((item) => item.reference) })]), sources: Object.freeze([tigSource]), limitations: Object.freeze([...result.limitations, "Calling is discerned over time through Scripture, prayer, fruit, wise counsel, community, and appropriate professional care; TIG does not determine a final destiny."]), proposals: Object.freeze([]), outputTrust: "untrusted_retrieved" });
      }
      case "buildPrayerOptions": {
        const prayerSource = source({ kind: "scripture", label: invocation.input.scriptureReference, authority: "Scripture", path: `canonical-scripture:${invocation.input.scriptureReference}`, version: "WEB-2026-07-21.1", scriptureReference: invocation.input.scriptureReference });
        return output({ tool: invocation.name, status: "complete", summary: "Editable Scripture-grounded prayer options were prepared.", items: Object.freeze([Object.freeze({ title: "Prayer draft", text: `Father, help me receive ${invocation.input.scriptureReference} with humility, seek wisdom, and take one faithful next step.`, editable: true, divineSpeech: false })]), sources: Object.freeze([prayerSource]), limitations: Object.freeze(["This prayer draft is a devotional aid, not divine speech, a command to God, or a guarantee."]), proposals: Object.freeze([]), outputTrust: "untrusted_retrieved" });
      }
      case "searchApprovedUserMemory": {
        const runtime = getMemoryRuntime();
        if (!runtime || !context.authorization) return empty(invocation.name, "Approved memory is unavailable.", "Durable memory or authenticated authorization is disabled for this preview request.");
        const records = await new TeoGuideAuthorizedMemoryReader(runtime.memory).readStructuredMemory(context.authorization, invocation.input.purpose);
        const items = records.map((record) => Object.freeze({ id: record.id, layer: record.layer, purposeId: record.purposeId, userApproved: record.userApproved, status: record.status, version: record.version, contentFields: Object.freeze(Object.keys(record.content).sort()) }));
        return output({ tool: invocation.name, status: "complete", summary: `${items.length} approved structured memory record(s) were available.`, items: Object.freeze(items), sources: Object.freeze(records.map(memorySource)), limitations: Object.freeze(["Raw private prayer or reflection text is not copied into telemetry or conversation metadata."]), proposals: Object.freeze([]), outputTrust: "user_approved" });
      }
      case "summarizeReflectionPattern": {
        return output({ tool: invocation.name, status: "complete", summary: "A reviewable pattern summary was prepared from approved record metadata.", items: Object.freeze([Object.freeze({ approvedRecordCount: invocation.input.approvedRecordIds.length, summary: invocation.input.approvedRecordIds.length ? "The approved records may show a recurring invitation to revisit Scripture, prayer, and one realistic action." : "No approved records were available to summarize.", requiresUserReview: true })]), sources: Object.freeze([]), limitations: Object.freeze(["This is a tentative pattern, not a hidden profile or a claim about God's action."]), proposals: Object.freeze([]), outputTrust: "user_approved" });
      }
      case "draftJournalEntry": {
        const draftSource = source({ kind: "scripture", label: invocation.input.scriptureReference, authority: "Scripture", path: `canonical-scripture:${invocation.input.scriptureReference}`, version: "WEB-2026-07-21.1", scriptureReference: invocation.input.scriptureReference });
        const proposal = this.proposals.create({ kind: "journal_draft", label: "Review journal draft", summary: "Review and edit a session-only reflection draft.", sourceIds: Object.freeze([draftSource.id]), payload: Object.freeze({ scriptureReference: invocation.input.scriptureReference, draftKind: "journal" }) });
        return output({ tool: invocation.name, status: "complete", summary: "An editable journal draft was prepared without persistence.", items: Object.freeze([Object.freeze({ draft: `I am reflecting on ${invocation.input.scriptureReference}. I want to notice what the text says, what I may be interpreting, and one faithful next step.`, editable: true })]), sources: Object.freeze([draftSource]), limitations: Object.freeze(["Nothing is saved unless the user later confirms an authorized application action."]), proposals: Object.freeze([proposal]), outputTrust: "untrusted_retrieved" });
      }
      case "draftTestimonyCandidate": {
        const testimonySource = source({ kind: "scripture", label: invocation.input.scriptureReference, authority: "Scripture", path: `canonical-scripture:${invocation.input.scriptureReference}`, version: "WEB-2026-07-21.1", scriptureReference: invocation.input.scriptureReference });
        const proposal = this.proposals.create({ kind: "testimony_candidate", label: "Review testimony candidate", summary: "Review, edit, or reject a testimony candidate; only the user may finalize it.", sourceIds: Object.freeze([testimonySource.id]), payload: Object.freeze({ scriptureReference: invocation.input.scriptureReference, draftKind: "testimony_candidate" }) });
        return output({ tool: invocation.name, status: "complete", summary: "An editable testimony candidate was prepared without publication or persistence.", items: Object.freeze([Object.freeze({ draft: `In light of ${invocation.input.scriptureReference}, I want to review what happened, what I learned, and what I can responsibly say without automatically declaring promise fulfillment or God's action.`, editable: true, userFinalizationRequired: true })]), sources: Object.freeze([testimonySource]), limitations: Object.freeze(["Teo Guide does not publish testimony, declare a promise fulfilled, or label an event as God's action."]), proposals: Object.freeze([proposal]), outputTrust: "untrusted_retrieved" });
      }
      case "createMentorDiscussionPrompt": {
        const mentorSource = source({ kind: "scripture", label: invocation.input.scriptureReference, authority: "Scripture", path: `canonical-scripture:${invocation.input.scriptureReference}`, version: "WEB-2026-07-21.1", scriptureReference: invocation.input.scriptureReference });
        const proposal: TeoGuideActionProposal = this.proposals.create({ kind: "mentor_discussion", label: "Review mentor discussion prompt", summary: "Review a question to discuss with wise counsel or community.", sourceIds: Object.freeze([mentorSource.id]), payload: Object.freeze({ scriptureReference: invocation.input.scriptureReference, promptKind: "mentor_discussion" }) });
        return output({ tool: invocation.name, status: "complete", summary: "A community discussion prompt was prepared.", items: Object.freeze([Object.freeze({ prompt: `As we read ${invocation.input.scriptureReference} in context, what interpretation should I test, what risks should I consider, and what humble next step seems faithful?`, editable: true })]), sources: Object.freeze([mentorSource]), limitations: Object.freeze(["For major decisions, include prayer, Scripture, wise counsel, community, and appropriate professional care."]), proposals: Object.freeze([proposal]), outputTrust: "untrusted_retrieved" });
      }
    }
  }
}

export const teoGuideToolRegistry = new TeoGuideToolRegistry();
