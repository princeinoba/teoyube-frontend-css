import { memo, type RefObject } from "react";

export const ApprovedTeoGuideView = memo(function ApprovedTeoGuideView({ html, rootRef }: { html: string; rootRef: RefObject<HTMLElement | null> }) {
  return <section ref={rootRef} className="view page-container guide-view active" id="guide" dangerouslySetInnerHTML={{ __html: html }} />;
});
