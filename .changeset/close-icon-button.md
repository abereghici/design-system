---
"@abereghici/ui": patch
---

Alert.Close, Dialog.Close and Popover.Close render an IconButton, so their `x` button behaves as one: `disabled` keeps it focusable and announced while blocking presses, and a press dispatches the IconButton's `ab-press` as well as the Close's `ab-dismiss`. IconButton's `type` and `disabled` accept `undefined`, so a wrapper can pass button props straight through.
