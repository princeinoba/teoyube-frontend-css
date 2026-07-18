# Phase 11.5 Consent UI Report

The Personalization Center now provides explicit consent controls.

## Modes

- Off / Standard Scripture Path: default. No preference signals affect recommendations.
- Session-only Personalization: uses visible feedback and saved journey memory from the current running session.
- Profile Preview Personalization: uses safe structured profile fields plus visible session hints as a preview.

## Status Surface

The center displays:

- Personalization enabled or disabled
- Session-only enabled or disabled
- Profile-preview enabled or disabled
- Raw text storage disabled
- Signal storage local/session only
- External analytics disabled
- Database persistence not connected
- Live AI not connected

## Controls

- Enable Session-only Personalization
- Enable Profile Preview
- Disable Personalization
- Reset Preferences
- Export Personalization Data
- Delete Personalization Data
- Remove Selected Hint
- Clear Session Signals

## Defaults

Personalization is off by default in `defaultState.consentState.personalization`.
