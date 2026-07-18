import Link from "next/link";
import {
  DailyWordPanel,
  KnownLimitationsNotice,
  PageHeader,
  SafetyNotice,
  TeoyubeProductCard
} from "@/components/productization/Phase11ProductPanels";
import {
  createPhase11DailyWordContext,
  createPhase11SeedSummary,
  getPhase11RouteInventory
} from "@/lib/phase11Productization";

export default function DashboardPage() {
  const dailyWord = createPhase11DailyWordContext();
  const seedSummary = createPhase11SeedSummary();
  const routes = getPhase11RouteInventory();

  return (
    <main>
      <PageHeader eyebrow="Product Dashboard" title="Advanced Teoyube App">
        Real local data, local TIG production, Scripture anchors, explanation paths, confidence labels, fallback visibility, and session-only user actions.
      </PageHeader>
      <section className="grid three">
        <TeoyubeProductCard eyebrow="Data" title={`${seedSummary.data.words} Words`}>
          <p className="muted">{seedSummary.data.promiseClusters} promise clusters and {seedSummary.data.scriptureEntries} Scripture canon entries loaded.</p>
        </TeoyubeProductCard>
        <TeoyubeProductCard eyebrow="Routes" title={`${routes.length} App Routes`}>
          <p className="muted">Core product routes are available without external services.</p>
        </TeoyubeProductCard>
        <TeoyubeProductCard eyebrow="Safety" title="Local Only">
          <p className="muted">No analytics, persistence, live AI, automatic contact, or external API is required.</p>
        </TeoyubeProductCard>
      </section>
      <DailyWordPanel initialContext={dailyWord} />
      <section className="grid two">
        <SafetyNotice />
        <KnownLimitationsNotice />
      </section>
      <TeoyubeProductCard eyebrow="Start" title="Primary Workflows">
        <div className="button-row">
          <Link className="button secondary" href="/promise-search">Promise Search</Link>
          <Link className="button secondary" href="/prayer">Prayer</Link>
          <Link className="button secondary" href="/calling-compass">Calling Compass</Link>
          <Link className="button secondary" href="/personalization">Personalization</Link>
        </div>
      </TeoyubeProductCard>
    </main>
  );
}
