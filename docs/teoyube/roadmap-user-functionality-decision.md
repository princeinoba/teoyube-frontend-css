# Roadmap User Functionality Decision

## Classification

**B. Owner/developer-only**

## Evidence

The surviving Roadmap view is an implementation dashboard. Its primary content includes internal phases, module completion percentages, architecture/API plans, integration counts, deployment readiness, project structure, database seeds, AI prompts, and developer build status.

The page does not currently:

- derive milestones from the Saint's active local journey;
- show completed and upcoming user steps;
- continue an active journey;
- connect a milestone to a normal user action;
- explain a user-facing Teoyube path using current local state.

Its clickable surfaces expose technical details rather than a user journey. Restoring the page only because it appears in an earlier screenshot would conflict with the owner requirement that normal navigation contain genuine user functionality.

## Decision

- Keep Roadmap out of the normal sidebar and mobile navigation.
- Keep Roadmap out of the normal command palette.
- Preserve its source, renderer, styles, and documentation.
- Keep it accessible in local owner/QA mode through `?qa=1#roadmap`.
- Do not delete or redesign it in this focused recovery.

This decision can be revisited when Roadmap is rebuilt around actual local journey progress and user actions.
