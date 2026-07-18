const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "src", "data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
}

function assertArray(name, rows, expected) {
  if (!Array.isArray(rows)) throw new Error(`${name} must be an array.`);
  if (expected && rows.length !== expected) {
    throw new Error(`${name} expected ${expected} rows, found ${rows.length}.`);
  }
}

function validate() {
  const master = readJson("teoyubeCanonMasterSchema.json");
  const archetypes = readJson("kingdomArchetypes.json");
  const paths = readJson("covenantPaths.json");
  const maps = readJson("destinyMaps.json");
  const glyphs = readJson("glyphDefinitions.json");
  const relationships = readJson("graphRelationships.json");
  const prayers = readJson("prayerEngineTemplates.json");
  const prayerJourneys = readJson("prayerJourneys.json");
  const prayerRecommendationMap = readJson("prayerRecommendationMap.json");

  assertArray("kingdomArchetypes", archetypes, master.archetypes);
  assertArray("covenantPaths", paths, master.covenantPaths);
  assertArray("destinyMaps", maps, master.destinyMaps);
  assertArray("glyphDefinitions", glyphs, master.glyphs);
  assertArray("graphRelationships", relationships);
  assertArray("prayerEngineTemplates", prayers);
  assertArray("prayerJourneys", prayerJourneys);

  return { master, archetypes, paths, maps, glyphs, relationships, prayers, prayerJourneys, prayerRecommendationMap };
}

async function upsert(supabase, table, rows, onConflict) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw error;
}

async function seedCanon() {
  const data = validate();
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.log(
      `Canon validated: ${data.archetypes.length} archetypes, ${data.paths.length} paths, ${data.maps.length} maps, ${data.glyphs.length} glyphs, ${data.relationships.length} relationships.`
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
    "kingdom_archetypes",
    data.archetypes.map((row) => ({
      id: row.id,
      name: row.name,
      teoyube_word: row.teoyubeWord,
      category: row.category,
      identity_statement: row.identityStatement,
      primary_cluster: row.primaryCluster,
      primary_path: row.primaryPath,
      scriptural_models: row.scripturalModels,
      core_words: row.coreWords,
      manifestation_goal: row.manifestationGoal
    })),
    "id"
  );

  await upsert(supabase, "covenant_paths", data.paths, "id");

  await upsert(
    supabase,
    "destiny_maps",
    data.maps.map((row) => ({
      id: row.id,
      name: row.name,
      archetype: row.archetype,
      archetype_name: row.archetypeName,
      path: row.path,
      path_name: row.pathName,
      destination: row.destination,
      sequence: row.sequence,
      meaning: row.meaning
    })),
    "id"
  );

  await upsert(
    supabase,
    "prayer_engine_templates",
    data.prayers.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      category: row.category,
      structure: row.structure,
      example_sequence: row.example_sequence,
      sequence: row.sequence,
      scripture_anchor: row.scriptureAnchor,
      declaration: row.declaration,
      prayer: row.prayer,
      duration: row.duration,
      difficulty: row.difficulty,
      translation: row.translation,
      prayer_meaning: row.prayer_meaning
    })),
    "id"
  );

  await upsert(
    supabase,
    "prayer_journeys",
    data.prayerJourneys.map((row) => ({
      journey_id: row.journeyId,
      name: row.name,
      days: row.days
    })),
    "journey_id"
  );

  await upsert(
    supabase,
    "prayer_recommendation_map",
    Object.entries(data.prayerRecommendationMap).map(([userState, prayerIds]) => ({
      user_state: userState,
      prayer_ids: prayerIds
    })),
    "user_state"
  );

  await upsert(
    supabase,
    "glyph_definitions",
    data.glyphs.map((row) => ({
      word: row.word,
      glyph: row.glyph,
      glyph_name: row.glyphName,
      element: row.element,
      animation: row.animation,
      meaning: row.meaning,
      symbol: row.symbol
    })),
    "word"
  );

  await upsert(supabase, "graph_relationships", data.relationships, "source,relationship,target");

  console.log("Canon seeded.");
}

seedCanon().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
