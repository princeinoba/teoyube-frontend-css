import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import type { CanonicalRuntimeManifest } from "@/shared/contracts/canonical-runtime";

const root = process.cwd();
const require = createRequire(import.meta.url);
const launcher = require("../../scripts/runtime/runtime-launcher-lib.cjs") as {
  readBuild(rootPath: string): { ready: boolean; buildId: string | null; message: string };
  parseStartArguments(
    args: string[],
    environment?: NodeJS.ProcessEnv
  ): { port: number; hostname: string; nextArguments: readonly string[] };
};
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "config/runtime/canonical-runtime-manifest.json"), "utf8")
) as CanonicalRuntimeManifest & {
  gateCProduction: string;
  publicDeploymentPerformed: boolean;
  featureFlagDefaults: Record<string, boolean>;
};
const routes = JSON.parse(
  fs.readFileSync(path.join(root, "config/runtime/route-compatibility-manifest.json"), "utf8")
) as {
  publicRoutes: Array<{ path: string }>;
  legacyHashMappings: Array<{ hash: string; target: string }>;
  protectedRoutes: Array<{ path: string }>;
};

describe("owner-controlled canonical runtime cutover", () => {
  it("keeps Next canonical commands and the byte-compatible static rollback command distinct", () => {
    expect(packageJson.scripts.start).toBe("node scripts/runtime/start-next.cjs");
    expect(packageJson.scripts.dev).toBe("next dev");
    expect(packageJson.scripts["app:start"]).toBe(packageJson.scripts.start);
    expect(packageJson.scripts["static:start"]).toBe("node --preserve-symlinks-main server.js");
    expect(packageJson.scripts["prototype:start"]).toBe(packageJson.scripts["static:start"]);
    expect(packageJson.scripts["rollback:start"]).toBe(packageJson.scripts["static:start"]);
  });

  it("fails safely when a Next production build is absent or invalid", () => {
    const missing = path.join(root, ".tmp", "prompt22", "missing-build-fixture");
    fs.mkdirSync(missing, { recursive: true });
    expect(launcher.readBuild(missing)).toMatchObject({
      ready: false,
      buildId: null,
      message: expect.stringContaining("npm run app:build")
    });
  });

  it("normalizes local start arguments and rejects invalid ports", () => {
    expect(launcher.parseStartArguments([], { PORT: "3210" } as NodeJS.ProcessEnv)).toEqual({
      port: 3210,
      hostname: "127.0.0.1",
      nextArguments: ["--hostname", "127.0.0.1", "--port", "3210"]
    });
    expect(launcher.parseStartArguments(["--port", "3211", "--hostname", "localhost"])).toMatchObject({
      port: 3211,
      hostname: "localhost"
    });
    expect(() => launcher.parseStartArguments(["--port", "70000"])).toThrow(/valid local TCP port/);
    expect(() => launcher.parseStartArguments(["--hostname", "0.0.0.0"])).toThrow(
      /only to a loopback hostname/
    );
  });

  it("binds every retained route and legacy hash without merging capabilities", () => {
    expect(routes.publicRoutes.map((item) => item.path)).toHaveLength(23);
    expect(routes.publicRoutes.map((item) => item.path)).toEqual(
      expect.arrayContaining([
        "/search",
        "/promise-search",
        "/daily-word",
        "/explore",
        "/prayer",
        "/journey",
        "/journal"
      ])
    );
    const mappings = Object.fromEntries(
      routes.legacyHashMappings.map((item) => [item.hash, item.target])
    );
    expect(mappings).toMatchObject({
      today: "/",
      search: "/search",
      table: "/promise-table",
      calling: "/calling-compass",
      "ui-elements": "/embedded-videos",
      "teoyube-tables": "/tables"
    });
    expect(routes.protectedRoutes.map((item) => item.path)).toContain("/roadmap");
  });

  it("keeps production closed and all external checked-in defaults disabled", () => {
    expect(manifest.canonicalRuntime).toBe("next");
    expect(manifest.rollbackRuntime).toBe("static-node");
    expect(manifest.gateCProduction).toBe("CLOSED");
    expect(manifest.publicDeploymentPerformed).toBe(false);
    expect(Object.values(manifest.featureFlagDefaults)).toEqual([false, false, false, false]);
  });
});
