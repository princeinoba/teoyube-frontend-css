import { PublicConsentNotice, PublicLaunchLimitationsNotice, PublicPrivacyNotice } from "src/components/public";

export default function ConsentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-blue-100 bg-white/85 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase text-blue-700">Teoyube Public Copy</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Consent & Personalization
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Draft consent copy for visible, reversible, Scripture-anchored personalization controls.
          </p>
        </section>

        <PublicConsentNotice />
        <PublicPrivacyNotice compact />
        <PublicLaunchLimitationsNotice compact />
      </div>
    </main>
  );
}
