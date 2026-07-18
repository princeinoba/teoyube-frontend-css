const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "src", "data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
}

function validate() {
  const architecture = readJson("tkosArchitecture.json");
  const growthLevels = readJson("tkosGrowthLevels.json");
  const sampleProfile = readJson("tkosSampleProfile.json");
  const engines = readJson("tkosEngines.json");

  if (architecture.modules.length !== 10) throw new Error("TKOS must define 10 modules.");
  if (growthLevels.length !== 5) throw new Error("TKOS must define 5 growth levels.");
  if (!sampleProfile.userId || !sampleProfile.archetype) {
    throw new Error("TKOS sample profile is missing required fields.");
  }
  if (Object.keys(engines.destinyAssessment).length !== 7) {
    throw new Error("TKOS destiny assessment must define 7 dimensions.");
  }

  return { architecture, growthLevels, sampleProfile, engines };
}

async function seedTkos() {
  const data = validate();
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.log(
      `TKOS validated: ${data.architecture.modules.length} modules, ${data.growthLevels.length} growth levels, ${Object.keys(data.engines.destinyAssessment).length} destiny dimensions.`
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

  const { error: profileError } = await supabase.from("tkos_user_profiles").upsert(
    {
      user_id: data.sampleProfile.userId,
      display_name: data.sampleProfile.displayName,
      created_at: data.sampleProfile.createdAt,
      archetype: data.sampleProfile.archetype,
      primary_path: data.sampleProfile.primaryPath,
      secondary_path: data.sampleProfile.secondaryPath,
      growth_level: data.sampleProfile.growthLevel,
      current_journey: data.sampleProfile.currentJourney,
      recommended_words: data.sampleProfile.recommendedWords,
      recommended_prayers: data.sampleProfile.recommendedPrayers
    },
    { onConflict: "user_id" }
  );
  if (profileError) throw profileError;

  console.log("TKOS seeded.");
}

seedTkos().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
