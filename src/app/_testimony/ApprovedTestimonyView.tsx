import { memo, type RefObject } from "react";

export const ApprovedTestimonyView = memo(function ApprovedTestimonyView({ html, rootRef }: { html: string; rootRef: RefObject<HTMLElement | null> }) {
  return <section ref={rootRef} className="view page-container testimony-view active" id="testimony" dangerouslySetInnerHTML={{ __html: html }} />;
});
