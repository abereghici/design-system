---
"@abereghici/ui": patch
---

Command.Dialog returns focus to `finalFocus` when it closes with focus left on the page or inside the closed palette, not only on the page, by the same rule as every other Overlay. The Toaster returns focus after Escape or a dismiss by that rule too.
