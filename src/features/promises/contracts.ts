import type { PromiseRecord } from "../../domain/promises/promise-repository";

export type PromiseTableViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  rows: readonly PromiseRecord[];
  clusterCount: number;
}>;
