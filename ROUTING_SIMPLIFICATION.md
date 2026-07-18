# Teoyube Simplified App Structure

## Final User-facing Routes

- `/` - Home Dashboard with Daily Word, Promise Cluster, Prayer Companion, and Journal cards.
- `/explore` - Unified exploration page for words, clusters, paths, archetypes, Scripture, glyphs, destiny maps, and graph relationships.
- `/compass` - TeoyubeWorld video search and spiritual media hub.
- `/prayer` - Prayer Library plus companion-style prayer recommendation flow.
- `/journal` - Reflection prompts and journal entry form.
- `/profile` - Archetype, journey, growth level, and saved focus words.

## Merged or Removed Routes

- `/dashboard` merged into `/`.
- `/daily-word` merged into the Dashboard card and Explore data.
- `/words` merged into `/explore`.
- `/clusters` merged into `/explore`.
- `/companion` merged into `/prayer`.

## Reusable Components

- `DashboardCard`
- `DataGrid`
- `ExploreTabs`
- `WordCard`
- `ClusterCard`
- `PrayerCard`
- `JournalForm`
- `SearchFilter`
- `NavBar`
- `TeoyubeCard`

## Consolidated Data Files

- `data/words.json`
- `data/scriptureCanon.json`
- `data/promiseClusters.json`
- `data/covenantPaths.json`
- `data/kingdomArchetypes.json`
- `data/destinyMaps.json`
- `data/glyphDefinitions.json`
- `data/graphRelationships.json`
- `data/prayers.json`
- `data/tkos.json`

## Data Access Layer

All page and API reads should go through `lib/teoyubeData.ts`:

- `getWords()`
- `getDailyWord()`
- `getClusters()`
- `getPrayers()`
- `getExploreData()`
- `searchTeoyubeData(query)`
- `recommendCluster(userNeed)`

## Internal-only Material

MVP launch plans, build order, and brand identity records should remain documentation/config material rather than user-facing app pages.
