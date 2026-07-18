# Teoyube Manual Preview Deployment 2.1 - Provider Setup, Environment Verification & Preview Deployment Runbook Execution

Manual Preview Deployment 2.1 begins the guarded preview deployment stage after Production Launch Preparation reached 100% completion.

This step prepares Teoyube for the first real preview deployment by documenting provider setup, validating preview-safe environment configuration, recording local checks, preparing an execution record, evaluating go/no-go readiness, and creating a manual deployment runbook.

It does not deploy the app.

## Current Status

Phase 5B.2 - Intelligence Graph Seeds & Engines: 100% Complete
Phase 5B.3 - Production Intelligence Layer: 100% Complete
Phase 6 - Personalization & AI Learning: 100% Complete
Phase 7 - Mobile & Scale: 100% Complete
Production Launch Preparation: 100% Complete

Current stage: Soft Launch Preparation

Current step: 3.3 - Final Soft Launch Readiness Package & Go/No-Go: Complete

Next recommended step: 4.1 - Controlled Launch Activation Checklist

## What This Step Adds

- Manual preview deployment contracts
- Provider setup helper
- Preview environment verification
- Local check result recorder
- Deployment execution record
- Manual preview go/no-go module
- Manual deployment runbook
- Postdeployment checklist
- Manual preview deployment audit
- Example
- Smoke check
- Documentation

## Provider Setup Checklist

The provider setup helper supports:

- Vercel
- Netlify
- Render
- Railway
- Self-hosted
- Custom
- Undecided
- Unknown

The recommended first preview provider is Vercel because the project is a Next.js app and Vercel has first-class preview deployment support. This is a recommendation only; no provider account is connected by this step.

Each provider report includes:

- Expected install command
- Expected build command
- Expected output directory where relevant
- Environment variable setup guidance
- Preview deployment support notes
- Rollback notes
- Known risks
- Manual setup steps

## Preview Environment Verification

The environment verification module checks that preview deployment keeps these safety boundaries:

- Scripture anchoring required
- Explanation path required
- Fallback path enabled
- Safety guardrails enabled
- Consent controls enabled
- Personalization preview enabled only when consent-aware
- External analytics sending disabled
- Production persistence disabled
- Live AI orchestration disabled
- Raw text storage disabled
- Debug UI disabled for public preview
- No secret-looking values exposed in public variables

The verifier reports variable names only. It must not print real secret values.

## Local Checks

The local check recorder can track:

- Package install verified manually
- Typecheck
- Lint
- Build
- Test, if available
- Launch smoke checks
- Final launch preparation audit
- Final safety certification
- Manual preview deployment audit

This module only records and summarizes results. CLI commands must be run separately.

## Deployment Execution Record

The execution record tracks:

- Selected provider
- Selected environment profile
- Local checks completed
- Manual deployment command prepared
- Preview URL manually recorded, if available
- Postdeployment checks pending or complete
- Blockers
- Warnings
- Next action

The execution record is in-memory only. It does not fetch URLs, write files, or send records externally.

## Manual Preview Go/No-Go

The go/no-go module evaluates:

- Provider selection
- Environment verification
- Local build checks
- Launch quality gates
- Final launch safety certification
- Final readiness package
- No external analytics
- No production persistence
- No live AI orchestration
- No exposed secrets
- Scripture anchoring
- Explanation paths
- Fallback readiness
- Consent controls

Expected decisions are:

- ready_for_manual_provider_deployment
- ready_after_environment_review
- blocked
- needs_provider_selection
- needs_build_fix
- needs_environment_fix

## Manual Deployment Runbook

The runbook separates responsibilities clearly:

- Commands Codex may run locally: typecheck, lint, build, test, and smoke checks where available
- Commands a human must run manually: provider setup and provider preview deployment
- Environment values that must be configured manually in the provider dashboard
- Post-preview checks that must be completed after deployment
- Rollback actions if the preview behaves unsafely

The runbook prepares human-only deployment commands but does not execute them.

## Postdeployment Checklist

The postdeployment checklist is for step 2.2 after a preview URL exists. It includes:

- Preview app loads
- Canon loads
- Daily Word loads
- Prayer loads
- Calling Compass loads
- Promise Cluster loads
- AI Companion loads
- TIG Response Panel works
- Scripture anchors visible
- Explanation paths visible
- Fallback behavior safe
- Confidence labels visible
- Consent controls available
- Feedback controls available
- Mobile layout usable
- Accessibility basics reviewed
- Debug UI hidden
- No external analytics confirmed
- No database persistence confirmed
- No live AI orchestration confirmed

## Human Manual Actions

A human must still:

- Choose or confirm the deployment provider
- Configure provider project settings
- Enter environment values in the provider dashboard
- Run provider deployment manually only after approval
- Record the preview URL manually
- Run postdeployment QA against the preview URL
- Decide whether to continue toward the next stage

## This Step Does Not Include

- Actual deployment
- Database persistence
- External analytics sending
- Live AI orchestration
- Service worker implementation
- Native mobile app build
- Paid infrastructure
- Production monitoring connection

## Follow-Up Status

Manual Preview Deployment Execution 2.2 - Preview URL Verification & Post-Deployment QA and 2.3 - Preview Issue Triage & Fix Plan are now complete.

The next recommended step is Limited Soft Launch Execution 4.1 - Controlled Launch Activation Checklist.
