const fs = require("fs");
const path = require("path");

const clustersPath = path.join(__dirname, "..", "src", "data", "promiseClusters.json");
const requiredFields = [
  "cluster_id",
  "title",
  "theme",
  "promise_category",
  "promise_level",
  "scripture_references",
  "summary",
  "keywords",
  "related_teoyube_words",
  "prayer_framework",
  "divine_assignment",
  "calling_connection",
  "animation_prompt",
  "book_entry_template",
  "journey_status_options"
];

function readClusters() {
  return JSON.parse(fs.readFileSync(clustersPath, "utf8"));
}

function validateClusters(clusters) {
  if (!Array.isArray(clusters)) {
    throw new Error("Promise clusters file must contain a JSON array.");
  }

  const ids = new Set();
  const errors = [];

  clusters.forEach((cluster, index) => {
    requiredFields.forEach((field) => {
      if (!(field in cluster)) {
        errors.push(`${index}:${cluster.title || "UNKNOWN"} is missing ${field}`);
      }
    });

    if (cluster.cluster_id) {
      if (ids.has(cluster.cluster_id)) {
        errors.push(`${index}:${cluster.cluster_id} is duplicated`);
      }
      ids.add(cluster.cluster_id);
    }

    ["scripture_references", "keywords", "related_teoyube_words", "journey_status_options"].forEach(
      (field) => {
        if (!Array.isArray(cluster[field])) {
          errors.push(`${index}:${cluster.title} ${field} must be an array`);
        }
      }
    );
  });

  if (errors.length > 0) {
    throw new Error(`Promise cluster validation failed:\n${errors.join("\n")}`);
  }
}

async function seedPromiseClusters() {
  const clusters = readClusters();
  validateClusters(clusters);

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.log(`Promise clusters validated: ${clusters.length} clusters.`);
    console.log("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to seed Supabase.");
    return;
  }

  let createClient;
  try {
    ({ createClient } = await import("@supabase/supabase-js"));
  } catch {
    throw new Error(
      "Install @supabase/supabase-js before seeding Supabase: npm install @supabase/supabase-js"
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const rows = clusters.map((cluster) => ({
    cluster_id: cluster.cluster_id,
    title: cluster.title,
    name: cluster.name || cluster.title,
    theme: cluster.theme,
    description: cluster.description,
    promise_category: cluster.promise_category,
    promise_level: cluster.promise_level,
    scripture_references: cluster.scripture_references,
    anchor_scripture: cluster.anchor_scripture || cluster.anchorScripture,
    summary: cluster.summary,
    keywords: cluster.keywords,
    core_words: cluster.core_words || cluster.coreWords,
    related_teoyube_words: cluster.related_teoyube_words,
    prayer_sequence: cluster.prayer_sequence || cluster.prayerSequence,
    declaration: cluster.declaration,
    prayer_framework: cluster.prayer_framework,
    divine_assignment: cluster.divine_assignment,
    calling_connection: cluster.calling_connection,
    animation_prompt: cluster.animation_prompt,
    book_entry_template: cluster.book_entry_template,
    journey_status_options: cluster.journey_status_options
  }));

  const { error } = await supabase
    .from("promise_clusters")
    .upsert(rows, { onConflict: "cluster_id" });

  if (error) throw error;

  console.log(`Promise clusters seeded: ${clusters.length} clusters.`);
}

seedPromiseClusters().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
