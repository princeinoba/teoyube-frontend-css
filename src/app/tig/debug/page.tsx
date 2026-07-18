import type { ReactNode } from "react";
import { runTIGValidationDemo, validateGraphEngineArchitecture } from "../../../../src/lib/tig";

type DisplayItem =
  | string
  | {
      id?: string;
      title?: string;
      label?: string;
      name?: string;
      key?: string;
      reference?: string;
      word?: string;
      slug?: string;
      categoryKey?: string;
      categoryName?: string;
      clusterKey?: string;
      clusterName?: string;
      emotionKey?: string;
      emotionName?: string;
      callingKey?: string;
      callingName?: string;
      journeyKey?: string;
      journeyName?: string;
      sequenceKey?: string;
      milestoneKey?: string;
      milestoneName?: string;
      prompt?: string;
      action?: string;
      actionText?: string;
    };

function getRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function getStringField(item: Record<string, unknown>, key: string): string {
  const value = item[key];
  return typeof value === "string" ? value : "";
}

function getLabel(item: DisplayItem | unknown): string {
  if (typeof item === "string") return item;

  const record = getRecord(item);
  if (!record) return "";

  return (
    getStringField(record, "title") ||
    getStringField(record, "label") ||
    getStringField(record, "name") ||
    getStringField(record, "reference") ||
    getStringField(record, "word") ||
    getStringField(record, "slug") ||
    getStringField(record, "categoryName") ||
    getStringField(record, "categoryKey") ||
    getStringField(record, "clusterName") ||
    getStringField(record, "clusterKey") ||
    getStringField(record, "emotionName") ||
    getStringField(record, "emotionKey") ||
    getStringField(record, "callingName") ||
    getStringField(record, "callingKey") ||
    getStringField(record, "journeyName") ||
    getStringField(record, "journeyKey") ||
    getStringField(record, "sequenceKey") ||
    getStringField(record, "milestoneName") ||
    getStringField(record, "milestoneKey") ||
    getStringField(record, "prompt") ||
    getStringField(record, "actionText") ||
    getStringField(record, "action") ||
    getStringField(record, "id")
  );
}

function getItems(value: unknown): DisplayItem[] {
  return Array.isArray(value) ? (value as DisplayItem[]) : [];
}

function getPromptText(value: unknown): string {
  if (typeof value === "string") return value;
  const record = getRecord(value);
  return record ? getStringField(record, "prompt") : "";
}

function getActionText(value: unknown): string {
  if (typeof value === "string") return value;
  const record = getRecord(value);
  return record ? getStringField(record, "actionText") || getStringField(record, "action") : "";
}

function getRuntimeScriptures(response: unknown): Array<{
  reference: string;
  text: string;
  translation: string;
}> {
  const record = getRecord(response);
  const scriptures = record?.scriptures || record?.scriptureNodes;
  return Array.isArray(scriptures)
    ? (scriptures as Array<{ reference: string; text: string; translation: string }>)
    : [];
}

function getRuntimeConfidence(response: unknown): { overall?: number; explanation?: string } {
  const record = getRecord(response);
  const confidence = record?.confidence || record?.confidenceScore;
  return getRecord(confidence) as { overall?: number; explanation?: string };
}

function StatusBadge({ valid }: { valid: boolean }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        valid
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {valid ? "Valid" : "Invalid"}
    </span>
  );
}

function DebugCard(props: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm shadow-emerald-950/5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {props.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {props.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{props.title}</h2>
        </div>
        {props.action}
      </div>
      {props.children}
    </article>
  );
}

function MetricGrid(props: { items: Array<{ label: string; value: number | string }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {props.items.map((item) => (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3" key={item.label}>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function NodeCountsTable({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(counts).map(([type, count]) => (
        <div
          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
          key={type}
        >
          <span className="text-xs font-medium text-slate-600">{type}</span>
          <span className="text-sm font-semibold text-slate-950">{count}</span>
        </div>
      ))}
    </div>
  );
}

function ErrorList({ errors }: { errors: string[] }) {
  if (!errors.length) {
    return (
      <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
        No validation errors.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-2">
      {errors.map((error) => (
        <li className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-800" key={error}>
          {error}
        </li>
      ))}
    </ul>
  );
}

function PillList({ items }: { items: DisplayItem[] }) {
  if (!items.length) return <p className="text-sm text-slate-500">None detected.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const label = getLabel(item);
        return label ? (
          <span
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-900"
            key={`${label}-${index}`}
          >
            {label}
          </span>
        ) : null;
      })}
    </div>
  );
}

function ContextGrid({ context }: { context: Record<string, unknown> }) {
  const items = [
    { label: "Primary Emotion", value: context.primaryEmotion },
    { label: "Primary Promise", value: context.primaryPromise },
    { label: "Primary Cluster", value: context.primaryCluster },
    { label: "Primary Scripture", value: context.primaryScripture },
    { label: "Primary Journey", value: context.primaryJourney },
    { label: "Primary Calling", value: context.primaryCalling },
    { label: "Primary Prayer Sequence", value: context.primaryPrayerSequence },
    { label: "Primary Reflection Prompt", value: context.primaryReflectionPrompt },
    { label: "Primary Action Step", value: context.primaryActionStep },
    { label: "Primary Milestone", value: context.primaryMilestone }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3" key={item.label}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {getLabel(item.value) || "None"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function TIGDebugPage() {
  const seedValidation = runTIGValidationDemo();
  const graphEngineValidation = validateGraphEngineArchitecture();
  const combinedResult = {
    seedValidation,
    graphEngineValidation
  };
  const seedSummary = graphEngineValidation.seedSummary || seedValidation.seedSummary;
  const sample = graphEngineValidation.sampleResponse;
  const sampleRecord = getRecord(sample) || {};
  const scriptures = getRuntimeScriptures(sample);
  const confidence = getRuntimeConfidence(sample);
  const graphTrace = Array.isArray(sampleRecord.graphTrace) ? sampleRecord.graphTrace : [];
  const sampleContext = graphEngineValidation.sampleGraphContext as Record<string, unknown>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Developer Diagnostics
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Teoyube Intelligence Graph Debug
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Local seed validation, legacy demo response checks, shared Graph Engine checks, and a
            sample Scripture-anchored response.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <DebugCard
            action={<StatusBadge valid={seedValidation.seedGraph.valid} />}
            eyebrow="Seed Graph"
            title="Validation"
          >
            <MetricGrid
              items={[
                { label: "Nodes", value: seedValidation.seedGraph.summary.nodeCount },
                { label: "Relationships", value: seedValidation.seedGraph.summary.relationshipCount },
                { label: "Scriptures", value: seedValidation.seedGraph.summary.scriptureCount }
              ]}
            />
            <NodeCountsTable counts={seedValidation.seedGraph.summary.nodeCountsByType} />
            <ErrorList errors={seedValidation.seedGraph.errors} />
          </DebugCard>

          <DebugCard
            action={<StatusBadge valid={seedValidation.demoResponses.valid} />}
            eyebrow="Demo Responses"
            title="Validation"
          >
            <MetricGrid
              items={[{ label: "Responses", value: seedValidation.demoResponses.responseCount }]}
            />
            <ErrorList errors={seedValidation.demoResponses.errors} />
          </DebugCard>

          <DebugCard
            action={<StatusBadge valid={graphEngineValidation.graphResolution.valid} />}
            eyebrow="Shared Graph Engine"
            title="Graph Resolution"
          >
            <MetricGrid
              items={[{ label: "Results", value: graphEngineValidation.graphResolution.resultCount }]}
            />
            <ErrorList errors={graphEngineValidation.graphResolution.errors} />
          </DebugCard>

          <DebugCard
            action={<StatusBadge valid={graphEngineValidation.engineResponses.valid} />}
            eyebrow="Shared Graph Engine"
            title="Engine Responses"
          >
            <MetricGrid
              items={[{ label: "Responses", value: graphEngineValidation.engineResponses.responseCount }]}
            />
            <ErrorList errors={graphEngineValidation.engineResponses.errors} />
          </DebugCard>
        </section>

        <DebugCard eyebrow="Seed Summary" title="Unified Seed Graph Totals">
          <MetricGrid
            items={[
              { label: "Total Nodes", value: seedSummary.nodeCount },
              { label: "Relationships", value: seedSummary.relationshipCount },
              { label: "Node Types", value: Object.keys(seedSummary.nodeCountsByType).length }
            ]}
          />
          <NodeCountsTable counts={seedSummary.nodeCountsByType} />
        </DebugCard>

        <DebugCard eyebrow="Sample Graph Context" title="Resolved Context for I feel stuck.">
          <ContextGrid context={sampleContext} />
        </DebugCard>

        <DebugCard eyebrow="Sample Response" title="Scripture Intelligence Output">
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Detected Intent</h3>
                <PillList items={[String(sampleRecord.detectedIntent || "")]} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Journey</h3>
                <PillList items={sampleRecord.journey ? [sampleRecord.journey as DisplayItem] : []} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Detected Emotions</h3>
                <PillList items={getItems(sampleRecord.detectedEmotions)} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Promise Categories</h3>
                <PillList items={getItems(sampleRecord.detectedPromiseCategories)} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Calling Profiles</h3>
                <PillList items={getItems(sampleRecord.detectedCallingProfiles)} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Teoyube Words</h3>
                <PillList items={getItems(sampleRecord.teoyubeWords)} />
              </div>
              <div className="sm:col-span-2">
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Promise Clusters</h3>
                <PillList items={getItems(sampleRecord.promiseClusters)} />
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
                Scriptures
              </h3>
              <div className="space-y-3">
                {scriptures.map((scripture, index) => (
                  <blockquote
                    className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50/80 p-4"
                    key={`${scripture.reference}-${index}`}
                  >
                    <p className="font-semibold text-emerald-950">
                      {scripture.reference}{" "}
                      <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                        {scripture.translation}
                      </span>
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{scripture.text}</p>
                  </blockquote>
                ))}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-950">AI Message</h3>
                <p className="text-sm leading-6 text-slate-700">{String(sampleRecord.aiMessage || "")}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Confidence</h3>
                <p className="text-3xl font-semibold text-emerald-900">
                  {Math.round((confidence.overall || 0) * 100)}%
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{confidence.explanation}</p>
              </div>
            </section>

            <section className="rounded-xl border border-emerald-100 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-950">Prayer</h3>
              <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                {String(sampleRecord.prayer || "")}
              </p>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-white p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Reflection Prompt</h3>
                <p className="text-sm leading-6 text-slate-700">
                  {getPromptText(sampleRecord.reflectionPrompt)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Action Step</h3>
                <p className="text-sm leading-6 text-slate-700">
                  {getActionText(sampleRecord.actionStep)}
                </p>
              </div>
            </section>

            {graphTrace.length ? (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
                  Graph Trace
                </h3>
                <div className="space-y-3">
                  {graphTrace.map((trace, index) => (
                    <pre
                      className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-emerald-50"
                      key={index}
                    >
                      {JSON.stringify(trace, null, 2)}
                    </pre>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </DebugCard>

        <DebugCard eyebrow="Raw JSON" title="Combined Validation Result">
          <pre className="max-h-[680px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-emerald-50">
            {JSON.stringify(combinedResult, null, 2)}
          </pre>
        </DebugCard>
      </div>
    </main>
  );
}
