---
"@abereghici/ui": patch
---

Components that hold their own value or open state, or follow the app's, now share one implementation of it, form reset included; Stack and Inline share one body, and the date and time components one cache of locale formats. Nothing changes for consumers.
