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
