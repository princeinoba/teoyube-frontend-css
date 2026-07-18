"use client";

import { ConsentControlsPanel, SafetyNotice } from "@/components/productization/Phase112ScreenshotApp";
import { KnownLimitationsNotice, TeoyubeProductCard } from "@/components/productization/Phase11ProductPanels";

export function TIGPrivacyPanel() {
  return (
    <section className="grid two">
      <ConsentControlsPanel />
      <TeoyubeProductCard eyebrow="Privacy Status" title="No Hidden Persistence">
        <ul className="check-list">
          <li>No localStorage, sessionStorage, cookies, or IndexedDB are required.</li>
          <li>No analytics events, automatic contact, or external AI calls are sent.</li>
          <li>Safe export excludes raw private text.</li>
        </ul>
      </TeoyubeProductCard>
      <SafetyNotice />
      <KnownLimitationsNotice />
    </section>
  );
}
