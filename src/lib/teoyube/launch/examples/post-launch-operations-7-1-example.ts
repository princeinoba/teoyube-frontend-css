import { createPostLaunchGrowthRoadmap, createPostLaunchGrowthRoadmapReport } from "../post-launch-growth-roadmap";
import { runPostLaunchOperations71Audit } from "../post-launch-operations-audit";
import { createPostLaunchOperationsPackage, createPostLaunchOperationsPackageReport } from "../post-launch-operations-package";
import { createPostLaunchPublicMonitoringPlan, createPostLaunchPublicMonitoringReport } from "../post-launch-public-monitoring-plan";
import { createPostLaunchSupportWorkflow, createPostLaunchSupportWorkflowReport } from "../post-launch-support-workflow";

export function runPostLaunchOperations71Example() {
  const publicMonitoringReport = createPostLaunchPublicMonitoringReport(createPostLaunchPublicMonitoringPlan());
  const supportWorkflowReport = createPostLaunchSupportWorkflowReport(createPostLaunchSupportWorkflow());
  const growthRoadmapReport = createPostLaunchGrowthRoadmapReport(createPostLaunchGrowthRoadmap());
  const operationsPackage = createPostLaunchOperationsPackage({
    publicMonitoringReport,
    supportWorkflowReport,
    growthRoadmapReport
  });
  const operationsPackageReport = createPostLaunchOperationsPackageReport(operationsPackage);
  const audit = runPostLaunchOperations71Audit();

  return {
    publicMonitoringReport,
    supportWorkflowReport,
    growthRoadmapReport,
    operationsPackage,
    operationsPackageReport,
    audit
  };
}
