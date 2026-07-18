import {
  calculateBetaReadinessScore,
  calculateBetaReadinessScoreByArea,
  createBetaReadinessScoreDecision,
  createBetaReadinessScoreReport,
  getBetaReadinessScoreBand,
  getBetaReadinessScoreBlockers,
  getBetaReadinessScoreWarnings
} from "./beta-readiness-score";
import type {
  TeoyubeBetaReadinessScoreArea,
  TeoyubeBetaReadinessScoreInput
} from "./beta-readiness-score-contracts";

export type TeoyubePostRemediationReadinessScoreInput = TeoyubeBetaReadinessScoreInput;

export function calculatePostRemediationReadinessScore(input: TeoyubePostRemediationReadinessScoreInput = {}) {
  return calculateBetaReadinessScore(input);
}

export function calculatePostRemediationReadinessScoreByArea(input: TeoyubePostRemediationReadinessScoreInput = {}, area: TeoyubeBetaReadinessScoreArea) {
  return calculateBetaReadinessScoreByArea(input, area);
}

export function getPostRemediationReadinessScoreBand(score: number) {
  return getBetaReadinessScoreBand(score);
}

export function getPostRemediationReadinessScoreBlockers(input: TeoyubePostRemediationReadinessScoreInput = {}) {
  return getBetaReadinessScoreBlockers(input);
}

export function getPostRemediationReadinessScoreWarnings(input: TeoyubePostRemediationReadinessScoreInput = {}) {
  return getBetaReadinessScoreWarnings(input);
}

export function createPostRemediationReadinessScoreDecision(input: TeoyubePostRemediationReadinessScoreInput = {}) {
  return createBetaReadinessScoreDecision(input);
}

export function createPostRemediationReadinessScoreReport(input: TeoyubePostRemediationReadinessScoreInput = {}) {
  return {
    ...createBetaReadinessScoreReport(input),
    scoreContext: "post_remediation" as const,
    nextStep: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff" as const
  };
}
