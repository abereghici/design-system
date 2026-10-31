---
"@abereghici/ui": patch
---

The shared internals do one job per module: `asChild` rendering, prop merging and ref composition are separate modules, as are the checkbox click, the radio group choice and the multi-value selection list, and ToggleButtonGroup owns the context its ToggleButtons read. Nothing changes for consumers.
