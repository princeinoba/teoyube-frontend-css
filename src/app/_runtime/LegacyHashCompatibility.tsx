import routeCompatibility from "../../../config/runtime/route-compatibility-manifest.json";

function safeInlineJson(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function LegacyHashCompatibility() {
  const mappings = Object.fromEntries(
    routeCompatibility.legacyHashMappings.map((mapping) => [mapping.hash, mapping.target])
  );
  const conditional = routeCompatibility.conditionalLegacyHashMappings[0];
  const source = `(() => {
    try {
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== "/index.html") return;
      const rawHash = window.location.hash.slice(1);
      if (!rawHash) return;
      const hash = decodeURIComponent(rawHash).trim().toLowerCase();
      const mappings = ${safeInlineJson(mappings)};
      const conditional = ${safeInlineJson(conditional)};
      let target = mappings[hash];
      if (!target && hash === conditional.hash) {
        const query = new URLSearchParams(window.location.search);
        const required = conditional.requiredQuery;
        if (Object.entries(required).every(([key, value]) => query.get(key) === value)) {
          target = conditional.target;
        }
      }
      if (!target) return;
      window.location.replace(target + window.location.search);
    } catch {
      // Invalid legacy fragments retain the approved Today fallback.
    }
  })();`;
  return (
    <script
      id="teoyube-legacy-hash-compatibility"
      dangerouslySetInnerHTML={{ __html: source }}
    />
  );
}
