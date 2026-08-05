# Research data dictionary

Machine source: `config/research-field-policy.json`

Each stored record uses exactly these categories:

- identity boundary: opaque study, participant, session, task, event, scenario, and deletion identifiers;
- registry boundary: schema, study, event, and retention versions;
- safe outcome: route, capability, fixed result, fixed completion status, bounded rescue count, optional safe issue code, optional volunteered accessibility mode, optional bounded rating, and duration bucket;
- provenance: consent record IDs and canonical source IDs;
- integrity: previous event hash and event hash;
- separation: cohort.

Raw time is not an outcome; duration is bucketed. Ratings are 1–5 and apply only to clarity or trust. Scripture is referenced as a canonical source ID such as `WEB:Ephesians.1.18`; text is never stored.

The machine policy rejects unknown fields, free-form payloads, all listed spiritual/private text aliases, contact data, health/diagnosis/trauma/abuse/crisis fields, raw search/model/tool data, secrets, network identifiers, precise location, and spiritual-score fields. Prohibited keys fail at any depth. Email, phone, key, bearer-token, JWT, coordinate, and multiline patterns fail closed.
