import type { TeoyubeDeploymentReadinessStatus } from "./scale-readiness-contracts";

export type ProductionLaunchChecklistItem = {
  id: string;
  label: string;
  status: TeoyubeDeploymentReadinessStatus;
  required: boolean;
  note: string;
};

export type ProductionLaunchRisk = {
  id: string;
  risk: string;
  level: "low" | "medium" | "high";
  mitigation: string;
};

export type ProductionLaunchPreparationPlan = {
  phase: "Production Launch Preparation";
  status: "ready_to_begin";
  checklist: ProductionLaunchChecklistItem[];
  riskRegister: ProductionLaunchRisk[];
  monitoringPlan: string[];
  blockers: string[];
  constraints: string[];
};

function item(
  id: string,
  label: string,
  status: TeoyubeDeploymentReadinessStatus,
  note: string,
  required = true
): ProductionLaunchChecklistItem {
  return { id, label, status, required, note };
}

export function getProductionLaunchChecklist(): ProductionLaunchChecklistItem[] {
  return [
    item("final_typecheck", "Final typecheck", "planned", "Run available TypeScript checks before launch."),
    item("final_lint", "Final lint", "planned", "Run lint if a project script exists."),
    item("final_build", "Final build", "planned", "Run production build before launch."),
    item("final_test", "Final tests", "planned", "Run tests if a project script exists."),
    item("mobile_qa", "Mobile QA checklist", "planned", "Verify core surfaces on small, medium, and large screens."),
    item("accessibility_qa", "Accessibility QA checklist", "planned", "Verify keyboard, touch targets, contrast, and readable overflow."),
    item("scripture_explanation_qa", "Scripture and explanation QA", "planned", "Confirm Scripture anchors and explanation paths are visible."),
    item("fallback_offline_qa", "Fallback and offline QA", "planned", "Confirm fallback and offline read-only paths remain clear."),
    item("privacy_consent_qa", "Privacy and consent QA", "planned", "Confirm consent controls, export/delete/reset paths, and no hidden memory."),
    item("analytics_connection_plan", "Analytics connection plan", "planned", "Prepare provider decision later; no analytics sending is active."),
    item("persistence_connection_plan", "Persistence connection plan", "planned", "Prepare database adapter later; no database writes are active."),
    item("deployment_target_decision", "Deployment target decision", "planned", "Choose hosting target in a future launch preparation step."),
    item("monitoring_plan", "Monitoring plan", "planned", "Prepare privacy-safe monitoring later; no provider is active.")
  ];
}

export function getPreLaunchRiskRegister(): ProductionLaunchRisk[] {
  return [
    {
      id: "provider_connection_risk",
      risk: "A future provider could accidentally receive raw private text.",
      level: "high",
      mitigation: "Use the Phase 7 logging, analytics, persistence, and runtime safety boundaries before connecting providers."
    },
    {
      id: "mobile_payload_growth",
      risk: "Graph payloads could grow beyond mobile rendering budgets.",
      level: "medium",
      mitigation: "Keep expanded graph views deferred and apply response performance budgets."
    },
    {
      id: "offline_expectation_risk",
      risk: "Users may mistake offline fallback for live guidance.",
      level: "medium",
      mitigation: "Keep offline fallback labels explicit and read-only."
    }
  ];
}

export function getPostLaunchMonitoringPlan(): string[] {
  return [
    "Monitor route-level build and runtime health after a future deployment provider is selected.",
    "Track privacy-safe fallback frequency only after analytics consent and provider review.",
    "Review mobile layout regressions across primary surfaces.",
    "Review user-reported issues without storing raw sensitive personalization text.",
    "Keep Scripture anchoring and explanation path visibility as launch blockers."
  ];
}

export function getLaunchBlockers(): string[] {
  return [
    "Production provider is not selected yet.",
    "Production persistence is not connected yet.",
    "External analytics are not connected yet.",
    "Live AI orchestration is not connected yet.",
    "Final launch QA has not been run yet."
  ];
}

export function getProductionLaunchPreparationPlan(): ProductionLaunchPreparationPlan {
  return {
    phase: "Production Launch Preparation",
    status: "ready_to_begin",
    checklist: getProductionLaunchChecklist(),
    riskRegister: getPreLaunchRiskRegister(),
    monitoringPlan: getPostLaunchMonitoringPlan(),
    blockers: getLaunchBlockers(),
    constraints: [
      "Do not connect production services in Phase 7.5.",
      "Do not add hosting providers, databases, external analytics, live AI, service workers, or native app builds yet.",
      "Keep Scripture anchoring, explanation paths, consent controls, fallback safety, and privacy boundaries intact."
    ]
  };
}

export function createProductionLaunchPreparationReport() {
  const plan = getProductionLaunchPreparationPlan();

  return {
    ...plan,
    readyToBegin: true,
    activeProvidersConnected: false,
    productionServicesConnected: false,
    generatedAt: new Date().toISOString()
  };
}

