import { memo, type RefObject } from "react";

export const ApprovedCallingCompassView = memo(function ApprovedCallingCompassView({ html, rootRef }: { html: string; rootRef: RefObject<HTMLElement | null> }) {
  return <section ref={rootRef} className="view page-container active" id="calling" dangerouslySetInnerHTML={{ __html: html }} />;
});
