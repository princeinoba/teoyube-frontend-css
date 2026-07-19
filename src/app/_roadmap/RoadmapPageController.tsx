"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ApprovedMigrationOverlays } from "../_approved-source/ApprovedMigrationOverlays";
import { ApprovedRoadmapView } from "./ApprovedRoadmapView";

function ApprovedRoadmapQaPanel({ html }: { html: string }) {
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(
    <section className="phase114-qa-panel" id="phase114QaPanel" dangerouslySetInnerHTML={{ __html: html }} />,
    document.body
  );
}

export function RoadmapPageController({ approvedHtml, qaPanelHtml }: { approvedHtml: string; qaPanelHtml: string }) {
  return (
    <>
      <ApprovedRoadmapView html={approvedHtml} />
      <ApprovedRoadmapQaPanel html={qaPanelHtml} />
      <ApprovedMigrationOverlays notice={null} clearNotice={() => undefined} />
    </>
  );
}
