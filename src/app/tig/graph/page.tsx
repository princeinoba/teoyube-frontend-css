import { TIGGraphExplorer } from "src/components/tig/TIGGraphExplorer";
import { createJourneyPageProps } from "../../../../src/lib/teoyube/journey/journey-page-integration";

export default function TIGGraphExplorerPage() {
  const journeyPage = createJourneyPageProps({
    surface: "tig_graph_explorer",
    query: "TIG graph explorer",
    safeDisplayLabel: "TIG graph journey"
  });
  const journeyReport = journeyPage.report;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Developer Graph Tools
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Teoyube Intelligence Graph Explorer
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            Inspect TIG nodes, relationships, Scripture anchors, promise clusters, journeys,
            prayers, reflections, actions, and growth milestones.
          </p>
          <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            This explorer uses local seed graph data only. It does not call any external AI API.
          </p>
          <div className="mt-4 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700">
            <strong>Journey flow:</strong> {journeyReport.stage} | Confidence: {journeyReport.confidenceLabel || "needs_review"} | Trace steps: {journeyReport.explanationTraceStepCount}
            <br />
            <strong>Scripture anchors:</strong>{" "}
            {journeyPage.journey.scriptureAnchors.join(", ") || "Review Scripture anchor before recommendation display."}
            {journeyReport.fallbackUsed && (
              <>
                <br />
                <strong>Fallback:</strong> {journeyPage.journey.fallback?.message || journeyPage.journey.recommendation?.fallbackReason}
              </>
            )}
          </div>
        </section>

        <TIGGraphExplorer />
      </div>
    </main>
  );
}
