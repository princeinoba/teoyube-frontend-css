import { TIGOnboardingPanel } from "src/components/tig/TIGOnboardingPanel";

export default function TIGOnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Teoyube Intelligence Graph
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Teoyube Scripture Intelligence Onboarding
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            Learn how to search promises, understand Scripture connections, save session
            journey notes, journal reflections, and manage session data.
          </p>
        </section>

        <TIGOnboardingPanel />
      </div>
    </main>
  );
}
