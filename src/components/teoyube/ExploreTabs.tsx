"use client";

import { useMemo, useState } from "react";
import ClusterCard from "@/components/ClusterCard";
import DataGrid from "@/components/DataGrid";
import SearchFilter from "@/components/SearchFilter";
import TeoyubeCard from "@/components/TeoyubeCard";
import WordCard from "@/components/WordCard";
import PromiseTablePreview from "@/components/PromiseTablePreview";

const tabs = [
  "Words",
  "Clusters",
  "Promise Table",
  "Paths",
  "Archetypes",
  "Scripture",
  "Glyphs",
  "Destiny",
  "Graph"
];

function matchesQuery(item: unknown, query: string) {
  return JSON.stringify(item).toLowerCase().includes(query.toLowerCase());
}

export default function ExploreTabs({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState("Words");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return data;

    return {
      ...data,
      words: data.words.filter((item: any) => matchesQuery(item, q)),
      promiseClusters: data.promiseClusters.filter((item: any) => matchesQuery(item, q)),
      covenantPaths: data.covenantPaths.filter((item: any) => matchesQuery(item, q)),
      kingdomArchetypes: data.kingdomArchetypes.filter((item: any) => matchesQuery(item, q)),
      scriptureCanon: data.scriptureCanon.filter((item: any) => matchesQuery(item, q)),
      glyphDefinitions: data.glyphDefinitions.filter((item: any) => matchesQuery(item, q)),
      destinyMaps: data.destinyMaps.filter((item: any) => matchesQuery(item, q)),
      graphRelationships: data.graphRelationships.filter((item: any) => matchesQuery(item, q))
    };
  }, [data, query]);

  return (
    <section>
      <SearchFilter value={query} onChange={setQuery} />
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            className={tab === activeTab ? "tab active" : "tab"}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Words" && (
        <DataGrid>
          {filtered.words.map((word: any) => (
            <WordCard key={word.id || word.word} word={word} />
          ))}
        </DataGrid>
      )}

      {activeTab === "Clusters" && (
        <DataGrid>
          {filtered.promiseClusters.map((cluster: any) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </DataGrid>
      )}

      {activeTab === "Promise Table" && (
        <PromiseTablePreview initialQuery={query} maxRows={8} />
      )}

      {activeTab === "Paths" && (
        <DataGrid>
          {filtered.covenantPaths.map((path: any) => (
            <TeoyubeCard key={path.id} title={path.name}>
              <p>
                <strong>Sequence:</strong> {path.sequence.join(" -> ")}
              </p>
              <p>
                <strong>Scripture Flow:</strong> {path.scriptureFlow.join(", ")}
              </p>
            </TeoyubeCard>
          ))}
        </DataGrid>
      )}

      {activeTab === "Archetypes" && (
        <DataGrid>
          {filtered.kingdomArchetypes.map((archetype: any) => (
            <TeoyubeCard key={archetype.id} title={archetype.name}>
              <p>
                <strong>Word:</strong> {archetype.word}
              </p>
              <p>
                <strong>Path:</strong> {archetype.path}
              </p>
              <p>
                <strong>Core Words:</strong> {archetype.coreWords.join(", ")}
              </p>
            </TeoyubeCard>
          ))}
        </DataGrid>
      )}

      {activeTab === "Scripture" && (
        <DataGrid>
          {filtered.scriptureCanon.map((entry: any) => (
            <WordCard key={entry.id} word={entry} />
          ))}
        </DataGrid>
      )}

      {activeTab === "Glyphs" && (
        <DataGrid>
          {filtered.glyphDefinitions.map((glyph: any) => (
            <TeoyubeCard key={`${glyph.word}-${glyph.glyph}`} title={glyph.word}>
              <p>
                <strong>Glyph:</strong> {glyph.glyphName}
              </p>
              <p>
                <strong>Element:</strong> {glyph.element}
              </p>
              <p>
                <strong>Animation:</strong> {glyph.animation}
              </p>
            </TeoyubeCard>
          ))}
        </DataGrid>
      )}

      {activeTab === "Destiny" && (
        <DataGrid>
          {filtered.destinyMaps.map((map: any) => (
            <TeoyubeCard key={map.id} title={map.name}>
              <p>
                <strong>Archetype:</strong> {map.archetypeName}
              </p>
              <p>
                <strong>Path:</strong> {map.pathName}
              </p>
              <p>
                <strong>Destination:</strong> {map.destination}
              </p>
            </TeoyubeCard>
          ))}
        </DataGrid>
      )}

      {activeTab === "Graph" && (
        <DataGrid>
          {filtered.graphRelationships.map((relationship: any, index: number) => (
            <TeoyubeCard key={`${relationship.source}-${relationship.target}-${index}`} title={relationship.relationship || "Relationship"}>
              <p>
                <strong>Source:</strong> {relationship.source}
              </p>
              <p>
                <strong>Target:</strong> {relationship.target}
              </p>
            </TeoyubeCard>
          ))}
        </DataGrid>
      )}
    </section>
  );
}
