---
"@abereghici/ui": minor
---

Parts that looked like another component now render it, so each component ships only its own CSS:

- Tag takes `asChild`.
- AlertDialog.Action and AlertDialog.Cancel are Buttons. While `disabled`, they stay focusable and are announced as unavailable, like any Button.
- Pagination's Previous and Next are IconButtons, so pressing one dispatches `ab-press`.
- The `x` of Alert.Close, Dialog.Close and Popover.Close is an IconButton that still dispatches only `ab-dismiss`.
