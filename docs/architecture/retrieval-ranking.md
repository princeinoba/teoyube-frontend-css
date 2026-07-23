# Retrieval ranking

Prompt 20 uses deterministic, inspectable fusion:

```text
0.35 lexical
+ 0.35 normalized vector similarity
+ 0.12 TIG graph match
+ 0.15 trust
+ 0.03 current-journey continuity
```

An exact canonical reference ranks first with exact and trust scores of 1. Vector search is skipped for that path.

Lexical scores are normalized against the best candidate for the query. Cosine similarity is normalized to `[0, 1]`. TIG contributes only when a deterministic candidate label, ID, or Scripture anchor matches the indexed source. Trust is derived from the partition policy. Journey continuity requires an explicit current source ID.

Ties use stable chunk IDs. Final results are diversified by document so multiple chunks from one source do not crowd out other inspectable sources.

Each result exposes the component breakdown, matched terms/concepts, graph path when present, trust label, source version/checksum, selection reasons, limitations, and active index version.

The locked quality gate compares the full hybrid rank to exact + lexical + TIG baseline. It does not compare against a weakened lexical implementation.
