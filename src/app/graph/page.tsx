import {
  KnownLimitationsNotice,
  PageHeader,
  Phase11TigFlowPanel,
  SafetyNotice
} from "@/components/productization/Phase11ProductPanels";

export default function GraphPage() {
  return (
    <main>
      <PageHeader eyebrow="TIG Graph" title="Interactive Graph and Explanation">
        Choose an input, generate a local graph/list fallback, inspect selected nodes, explanation path, confidence, and fallback state.
      </PageHeader>
      <Phase11TigFlowPanel
        surface="tig_graph"
        title="Generate Graph"
        initialInput="Show a promise search graph for purpose, prayer, Scripture, and action."
        primaryActionLabel="Generate Graph"
      />
      <section className="grid two">
        <SafetyNotice />
        <KnownLimitationsNotice />
      </section>
    </main>
  );
}
