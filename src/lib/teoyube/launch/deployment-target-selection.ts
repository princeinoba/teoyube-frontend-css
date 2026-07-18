import type {
  TeoyubeDeploymentTargetDecision,
  TeoyubeDeploymentTargetOption
} from "./launch-environment-contracts";

export type TeoyubeDeploymentProjectContext = {
  framework?: "nextjs" | "vite" | "static" | "unknown";
  prefersLowestCostRisk?: boolean;
  needsPreviewDeployments?: boolean;
  needsEasyRollback?: boolean;
  futureDatabaseLikely?: boolean;
  futureAnalyticsLikely?: boolean;
};

export function getDeploymentTargetOptions(): TeoyubeDeploymentTargetOption[] {
  return [
    {
      target: "vercel",
      label: "Vercel",
      description: "Strong fit for Next.js preview deployments and environment management.",
      easeOfNextDeployment: 10,
      previewSupport: 10,
      environmentVariableSupport: 9,
      scalability: 8,
      costRisk: 6,
      buildSupport: 10,
      rollbackSupport: 9,
      customDomainSupport: 9,
      futureDatabaseFlexibility: 8,
      futureAnalyticsFlexibility: 8,
      safetyPrivacyFit: 8,
      notes: ["Best default fit for a Next.js app.", "Provider still must be connected deliberately later."]
    },
    {
      target: "netlify",
      label: "Netlify",
      description: "Good preview deployment and static/web app support.",
      easeOfNextDeployment: 8,
      previewSupport: 9,
      environmentVariableSupport: 8,
      scalability: 7,
      costRisk: 7,
      buildSupport: 8,
      rollbackSupport: 8,
      customDomainSupport: 9,
      futureDatabaseFlexibility: 7,
      futureAnalyticsFlexibility: 8,
      safetyPrivacyFit: 8,
      notes: ["Good general web deployment option.", "Next.js feature compatibility should be checked."]
    },
    {
      target: "render",
      label: "Render",
      description: "Flexible web service hosting with environment controls.",
      easeOfNextDeployment: 7,
      previewSupport: 6,
      environmentVariableSupport: 8,
      scalability: 7,
      costRisk: 7,
      buildSupport: 7,
      rollbackSupport: 6,
      customDomainSupport: 8,
      futureDatabaseFlexibility: 8,
      futureAnalyticsFlexibility: 7,
      safetyPrivacyFit: 8,
      notes: ["Flexible hosting.", "Preview flow may need more manual setup."]
    },
    {
      target: "railway",
      label: "Railway",
      description: "Fast app hosting with future database flexibility.",
      easeOfNextDeployment: 7,
      previewSupport: 6,
      environmentVariableSupport: 8,
      scalability: 7,
      costRisk: 6,
      buildSupport: 7,
      rollbackSupport: 6,
      customDomainSupport: 7,
      futureDatabaseFlexibility: 9,
      futureAnalyticsFlexibility: 7,
      safetyPrivacyFit: 7,
      notes: ["Good future backend flexibility.", "Cost and provider boundaries should be reviewed."]
    },
    {
      target: "self_hosted",
      label: "Self-hosted",
      description: "Maximum control with more operational responsibility.",
      easeOfNextDeployment: 4,
      previewSupport: 4,
      environmentVariableSupport: 7,
      scalability: 6,
      costRisk: 5,
      buildSupport: 6,
      rollbackSupport: 5,
      customDomainSupport: 8,
      futureDatabaseFlexibility: 8,
      futureAnalyticsFlexibility: 7,
      safetyPrivacyFit: 9,
      notes: ["High control.", "Requires more operations and monitoring maturity."]
    }
  ];
}

export function scoreDeploymentTargetOption(
  option: TeoyubeDeploymentTargetOption,
  projectContext: TeoyubeDeploymentProjectContext = {}
): number {
  const nextWeight = projectContext.framework === "nextjs" || projectContext.framework === undefined ? 1.5 : 1;
  const previewWeight = projectContext.needsPreviewDeployments === false ? 0.8 : 1.2;
  const rollbackWeight = projectContext.needsEasyRollback === false ? 0.8 : 1.1;
  const databaseWeight = projectContext.futureDatabaseLikely ? 1.1 : 0.9;
  const analyticsWeight = projectContext.futureAnalyticsLikely ? 1.05 : 0.9;
  const costWeight = projectContext.prefersLowestCostRisk ? 1.2 : 1;
  const total =
    option.easeOfNextDeployment * nextWeight +
    option.previewSupport * previewWeight +
    option.environmentVariableSupport +
    option.scalability +
    option.costRisk * costWeight +
    option.buildSupport +
    option.rollbackSupport * rollbackWeight +
    option.customDomainSupport +
    option.futureDatabaseFlexibility * databaseWeight +
    option.futureAnalyticsFlexibility * analyticsWeight +
    option.safetyPrivacyFit * 1.2;
  const max =
    10 * nextWeight +
    10 * previewWeight +
    10 +
    10 +
    10 * costWeight +
    10 +
    10 * rollbackWeight +
    10 +
    10 * databaseWeight +
    10 * analyticsWeight +
    10 * 1.2;

  return Math.round((total / max) * 100);
}

export function compareDeploymentTargetOptions(
  projectContext: TeoyubeDeploymentProjectContext = {}
) {
  return getDeploymentTargetOptions()
    .map((option) => ({
      option,
      score: scoreDeploymentTargetOption(option, projectContext)
    }))
    .sort((a, b) => b.score - a.score);
}

export function selectRecommendedDeploymentTarget(
  projectContext: TeoyubeDeploymentProjectContext = {}
) {
  return compareDeploymentTargetOptions(projectContext)[0];
}

export function createDeploymentTargetDecision(
  projectContext: TeoyubeDeploymentProjectContext = { framework: "nextjs", needsPreviewDeployments: true, needsEasyRollback: true }
): TeoyubeDeploymentTargetDecision {
  const compared = compareDeploymentTargetOptions(projectContext);
  const best = compared[0];

  if (!best) {
    return {
      selectedTarget: "undecided",
      label: "Undecided",
      score: 0,
      status: "undecided",
      reasons: ["No deployment options were available."],
      warnings: ["Choose a deployment target before soft launch."],
      nextActions: ["Review deployment target options."],
      comparedOptions: []
    };
  }

  return {
    selectedTarget: best.option.target,
    label: best.option.label,
    score: best.score,
    status: best.score >= 80 ? "recommended" : "acceptable",
    reasons: [
      `${best.option.label} has the strongest fit for the current Next.js launch preparation context.`,
      "The decision remains a plan only; no provider is connected in this step.",
      ...best.option.notes
    ],
    warnings: [
      "Do not deploy yet.",
      "Do not add provider-specific secrets until the deployment step intentionally requires them."
    ],
    nextActions: [
      "Confirm deployment target with the project owner.",
      "Prepare preview and production environment variable values using placeholders first.",
      "Use the completed Production Launch Preparation 1.3 QA foundation before soft launch, then run the 1.4 build verification and deployment dry run."
    ],
    comparedOptions: compared.map(({ option, score }) => ({
      target: option.target,
      label: option.label,
      score
    }))
  };
}

export function explainDeploymentTargetDecision(decision: TeoyubeDeploymentTargetDecision): string {
  return `${decision.label} is ${decision.status} with a score of ${decision.score}. ${decision.reasons.join(" ")}`;
}
