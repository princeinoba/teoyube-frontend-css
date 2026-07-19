import { readFile } from "node:fs/promises";
import path from "node:path";

const APPROVED_STYLES = new Set([
  "styles.css",
  "styles/legacy.css",
  "styles/tokens.css",
  "styles/reset.css",
  "styles/base.css",
  "styles/layout.css",
  "styles/components.css",
  "styles/pages/index.css",
  "styles/pages/today.css",
  "styles/pages/roadmap.css",
  "styles/pages/canon.css",
  "styles/pages/search.css",
  "styles/pages/promise-table.css",
  "styles/pages/calling-compass.css",
  "styles/pages/book.css",
  "styles/pages/lexicon.css",
  "styles/pages/testimony.css",
  "styles/pages/teo-guide.css",
  "styles/pages/embedded-videos.css",
  "styles/pages/tables.css",
  "styles/utilities.css",
  "styles/responsive.css"
]);

export async function readApprovedStylesheet(segments: readonly string[]): Promise<string | null> {
  const relativePath = segments.join("/");
  if (!APPROVED_STYLES.has(relativePath)) return null;
  const workspaceRoot = path.resolve(/* turbopackIgnore: true */ process.cwd());
  const resolved = path.resolve(/* turbopackIgnore: true */ workspaceRoot, relativePath);
  if (!resolved.startsWith(`${workspaceRoot}${path.sep}`)) return null;
  return readFile(resolved, "utf8");
}
