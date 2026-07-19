import { memo, type RefObject } from "react";

export const ApprovedBookView = memo(function ApprovedBookView({ html, rootRef }: { html: string; rootRef: RefObject<HTMLElement | null> }) {
  return <section ref={rootRef} className="view page-container book-saint-view active" id="book" dangerouslySetInnerHTML={{ __html: html }} />;
});
