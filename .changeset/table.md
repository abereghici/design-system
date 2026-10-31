---
"@abereghici/ui": minor
"@abereghici/tokens": minor
---

Table: a header that stays in view and lifts off the rows once they scroll under it, `loading` with `Table.Skeleton` rows, `Table.Empty` for an EmptyState across all columns, and `SortLabel asChild` for sort links that work before hydration. Row selection, single or multiple, as change requests: `selectionMode` with `selectedKeys` or `defaultSelectedKeys` and `onSelectionChange` on `Table.Root`, a `Table.SelectAll` header cell and a `Table.SelectRow` per row, keyed by its `value`, with the selected rows highlighted from the server HTML. Table renders on the server and works before hydration; row selection works once the page hydrates, and its column hides with JavaScript off. The sticky header's fill and shadow ship as `table-header-background-color` and `table-header-shadow`.
