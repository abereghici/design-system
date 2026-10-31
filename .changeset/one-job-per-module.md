---
"@abereghici/ui": patch
---

The shared internals do one job per module: `asChild` rendering, prop merging, handler chaining and ref composition are separate modules, as are the checkbox click, the radio group choice, the multi-value selection list, typeahead, the invoker-command types and the date pickers' contexts, and ToggleButtonGroup owns the context its ToggleButtons read. Nothing else changes for consumers, but for NumberField's step buttons, whose `aria-controls` now names the input's own `id`, one you pass included.
