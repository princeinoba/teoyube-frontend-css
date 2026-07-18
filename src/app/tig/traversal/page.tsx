import {
  runFearToCourageTraversalDemo,
  runPurposeToCallingTraversalDemo,
  runWaitingToRenewalTraversalDemo,
  summarizeTraversalResult
} from "../../../../src/lib/tig";

type TraversalSummary = ReturnType<typeof summarizeTraversalResult>;

const traversalDemos = [
  {
    title: "Fear to Courage",
    description: "Starts from fear and follows TIG connections toward courage, Scripture, and action.",
    summary: summarizeTraversalResult(runFearToCourageTraversalDemo())
  },
  {
    title: "Waiting to Renewal",
    description: "Starts from waiting and follows TIG connections toward renewal, strength, and hope.",
    summary: summarizeTraversalResult(runWaitingToRenewalTraversalDemo())
  },
  {
    title: "Purpose to Calling",
    description: "Starts from purpose and follows TIG connections toward calling and faithful next steps.",
    summary: summarizeTraversalResult(runPurposeToCallingTraversalDemo())
  }
];

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function PillList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-slate-500">None.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900"
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function MetricGrid({ summary }: { summary: TraversalSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Results</p>
        <p className="mt-1 text-2xl font-semibold text-emerald-950">{summary.resultCount}</p>
      </div>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Relationships
        </p>
        <p className="mt-1 text-2xl font-semibold text-emerald-950">
          {summary.relationshipCount}
        </p>
      </div>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Paths</p>
        <p className="mt-1 text-2xl font-semibold text-emerald-950">{summary.paths.length}</p>
      </div>
    </div>
  );
}

function TopNodesTable({ summary }: { summary: TraversalSummary }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <div className="grid grid-cols-[64px_1fr_160px_100px] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>Rank</span>
        <span>Title</span>
        <span>Type</span>
        <span>Score</span>
      </div>
      <div className="divide-y divide-slate-100">
        {summary.topNodes.map((node) => (
          <div
            className="grid grid-cols-[64px_1fr_160px_100px] gap-2 px-3 py-3 text-sm text-slate-700"
            key={node.id}
          >
            <span className="font-semibold text-emerald-800">#{node.rank}</span>
            <span className="font-medium text-slate-950">{node.title}</span>
            <span className="break-all text-xs font-semibold text-slate-500">{node.type}</span>
            <span>{formatPercent(node.score)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PathsList({ summary }: { summary: TraversalSummary }) {
  if (!summary.paths.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        No traversal paths were returned.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {summary.paths.map((path, index) => (
        <article className="rounded-xl border border-slate-100 bg-slate-50 p-4" key={index}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-950">Path {index + 1}</h4>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-800">
              <span className="rounded-full bg-emerald-100 px-3 py-1">Depth {path.depth}</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1">
                Strength {formatPercent(path.totalStrength)}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1">
                Confidence {formatPercent(path.averageConfidence)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Node IDs
              </p>
              <PillList items={path.nodeIds} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Relationship IDs
              </p>
              <PillList items={path.relationshipIds} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function TraversalCard(props: {
  title: string;
  description: string;
  summary: TraversalSummary;
}) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm shadow-emerald-950/5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Traversal Demo
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-950">{props.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{props.description}</p>

      <div className="mt-5 space-y-5">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-950">Start Node IDs</h3>
          <PillList items={props.summary.startNodeIds} />
        </div>

        <MetricGrid summary={props.summary} />

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Top Nodes
          </h3>
          <TopNodesTable summary={props.summary} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Paths
          </h3>
          <PathsList summary={props.summary} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Raw JSON
          </h3>
          <pre className="max-h-[520px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-emerald-50">
            {JSON.stringify(props.summary, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}

export default function TIGTraversalDemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Developer Graph Tools
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Teoyube Graph Traversal Demo
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            Explore how TIG moves from emotions and promises into Scripture, words, journeys,
            prayers, reflections, actions, and milestones.
          </p>
          <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            This page uses local seed graph data only and does not call any external AI API.
          </p>
        </section>

        <div className="space-y-6">
          {traversalDemos.map((demo) => (
            <TraversalCard
              description={demo.description}
              key={demo.title}
              summary={demo.summary}
              title={demo.title}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
