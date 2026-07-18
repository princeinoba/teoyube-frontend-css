# Phase 11.6B Search And Promise Table Report

## TeoyubeSearch
Added local tokenized search scoring with:
- token scoring
- simple fuzzy matching
- Scripture match boost
- word match boost
- promise/category boost
- relevance score
- quality score
- explanation path
- fallback reason

Search result actions now hydrate the active response before saving, praying, adding to Promise Table, or opening Graph Explorer.

## Promise Table Workspace
Added:
- manual add form
- status filter
- search rows
- sort rows
- detail drawer
- note edit
- prayer generation
- action start
- Book save
- safe export access

Statuses remain:
Discovered, Studying, Praying, Acting, Witnessing Progress, Testified, Remembered.

## Testimony Rule
The app never automatically selects `Testified`. It only appears through explicit user status selection.

## Safety
Rows remain local session state. No external services, analytics, database, or browser persistence were added.
