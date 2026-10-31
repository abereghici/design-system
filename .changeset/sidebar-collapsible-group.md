---
"@abereghici/ui": minor
---

Sidebar.Group no longer takes `collapsible` or `defaultOpen`. For a group people can fold, write `<Sidebar.CollapsibleGroup label="Settings" defaultOpen>` instead. It is built on Disclosure, so it also takes `open` and `onOpenChange` (which can cancel the change; type its `details` as `Sidebar.ChangeEventDetails`), opens for find-in-page, and dispatches `ab-toggle` with `component: "Sidebar"`.
