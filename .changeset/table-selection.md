---
"@abereghici/ui": minor
"@abereghici/tokens": minor
---

Table: a header that stays in view and lifts off the rows once they scroll under it, `loading` with `Table.Skeleton` rows, `Table.Empty` for an EmptyState across all columns, and `SortLabel asChild` for sort links that work before hydration. Table is plain HTML and CSS, and ships no script. TableSelection adds single or multiple row selection around a Table, as change requests: `TableSelection.SelectAll` and a `TableSelection.SelectRow` per row, keyed by its `value`, with the selected rows highlighted from the server HTML. The sticky header's fill and shadow ship as `table-header-background-color` and `table-header-shadow`.
