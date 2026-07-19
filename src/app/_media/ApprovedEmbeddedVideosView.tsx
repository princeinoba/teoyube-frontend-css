import { memo, type RefObject } from "react";

export const ApprovedEmbeddedVideosView = memo(function ApprovedEmbeddedVideosView({ html, rootRef }: { html: string; rootRef: RefObject<HTMLElement | null> }) {
  return <section ref={rootRef} className="view page-container active" id="ui-elements" dangerouslySetInnerHTML={{ __html: html }} />;
});
