---
"@abereghici/ui": patch
---

Components that hold their own value or open state, or follow the app's, now share one implementation of it, form reset included, so a DateRangePicker or a range Slider resets once per form reset; Stack and Inline share one body, DatePicker and DateRangePicker one calendar button and panel, and the date and time components one cache of locale formats. Nothing changes for consumers.
