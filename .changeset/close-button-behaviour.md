---
"@abereghici/ui": patch
---

Dialog.Close and Popover.Close press as IconButton and Alert.Close do: `disabled` keeps them focusable and announced while blocking presses, and pressing the `x` button dispatches one Feedback event, its `ab-dismiss`.
