import { TIGJourneyActivityPanel } from "src/components/tig/TIGJourneyActivityPanel";
import { createJourneyPageProps } from "../../../../src/lib/teoyube/journey/journey-page-integration";

export default function TIGJourneyPage() {
  const journeyPage = createJourneyPageProps({
    surface: "tig_response_panel",
    query: "My Teoyube Journey",
    safeDisplayLabel: "Saved journey review"
  });
  const journeyReport = journeyPage.report;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Teoyube Intelligence Graph
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            My Teoyube Journey
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            Saved Scripture responses, prayers, reflections, and action steps from the Teoyube
            Intelligence Graph.
          </p>
          <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            This version uses session memory only. Database sync and browser persistence are not connected.
          </p>
          <p className="mt-4 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700">
            <strong>Phase 3.5 journey state:</strong> {journeyReport.stage} | Confidence: {journeyReport.confidenceLabel || "needs_review"} | Trace steps: {journeyReport.explanationTraceStepCount}
            <br />
            The recommendation journey summary above is in-memory only and does not require browser persistence.
          </p>
        </section>

        <TIGJourneyActivityPanel />
      </div>
    </main>
  );
}
