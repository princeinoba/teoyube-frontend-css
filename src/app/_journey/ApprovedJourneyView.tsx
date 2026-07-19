import type { JourneyPageViewModel } from "../../domain/journey/journey-contracts";

export function ApprovedJourneyView({ viewModel }: { viewModel: JourneyPageViewModel }) {
  return (
    <main>
      <section className="page-title-row"><div><p className="eyebrow">Growth Journey</p><h1>Session Journey Progress</h1><p>Start a local growth journey, complete stages, reflections, actions, and milestones without accounts or persistence.</p></div></section>
      <section className="grid two">
        <article className="card"><p className="eyebrow">Journeys</p><h2 className="gold">{viewModel.journeys.length} Local Journey Seeds</h2><div className="activity-list">{viewModel.journeys.map((journey) => <article className="mini-card" key={journey.id}><strong>{journey.title}</strong><p>{journey.summary}</p></article>)}</div></article>
        <article className="card"><p className="eyebrow">Levels</p><h2 className="gold">{viewModel.levels.length} Growth Levels</h2><div className="activity-list">{viewModel.levels.map((level) => <article className="mini-card" key={level.id}><strong>{level.name}</strong><p>{level.description}</p></article>)}</div></article>
      </section>
      <section className="grid two">
        <article className="card"><p className="eyebrow">Guardrails</p><h2 className="gold">Teoyube Guardrails</h2><ul className="check-list">{viewModel.guardrails.map((point) => <li key={point}>{point}</li>)}</ul></article>
        <article className="card"><p className="eyebrow">Limitations</p><h2 className="gold">Local Preview Boundaries</h2><ul className="check-list">{viewModel.limitations.map((point) => <li key={point}>{point}</li>)}</ul></article>
      </section>
    </main>
  );
}
