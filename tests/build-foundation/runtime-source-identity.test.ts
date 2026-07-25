import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const identity = require("../../scripts/runtime/runtime-source-identity.cjs") as {
  assertKnownRuntimePath(pathname: string, manifest: RuntimeSourceManifest): string;
  assertRecordedIdentity(recorded: RecordedIdentity, computed: ComputedIdentity): boolean;
  buildIdFromDigest(digest: string, manifest: RuntimeSourceManifest): string;
  computeRuntimeSourceIdentityFromFiles(input: {
    manifest: RuntimeSourceManifest;
    files: Record<string, string | Buffer>;
  }): ComputedIdentity;
  createSourceRecord(pathname: string, content: string): SourceRecord;
  digestRuntimeSourceRecords(records: SourceRecord[], version: string): string;
  evaluateRuntimeIdentityContract(input: {
    recorded: RecordedIdentity;
    computed: ComputedIdentity;
    buildId: string;
    dirtyPaths?: string[];
    staticRollbackRetained: boolean;
    featureFlagDefaults: Record<string, boolean>;
  }): { result: "PASS" | "BLOCKED"; failures: string[] };
  loadRuntimeSourceManifest(root: string, manifestPath?: string): RuntimeSourceManifest;
  resolveBuildId(computed: ComputedIdentity, environment?: NodeJS.ProcessEnv): string;
  stableStringify(value: unknown): string;
  validateManifest(manifest: RuntimeSourceManifest): RuntimeSourceManifest;
};

type RuntimeSourceManifest = {
  schemaVersion: 1;
  identityVersion: string;
  algorithm: "sha256";
  buildIdPrefix: string;
  digestPrefixLength: number;
  exactPaths: string[];
  prefixes: string[];
  excludedClasses?: string[];
};
type SourceRecord = { path: string; bytes: number; sha256: string };
type ComputedIdentity = {
  generatorVersion: string;
  algorithm: "sha256";
  digest: string;
  buildId: string;
  sourceFileCount: number;
};
type RecordedIdentity = {
  runtimeSourceDigest: string;
  buildIdGeneratorVersion: string;
  nextBuildId: string;
};

const manifest = (): RuntimeSourceManifest => ({
  schemaVersion: 1,
  identityVersion: "teoyube-runtime-source-digest-test.1",
  algorithm: "sha256",
  buildIdPrefix: "teoyube",
  digestPrefixLength: 24,
  exactPaths: [
    "config/runtime/runtime-source-manifest.json",
    "next.config.mjs",
    "package-lock.json",
    "package.json"
  ],
  prefixes: ["public/", "src/"]
});

const files = () => ({
  "config/runtime/runtime-source-manifest.json": "{\"schemaVersion\":1}\n",
  "next.config.mjs": "export default { reactStrictMode: true };\n",
  "package-lock.json": "{\"lockfileVersion\":3}\n",
  "package.json": "{\"scripts\":{\"build\":\"next build\"}}\n",
  "public/runtime.txt": "public asset\n",
  "src/app/api/health/route.ts": "export const GET = () => Response.json({ ok: true });\n",
  "src/app/page.tsx": "export default function Page() { return <main />; }\n"
});

const compute = (
  changes: Record<string, string> = {},
  extra: Record<string, string> = {},
  inputManifest = manifest()
) =>
  identity.computeRuntimeSourceIdentityFromFiles({
    manifest: inputManifest,
    files: { ...files(), ...changes, ...extra }
  });

describe("deterministic Next runtime-source identity", () => {
  it("returns the same digest and safe build ID for identical inputs", () => {
    expect(compute()).toEqual(compute());
    expect(compute().buildId).toMatch(/^teoyube-[a-f0-9]{24}$/);
  });

  it("normalizes path ordering and manifest object serialization", () => {
    const first = manifest();
    const second = {
      prefixes: [...first.prefixes].reverse(),
      exactPaths: [...first.exactPaths].reverse(),
      digestPrefixLength: first.digestPrefixLength,
      buildIdPrefix: first.buildIdPrefix,
      algorithm: first.algorithm,
      identityVersion: first.identityVersion,
      schemaVersion: first.schemaVersion
    };
    expect(compute({}, {}, first).digest).toBe(compute({}, {}, second).digest);
    expect(identity.stableStringify({ b: 2, a: 1 })).toBe(identity.stableStringify({ a: 1, b: 2 }));
  });

  it("normalizes text line endings", () => {
    expect(compute({ "src/app/page.tsx": "line one\r\nline two\r\n" }).digest).toBe(
      compute({ "src/app/page.tsx": "line one\nline two\n" }).digest
    );
  });

  it.each([
    ["runtime source", "src/domain/runtime.ts", "runtime change\n"],
    ["route/API source", "src/app/api/health/route.ts", "export const GET = changed;\n"],
    ["Next config", "next.config.mjs", "export default { poweredByHeader: false };\n"],
    ["package manifest", "package.json", "{\"scripts\":{\"build\":\"changed\"}}\n"],
    ["lockfile", "package-lock.json", "{\"lockfileVersion\":3,\"changed\":true}\n"],
    ["public runtime asset", "public/runtime.txt", "changed public asset\n"]
  ])("invalidates for a %s change", (_label, pathname, content) => {
    const baseline = compute();
    const changed = Object.hasOwn(files(), pathname)
      ? compute({ [pathname]: content })
      : compute({}, { [pathname]: content });
    expect(changed.digest).not.toBe(baseline.digest);
    expect(changed.buildId).not.toBe(baseline.buildId);
  });

  it.each([
    "docs/recovery/report.md",
    "docs/owner-approvals/runtime/decision.md",
    "docs/recovery/prompt-23a-complete-inventory.json",
    "artifacts/release-evidence/manifest.json"
  ])("does not invalidate for excluded report/evidence path %s", (pathname) => {
    const baseline = compute();
    expect(compute({}, { [pathname]: "version one\n" }).digest).toBe(baseline.digest);
    expect(compute({}, { [pathname]: "version two\n" }).digest).toBe(baseline.digest);
  });

  it("fails closed on an unknown classified runtime path", () => {
    expect(() => identity.assertKnownRuntimePath("unexpected/runtime-file.ts", manifest())).toThrow(
      /Unknown classified runtime path/
    );
  });

  it("fails closed when the source manifest is missing", () => {
    const root = path.join(process.cwd(), ".tmp", "prompt23ad", "missing-manifest");
    fs.mkdirSync(root, { recursive: true });
    expect(() => identity.loadRuntimeSourceManifest(root)).toThrow(/manifest is missing/);
  });

  it("fails closed on malformed digests, duplicate records, and duplicate manifest paths", () => {
    expect(() => identity.buildIdFromDigest("not-a-digest", identity.validateManifest(manifest()))).toThrow(
      /digest is malformed/
    );
    const record = identity.createSourceRecord("src/app/page.tsx", "page\n");
    expect(() =>
      identity.digestRuntimeSourceRecords([record, record], manifest().identityVersion)
    ).toThrow(/duplicate path/);
    expect(() =>
      identity.validateManifest({ ...manifest(), exactPaths: ["package.json", "PACKAGE.JSON"] })
    ).toThrow(/duplicate path or prefix/);
  });

  it("fails closed on a stale recorded digest or generator version", () => {
    const computed = compute();
    expect(() =>
      identity.assertRecordedIdentity(
        {
          runtimeSourceDigest: "0".repeat(64),
          buildIdGeneratorVersion: computed.generatorVersion,
          nextBuildId: computed.buildId
        },
        computed
      )
    ).toThrow(/digest is stale/);
    expect(() =>
      identity.assertRecordedIdentity(
        {
          runtimeSourceDigest: computed.digest,
          buildIdGeneratorVersion: "old-generator",
          nextBuildId: computed.buildId
        },
        computed
      )
    ).toThrow(/generator version is stale/);
  });

  it("rejects arbitrary build-ID overrides", () => {
    expect(() =>
      identity.resolveBuildId(compute(), {
        TEOYUBE_NEXT_BUILD_ID_OVERRIDE: "arbitrary"
      } as NodeJS.ProcessEnv)
    ).toThrow(/overrides are not supported/);
  });

  it("accepts the current deterministic contract and rejects stale builds or unsafe defaults", () => {
    const computed = compute();
    const recorded = {
      runtimeSourceDigest: computed.digest,
      buildIdGeneratorVersion: computed.generatorVersion,
      nextBuildId: computed.buildId
    };
    const safe = {
      recorded,
      computed,
      buildId: computed.buildId,
      staticRollbackRetained: true,
      featureFlagDefaults: { liveAi: false, vectorRetrieval: false }
    };
    expect(identity.evaluateRuntimeIdentityContract(safe).result).toBe("PASS");
    expect(identity.evaluateRuntimeIdentityContract({ ...safe, buildId: "stale-build" }).result).toBe(
      "BLOCKED"
    );
    expect(
      identity.evaluateRuntimeIdentityContract({
        ...safe,
        featureFlagDefaults: { liveAi: true }
      }).result
    ).toBe("BLOCKED");
    expect(
      identity.evaluateRuntimeIdentityContract({
        ...safe,
        dirtyPaths: ["src/app/page.tsx"]
      }).result
    ).toBe("BLOCKED");
  });
});
