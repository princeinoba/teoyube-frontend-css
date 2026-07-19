import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const layoutSource = fs.readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");
const shellSource = fs.readFileSync(path.join(root, "src/app/_shell/ApprovedTeoyubeShell.tsx"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};

describe("approved Next preview shell source contract", () => {
  it("keeps the protected stylesheet imports in their approved order", () => {
    const approvedStylesheets = [
      "/styles/legacy.css?recovery=1",
      "/styles/tokens.css?recovery=1",
      "/styles/reset.css?recovery=1",
      "/styles/base.css?recovery=1",
      "/styles/layout.css?recovery=1",
      "/styles/components.css?recovery=1",
      "/styles/pages/index.css?recovery=1",
      "/styles/utilities.css?recovery=1",
      "/styles/responsive.css?recovery=1"
    ];
    const positions = approvedStylesheets.map((stylesheet) => layoutSource.indexOf(stylesheet));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });

  it("keeps visible navigation exact and excludes internal routes", () => {
    const expectedNavigation = [
      "Today",
      "TeoyubeSearch",
      "Canon",
      "Promise Table",
      "Calling Compass",
      "Book of the Saint",
      "Lexicon",
      "Testimony",
      "Teo Guide",
      "Embedded Videos",
      "Tables"
    ];
    const labels = [...shellSource.matchAll(/\{ view: "[^"]+", label: "([^"]+)"/g)].map((match) => match[1]);
    expect(labels).toEqual(expectedNavigation);
    expect(shellSource).not.toContain('label: "TIG"');
    expect(shellSource).not.toContain('label: "Roadmap"');
    expect(shellSource).not.toContain('label: "Settings"');
  });

  it("keeps the original static runtime canonical", () => {
    expect(packageJson.scripts.start).toBe("node --preserve-symlinks-main server.js");
    expect(packageJson.scripts["prototype:start"]).toBe(packageJson.scripts.start);
    expect(packageJson.scripts["app:start"]).toBe("next start");
  });
});
