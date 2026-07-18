"use client";

import { useMemo } from "react";
import {
  ExplanationPathPanel,
  FallbackNotice,
  TIGGraphExplorer,
  TIGResponsePanel,
  TeoyubeProductCard
} from "@/components/productization/Phase11ProductPanels";
import { runPhase11TigSurface, type Phase11ProductSurface } from "@/lib/phase11Productization";

type Props = {
  compact?: boolean;
  input?: Record<string, any>;
  title?: string;
  subtitle?: string;
  surface?: Phase11ProductSurface;
};

function inferSurface(input?: Record<string, any>, fallback: Phase11ProductSurface = "promise_search"): Phase11ProductSurface {
  const value = String(input?.surface || input?.mode || input?.context?.surface || "").toLowerCase();
  if (value.includes("prayer")) return "prayer";
  if (value.includes("calling")) return "calling_compass";
  if (value.includes("canon")) return "canon";
  if (value.includes("graph")) return "tig_graph";
  if (value.includes("daily")) return "daily_word";
  return fallback;
}

export function TigSurfaceProductionSection({ compact, input, title, subtitle, surface }: Props) {
  const result = useMemo(() => {
    const selectedSurface = surface || inferSurface(input);
    const text = String(input?.input || input?.query || input?.prompt || "I need direction.");
    return runPhase11TigSurface(selectedSurface, text, input?.context || input || {});
  }, [input, surface]);

  return (
    <section className={compact ? "grid two" : "grid two"} aria-label={title || "TIG production surface"}>
      <TeoyubeProductCard eyebrow="TIG Production" title={title || "Local Production Surface"}>
        <p>{subtitle || "Local TIG data powers this surface without live AI, analytics, or persistence."}</p>
        <FallbackNotice
          used={result.responsePanel.fallback.used}
          reason={result.responsePanel.fallback.reason}
        />
      </TeoyubeProductCard>
      <TIGResponsePanel result={result} />
      <TIGGraphExplorer result={result} />
      <ExplanationPathPanel items={result.explanationPanel.items} />
    </section>
  );
}
