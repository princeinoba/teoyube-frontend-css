import {
  createBuildStabilizationReport,
  createComponentRenderVerificationReport,
  createDataLoadingVerificationReport,
  createPhase102Package,
  createPhase102PackageReport,
  createRealAppRuntimeVerificationReport,
  createRealAppVerificationPackage,
  createRealAppVerificationPackageReport,
  createRouteQaInventory,
  createRouteQaReport,
  runPhase102Audit
} from "../phase-10";

export function runPhase102RouteBuildSmokeCheck() {
  const routes = createRouteQaInventory();
  const routeQaReport = createRouteQaReport();
  const dataLoadingReport = createDataLoadingVerificationReport();
  const componentReport = createComponentRenderVerificationReport();
  const buildReport = createBuildStabilizationReport();
  const runtimeReport = createRealAppRuntimeVerificationReport();
  const realAppPackage = createRealAppVerificationPackage();
  const realAppPackageReport = createRealAppVerificationPackageReport(realAppPackage);
  const phase102Package = createPhase102Package({ ownerReviewed: true });
  const phase102PackageReport = createPhase102PackageReport(phase102Package);
  const audit = runPhase102Audit();
  const results = [
    { id: "route_inventory", passed: routes.length >= 10, details: "Route inventory can be created." },
    { id: "data_loading", passed: dataLoadingReport.valid, details: "Data loading checks return structured results." },
    { id: "component_render", passed: componentReport.valid, details: "Component verification checks return structured results." },
    { id: "build_stabilization", passed: buildReport.decision === "blocked_by_dependencies", details: "Build stabilization correctly records missing dependency blocker." },
    { id: "runtime_report", passed: runtimeReport.decision === "blocked_by_build", details: "Runtime report correctly records build blocker." },
    { id: "real_app_package", passed: realAppPackageReport.decision === "blocked_by_build", details: "Real app verification package records blocker." },
    { id: "phase_10_2_package", passed: phase102PackageReport.decision === "blocked_by_real_app_build_runtime", details: "Phase 10.2 package remains blocked until build/runtime are fixed." },
    { id: "phase_10_2_audit", passed: !audit.complete && audit.blockers.length > 0, details: "Phase 10.2 audit returns structured blocked report." },
    { id: "no_public_url_fetching", passed: realAppPackage.noPublicUrlsFetchedAutomatically, details: "No public URL fetching is required." },
    { id: "no_external_services", passed: realAppPackage.noExternalServicesRequired, details: "No external service connection is required." }
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: phase102PackageReport.warnings,
    nextAction: "Fix dependency/build blockers before Phase 10.3.",
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
