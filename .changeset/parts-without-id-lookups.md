---
"@abereghici/ui": patch
---

Tooltip, Popover, DropdownMenu, ContextMenu, Combobox and the date pickers find their own parts without `document.getElementById`: through a ref, the trigger's `commandfor` link, or an escaped selector. Nothing changes for consumers.
