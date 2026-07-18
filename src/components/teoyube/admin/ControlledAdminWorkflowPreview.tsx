"use client";

import { useMemo } from "react";
import {
  createAdminReviewBoardViewModel,
  createPhase45Package,
  createPhase45PackageReport
} from "../../../lib/teoyube/phase-4";

export type ControlledAdminWorkflowPreviewProps = {
  maxItemsPerPanel?: number;
};

export default function ControlledAdminWorkflowPreview({
  maxItemsPerPanel = 4
}: ControlledAdminWorkflowPreviewProps) {
  const viewModel = useMemo(() => createAdminReviewBoardViewModel(), []);
  const phase45Report = useMemo(() => createPhase45PackageReport(createPhase45Package()), []);

  return (
    <section className="card" aria-label="Controlled Admin Workflow Prototype Preview">
      <div>
        <p className="eyebrow">Prototype-only</p>
        <h2 className="gold">Controlled Admin Workflow Preview</h2>
        <p className="muted">
          In-memory review board for future owner/reviewer workflows. It does not publish content,
          persist data, connect services, add auth, or modify production JSON.
        </p>
      </div>

      <div className="grid">
        <article className="card">
          <h3>Review Queue</h3>
          <p>{viewModel.summary.reviewItemCount} review item(s)</p>
          <p className="muted">{viewModel.summary.releaseCandidateCount} release candidate item(s)</p>
        </article>
        <article className="card">
          <h3>Service Readiness</h3>
          <p>{viewModel.summary.serviceReadinessDecision.replace(/_/g, " ")}</p>
          <p className="muted">Database, analytics, monitoring, live AI, auth, CMS, and email remain disabled.</p>
        </article>
        <article className="card">
          <h3>Beta QA</h3>
          <p>{viewModel.summary.betaQaDecision.replace(/_/g, " ")}</p>
          <p className="muted">Manual execution remains required.</p>
        </article>
        <article className="card">
          <h3>Phase 4.5 Package</h3>
          <p>{phase45Report.decision.replace(/_/g, " ")}</p>
          <p className="muted">{phase45Report.warnings.length} warning(s), {phase45Report.blockers.length} blocker(s)</p>
        </article>
      </div>

      <div className="grid one">
        {viewModel.panels.map((panel) => (
          <article className="card" key={panel.id}>
            <h3>{panel.title}</h3>
            <p className="muted">{panel.summary}</p>
            <p>
              <strong>Status:</strong> {panel.status.replace(/_/g, " ")}
            </p>
            <p>
              <strong>Reviews:</strong> {panel.requiredReviewCount} required,{" "}
              <strong>Warnings:</strong> {panel.warningCount}, <strong>Blockers:</strong> {panel.blockerCount}
            </p>
            {panel.items.length ? (
              <ul>
                {panel.items.slice(0, maxItemsPerPanel).map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong> - {item.status.replace(/_/g, " ")}
                    {item.scriptureAnchors.length ? ` (${item.scriptureAnchors.join(", ")})` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No items in this prototype panel yet.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
