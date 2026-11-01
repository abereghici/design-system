---
"@abereghici/ui": patch
---

IconButton, Dialog.Close and Popover.Close with `asChild` no longer run their child's own `onClick` while disabled, as Button already didn't: a disabled control reports no press to anyone, as a disabled `<button>` dispatches no click.
