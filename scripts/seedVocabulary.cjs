const fs = require("fs");
const path = require("path");

const vocabularyPath = path.join(__dirname, "..", "src", "data", "coreTeoyubeVocabulary.json");
const vocabularyPart3Path = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "coreTeoyubeVocabulary-part3.json"
);
const requiredFields = [
  "word",
  "pronunciation",
  "meaning",
  "category",
  "scripture_sources",
  "promise_category",
  "prayer_use",
  "animation_symbol",
  "related_words"
];

function readVocabulary() {
  const vocabulary = JSON.parse(fs.readFileSync(vocabularyPath, "utf8"));
  if (!fs.existsSync(vocabularyPart3Path)) {
    return vocabulary;
  }

  const part3 = JSON.parse(fs.readFileSync(vocabularyPart3Path, "utf8"));
  return [...vocabulary, ...part3];
}

function validateVocabulary(vocabulary) {
  if (!Array.isArray(vocabulary)) {
    throw new Error("Vocabulary file must contain a JSON array.");
  }

  const words = new Set();
  const errors = [];

  vocabulary.forEach((entry, index) => {
    requiredFields.forEach((field) => {
      if (!(field in entry)) {
        errors.push(`${index}:${entry.word || "UNKNOWN"} is missing ${field}`);
      }
    });

    if (entry.word) {
      if (words.has(entry.word)) {
        errors.push(`${index}:${entry.word} is duplicated`);
      }
      words.add(entry.word);
    }

    if (!Array.isArray(entry.scripture_sources)) {
      errors.push(`${index}:${entry.word} scripture_sources must be an array`);
    }

    if (!Array.isArray(entry.related_words)) {
      errors.push(`${index}:${entry.word} related_words must be an array`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Vocabulary validation failed:\n${errors.join("\n")}`);
  }
}

async function seedVocabulary() {
  const vocabulary = readVocabulary();
  validateVocabulary(vocabulary);

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.log(`Vocabulary validated: ${vocabulary.length} words.`);
    console.log("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to seed Supabase.");
    return;
  }

  let createClient;
  try {
    ({ createClient } = await import("@supabase/supabase-js"));
  } catch (error) {
    throw new Error(
      "Install @supabase/supabase-js before seeding Supabase: npm install @supabase/supabase-js"
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { error } = await supabase
    .from("core_teoyube_vocabulary")
    .upsert(vocabulary, { onConflict: "word" });

  if (error) {
    throw error;
  }

  console.log(`Vocabulary seeded: ${vocabulary.length} words.`);
}

seedVocabulary().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
