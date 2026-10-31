---
"@abereghici/ui": patch
---

Slider: a value snaps to the steps counted from `min`, as in NumberField, so a Slider whose `min` has more decimals than its `step` (`min={0.05} step={0.1}`) moves to 0.15 instead of jumping to a value off its own steps.
