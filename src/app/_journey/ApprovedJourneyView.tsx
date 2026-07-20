"use client";

import { useRouter } from "next/navigation";
import { useDailySpiritualLoop } from "../../features/journey/ui/DailySpiritualLoopProvider";
import {
  getDailySpiritualLoopActionPolicy,
  getDailySpiritualLoopProgress,
  type DailySpiritualLoopStage
} from "../../domain/journey/daily-spiritual-loop";
import type { JourneyPageViewModel } from "../../domain/journey/journey-contracts";

const STAGE_ROUTES: Readonly<Record<DailySpiritualLoopStage, string>> = {
  check_in: "/",
  scripture: "/canon",
  promise: "/promise-table",
  prayer: "/prayer",
  calling_discernment: "/calling-compass",
  daily_assignment: "/",
  reflection: "/journal",
  testimony_candidate: "/testimony",
  book_review: "/book",
  tomorrow: "/"
};

const STAGE_LABELS: Readonly<Record<DailySpiritualLoopStage, string>> = {
  check_in: "Check-in",
  scripture: "Scripture",
  promise: "Promise",
  prayer: "Prayer",
  calling_discernment: "Calling discernment",
  daily_assignment: "Daily assignment",
  reflection: "Reflection",
  testimony_candidate: "Testimony candidate",
  book_review: "Book review",
  tomorrow: "Tomorrow"
};

export function ApprovedJourneyView({ viewModel }: { viewModel: JourneyPageViewModel }) {
  const router = useRouter();
  const { state, act } = useDailySpiritualLoop();
  const active = state?.active ? state : null;
  const currentArtifact = active?.artifacts[active.currentStage];
  const actionPolicy = active ? getDailySpiritualLoopActionPolicy(active) : null;
  const priorStage = active?.transitions[active.transitions.length - 1]?.fromStage;

  return (
    <main>
      <section className="page-title-row"><div><p className="eyebrow">Growth Journey</p><h1>Session Journey Progress</h1><p>Start a local growth journey, complete stages, reflections, actions, and milestones without accounts or persistence.</p></div></section>
      <section className="grid two">
        <article className="card">
          {active && currentArtifact ? <>
            <p className="eyebrow">Journeys</p>
            <h2 className="gold">{getDailySpiritualLoopProgress(active)}% Daily Loop</h2>
            <div className="activity-list">
              <article className="mini-card" data-daily-journey-stage={active.currentStage}>
                <strong>{STAGE_LABELS[active.currentStage]}</strong>
                <p>{currentArtifact.sourceReferences.map((source) => source.reference).join(", ")}</p>
              </article>
            </div>
          </> : <>
            <p className="eyebrow">Journeys</p><h2 className="gold">{viewModel.journeys.length} Local Journey Seeds</h2><div className="activity-list">{viewModel.journeys.map((journey) => <article className="mini-card" key={journey.id}><strong>{journey.title}</strong><p>{journey.summary}</p></article>)}</div>
          </>}
        </article>
        <article className="card">
          {active && currentArtifact && actionPolicy ? <>
            <p className="eyebrow">Active Moment</p>
            <h2 className="gold">{STAGE_LABELS[active.currentStage]}</h2>
            <p>{currentArtifact.limitations[0]}</p>
            <div className="phase116b-action-row">
              <button className="primary" type="button" data-daily-journey-navigation={active.currentStage} onClick={() => router.push(STAGE_ROUTES[active.currentStage])}>Continue in {STAGE_LABELS[active.currentStage]}</button>
              <button className="secondary" type="button" data-daily-journey-action={actionPolicy.secondary[0]?.type} onClick={() => act({ type: actionPolicy.secondary[0]?.type || "skip" })}>{actionPolicy.secondary[0]?.label}</button>
              <button className="secondary" type="button" data-daily-journey-action={actionPolicy.secondary[1]?.type} onClick={() => actionPolicy.secondary[1]?.type === "undo"
                ? act({ type: "undo" })
                : act({ type: "revisit", stage: priorStage || active.currentStage })}>{actionPolicy.secondary[1]?.label}</button>
            </div>
          </> : <>
            <p className="eyebrow">Levels</p><h2 className="gold">{viewModel.levels.length} Growth Levels</h2><div className="activity-list">{viewModel.levels.map((level) => <article className="mini-card" key={level.id}><strong>{level.name}</strong><p>{level.description}</p></article>)}</div>
          </>}
        </article>
      </section>
      <section className="grid two">
        <article className="card"><p className="eyebrow">Guardrails</p><h2 className="gold">Teoyube Guardrails</h2><ul className="check-list">{viewModel.guardrails.map((point) => <li key={point}>{point}</li>)}</ul></article>
        <article className="card"><p className="eyebrow">Limitations</p><h2 className="gold">Local Preview Boundaries</h2><ul className="check-list">{viewModel.limitations.map((point) => <li key={point}>{point}</li>)}</ul></article>
      </section>
    </main>
  );
}
