import {
  ConsentControlsPanel,
  FeedbackControlsPanel,
  SafetyNotice
} from "@/components/productization/Phase112ScreenshotApp";
import {
  getGuardrailsContent,
  getPhase112ButtonActionMap,
  getPhase112RouteConfigs,
  getPhase112SafetyStatus
} from "@/lib/phase112Productization";

export default function SettingsPage() {
  const guardrails = getGuardrailsContent();
  const routes = getPhase112RouteConfigs();
  const buttons = getPhase112ButtonActionMap();
  const safety = getPhase112SafetyStatus();

  return (
    <main>
      <section className="page-title-row">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Local App Settings and Service Status</h1>
          <p>Review disabled services, route readiness, consent controls, and safety boundaries.</p>
        </div>
      </section>
      <section className="grid two">
        <SafetyNotice />
        <ConsentControlsPanel />
        <FeedbackControlsPanel />
        <section className="panel">
          <h2>Disabled Services</h2>
          <p>External services required: {String(!safety.noExternalServices)}</p>
          <p>Database persistence enabled: {String(!safety.noDatabasePersistence)}</p>
          <p>Analytics enabled: {String(!safety.noAnalytics)}</p>
          <p>Live AI orchestration enabled: {String(!safety.noLiveAi)}</p>
          <p>Raw private text storage enabled: {String(!safety.noRawPrivateTextStored)}</p>
        </section>
        <section className="panel">
          <h2>Guardrails</h2>
          <ul className="check-list">
            {guardrails.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </section>
        <section className="panel">
          <h2>Route Inventory</h2>
          <div className="activity-list">
            {routes.map((route) => (
              <article className="mini-card" key={route.key}>
                <strong>{route.label}</strong>
                <p>{route.href} - {route.primaryDataSource}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Button Inventory</h2>
          <p>{buttons.length} visible/global actions mapped for Phase 11.2.</p>
          <pre className="export-box">{JSON.stringify(buttons.slice(0, 12), null, 2)}</pre>
        </section>
      </section>
    </main>
  );
}

