import { createHash } from "node:crypto";
import type { AuthorizationContext } from "../../domain/identity/identity-contracts";
import {
  TEO_GUIDE_LIMITS,
  type TeoGuideActionProposal,
  type TeoGuideProposalDecision,
  type TeoGuideProposalDecisionResult
} from "../../domain/teo-guide/orchestration-contracts";
import type { PrivacySafeEventSink } from "../observability/privacy-safe-events";
import { nullPrivacySafeEventSink } from "../observability/privacy-safe-events";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export class TeoGuideActionProposalRepository {
  readonly #records = new Map<string, TeoGuideActionProposal>();
  constructor(
    private readonly now: () => string = () => new Date().toISOString(),
    private readonly events: PrivacySafeEventSink = nullPrivacySafeEventSink
  ) {}

  create(input: Readonly<{
    kind: TeoGuideActionProposal["kind"];
    label: string;
    summary: string;
    sourceIds: readonly string[];
    payload: TeoGuideActionProposal["payload"];
  }>): TeoGuideActionProposal {
    const createdAt = this.now();
    const id = `teo-proposal-${digest(JSON.stringify({ ...input, createdAt })).slice(0, 20)}`;
    const proposal: TeoGuideActionProposal = Object.freeze({
      id,
      kind: input.kind,
      status: "proposed",
      label: input.label,
      summary: input.summary,
      sourceIds: Object.freeze([...input.sourceIds]),
      requiresAuthentication: true,
      requiresCsrf: true,
      requiresExplicitConfirmation: true,
      createdAt,
      expiresAt: new Date(Date.parse(createdAt) + TEO_GUIDE_LIMITS.proposalTtlMs).toISOString(),
      confirmationRevision: 1,
      payload: Object.freeze({ ...input.payload })
    });
    this.#records.set(id, proposal);
    return proposal;
  }

  get(id: string): TeoGuideActionProposal | null {
    return this.#records.get(id) || null;
  }

  decide(context: AuthorizationContext, decision: TeoGuideProposalDecision): TeoGuideProposalDecisionResult {
    const current = this.#records.get(decision.proposalId);
    if (!current) throw new Error("Action proposal is unavailable.");
    if (current.status !== "proposed" || current.confirmationRevision !== decision.expectedRevision) throw new Error("Action proposal conflict.");
    const occurredAt = this.now();
    const expired = Date.parse(current.expiresAt) <= Date.parse(occurredAt);
    const status = expired ? "expired" : decision.decision === "confirm" ? "confirmed" : "rejected";
    const proposal = Object.freeze({ ...current, status, confirmationRevision: current.confirmationRevision + 1 });
    this.#records.set(proposal.id, proposal);
    if (expired) throw new Error("Action proposal is unavailable.");
    const event = status === "confirmed" ? "teo_guide_action_confirmed" : "teo_guide_action_rejected";
    const subjectHash = digest(context.user.id);
    const proposalHash = digest(proposal.id);
    this.events.emit({ name: event, occurredAt, subjectHash, result: status === "confirmed" ? "allowed" : "denied" });
    return Object.freeze({
      proposal,
      applicationActionAuthorized: status === "confirmed",
      durableWritePerformed: false,
      audit: Object.freeze({ event, subjectHash, proposalHash, occurredAt })
    });
  }
}

export const teoGuideActionProposals = new TeoGuideActionProposalRepository();
