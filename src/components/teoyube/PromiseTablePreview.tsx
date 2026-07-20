"use client";

import { useMemo, useState } from "react";

type TeoyubePromiseTableRow = Readonly<{
  promiseId: string;
  title: string;
  theme: string;
  scriptureAnchors: readonly string[];
  relatedTeoyubeWords: readonly string[];
  callingLinks: readonly string[];
  prayerLinks: readonly string[];
  tigEdges: readonly Readonly<{ id: string; sourceNodeId: string; targetNodeId: string; type: string }>[];
  valid: boolean;
  warnings: readonly string[];
}>;

type TeoyubePromiseTable = Readonly<{
  rows: readonly TeoyubePromiseTableRow[];
  rowCount: number;
}>;

export type PromiseTablePreviewProps = {
  initialQuery?: string;
  initialTable?: TeoyubePromiseTable;
  maxRows?: number;
};

function uniqueRows(rows: TeoyubePromiseTableRow[]): TeoyubePromiseTableRow[] {
  return [...new Map(rows.map((row) => [row.promiseId, row])).values()];
}

function getFilteredRows(table: TeoyubePromiseTable, query: string): TeoyubePromiseTableRow[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [...table.rows];
  const term = normalizedQuery.toLowerCase();
  return uniqueRows(table.rows.filter((row) => [
    row.theme,
    row.title,
    ...row.relatedTeoyubeWords,
    ...row.callingLinks,
    ...row.scriptureAnchors
  ].join(" ").toLowerCase().includes(term)));
}

export default function PromiseTablePreview({
  initialQuery = "",
  initialTable = { rows: [], rowCount: 0 },
  maxRows = 6
}: PromiseTablePreviewProps) {
  const [query, setQuery] = useState(initialQuery);
  const table = initialTable;
  const rows = useMemo(() => getFilteredRows(table, query).slice(0, maxRows), [maxRows, query, table]);

  return (
    <section className="card" aria-label="Promise Table Preview">
      <div>
        <p className="eyebrow">Integrated Promise Table</p>
        <h2 className="gold">Promise Table Preview</h2>
        <p className="muted">
          {table.rowCount} Scripture-anchored promise row(s) generated from the integrated Promise Engine.
        </p>
      </div>

      <label className="search-filter">
        Filter by theme, word, or Scripture
        <input
          aria-label="Filter Promise Table by theme, word, or Scripture"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Example: Calling, Benor, Romans"
          type="search"
          value={query}
        />
      </label>

      {rows.length ? (
        <div className="grid one">
          {rows.map((row) => (
            <article className="card promise-table-preview-row" key={row.promiseId}>
              <h3>{row.title}</h3>
              <p>
                <strong>Theme:</strong> {row.theme}
              </p>
              <p className="break-words">
                <strong>Scripture Anchors:</strong>{" "}
                {row.scriptureAnchors.length ? row.scriptureAnchors.join(", ") : "Missing anchor - needs review"}
              </p>
              <p className="break-words">
                <strong>Related Words:</strong>{" "}
                {row.relatedTeoyubeWords.length ? row.relatedTeoyubeWords.join(", ") : "No related words yet"}
              </p>
              {row.callingLinks.length ? (
                <p>
                  <strong>Calling Links:</strong> {row.callingLinks.join(", ")}
                </p>
              ) : null}
              {row.tigEdges.length ? (
                <p className="muted">
                  TIG edges available: {row.tigEdges.length}
                </p>
              ) : null}
              {!row.valid || row.warnings.length ? (
                <p className="muted">
                  <strong>Review Status:</strong> {row.valid ? "Usable with warnings" : "Needs review"}{" "}
                  {row.warnings.length ? `- ${row.warnings.join("; ")}` : ""}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="muted">
          No Promise Table rows match this filter yet. Try a broader word, theme, or Scripture reference; no unsupported promise is being invented for this search.
        </p>
      )}
    </section>
  );
}
