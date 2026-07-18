"use client";

import { useState } from "react";
import { Phase11TigFlowPanel } from "@/components/productization/Phase11ProductPanels";
import type { Phase11ProductSurface } from "@/lib/phase11Productization";

export function TIGSearchPanel({ defaultMode = "promise_search" }: { defaultMode?: Phase11ProductSurface }) {
  const [mode, setMode] = useState<Phase11ProductSurface>(defaultMode);
  return (
    <section>
      <div className="button-row" role="tablist" aria-label="TIG mode">
        {(["promise_search", "prayer", "calling_compass", "tig_graph"] as Phase11ProductSurface[]).map((item) => (
          <button
            className={item === mode ? "button primary" : "button secondary"}
            key={item}
            type="button"
            onClick={() => setMode(item)}
          >
            {item.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      <Phase11TigFlowPanel
        surface={mode}
        title="Search Local TIG"
        initialInput="I need Scripture-grounded wisdom for my next faithful step."
        primaryActionLabel="Run TIG"
      />
    </section>
  );
}
