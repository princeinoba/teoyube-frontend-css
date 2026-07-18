# Phase 11.6B.1 Undo and Action History Report

Undo is memory-only and capped at 30 entries. Recent action history is capped at 40 sanitized outcomes. Neither is stored in localStorage, cookies, IndexedDB, a database, or an external service.

Supported reversible paths include Promise add/remove/status, registry-based Book/Scripture/word/promise save, journey start, Today action completion, collection item add/remove/delete, and continuation clearing. Existing preference and recommendation controls remain session-only; their older reset paths are preserved.

Successful reversible actions add an Undo button to the existing save drawer. `Undo Last Action` is available in the command palette and with Ctrl/Cmd+Z outside text inputs. QA mode shows recent safe labels, status, and short detail; it never copies raw journal or testimony content into generic history.
