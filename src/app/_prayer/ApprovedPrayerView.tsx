import type { ReactNode } from "react";
import type { PrayerPageViewModel, PrayerProductionDto } from "../../domain/prayer/prayer-contracts";
import { PrayerCompanionController } from "./PrayerCompanionController";

function ProductCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <article className="card"><p className="eyebrow">{eyebrow}</p><h2 className="gold">{title}</h2>{children}</article>;
}

function FallbackNotice({ used, reason }: { used: boolean; reason: string }) {
  return <div className="notice"><strong>{used ? "Fallback visible" : "Fallback ready"}</strong><p>{reason || "If local data is incomplete, Teoyube shows the reason and keeps Scripture review visible."}</p></div>;
}

function ResponsePanel({ production }: { production: PrayerProductionDto }) {
  return (
    <ProductCard eyebrow="TIG Response" title={production.responseTitle}>
      <p className="muted">{production.responseSubtitle}</p>
      <span className="status-pill">{`${production.confidenceLabel} - ${Math.round(production.confidenceScore * 100)}%`}</span>
      <div className="activity-list">{production.selectionRows.map((row) => <article className="mini-card" key={row.label}><strong>{row.label}</strong><p>{row.value}</p></article>)}</div>
      <FallbackNotice used={production.fallbackUsed} reason={production.fallbackReason} />
    </ProductCard>
  );
}

function PrayerProductionSurface({ production }: { production: PrayerProductionDto }) {
  return (
    <section className="grid two" aria-label="Prayer Production Surface">
      <ProductCard eyebrow="TIG Production" title="Prayer Production Surface">
        <p>Prayer guidance now shows why a prayer sequence was selected and how it connects back to Scripture.</p>
        <FallbackNotice used={production.fallbackUsed} reason={production.fallbackReason} />
      </ProductCard>
      <ResponsePanel production={production} />
      <ProductCard eyebrow="Graph" title="Readable Local Graph">
        <p className="muted">Nodes: {production.graphNodes.length}. List fallback:{" "}{production.listFallbackAvailable ? "available" : "review needed"}.</p>
        <div className="activity-list">{production.graphNodes.map((node) => <article className="mini-card" key={node.id}><strong>{node.label}</strong><p>{node.type}</p></article>)}</div>
        <ul className="check-list">{production.graphEdges.map((edge) => <li key={`${edge.source}-${edge.target}`}>{edge.source} to {edge.target}: {edge.label}</li>)}</ul>
      </ProductCard>
      <ProductCard eyebrow="Explanation" title="Why This Was Suggested">
        <ol className="check-list">{production.explanationItems.map((item) => <li key={item}>{item}</li>)}</ol>
      </ProductCard>
    </section>
  );
}

export function ApprovedPrayerView({ viewModel }: { viewModel: PrayerPageViewModel }) {
  return (
    <main>
      <section className="page-hero prayer-hero compact-hero"><p className="eyebrow">Companion Flow</p><h1>Prayer Companion</h1><p>Prayer Library, prayer generation, and companion guidance now live together in one focused page.</p></section>
      <PrayerProductionSurface production={viewModel.production} />
      <section className="card" aria-label="Prayer journey state">
        <p className="eyebrow">Journey Flow</p><h2 className="gold">Prayer to promise and next step</h2>
        <p>Stage: {viewModel.journeyStage} | Confidence: {viewModel.journeyConfidence} | Trace steps: {viewModel.journeyTraceStepCount}</p>
        <p className="muted">Scripture anchors: {viewModel.journeyScriptureAnchors.join(", ") || "Missing Scripture anchor - use fallback framing."}</p>
      </section>
      <PrayerCompanionController />
      <section className="grid two">
        <ResponsePanel production={viewModel.production} />
        <ProductCard eyebrow="Prayer Safety" title="Devotional Boundary">
          <p>Prayer copy is generated from local promise and Scripture context. It does not claim divine certainty, does not persist user prayer text, and keeps explanation visible.</p>
          <ul className="check-list">{viewModel.safetyRows.map((row) => <li key={row.id}>{row.scripture}: {row.prayer}</li>)}</ul>
        </ProductCard>
      </section>
      {viewModel.prayerCards.map((prayer) => <section aria-label={prayer.name} className="card" key={prayer.id}><h2 className="gold">{prayer.name}</h2><p><strong>Category:</strong> {prayer.category}</p><p><strong>Sequence:</strong> {prayer.sequence.join(" -> ")}</p><p><strong>Scripture:</strong> {prayer.scriptureAnchor}</p><p>{prayer.prayer}</p></section>)}
    </main>
  );
}
