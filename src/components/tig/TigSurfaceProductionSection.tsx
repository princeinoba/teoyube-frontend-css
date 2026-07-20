import { runPhase11TigSurface, type Phase11ProductSurface } from "@/lib/phase11Productization";

type Props = {
  compact?: boolean;
  input?: Record<string, any>;
  title?: string;
  subtitle?: string;
  surface?: Phase11ProductSurface;
};

function inferSurface(input?: Record<string, any>, fallback: Phase11ProductSurface = "promise_search"): Phase11ProductSurface {
  const value = String(input?.surface || input?.mode || input?.context?.surface || "").toLowerCase();
  if (value.includes("prayer")) return "prayer";
  if (value.includes("calling")) return "calling_compass";
  if (value.includes("canon")) return "canon";
  if (value.includes("graph")) return "tig_graph";
  if (value.includes("daily")) return "daily_word";
  return fallback;
}

export function TigSurfaceProductionSection({ compact, input, title, subtitle, surface }: Props) {
  const selectedSurface = surface || inferSurface(input);
  const text = String(input?.input || input?.query || input?.prompt || "I need direction.");
  const result = runPhase11TigSurface(selectedSurface, text, input?.context || input || {});
  const rows = result.responsePanel.selectionRows;
  const nodes = result.graphPanel.nodes;
  const edges = result.graphPanel.edges;
  const confidence = result.responsePanel.confidence;
  const fallback = result.responsePanel.fallback;

  return (
    <section className={compact ? "grid two" : "grid two"} aria-label={title || "TIG production surface"}>
      <article className="card">
        <p className="eyebrow">TIG Production</p>
        <h2 className="gold">{title || "Local Production Surface"}</h2>
        <p>{subtitle || "Local TIG data powers this surface without live AI, analytics, or persistence."}</p>
        <div className="notice"><strong>{fallback.used ? "Fallback visible" : "Fallback ready"}</strong><p>{fallback.reason || "If local data is incomplete, Teoyube shows the reason and keeps Scripture review visible."}</p></div>
      </article>
      <article className="card">
        <p className="eyebrow">TIG Response</p>
        <h2 className="gold">{result.responsePanel.title || "Local response"}</h2>
        <p className="muted">{result.responsePanel.subtitle}</p>
        <span className="status-pill">{confidence.label || "Cautious preview"}{typeof confidence.score === "number" ? ` - ${Math.round(confidence.score * 100)}%` : ""}</span>
        <div className="activity-list">{rows.map((row) => <article className="mini-card" key={row.label}><strong>{row.label}</strong><p>{row.value}</p></article>)}</div>
        <div className="notice"><strong>{fallback.used ? "Fallback visible" : "Fallback ready"}</strong><p>{fallback.reason || "If local data is incomplete, Teoyube shows the reason and keeps Scripture review visible."}</p></div>
      </article>
      <article className="card">
        <p className="eyebrow">Graph</p>
        <h2 className="gold">Readable Local Graph</h2>
        <p className="muted">Nodes: {result.graphPanel.statistics.totalNodes || nodes.length}. List fallback: {result.graphPanel.listFallbackAvailable ? "available" : "review needed"}.</p>
        <div className="activity-list">{nodes.map((node) => <article className="mini-card" key={node.id}><strong>{node.label}</strong><p>{node.type}</p></article>)}</div>
        <ul className="check-list">{edges.map((edge) => <li key={`${edge.source}-${edge.target}`}>{edge.source} to {edge.target}: {edge.label}</li>)}</ul>
      </article>
      <article className="card">
        <p className="eyebrow">Explanation</p>
        <h2 className="gold">Why This Was Suggested</h2>
        <ol className="check-list">{result.explanationPanel.items.map((item) => <li key={item}>{item}</li>)}</ol>
      </article>
    </section>
  );
}
