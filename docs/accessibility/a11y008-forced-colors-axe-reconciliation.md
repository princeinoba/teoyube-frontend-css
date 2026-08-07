# A11Y-008 forced-colors axe reconciliation

## Result

All six browser/selector cells produced the same direct reconciliation:

| Browser | Selector | Axe 4.12.1 pair | Computed forced-color pair | Rendered pair | Rendered ratio | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| Playwright Chromium 149.0.7827.55 | D02 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Playwright Chromium 149.0.7827.55 | D05 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Chrome 150.0.7871.187 | D02 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Chrome 150.0.7871.187 | D05 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Edge 150.0.4078.105 | D02 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Edge 150.0.4078.105 | D05 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |

Raw axe nodes, including `any`, `all`, `none`, check data, related nodes, targets, messages, engine metadata, and runner configuration, remain in the measurement JSON. No axe rule was disabled or suppressed.

Native Windows high-contrast mode was **NOT_AVAILABLE** because the existing OS session did not report native forced colors active. The harness did not change operating-system settings. Emulated forced colors reported `forced-colors: active`, resolved `CanvasText`/`Canvas` to black/white, and painted the target black/white.
