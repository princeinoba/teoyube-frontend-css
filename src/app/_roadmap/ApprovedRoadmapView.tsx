import { memo } from "react";

export const ApprovedRoadmapView = memo(function ApprovedRoadmapView({ html }: { html: string }) {
  return <section className="view page-container owner-qa-view active" id="roadmap" dangerouslySetInnerHTML={{ __html: html }} />;
});
