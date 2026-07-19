import promiseClustersJson from "../../../data/promiseClusters.json";
import {
  PROMISE_STATUSES,
  type PromiseLevel,
  type PromiseRecord,
  type PromiseRepository,
  type PromiseStatus,
  type PromiseStatusTransition
} from "../../../domain/promises/promise-repository";

type ClusterSource = Readonly<{
  cluster_id?: string;
  id?: string;
  title?: string;
  name?: string;
  summary?: string;
  description?: string;
  promise_level?: string;
  scripture_references?: readonly string[];
}>;

function toLevel(value: string | undefined): PromiseLevel {
  return value === "B" || value === "C" ? value : "A";
}

const clusterRecords: readonly PromiseRecord[] = (promiseClustersJson as readonly ClusterSource[]).map((cluster, index) => {
  const id = cluster.cluster_id || cluster.id || `promise-cluster-${index + 1}`;
  const scriptureReference = cluster.scripture_references?.[0] || "";
  return Object.freeze({
    id,
    title: cluster.title || cluster.name || `Promise Cluster ${index + 1}`,
    scriptureReference,
    promiseLevel: toLevel(cluster.promise_level),
    explanation: cluster.summary || cluster.description || "",
    status: "Discovered" as const,
    source: Object.freeze({
      kind: "canon" as const,
      label: "Promise Cluster",
      sourceId: id,
      scriptureReferences: Object.freeze([...(cluster.scripture_references || [])])
    }),
    notes: ""
  });
});

export const APPROVED_INITIAL_PROMISE_ROW: PromiseRecord = Object.freeze({
  id: "active-daily-promise",
  title: "Calling & Purpose: TIDUILOVP",
  scriptureReference: "Ephesians 1:18",
  promiseLevel: "A",
  explanation: "Words connected to divine calling, assignment, direction, and destiny.",
  status: "Studying",
  source: Object.freeze({
    kind: "today",
    label: "Today",
    sourceId: "active-daily-promise",
    scriptureReferences: Object.freeze(["Ephesians 1:18"])
  }),
  notes: ""
});

export class LocalPromiseRepository implements PromiseRepository {
  readonly #clusters: readonly PromiseRecord[];
  #saved: PromiseRecord[];
  #history = new Map<string, PromiseStatus[]>();

  constructor(saved: readonly PromiseRecord[] = [APPROVED_INITIAL_PROMISE_ROW], clusters: readonly PromiseRecord[] = clusterRecords) {
    this.#saved = saved.map((record) => structuredClone(record));
    this.#clusters = clusters;
  }

  listClusters() { return this.#clusters; }
  listSaved() { return this.#saved.map((record) => structuredClone(record)); }
  findSavedById(id: string) { const record = this.#saved.find((item) => item.id === id); return record ? structuredClone(record) : undefined; }

  save(record: PromiseRecord) {
    const next = structuredClone(record);
    this.#saved = [next, ...this.#saved.filter((item) => item.id !== next.id)];
    return structuredClone(next);
  }

  updateStatus(id: string, status: PromiseStatus): PromiseStatusTransition | undefined {
    if (!PROMISE_STATUSES.includes(status)) return undefined;
    const index = this.#saved.findIndex((item) => item.id === id);
    if (index < 0) return undefined;
    const previousStatus = this.#saved[index].status;
    if (previousStatus === status) return { recordId: id, previousStatus, nextStatus: status };
    this.#history.set(id, [...(this.#history.get(id) || []), previousStatus]);
    this.#saved[index] = { ...this.#saved[index], status };
    return { recordId: id, previousStatus, nextStatus: status };
  }

  undoLastStatusTransition(id: string): PromiseStatusTransition | undefined {
    const history = this.#history.get(id) || [];
    const previousStatus = history.at(-1);
    const record = this.#saved.find((item) => item.id === id);
    if (!previousStatus || !record) return undefined;
    const currentStatus = record.status;
    this.#history.set(id, history.slice(0, -1));
    this.#saved = this.#saved.map((item) => item.id === id ? { ...item, status: previousStatus } : item);
    return { recordId: id, previousStatus: currentStatus, nextStatus: previousStatus };
  }

  remove(id: string) {
    const record = this.#saved.find((item) => item.id === id);
    if (!record) return undefined;
    this.#saved = this.#saved.filter((item) => item.id !== id);
    return structuredClone(record);
  }

  restore(record: PromiseRecord) { return this.save(record); }
}

export function createLocalPromiseRepository(saved?: readonly PromiseRecord[]): PromiseRepository {
  return new LocalPromiseRepository(saved);
}
