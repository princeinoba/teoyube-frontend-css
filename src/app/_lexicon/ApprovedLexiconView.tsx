import { memo, type RefObject } from "react";

export const ApprovedLexiconView = memo(function ApprovedLexiconView({ html, rootRef }: { html: string; rootRef: RefObject<HTMLElement | null> }) {
  return <section ref={rootRef} className="view page-container lexicon-view active" id="lexicon" dangerouslySetInnerHTML={{ __html: html }} />;
});
