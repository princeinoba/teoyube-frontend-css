import { TIGOnboardingCallout } from "src/components/tig/TIGOnboardingCallout";
import { TIGSearchPanel } from "src/components/tig/TIGSearchPanel";
import { createJourneyPageProps } from "../../../src/lib/teoyube/journey/journey-page-integration";

const features = [
  {
    title: "Promise Discovery",
    description: "Find Scripture-backed promises connected to your season."
  },
  {
    title: "Calling Compass",
    description: "Recognize patterns of gifts, burdens, and faithful next steps."
  },
  {
    title: "Guided Prayer",
    description: "Receive structured prayers anchored in God's Word."
  },
  {
    title: "Growth Journeys",
    description:
      "Move from emotion to promise, from promise to action, and from action to transformation."
  }
];

export default function TIGPage() {
  const journeyPage = createJourneyPageProps({
    surface: "tig_response_panel",
    query: "Teoyube Scripture Intelligence",
    safeDisplayLabel: "TIG response journey"
  });
  const journeyReport = journeyPage.report;

  return (
    <main>
      <section className="page-hero compass-hero compact-hero">
        <p className="eyebrow">Teoyube Intelligence Graph</p>
        <h1>Teoyube Scripture Intelligence</h1>
        <p>
          Search God's promises, discover Scripture connections, and receive a guided prayer,
          reflection, and next step.
        </p>
      </section>

      <TIGOnboardingCallout />

      <TIGSearchPanel defaultMode="promise_search" />

      <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-lg shadow-emerald-950/5" aria-label="TIG journey state">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Journey Flow
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-emerald-950">
          Search to response, trace, graph, and action
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Stage: {journeyReport.stage} | Confidence: {journeyReport.confidenceLabel || "needs_review"} | Trace steps: {journeyReport.explanationTraceStepCount}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Scripture anchors: {journeyPage.journey.scriptureAnchors.join(", ") || "Review Scripture anchor before presenting a recommendation."}
        </p>
        {journeyReport.fallbackUsed && (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Fallback: {journeyPage.journey.fallback?.message || journeyPage.journey.recommendation?.fallbackReason}
          </p>
        )}
      </section>

      <section className="section-heading">
        <p className="eyebrow">Beyond Verse Search</p>
        <h2>Beyond Verse Search</h2>
        <p>
          Teoyube does not only search for keywords. It listens for the spiritual state behind the
          question, connects it to Scripture-backed promises, and guides the user through prayer,
          reflection, and growth.
        </p>
      </section>

      <section className="grid" aria-label="TIG features">
        {features.map((feature) => (
          <article className="card" key={feature.title}>
            <p className="eyebrow">TIG</p>
            <h3 className="gold">{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
