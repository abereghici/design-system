---
"@abereghici/ui": minor
---

Add `selectionMode="multiple"` to Combobox: the list stays open while people choose several Items, shown as tags in the field that Backspace removes from the end, and each value submits with its form. `value`, `defaultValue` and `onValueChange` take a list of values, and `removeLabel` names the tags' remove buttons. The server now renders the chosen Item's text, so the field no longer changes on hydration, and Combobox's description says that before hydration its form submits the starting value whatever is typed.
