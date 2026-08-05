# Teoyube formative pilot data dictionary

Status: **DRAFT - MINIMAL DATA SET; RETENTION PENDING OWNER DECISION**

| Field | Type | Purpose | Required | Privacy rule |
| --- | --- | --- | --- | --- |
| `participantId` | string | De-identified linkage | Yes | Random research ID; no name/email |
| `segment` | enum | Ordinary-user or expert analysis | Yes | Approved broad segment only |
| `ageBand` | enum | Confirm adult sample range | Yes | Band only; no birth date |
| `accessibilityAccommodation` | bounded string or null | Prepare volunteered study setup | No | Accommodation only; no diagnosis |
| `technicalConfidence` | enum | Interpret navigation friction | Yes | Low/moderate/high/prefer not to say |
| `aiFamiliarity` | enum | Interpret mode comprehension | Yes | None/limited/comfortable/extensive |
| `bibleAppFamiliarity` | enum | Interpret domain familiarity | Yes | None/limited/comfortable/extensive |
| `sessionDate` | date | Research chronology | Yes | No exact location |
| `moderatorId` | string | Research quality | Yes | Approved operator code |
| `recordingConsent` | object | Separate optional permissions | Yes | Audio/screen/video each explicit |
| `taskId` | enum | Link outcome to task | Yes | `TASK-01` through `TASK-15` |
| `route` | string | Locate product surface | Yes | Public route only |
| `taskResult` | enum | Completion analysis | Yes | success/partial/failure/stopped/skipped |
| `moderatorRescueCount` | integer | Usability evidence | Yes | Nonnegative count |
| `criticalRescue` | boolean | Threshold calculation | Yes | No narrative required |
| `safeErrorCode` | string or null | Reproducible issue category | No | No raw error body or user text |
| `completionSeconds` | integer or null | Diagnose task friction | No | Not an engagement objective |
| `sourceInspectionSuccess` | boolean or null | RQ-03/RQ-04 | As applicable | Content-free outcome |
| `understandingCode` | enum | Authority/mode comprehension | As applicable | Code plus bounded non-sensitive note |
| `consentComprehension` | boolean or null | RQ-06 | As applicable | No memory content |
| `rejectUndoResult` | enum or null | RQ-07 | As applicable | success/partial/failure |
| `clarityRating` | integer 1-5 | Self-reported clarity | Yes | Not a spiritual score |
| `trustRating` | integer 1-5 | Self-reported trust | Yes | Not faith or holiness |
| `spiritualUsefulnessRating` | integer 1-5 | Perceived usefulness | Yes | Does not claim God acted |
| `nonSensitiveFeedback` | bounded string | Qualitative insight | No | Review/redact before storage |
| `accessibilityBarrierId` | string or null | Link de-identified finding | No | No diagnosis/private detail |
| `adverseEventFlag` | boolean | Safety routing | Yes | Details stored only in minimal incident record |
| `withdrawalOrDeletionStatus` | enum | Respect participant choice | Yes | none/requested/completed |

## Prohibited fields and content

Do not create fields or aliases for raw prayer, journal, testimony, memory, check-in, reflection, health diagnosis, trauma, abuse, relationship, crisis, raw prompt, raw model response, API key, access token, session token, password, church membership, holiness, faith score, spiritual rank, divine favor, guilt streak, hidden engagement profile, or personal contact inside analysis data.

Names and recruitment contacts belong in a separate approved system, not this research dataset. Phase 4A creates no participant dataset.
