# Phase 11.6B.1 Responsive QA Lab Report

QA mode now includes a local constrained iframe lab for 360, 390, 430, 768, 1024, and 1280px. The iframe receives `embedded=1`, which suppresses nested QA extensions while leaving the app and Promise dialog functional.

The lab reports selected width, document horizontal overflow, sidebar state, insight-rail state, open modal, and visible controls below the 44px touch-target threshold. It can navigate its preview to Promise Table and open Add Promise at 390px.

The lab uses only the current local URL and does not read cookies, browser storage, secrets, or raw private text. It supplements browser testing; it is not represented as physical-device coverage.
