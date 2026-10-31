---
"@abereghici/ui": patch
---

IconButton is announced as unavailable while `loading`, as Button already was, not only while `disabled`. Button, IconButton, ToggleButton and Alert.Close share one rule for a disabled press: it stays focusable, it is announced as unavailable and a press does nothing, and an `aria-disabled` you pass wins.
