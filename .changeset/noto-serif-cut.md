---
"@abereghici/tokens": minor
---

Noto Serif: Ship the font cut to the weights the type roles use (400–500) at its normal width, so `NotoSerif-latin.woff2` drops from 101 KB to 34 KB; its `@font-face` rules now declare `font-weight: 400 500` and no `font-stretch`. `--ab-font-family-noto-serif` gains a metric-matched `"Noto Serif Fallback"` (Times New Roman or Liberation Serif, resized to Noto Serif's metrics) before Georgia, so text doesn't shift when the font arrives.
