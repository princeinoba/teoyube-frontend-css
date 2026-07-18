const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "src", "data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
}

function assertArray(name, rows, minLength = 1) {
  if (!Array.isArray(rows)) throw new Error(`${name} must be an array.`);
  if (rows.length < minLength) throw new Error(`${name} must contain at least ${minLength} rows.`);
}

function validate() {
  const schema = readJson("scriptureKnowledgeGraphSchema.json");
  const canon = readJson("scriptureCanon.json");
  const paths = readJson("scriptureLinkedPaths.json");
  const archetypes = readJson("scriptureLinkedArchetypes.json");
  const clusters = readJson("scripturePromiseClusters.json");
  const relationships = readJson("scriptureGraphRelationships.json");
  const tags = readJson("scriptureSearchTags.json");

  assertArray("scriptureCanon", canon, schema.canonizedCoreWords);
  assertArray("scriptureLinkedPaths", paths, schema.scriptureLinkedPaths);
  assertArray("scriptureLinkedArchetypes", archetypes, schema.scriptureLinkedArchetypes);
  assertArray("scripturePromiseClusters", clusters, schema.promiseClusterCanonizations);
  assertArray("scriptureGraphRelationships", relationships, schema.scriptureGraphRelationships);
  assertArray("scriptureSearchTags", tags, schema.searchTags);

  canon.forEach((record) => {
    if (!Array.isArray(record.scriptureReferences) || record.scriptureReferences.length < 3) {
      throw new Error(`${record.id}:${record.teoyubeWord} must have at least 3 scripture references.`);
    }
  });

  return { schema, canon, paths, archetypes, clusters, relationships, tags };
}

async function upsert(supabase, table, rows, onConflict) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw error;
}

async function seedScriptureCanon() {
  const data = validate();
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.log(
      `Scripture canon validated: ${data.canon.length} words, ${data.paths.length} paths, ${data.relationships.length} relationships.`
    );
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

  await upsert(
    supabase,
    "scripture_canon",
    data.canon.map((row) => ({
      id: row.id,
      teoyube_word: row.teoyubeWord,
      word: row.word || row.teoyubeWord,
      meaning: row.meaning,
      category: row.category,
      scripture_references: row.scriptureReferences,
      scripture_themes: row.scriptureThemes,
      promise_statement: row.promiseStatement,
      archetype_links: row.archetypeLinks,
      path_links: row.pathLinks,
      cluster_links: row.clusterLinks,
      prayer_use: row.prayerUse,
      graph_tags: row.graphTags
    })),
    "id"
  );

  await upsert(
    supabase,
    "scripture_linked_paths",
    data.paths.map((row) => ({
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      scripture_flow: row.scriptureFlow,
      path_prayer: row.pathPrayer
    })),
    "id"
  );

  await upsert(
    supabase,
    "scripture_linked_archetypes",
    data.archetypes.map((row) => ({
      id: row.id,
      name: row.name,
      teoyube_word: row.teoyubeWord,
      scriptural_models: row.scripturalModels
    })),
    "id"
  );

  await upsert(
    supabase,
    "scripture_promise_clusters",
    data.clusters.map((row) => ({
      id: row.id,
      name: row.name,
      core_words: row.coreWords,
      scripture_anchor: row.scriptureAnchor,
      supporting_references: row.supportingReferences,
      cluster_declaration: row.clusterDeclaration
    })),
    "id"
  );

  await upsert(
    supabase,
    "scripture_graph_relationships",
    data.relationships.map((row) => ({
      source_type: row.sourceType,
      source: row.source,
      relationship: row.relationship,
      target_type: row.targetType,
      target: row.target
    })),
    "source_type,source,relationship,target_type,target"
  );

  await upsert(
    supabase,
    "scripture_search_tags",
    data.tags.map((tag) => ({ tag })),
    "tag"
  );

  console.log("Scripture canon seeded.");
}

seedScriptureCanon().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
