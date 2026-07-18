import {
  KnownLimitationsNotice,
  PageHeader,
  SafetyNotice,
  TeoyubeProductCard
} from "@/components/productization/Phase11ProductPanels";
import {
  createPhase11SeedSummary,
  getPhase11ButtonBehaviorMap,
  getPhase11RouteInventory,
  runPhase11TigSurface
} from "@/lib/phase11Productization";

export default function TeoyubeHealthPage() {
  const enabled = process.env.NODE_ENV !== "production" || process.env.TEOYUBE_SHOW_DEV_HEALTH === "true";
  const summary = createPhase11SeedSummary();
  const smoke = runPhase11TigSurface("promise_search", "Health check promise search");

  if (!enabled) {
    return (
      <main>
        <PageHeader eyebrow="Development" title="Teoyube Health">
          This diagnostic page is disabled outside local development unless explicitly enabled.
        </PageHeader>
      </main>
    );
  }

  return (
    <main>
      <PageHeader eyebrow="Development" title="Teoyube Health">
        Local diagnostics with seed summary, route inventory, button map, production surface smoke result, and disabled service status.
      </PageHeader>
      <section className="grid two">
        <SafetyNotice />
        <KnownLimitationsNotice />
      </section>
      <TeoyubeProductCard eyebrow="Seed Summary" title={`${summary.data.words} Words Loaded`}>
        <pre className="export-box">{JSON.stringify(summary, null, 2)}</pre>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Production Surface" title={smoke.responsePanel.confidence.label}>
        <p className="muted">{smoke.responsePanel.subtitle}</p>
        <p>Scripture evidence: {smoke.explanationPanel.scriptureEvidence.join(", ") || "review needed"}</p>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Routes" title={`${getPhase11RouteInventory().length} Routes`}>
        <pre className="export-box">{JSON.stringify(getPhase11RouteInventory(), null, 2)}</pre>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="Buttons" title={`${getPhase11ButtonBehaviorMap().length} Behaviors`}>
        <pre className="export-box">{JSON.stringify(getPhase11ButtonBehaviorMap().slice(0, 12), null, 2)}</pre>
      </TeoyubeProductCard>
    </main>
  );
}
