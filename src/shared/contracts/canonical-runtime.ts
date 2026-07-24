export type RuntimeRouteRecord = Readonly<{
  path: string;
  capability: string;
}>;

export type LegacyUrlMapping = Readonly<{
  source: string;
  target: string;
}>;

export type AssetContract = Readonly<{
  id: string;
  manifest?: string;
  source?: string;
  target?: string;
}>;

export type ApiContract = Readonly<{
  path: string;
  source: string;
}>;

export interface CanonicalRuntimeManifest {
  readonly schemaVersion: string;
  readonly canonicalRuntime: "next";
  readonly rollbackRuntime: "static-node";
  readonly ownerDecisionId: string;
  readonly cutoverCommit: string;
  readonly staticBaselineCommit: string;
  readonly nextBuildId: string;
  readonly publicRoutes: readonly RuntimeRouteRecord[];
  readonly legacyUrlMappings: readonly LegacyUrlMapping[];
  readonly assetContracts: readonly AssetContract[];
  readonly apiContracts: readonly ApiContract[];
  readonly featureFlagDefaults: Readonly<Record<string, boolean>>;
  readonly rollbackCommand: string;
  readonly verifiedAt: string;
}
