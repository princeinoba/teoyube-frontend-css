# Scripture corpus readiness

Status: **READY**

The active `engwebp` corpus passes archive safety, embedded checksum, source/license evidence, 66-book canon, source-marker completeness, deterministic regeneration, zero-warning import, duplicate/empty-verse rejection, generated-artifact hash binding, fixed server-only paths, and 356/356 reference coverage.

The canonical repository provides exact verse, range, supported cross-chapter range, and chapter retrieval; deterministic same-chapter context windows with explicit limitations; lexical search; exact citation validation; typed limits/failures; and version-aware caching. It uses no network, model, embedding, vector store, database, or request-controlled source path.

Five source markers contain only source footnotes and therefore have no displayable main text: Luke 17:36, Acts 8:37, Acts 15:34, Acts 24:7, and Romans 16:25. Requests for those standalone markers return typed missing-coverage results rather than invented text.

Prompt 15B readiness is separate from runtime cutover. Static remains canonical and Next remains preview-only.
