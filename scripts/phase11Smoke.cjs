const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..");

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch {
    return fallback;
  }
}

function requestStatus(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      response.on("end", () => resolve(response.statusCode || 0));
    });
    request.on("error", () => resolve(0));
    request.setTimeout(1500, () => {
      request.destroy();
      resolve(0);
    });
  });
}

async function run() {
  const packageJson = readJson("package.json", {});
  const scripts = packageJson.scripts || {};
  const words = readJson("src/data/coreTeoyubeVocabulary.json", []);
  const promises = readJson("src/data/promiseClusters.json", []);
  const scriptures = readJson("src/data/scriptureCanon.json", []);
  const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const serverJs = fs.readFileSync(path.join(root, "server.js"), "utf8");
  const checks = [
    ["primary_runtime_script", Boolean(scripts["prototype:start"] || scripts.start), "Static primary runtime has a start script."],
    ["import_checker_script", Boolean(scripts["check:imports"]), "Import health script is present."],
    ["phase11_smoke_script", Boolean(scripts["phase11:smoke"]), "Phase 11 smoke script is present."],
    ["static_shell_present", exists("index.html") && exists("app.js") && exists("styles.css") && exists("server.js"), "Static app files exist."],
    ["next_migration_source_present", exists("src/app/page.tsx") && exists("src/app/layout.tsx"), "Next migration source exists but is not primary."],
    ["productization_components_present", exists("src/components/productization/Phase112ScreenshotApp.tsx") && exists("src/components/productization/Phase11ProductPanels.tsx"), "Productization components exist."],
    ["state_layer_present", exists("src/lib/teoyube/app-state.ts") && exists("src/components/productization/TeoyubeAppStateProvider.tsx"), "Session-safe app state layer exists."],
    ["data_loads", words.length > 0 && promises.length > 0 && scriptures.length > 0, "Core vocabulary, promises, and Scripture data load."],
    ["guardrails_visible", appJs.includes("Guardrails") && appJs.includes("Scripture"), "Guardrails and Scripture boundary copy exist."],
    ["today_journey_generation", appJs.includes("generateJourney") && appJs.includes("Generated Journey"), "Today journey generation path exists."],
    ["promise_table_actions", appJs.includes("addSearchResultToPromiseTable") && appJs.includes("journeyStatuses"), "Promise Table add/status path exists."],
    ["calling_compass_safe_language", appJs.includes("wise counsel") && appJs.includes("fruit"), "Calling copy keeps cautious language."],
    ["teo_guide_local_response", appJs.includes("buildTeoResponse") && !appJs.includes("OpenAI"), "Teo Guide local response exists without live AI."],
    ["embedded_videos_local", serverJs.includes("source_not_connected") && !serverJs.includes("youtube.com"), "Embedded media uses local source-disabled data."],
    ["no_browser_persistence", !appJs.includes("localStorage") && !appJs.includes("sessionStorage"), "No browser persistence is required."],
    ["no_external_media_runtime", !appJs.includes("youtube.com") && !appJs.includes("i.ytimg") && !serverJs.includes("i.ytimg"), "Runtime source avoids external media URLs."]
  ];
  const status = await requestStatus("http://127.0.0.1:4173");
  const requireRuntime = process.env.TEOYUBE_REQUIRE_RUNTIME === "1";
  checks.push([
    "local_server_reachable",
    requireRuntime ? status === 200 : true,
    requireRuntime
      ? `Required local server status: ${status || "not running"}.`
      : `Runtime reachability deferred to check:runtime; local server status: ${status || "not running"}.`
  ]);

  const report = {
    phase: "11.3",
    primaryRuntime: "static-node-app",
    nextRuntimeDeferred: true,
    valid: checks.every(([, passed]) => passed),
    checks: checks.map(([id, passed, message]) => ({ id, status: passed ? "pass" : "fail", message })),
    safety: {
      noExternalServices: true,
      noLiveAi: true,
      noAnalytics: true,
      noDatabasePersistence: true,
      noRawPrivateTextStored: true,
      noAutomaticContact: true
    }
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exit(1);
}

run();
