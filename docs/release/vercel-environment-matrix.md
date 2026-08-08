# Vercel environment matrix

Status: **PLANNED - not applied because project binding is blocked by target ambiguity**

No secret values are recorded here. No paid provider call is required for this controlled beta.

| Variable | Preview | Production | Exposure | Purpose |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_TEOYUBE_APP_ENV` | `preview` | `production` | Client-safe | Runtime label |
| `NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET` | `vercel-preview` | `vercel-production` | Client-safe | Deployment target label |
| `NEXT_PUBLIC_TEOYUBE_ENABLE_PERSONALIZATION_PREVIEW` | `true` | `true` | Client-safe | Existing local/user-owned preview behavior |
| `NEXT_PUBLIC_TEOYUBE_ENABLE_CONSENT_CONTROLS` | `true` | `true` | Client-safe | Existing consent controls |
| `NEXT_PUBLIC_TEOYUBE_ENABLE_OFFLINE_FALLBACK` | `true` | `true` | Client-safe | Deterministic fallback |
| `NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI` | `false` | `false` | Client-safe | No public debug UI |
| `TEOYUBE_LIVE_AI_ENABLED` | `false` | `false` | Server-only | Disable live model generation |
| `TEOYUBE_VECTOR_RETRIEVAL_ENABLED` | `false` | `false` | Server-only | Disable vector retrieval |
| `TEOYUBE_RESEARCH_MODE_ENABLED` | `false` | `false` | Server-only | Disable research collection |
| `TEOYUBE_ENABLE_EXTERNAL_ANALYTICS` | `false` | `false` | Server-only | Disable external analytics |
| `TEOYUBE_ENABLE_DATABASE_PERSISTENCE` | `false` | `false` | Server-only | Disable external persistence |
| `TEOYUBE_ENABLE_LIVE_AI` | `false` | `false` | Server-only | Fail-safe legacy live-AI flag |
| `TEOYUBE_ENABLE_EXTERNAL_MONITORING` | `false` | `false` | Server-only | Disable external monitoring |
| `TEOYUBE_ENABLE_DURABLE_MEMORY` | `false` | `false` | Server-only | Disable server-side private memory |
| `TEOYUBE_ENABLE_EMBEDDINGS` | `false` | `false` | Server-only | Disable embeddings |
| `TEOYUBE_ENABLE_VECTOR_RETRIEVAL` | `false` | `false` | Server-only | Fail-safe vector flag |
| `TEOYUBE_ENABLE_BROAD_RAG` | `false` | `false` | Server-only | Disable broad RAG |
| `TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER` | `false` | `false` | Server-only | Keep Teo Guide deterministic |

Before applying this matrix, the selected project must be checked against the repository environment schema. Only names accepted by that schema will be set. Provider keys, database URLs, telemetry credentials, and other secrets will not be added for this release mode.
