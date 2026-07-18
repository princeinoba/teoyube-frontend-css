# Teoyube Manual Preview Deployment 2.3 - Preview Issue Triage & Fix Plan

Manual Preview Deployment 2.3 creates the preview issue triage and fix planning layer for Teoyube.

This step takes issues discovered during manual preview URL review and post-deployment QA, classifies them, prioritizes launch-critical blockers, creates safe fix plans, maps regression checks, prepares owner review, and determines readiness for safe fix implementation.

It does not deploy the app, fetch preview URLs, apply production fixes automatically, connect providers, or write issue data externally.

## Current Status

Phase 5B.2 - Intelligence Graph Seeds & Engines: 100% Complete
Phase 5B.3 - Production Intelligence Layer: 100% Complete
Phase 6 - Personalization & AI Learning: 100% Complete
Phase 7 - Mobile & Scale: 100% Complete
Production Launch Preparation: 100% Complete

Current stage: Soft Launch Preparation

Completed manual preview steps:

- 2.1 - Provider Setup, Environment Verification & Preview Deployment Runbook Execution
- 2.2 - Preview URL Verification & Post-Deployment QA
- 2.3 - Preview Issue Triage & Fix Plan
- 2.4 - Safe Fix Implementation & Regression Verification

Current step: 3.3 - Final Soft Launch Readiness Package & Go/No-Go: Complete

Next recommended step: 4.1 - Controlled Launch Activation Checklist

## What This Step Adds

- Issue triage contracts
- Issue classifier
- Issue triage engine
- Fix plan generator
- Fix plan safety validator
- Regression check mapper
- Issue resolution tracker
- Fix implementation readiness
- Owner review module
- Manual Preview Deployment 2.3 audit
- Example
- Smoke check
- Documentation

## Issue Categories

The 2.3 issue contracts support these categories:

- build
- environment
- route
- mobile_ui
- accessibility
- tig_response
- scripture_anchor
- explanation_path
- fallback
- confidence
- consent
- feedback_controls
- personalization
- offline
- privacy
- debug_safety
- security
- content_clarity
- performance
- unknown

Severity levels are:

- low
- medium
- high
- critical
- unknown

Statuses are:

- new
- triaged
- planned
- in_progress
- fixed
- verified
- deferred
- blocked
- wont_fix
- unknown

## Launch-Critical Issue Rules

The classifier treats these as launch-critical or soft-launch-blocking:

- Missing Scripture anchor
- Missing explanation path
- Unsafe or empty fallback response
- Consent controls missing where personalization appears
- Raw sensitive text displayed or stored
- Debug payload visible to normal users
- External analytics unexpectedly sending
- Production persistence unexpectedly enabled
- Live AI orchestration unexpectedly enabled
- Broken mobile layout on key surfaces
- Critical accessibility blocker
- Page crash or blank state on key surfaces

## Issue Triage Process

The triage engine:

- Classifies every issue
- Groups issues by category
- Groups issues by surface
- Separates blockers from warnings
- Identifies safety-critical issues
- Identifies soft-launch blockers
- Identifies deferrable issues
- Produces a clear priority order

The triage report is in-memory only. It does not write files, send analytics, write to a database, fetch URLs, or call external services.

## Fix Plan Generation

The fix plan generator creates a safe plan for each issue. Each plan includes:

- Issue id
- Category
- Severity
- Affected surface
- Recommended fix summary
- Safe implementation notes
- Risk level
- Regression checks
- Owner review requirement
- Launch impact
- Soft launch blocker status

Examples:

- Missing Scripture anchor: restore Scripture evidence and verify TIG explanation path.
- Missing explanation path: ensure production response includes a traceable graph path.
- Unsafe fallback: replace with a Scripture-anchored safe fallback.
- Mobile overflow: patch layout with responsive stacking and wrapping.
- Debug payload exposed: hide debug behind an explicit developer-only flag such as showDebugInfo.
- Consent controls missing: restore consent controls or disable personalization preview on that surface.

## Fix Plan Safety Validation

The safety validator blocks fix plans that would:

- Remove Scripture anchors
- Remove explanation paths
- Weaken fallback safety
- Hide consent controls
- Enable hidden personalization
- Enable external analytics
- Enable production persistence
- Enable live AI orchestration
- Expose secrets
- Store raw sensitive text
- Claim divine certainty

This keeps Teoyube Scripture-anchored, consent-aware, explainable, confidence-aware, fallback-safe, accessible, privacy-protective, and reversible.

## Regression Check Mapping

The regression mapper connects issue categories to required validation:

- Scripture anchor issue: Scripture/explanation verification
- Explanation path issue: TIG production QA
- Fallback issue: fallback/offline verification
- Consent issue: consent/privacy verification
- Mobile issue: mobile/accessibility verification
- Accessibility issue: accessibility audit
- Debug issue: launch safety review
- Environment issue: environment safety audit
- Build issue: build verification
- Privacy issue: final safety certification

## Issue Resolution Tracker

The resolution tracker records:

- Issues
- Fix plans
- Status updates
- Regression verifications
- Unresolved blockers
- Resolution summary

It is manual and in-memory only. It does not write issue data to files, databases, analytics, localStorage, cookies, IndexedDB, or external services.

## Owner Review Process

The owner review module provides structured manual approval. It checks:

- Critical blockers reviewed
- Scripture anchor issues reviewed
- Explanation path issues reviewed
- Fallback safety issues reviewed
- Consent/privacy issues reviewed
- Mobile/accessibility issues reviewed
- Fix priorities accepted
- Deferred issues accepted
- Soft launch blocker list accepted
- Next fix step approved

No signature is required.

## What This Step Does Not Include

- Actual deployment
- Preview URL fetching
- Automatic production fixes
- Database persistence
- External analytics sending
- Live AI orchestration
- Service worker implementation
- Native mobile app build
- Paid infrastructure
- Production monitoring connection

## Next Step

Manual Preview Deployment Execution 2.5 - Preview Re-Check & Soft Launch Candidate Confirmation.

Step 2.5 should re-check the preview and confirm the soft launch candidate only after approved fixes and mapped regression checks remain safe.
