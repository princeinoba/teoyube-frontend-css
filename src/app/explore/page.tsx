import ExploreTabs from "@/components/ExploreTabs";
import { getExploreData } from "@/lib/teoyubeData";
import { TigSurfaceProductionSection } from "src/components/tig/TigSurfaceProductionSection";
import {
  createCanonTigProductionInput,
  createPromiseClusterTigProductionInput
} from "../../../src/lib/tig";
import { createWordCardAdapterProps } from "../../../src/lib/teoyube/adapters/word-card-adapter";
import { createJourneyPageProps } from "../../../src/lib/teoyube/journey/journey-page-integration";
import { createPromiseRecommendationContext } from "../../../src/lib/teoyube/promises/promise-engine";

export default function ExplorePage() {
  const data = getExploreData();
  const featuredWord = data.words[0];
  const featuredCluster = data.promiseClusters[0];
  const featuredClusterLabel = featuredCluster?.name || "Scripture-backed promises";
  const featuredWordContext = createWordCardAdapterProps(featuredWord?.word || featuredWord?.id || "Benor");
  const featuredPromiseContext = createPromiseRecommendationContext({
    query: featuredClusterLabel,
    clusterId: featuredCluster?.id
  });
  const journeyPage = createJourneyPageProps({
    surface: "canon",
    wordId: featuredWordContext.context.word.id,
    clusterId: featuredPromiseContext.clusters[0]?.id,
    safeDisplayLabel: "Canon exploration journey"
  });
  const journeyReport = journeyPage.report;

  return (
    <main>
      <section className="page-hero explore-hero compact-hero">
        <p className="eyebrow">Canon Explorer</p>
        <h1>Explore Teoyube</h1>
        <p>
          Search and browse words, Promise Clusters, Covenant Paths, Archetypes, Scripture Canon, Glyphs, Destiny Maps, and graph relationships.
        </p>
      </section>

      <TigSurfaceProductionSection
        compact
        input={createCanonTigProductionInput({
          input: `Canon exploration for ${featuredWord?.word || "Teoyube promise language"}.`,
          userState: "exploring the Teoyube canon through Scripture",
          selectedWordId: featuredWordContext.context.word.id,
          selectedClusterId: featuredWordContext.context.promiseConnections[0]?.id,
          context: {
            legacyWordId: featuredWord?.id,
            legacyWord: featuredWord?.word,
            scriptureReferences: featuredWordContext.context.scriptureAnchors,
            explanationPath: featuredWordContext.context.explanationPath,
            phase33Source: "teoyube_language_engine"
          }
        })}
        subtitle="Canon recommendations now show the selected Teoyube word, promise, Scripture anchor, explanation path, graph preview, and confidence state."
        title="Canon Production Surface"
      />

      <section className="card" aria-label="Canon journey state">
        <p className="eyebrow">Journey Flow</p>
        <h2 className="gold">Canon to WordCard and Promise Table</h2>
        <p>
          Stage: {journeyReport.stage} | Confidence: {journeyReport.confidenceLabel || "needs_review"} | Trace steps: {journeyReport.explanationTraceStepCount}
        </p>
        <p className="muted">
          Scripture anchors: {journeyPage.journey.scriptureAnchors.join(", ") || "Missing Scripture anchor - keep this in review."}
        </p>
        {journeyReport.fallbackUsed && (
          <p className="muted">
            Fallback: {journeyPage.journey.fallback?.message || journeyPage.journey.recommendation?.fallbackReason}
          </p>
        )}
      </section>

      <TigSurfaceProductionSection
        compact
        input={createPromiseClusterTigProductionInput({
          input: `Promise cluster exploration for ${featuredClusterLabel}.`,
          userState: "seeking Scripture-backed promise cluster clarity",
          selectedWordId: featuredPromiseContext.clusters[0]?.coreWords[0],
          selectedClusterId: featuredPromiseContext.clusters[0]?.id,
          context: {
            legacyClusterId: featuredCluster?.id,
            legacyClusterName: featuredClusterLabel,
            anchorScripture: featuredPromiseContext.scriptureAnchors[0],
            explanationPath: featuredPromiseContext.explanationPath,
            phase33Source: "promise_engine"
          }
        })}
        subtitle="Promise Cluster discovery now stays Scripture-anchored and exposes the same production explanation path."
        title="Promise Cluster Production Surface"
      />

      <ExploreTabs data={data} />
    </main>
  );
}
