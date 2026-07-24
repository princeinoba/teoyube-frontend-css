# Prompt 21 performance and resource budgets

Source of truth: `config/release-gate-policy.json`.

All figures are local/preview synthetic evidence. Critical metrics may not
regress more than 10% unless the owner reviews a documented nonvisual change.
The approved CSS, image, and media totals are protected and therefore have zero
growth budget in Prompt 21.

| Metric | Baseline | Maximum |
| --- | ---: | ---: |
| Route readiness per parity cell | Existing locked gate | 5,000 ms |
| Three-run visual/performance cells | 216 | 216 PASS |
| Next client JavaScript | 1,896,094 bytes | 2,085,704 bytes |
| Largest client chunk | 886,783 bytes | 975,462 bytes |
| Approved CSS | 948,538 bytes | 948,538 bytes |
| Images | 167,041,108 bytes | 167,041,108 bytes |
| Media | 11,161,794 bytes | 11,161,794 bytes |
| Largest image | 2,554,394 bytes | 2,554,394 bytes |
| Largest media file | 942,235 bytes | 942,235 bytes |
| Local non-AI API p95 | measured by current gate | 250 ms |
| Hybrid retrieval p95 | 304.2182 ms | 334.64 ms |
| Live-AI first approved section | owner-tagged preview evidence | 15,000 ms |
| Live-AI complete response | owner-tagged preview evidence | 20,000 ms |
| Active public vector index | current verified index | 629,145,600 bytes |
| Prompt 21 workspace growth after cleanup | task starting inventory | 524,288,000 bytes |

The performance artifact also records exact Scripture, TIG, memory, hybrid
retrieval, deterministic Teo Guide, vector load, process memory, route/resource
bytes, and workspace storage. Live-provider latency is reused only when Prompt
19K dependency hashes remain valid; no paid call is made solely for metrics.

Client-bundle verification rejects TIG seeds, WEB corpus/index data, vector
indexes, safety fixtures, memory/encryption server code, provider secrets, and
server SDKs.
