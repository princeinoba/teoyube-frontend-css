import { createSupportView, type SupportView } from "../../../domain/support/support-view";

const RETAINED_PUBLIC = [
  "/settings", "/privacy", "/consent", "/terms", "/profile", "/daily-word",
  "/explore", "/personalization", "/promise-search", "/prayer", "/journey", "/journal"
] as const;

export function getSupportViewRegistry(): readonly SupportView[] {
  return Object.freeze([
    ...RETAINED_PUBLIC.map((route) => createSupportView({ route, capability: route.slice(1), visibility: "retained_public", normalNavigation: false, visualTreatment: "approved_shell_current_view" })),
    createSupportView({ route: "/compass", capability: "calling-compass-alias", visibility: "retained_public", normalNavigation: false, visualTreatment: "approved_shell_current_view" }),
    createSupportView({ route: "/roadmap", capability: "owner-roadmap", visibility: "owner_only", normalNavigation: false, visualTreatment: "approved_owner_qa_view" }),
    createSupportView({ route: "/tig", capability: "tig-internal", visibility: "owner_only", normalNavigation: false, visualTreatment: "approved_owner_qa_view" }),
    createSupportView({ route: "/dashboard", capability: "development-dashboard", visibility: "development_only", normalNavigation: false, visualTreatment: "approved_owner_qa_view" }),
    createSupportView({ route: "/graph", capability: "graph-internal", visibility: "owner_only", normalNavigation: false, visualTreatment: "approved_owner_qa_view" }),
    createSupportView({ route: "/dev", capability: "development-health", visibility: "development_only", normalNavigation: false, visualTreatment: "approved_owner_qa_view" })
  ]);
}
