import PrayerCard from "@/components/PrayerCard";
import PrayerCompanion from "@/components/PrayerCompanion";
import { PrayerCompanionProductPanel } from "@/components/productization/Phase11ProductPanels";
import { getPrayers } from "@/lib/teoyubeData";
import { TigSurfaceProductionSection } from "src/components/tig/TigSurfaceProductionSection";
import { createPrayerTigProductionInput } from "../../../src/lib/tig";
import { createPrayerCompanionAdapterContext } from "../../../src/lib/teoyube/adapters/prayer-companion-adapter";
import { createJourneyPageProps } from "../../../src/lib/teoyube/journey/journey-page-integration";

export default function PrayerPage() {
  const prayers = getPrayers();
  const focusPrayer = prayers[0];
  const prayerContext = createPrayerCompanionAdapterContext({
    message: focusPrayer?.prayer || focusPrayer?.name || "Scripture-grounded prayer"
  });
  const prayerCluster = prayerContext.recommendation.clusters[0];
  const journeyPage = createJourneyPageProps({
    surface: "prayer_companion",
    prayerInput: focusPrayer?.prayer || focusPrayer?.name || "Scripture-grounded prayer",
    clusterId: prayerCluster?.id,
    safeDisplayLabel: "Prayer companion journey"
  });
  const journeyReport = journeyPage.report;

  return (
    <main>
      <section className="page-hero prayer-hero compact-hero">
        <p className="eyebrow">Companion Flow</p>
        <h1>Prayer Companion</h1>
        <p>
          Prayer Library, prayer generation, and companion guidance now live together in one focused page.
        </p>
      </section>

      <TigSurfaceProductionSection
        compact
        input={createPrayerTigProductionInput({
          input: `Prayer companion request connected to ${focusPrayer?.name || "Scripture-grounded prayer"}.`,
          userState: "needing prayerful encouragement without divine-certainty claims",
          selectedWordId: prayerCluster?.coreWords[0],
          selectedClusterId: prayerCluster?.id,
          context: {
            legacyPrayerId: focusPrayer?.id,
            legacyPrayerName: focusPrayer?.name,
            scriptureAnchor: prayerContext.safeDisplayData.scriptureAnchor,
            explanationPath: prayerContext.safeDisplayData.explanationPath,
            phase33Source: "promise_engine_prayer_adapter"
          }
        })}
        subtitle="Prayer guidance now shows why a prayer sequence was selected and how it connects back to Scripture."
        title="Prayer Production Surface"
      />

      <section className="card" aria-label="Prayer journey state">
        <p className="eyebrow">Journey Flow</p>
        <h2 className="gold">Prayer to promise and next step</h2>
        <p>
          Stage: {journeyReport.stage} | Confidence: {journeyReport.confidenceLabel || "needs_review"} | Trace steps: {journeyReport.explanationTraceStepCount}
        </p>
        <p className="muted">
          Scripture anchors: {journeyPage.journey.scriptureAnchors.join(", ") || "Missing Scripture anchor - use fallback framing."}
        </p>
        {journeyReport.fallbackUsed && (
          <p className="muted">
            Fallback: {journeyPage.journey.fallback?.message || journeyPage.journey.recommendation?.fallbackReason}
          </p>
        )}
      </section>

      <PrayerCompanion />

      <PrayerCompanionProductPanel />

      {prayers.map((prayer: any) => (
        <PrayerCard key={prayer.id} prayer={prayer} />
      ))}
    </main>
  );
}
