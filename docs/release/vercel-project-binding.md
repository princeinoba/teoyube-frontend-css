# Vercel project binding

## Status

- Authorization: `TEOYUBE-ACCELERATED-RELEASE-2026-08-21-001`
- Inspected account: `princeinoba`
- Inspected team: `princeinobas-projects`
- Vercel CLI: `58.0.0`
- Source commit: `72644c45d3e7f2c1918bf4ece21705e75ed4d786`
- Local `.vercel/project.json`: absent
- Result: **BLOCKED_TARGET_AMBIGUITY**

The authenticated team contains three Teoyube-named projects, but none can be selected safely from its name alone:

| Project | Project ID | Current production URL | Current observed purpose | Risk if reused silently |
| --- | --- | --- | --- | --- |
| `teoyube-cooperation` | `prj_biPhkAy6rJDwlAi61GI6DSizYudU` | `https://teoyube-cooperation.vercel.app` | Teoyube Cooperation corporate/product-engineering site | Would replace a distinct public site |
| `teoyube-scripture-intelligence` | `prj_WKcHmnsfdkAI32Hzwb0YxbOERiVW` | Vercel-managed project domain | Scripture Intelligence service/product | Would replace a distinct service |
| `teoyube-phase-1-sntz` | `prj_Hg8SixGmUgA5K2UlDBYO0bAr2EnO` | `https://teoyube-phase-1-sntz.vercel.app` | Historical static Teoyube application | May destroy the currently available hosted rollback/history |

No custom production domain was present in the inspected account. The repository does not contain a binding that resolves which project or domain is the intended home of the current canonical Next application. Creating a fourth Teoyube project without owner selection would violate the instruction not to create duplicate projects silently.

## Required owner selection

Supply one exact project and one exact production domain. The safest option is a new, explicitly named project for the current canonical Next application, leaving all three existing deployments untouched. Example only: project `teoyube-app`, Vercel domain `teoyube-app.vercel.app` (or another owner-selected name/domain).
