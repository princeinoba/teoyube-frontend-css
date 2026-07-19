import { memo, type RefObject } from "react";

export const ApprovedTablesView = memo(function ApprovedTablesView({ html, rootRef }: { html: string; rootRef: RefObject<HTMLElement | null> }) {
  return <section ref={rootRef} className="view page-container tables-page active" id="teoyube-tables" dangerouslySetInnerHTML={{ __html: html }} />;
});
