---
"@abereghici/ui": minor
---

Grid: Add `columns` and `areas`, each one value or one per breakpoint (`initial`, `sm`, `md`, `lg`), resolved with container queries at the `breakpoint-*` values. `Grid.Item` places a child in a named area; `Grid.Item<typeof areas>` rejects an area the layout doesn't declare. Grid is now a compound: render `Grid.Root` where you rendered `Grid`. Without `columns` or `areas`, it keeps fitting as many columns as `min` allows.
