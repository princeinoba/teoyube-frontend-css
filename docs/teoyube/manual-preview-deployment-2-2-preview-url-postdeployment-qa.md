# Teoyube Manual Preview Deployment 2.2 - Preview URL Verification & Post-Deployment QA

Manual Preview Deployment 2.2 creates the post-deployment QA and preview URL verification layer for Teoyube.

This step supports a manually created preview deployment by allowing a human reviewer to record a preview URL, verify URL assumptions, review major surfaces, record QA results, and bridge warnings or failures into the in-memory preview issue log.

It does not deploy the app and does not fetch the preview URL.

## Current Status

Phase 5B.2 - Intelligence Graph Seeds & Engines: 100% Complete
Phase 5B.3 - Production Intelligence Layer: 100% Complete
Phase 6 - Personalization & AI Learning: 100% Complete
Phase 7 - Mobile & Scale: 100% Complete
Production Launch Preparation: 100% Complete

Current stage: Soft Launch Preparation

Completed manual preview steps:

- 2.1 - Provider Setup, Environment Verification & Preview Deployment Runbook Execution

Current step: 3.3 - Final Soft Launch Readiness Package & Go/No-Go: Complete

Next recommended step: 4.1 - Controlled Launch Activation Checklist

## What This Step Adds

- Preview URL verification contracts
- URL verification module
- Postdeployment QA contracts
- Postdeployment QA runner
- Surface postdeployment checklist
- Scripture/explanation verification
- Consent/privacy verification
- Mobile/accessibility verification
- Fallback/offline verification
- Postdeployment issue bridge
- Postdeployment QA audit
- Example
- Smoke check
- Documentation

## Preview URL Verification Process

The URL verification layer supports manually supplied preview URL information.

It checks:

- URL exists when postdeployment QA is being recorded
- URL has a valid format
- URL appears to be a preview URL, not an unintended production domain
- URL does not contain secret-looking tokens
- URL is not hardcoded into app logic
- URL should be reviewed manually in a browser
- URL should not be fetched by code
- URL is documented only as a manual QA reference
- Environment profile is attached
- Deployment provider is attached

The module never fetches, crawls, or calls the preview URL.

## Post-Deployment QA Runner

The QA runner records manual QA results in memory only.

It supports:

- Canon
- Daily Word
- Prayer
- Calling Compass
- Promise Cluster
- AI Companion
- Onboarding
- TIG Response Panel
- TIG Graph Preview
- Personalization Preview Panel
- Consent Controls
- Feedback Controls
- Offline Fallback
- Mobile Navigation
- Error/Fallback States

Each QA result can include:

- surface
- check id
- status
- redacted notes
- blocker flag
- warning flag
- mobile result
- accessibility result
- Scripture anchor result
- explanation path result
- fallback result
- confidence label result
- consent result
- debug safety result
- privacy result

## Surface Postdeployment Checklist

Every major surface checklist verifies:

- surface loads in preview
- mobile layout is usable
- desktop layout is usable
- Scripture anchor is visible or accessible
- explanation path is visible or accessible
- fallback state is safe and non-empty
- confidence label is visible where applicable
- consent controls are visible where personalization appears
- feedback controls are usable where applicable
- debug payload is hidden from normal users
- no raw sensitive data appears
- no external provider is required for safe render
- error state uses safe fallback language
- accessibility basics are reviewed

## Scripture And Explanation Verification

The Scripture/explanation verification module treats the following as launch-critical:

- missing Scripture anchor
- missing explanation path
- promise displayed without Scripture support
- prayer displayed without explanation path
- action step displayed without explanation path
- fallback displayed without Scripture-anchored explanation
- confidence label shown without reason or context
- claim of divine certainty

## Consent And Privacy Verification

The consent/privacy verifier checks:

- personalization is visibly consent-aware
- consent controls are available
- disable/reset/export/delete simulation controls remain clear where present
- raw text storage is disabled by default
- hidden personalization is not introduced
- external analytics are not sending
- production persistence is not enabled
- live AI orchestration is not enabled
- debug output is hidden from normal users

## Mobile And Accessibility Verification

The mobile/accessibility verifier provides a manual viewport plan:

- small mobile
- large mobile
- tablet
- desktop

It checks:

- no major horizontal overflow
- cards stack correctly
- Scripture/prayer text wraps
- buttons are touch-friendly
- graph preview does not require tiny labels
- explanation path remains readable
- consent and feedback controls are easy to use
- debug information is hidden by default
- focus and label basics are acceptable for launch review

## Fallback And Offline Verification

The fallback/offline verifier checks:

- fallback response is never empty
- fallback remains Scripture-anchored
- fallback includes explanation path
- fallback does not overstate confidence
- offline-safe fallback is available as a safe path
- no live AI is required for safe fallback
- no database is required for safe fallback
- no external analytics is required for safe fallback

## Issue Log Bridge

The postdeployment issue bridge converts failed or warning QA results into existing preview issue log items.

This remains in-memory only. It does not write issues externally, send analytics, or store issues in a database.

## Human Manual Actions

A human must still:

- create the preview deployment manually
- record the preview URL manually
- open the preview URL manually in a browser
- review each launch-critical surface manually
- record QA results manually
- review warnings and blockers before preview review

## This Step Does Not Include

- actual deployment
- preview URL fetching
- database persistence
- external analytics sending
- live AI orchestration
- service worker implementation
- native mobile app build
- paid infrastructure
- production monitoring connection

## Next Step

Manual Preview Deployment Execution 2.5 - Preview Re-Check & Soft Launch Candidate Confirmation.

Step 2.4 should implement only approved, scoped, safe fixes and rerun mapped regression checks before any broader preview sharing.
