---
"@abereghici/ui": patch
---

ContextMenu now owns where focus returns when it closes and how it tells a pointer open from a keyboard one, and DatePicker and DateRangePicker return focus to their calendar button the same way, so the overlay they share holds no rules for one Component. Nothing changes for consumers.
