import words from "@/data/words.json";
import scriptureCanon from "@/data/scriptureCanon.json";
import promiseClusters from "@/data/promiseClusters.json";
import covenantPaths from "@/data/covenantPaths.json";
import kingdomArchetypes from "@/data/kingdomArchetypes.json";
import destinyMaps from "@/data/destinyMaps.json";
import glyphDefinitions from "@/data/glyphDefinitions.json";
import graphRelationships from "@/data/graphRelationships.json";
import prayers from "@/data/prayers.json";
import tkos from "@/data/tkos.json";
import { createWordCardAdapterProps } from "./adapters/word-card-adapter";
import { createPromiseTable } from "./promises/promise-table";

export function getWords() {
  return words;
}

export function getDailyWord(wordList: any[] = words) {
  const today = new Date().toISOString().slice(0, 10);
  const index =
    today.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    wordList.length;

  return wordList[index];
}

export function getClusters() {
  return promiseClusters;
}

export function getPrayers() {
  return prayers;
}

export function getExploreData() {
  const wordContextKey = (word: any) => String(word?.id || word?.word || word?.teoyubeWord || "Benor");
  return {
    words,
    scriptureCanon,
    promiseClusters,
    covenantPaths,
    kingdomArchetypes,
    destinyMaps,
    glyphDefinitions,
    graphRelationships,
    prayers,
    tkos,
    wordContexts: Object.fromEntries(
      [...words, ...scriptureCanon].map((word: any) => [wordContextKey(word), createWordCardAdapterProps(wordContextKey(word))])
    ),
    promiseTable: createPromiseTable()
  };
}

export function searchTeoyubeData(query: string) {
  const q = query.trim().toLowerCase();
  const data = getExploreData();
  if (!q) return data;

  const includesQuery = (value: unknown) =>
    JSON.stringify(value).toLowerCase().includes(q);

  return {
    words: words.filter(includesQuery),
    scriptureCanon: scriptureCanon.filter(includesQuery),
    promiseClusters: promiseClusters.filter(includesQuery),
    covenantPaths: covenantPaths.filter(includesQuery),
    kingdomArchetypes: kingdomArchetypes.filter(includesQuery),
    destinyMaps: destinyMaps.filter(includesQuery),
    glyphDefinitions: glyphDefinitions.filter(includesQuery),
    graphRelationships: graphRelationships.filter(includesQuery),
    prayers: prayers.filter(includesQuery),
    tkos
  };
}

export function recommendCluster(userNeed: string) {
  const need = userNeed.toLowerCase();

  if (need.includes("peace")) return "Peace & Protection";
  if (need.includes("healing")) return "Healing & Restoration";
  if (need.includes("wisdom")) return "Light & Revelation";
  if (need.includes("purpose")) return "Calling & Purpose";
  if (need.includes("identity")) return "Sonship & Belonging";
  if (need.includes("strength")) return "Peace & Protection";
  if (need.includes("growth")) return "Fruitfulness & Increase";
  if (need.includes("legacy")) return "Legacy & Inheritance";

  return "Calling & Purpose";
}
