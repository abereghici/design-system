---
"@abereghici/ui": minor
---

Add `name` to SegmentedControl, so the chosen segment submits with its form. RadioGroup, SegmentedControl and Slider return to their default value when their form resets, and report the next change. Field describes its control from the server HTML, so descriptions are announced before hydration. NumberField's description says that before hydration its form submits the starting value.
