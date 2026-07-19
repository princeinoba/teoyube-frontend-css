import { memo, type RefObject } from "react";

export const ApprovedPromiseTableView = memo(function ApprovedPromiseTableView({ html, rootRef }: { html: string; rootRef: RefObject<HTMLElement | null> }) {
  return <section ref={rootRef} className="view page-container active" id="table" dangerouslySetInnerHTML={{ __html: html }} />;
});
