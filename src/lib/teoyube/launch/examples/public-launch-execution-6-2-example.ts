import { createPublicLaunchDayFeedbackItem, createPublicLaunchDayFeedbackLog, addPublicLaunchDayFeedbackItem } from "../public-launch-day-feedback-intake";
import { createPublicLaunchDayMonitoringFeedbackPackage, createPublicLaunchDayMonitoringFeedbackPackageReport } from "../public-launch-day-monitoring-feedback-package";
import { createPublicLaunchDayMonitoringReport, createPublicLaunchDayMonitoringRun, recordPublicLaunchDayMonitoringResult } from "../public-launch-day-monitoring-run";

export function runPublicLaunchExecution62Example() {
  const monitoringRun = recordPublicLaunchDayMonitoringResult(createPublicLaunchDayMonitoringRun(), {
    checkId: "public_app_load_manual_check",
    status: "pass",
    notes: ["Owner manually confirmed the public app loads."]
  });
  const feedbackLog = addPublicLaunchDayFeedbackItem(createPublicLaunchDayFeedbackLog(), createPublicLaunchDayFeedbackItem({
    id: "public_copy_clarity_sample",
    category: "public_copy",
    surface: "privacy_notice",
    summary: "Sample sanitized note about public notice clarity."
  }));
  const pkg = createPublicLaunchDayMonitoringFeedbackPackage({
    monitoringReport: createPublicLaunchDayMonitoringReport(monitoringRun),
    knownLimitations: ["Manual public launch day monitoring remains owner-reviewed."]
  });

  return {
    packageReport: createPublicLaunchDayMonitoringFeedbackPackageReport(pkg),
    feedbackLog,
    generatedAt: new Date().toISOString()
  };
}
