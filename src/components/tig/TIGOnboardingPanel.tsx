"use client";

import { TeoyubeProductCard } from "@/components/productization/Phase11ProductPanels";

export function TIGOnboardingPanel() {
  return (
    <section className="grid three">
      <TeoyubeProductCard eyebrow="1" title="Search Scripture-Rooted Promises">
        <p>Start with a need, word, Scripture, promise, prayer, or calling question.</p>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="2" title="Inspect Explanation">
        <p>Review the word, promise cluster, Scripture anchor, confidence label, and fallback reason.</p>
      </TeoyubeProductCard>
      <TeoyubeProductCard eyebrow="3" title="Take One Faithful Step">
        <p>Use prayer, counsel, fruit, and time. Teoyube does not claim divine certainty.</p>
      </TeoyubeProductCard>
    </section>
  );
}
