# Table

Data in rows and columns that the user reads and compares: invoices, usage per month, a list of members with their roles. It is static: cells are not focusable, and any Button, Link or Checkbox inside a cell is its own tab stop. A column can be sortable (a `SortLabel` button in its header, `aria-sort` on the sorted one) and rows selectable (a column of native Checkboxes). For a short list of labelled values use a description list; for a spreadsheet-like grid the user moves through with arrow keys, use a grid (not part of this component).

```tsx
import { ScrollArea } from "@platform/ui/scroll-area";
import { Table } from "@platform/ui/table";

<ScrollArea>
  <Table.Root>
    <Table.Caption>Invoices, 2026</Table.Caption>
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeader>Invoice</Table.ColumnHeader>
        <Table.ColumnHeader>Status</Table.ColumnHeader>
        <Table.ColumnHeader className={styles.amount}>Amount</Table.ColumnHeader>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.RowHeader>INV-001</Table.RowHeader>
        <Table.Cell>Paid</Table.Cell>
        <Table.Cell className={styles.amount}>€250.00</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table.Root>
</ScrollArea>;
```

Status: draft for brand-owner review (phase 3). No source guide: drafted from the brand principles (Quiet, Compact), the base stylesheet's tabular figures, the APG Table pattern and the reference libraries.

## Anatomy

Root (table) → Caption → Header (thead) → Body (tbody) → Rows → ColumnHeader / RowHeader / Cell.

- **Root.** A native `<table>`, `inline-size: 100%`, `border-collapse: collapse`. Numbers use tabular figures from the base stylesheet (`:where(table, time, output, data) { font-variant-numeric: tabular-nums; }`). No fill, border or radius: in-flow content (brand principle 5, "Flat in flow").
- **Caption.** A native `<caption>`, the table's title, above it (`caption-side: top`, the default), aligned to the inline start, in `table-caption-font` / `table-caption-text-color`, `space-stack-sm` below it.
- **Header.** A native `<thead>`.
- **Body.** A native `<tbody>`.
- **Row.** A native `<tr>` with a `table-border-width` hairline in `table-border-color` at its block end (every Row in Header and Body except the last Row of the Body).
- **ColumnHeader.** A native `<th scope="col">`, `text-align: start` (UA default is centred), `table-header-font` / `table-header-text-color`.
- **RowHeader.** A native `<th scope="row">` for the cell that names its row (an invoice number, a member's name). Looks like a Cell (`text-align: start`, the UA bold reset to `table-body-font`); the difference is semantic (judgement call: quiet, one text style per row).
- **Cell.** A native `<td>`, `table-body-font` / `table-body-text-color`, `vertical-align: baseline`.
- Every cell has `table-padding-block` and `table-padding-inline`.
- **Empty.** No component of its own: with no rows, the Body holds one Row whose Cell spans every column (`colSpan`) and holds an EmptyState, so the column headers stay. React Aria `TableBody` `renderEmptyState`, shadcn's data table ("No results." in a `colSpan` row), MUI DataGrid's no-rows overlay and Carbon's empty-state pattern all keep the headers and say why it is empty.

A wide table goes inside a [ScrollArea](./scroll-area.md), which scrolls it horizontally without touching the table's semantics (see Behaviour).

## API

`Table.Root`: `ComponentProps<"table">`. `Table.Caption`: `ComponentProps<"caption">`. `Table.Header`: `ComponentProps<"thead">`. `Table.Body`: `ComponentProps<"tbody">`. `Table.Row`: `ComponentProps<"tr">`. `Table.ColumnHeader` and `Table.RowHeader`: `ComponentProps<"th">` (`scope` preset to `"col"` / `"row"`, overridable, e.g. `"colgroup"`). `Table.Cell`: `ComponentProps<"td">`. `ref`, `className`, `colSpan`, `rowSpan`, `headers`, `aria-*` and every native attribute pass through.

Own props (fix/review, issue #39 asks for "sortable headers announced correctly, row selection"):

| Part           | Prop                       | Type                          | Notes                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | -------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ColumnHeader` | `sortDirection`            | `"ascending" \| "descending"` | Rendered as `aria-sort`. Set it on the sorted column only (APG Sortable Table example: "Set on the currently sorted column. When the sorted column is changed, the aria-sort attribute is removed and set on the newly sorted column.", https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/). Names: MUI `TableCell` `sortDirection`, React Aria `SortDescriptor.direction` `"ascending" \| "descending"`. |
| `SortLabel`    | `ComponentProps<"button">` |                               | A native `<button type="button">` inside the ColumnHeader; its text names the column and a CSS arrow shows the sort (hidden on unsorted columns until hover). Your `onClick` changes the order. Name: MUI `TableSortLabel`.                                                                                                                                                                                                    |
| `Row`          | `selected`                 | `boolean`                     | Draws the row with `table-row-background-color-selected`. Name: MUI `TableRow` `selected`. The row's own Checkbox carries the state for assistive technology; a native table row has no selected state (`aria-selected` applies to rows of a grid or treegrid only).                                                                                                                                                           |

Selection is composed: a first column of `Checkbox`es named "Select <row>", and a header Checkbox with `indeterminate` for select-all (MUI's "Sorting & selecting" demo; React Aria's `selectionMode` needs its interactive grid, left out).

Names, checked against the reference libraries:

- **Component `Table`, namespaced Parts**: Radix Themes "Semantic table element for presenting data." with `Table.Root`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.ColumnHeaderCell`, `Table.RowHeaderCell`, `Table.Cell` (https://www.radix-ui.com/themes/docs/components/table); shadcn "A responsive table component." exporting "Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption" (https://ui.shadcn.com/docs/components/table); React Aria `Table`, `TableHeader`, `Column`, `TableBody`, `Row`, `Cell` (https://react-aria.adobe.com/Table); Mantine `Table.Thead`, `Table.Tbody`, `Table.Tfoot`, `Table.Tr`, `Table.Th`, `Table.Td`, `Table.Caption` (https://mantine.dev/core/table/); MUI `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `TableContainer`, `TableFooter` (https://mui.com/material-ui/react-table/). Every library says Table. `Root`, `Header`, `Body`, `Row`, `Cell` follow Radix Themes (Radix is the naming rule's source).
- **`ColumnHeader` / `RowHeader`**: Radix Themes "Table.ColumnHeaderCell: The header of a table column. Based on the `th` element." and "Table.RowHeaderCell: The header of a table row. Based on the `th` element."; React Aria `Column` and `isRowHeader` "Whether a column is a row header and should be announced by assistive technology during row navigation."; MUI "render it as a row header with `component="th"` and `scope="row"`". The names drop Radix Themes' `Cell` suffix and match the ARIA roles they produce, `columnheader` and `rowheader` (APG, below) (judgement call: shorter, and the same word as the role).
- **`Caption`**: shadcn `TableCaption`, Mantine `Table.Caption`. Radix Themes has none. HTML: "The caption element represents the title of the table that is its parent".
- **No `Footer`.** shadcn `TableFooter`, Mantine `Table.Tfoot`, MUI "`TableFooter` is an optional container for footer rows." No product needs a totals row yet; a native `<tfoot>` inside `Table.Root` works with `Table.Row` and `Table.Cell` until one does.
- **No `align` / `justify` prop.** Radix Themes `Table.Cell` `justify` "`"start"`, `"center"`, or `"end"`"; shadcn aligns amounts with `className="text-right"`. Numeric columns set `text-align: end` through `className` on the ColumnHeader and Cells (shadcn's way); the figures are already tabular from the base stylesheet.
- **No `size`, `variant` or `layout`.** Radix Themes `size` "`"1"`, `"2"`, or `"3"`", `variant` "`"surface"` or `"ghost"`", `layout` "`"auto"` or `"fixed"`"; MUI "Dense table"; Mantine `verticalSpacing`. The brand book has one density ("Compact. Linear-class density on a fine pointer."), so there is one cell padding.
- **No scroll container Part.** MUI "`TableContainer` provides horizontal scrolling for `Table`"; Mantine `Table.ScrollContainer` with `minWidth`. ScrollArea is that container, composed around the Root.
- Left out (YAGNI): the interactive grid (React Aria's Table "enables a user to navigate its contents via directional navigation keys"), sticky header (MUI and Mantine `stickyHeader`), column resizing (React Aria `ResizableTableContainer`), striped rows and row hover highlight (Mantine demo "Striped and rows hover"), a Footer Part, density sizes, cell alignment props.

## States

| State         | How it shows                                        | Exposed as                 |
| ------------- | --------------------------------------------------- | -------------------------- |
| rest          | Header row in label type, hairlines between rows    | —                          |
| focus-visible | On Links/Buttons inside cells only (their own ring) | Their own `:focus-visible` |
| sorted        | Arrow after the SortLabel text, up for ascending    | `aria-sort` on the `th`    |
| selected      | `table-row-background-color-selected` fill          | The row's Checkbox checked |

No hovered or disabled row state: a hover highlight would suggest the row can be clicked (judgement call).

## Behaviour

- **Static structure.** APG: "Like an HTML table element, a WAI-ARIA table is a static tabular structure containing one or more rows that each contain one or more cells; it is not an interactive widget. Thus, its cells are not focusable or selectable." Nothing is added to the tab sequence.
- **When a grid would be right instead.** APG: "Since a table is not a widget, each widget contained in a table is a separate stop in the page tab sequence. If the number of widgets is large, replacing the table with a grid can dramatically reduce the length of the page tab sequence". A table with a Link or Button per row is fine; a table with several controls per row and many rows is a grid, a different component.
- **Never change `display`.** Rows and cells keep their table `display` values. Adrian Roselli: "Yes, you can apply CSS display properties to reflow the table, but some browsers break the semantics and a screen reader user will be stranded". No Part sets `display`, and the docs page tells consumers not to.
- **Wide tables** go inside a ScrollArea, which keeps the `<table>` untouched and gives the scrolling box `tabIndex={0}` (Adrian Roselli's pattern, "<div role="region" aria-labelledby="Caption01" tabindex="0"> <table>[…]</table> </div>"). Pass `aria-labelledby` (the Caption's `id`) and `role="region"` on the ScrollArea when the table should be a named landmark; without them the box is an unnamed focus stop (see ScrollArea, Behaviour).
- **Numbers.** Tabular figures come from the base stylesheet. Cells keep `table-body-font` (body type), not `type-data-*`: the brand's data roles are 12–13 px with tight line height, below the body size the rest of a table row uses (judgement call). A consumer can set `font: var(--ab-type-data-md)` on a numeric column through `className`.
- Server Components: every Part. No state, no handlers, no `'use client'`.

## Motion

None. A table is in-flow content; rows that appear or disappear do so in one frame.

- **Reduced motion:** nothing to remove.
- **Instant exit:** rows removed by the app vanish in one frame and the rows below move up at once, which reads as correct for data.

## Keyboard

APG pattern: **Table** (https://www.w3.org/WAI/ARIA/apg/patterns/table/). Keyboard interaction: "Not applicable."

| Key             | Action                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Moves to / from Links and Buttons inside cells; cells themselves are not focusable ("its cells are not focusable or selectable"). |

Screen readers provide their own table navigation (row and column commands) from the native semantics.

**RTL:** no arrow-key behaviour.

## Accessibility

- **Roles** come from the native elements: `table`, `rowgroup`, `row`, `columnheader`, `rowheader`, `cell`. APG: "authors are strongly encouraged to use a native HTML table element whenever possible." and "Each cell … has one of the following roles: columnheader if the cell contains a title or header information for the column. rowheader if the cell contains title or header information for the row. cell if the cell does not contain column or row header information."
- **Sorting.** APG Sortable Table example: "The aria-sort attribute is set on the column header of the currently sorted column, and the header text of sortable columns is wrapped in a button element." So the column name is the button's name and screen readers announce the sort on the header.
- **Header scope.** HTML `scope`: "row — The header cell applies to some of the subsequent cells in the same row(s). col — The header cell applies to some of the subsequent cells in the same column(s)." ColumnHeader and RowHeader set it explicitly instead of relying on the auto state.
- **Name.** Every Table needs one. With `Table.Caption`: HTML-AAM "if the table element has a child that is a caption element, then use the subtree of the first such element". Without a visible caption, pass `aria-labelledby` (a visible heading) or `aria-label` on the Root; APG: "If there is an element in the user interface that serves as a label for the table, aria-labelledby is set on the table element … Otherwise, a label is specified for the table element using aria-label." A visually hidden caption is `<Table.Caption><VisuallyHidden>…</VisuallyHidden></Table.Caption>`.
- **Contrast.** Header text `color-text-subtle`, cell and caption text `color-text-default`, both in the contrast matrix on every surface. Row hairlines (`color-border-subtle`) are decorative (brand book exemption: "The subtle hairline border is decorative and is never the only boundary of a control"); rows are told apart by alignment and the text itself.
- **Reflow (1.4.10):** the criterion excepts "parts of the content which require two-dimensional layout for usage or meaning", naming "data tables (not individual cells)"; inside a ScrollArea the page itself still never scrolls in two axes, and cell text wraps.
- **More contrast:** header text uses `table-body-text-color` (`color-text-default`) and the row hairline uses `color-border-default` (`@media (prefers-contrast: more)`).
- **Forced colors:** hairlines are borders and take the system colour; text is `CanvasText`. Nothing relies on a fill.
- **Reduced transparency:** not affected.

## RTL

Logical properties only: `text-align: start`/`end`, `padding-inline`, `border-block-end`. Column order follows the table's direction natively (the first column sits at the inline start). No icons, no arrow keys.

## Component tokens

New component word `table` (Dictionary change) and a new modifier word `caption` (the Caption Part; the existing `title` was considered, but the HTML element and the Part are both called caption).

| Token                                 | References                  | `$type`    | Why                                                   |
| ------------------------------------- | --------------------------- | ---------- | ----------------------------------------------------- |
| `table-padding-block`                 | `space-inset-sm`            | dimension  | Cell padding, 8 (compact density)                     |
| `table-padding-inline`                | `space-inset-md`            | dimension  | Cell padding, 12                                      |
| `table-border-color`                  | `color-border-subtle`       | color      | Row hairline                                          |
| `table-border-width`                  | `border-width-default`      | dimension  | Row hairline, 1                                       |
| `table-header-font`                   | `type-label-sm`             | typography | ColumnHeader type                                     |
| `table-header-text-color`             | `color-text-subtle`         | color      | ColumnHeader text, one step quieter than the data     |
| `table-body-font`                     | `type-body-xs`              | typography | Cell and RowHeader type (as Alert and Card body text) |
| `table-body-text-color`               | `color-text-default`        | color      | Cell and RowHeader text                               |
| `table-caption-font`                  | `type-label-md`             | typography | Caption type                                          |
| `table-caption-text-color`            | `color-text-default`        | color      | Caption text                                          |
| `table-row-background-color-selected` | `color-background-selected` | color      | Selected Row fill (new modifier word `row`)           |
| `table-sort-icon-color`               | `color-icon-subtle`         | color      | SortLabel arrow (new modifier word `sort`)            |

None exist yet. The gap below the Caption uses `space-stack-sm` directly; the more-contrast hairline uses `color-border-default` directly.

## Built-in labels

None. The Caption or `aria-label` is the consumer's.

## Feedback events

None. Sorting and selection are the consumer's handlers on a native button and Checkbox (the Checkbox dispatches its own `ab-toggle`).

## Sources

- WAI-ARIA APG Table pattern: https://www.w3.org/WAI/ARIA/apg/patterns/table/
- HTML Living Standard, tables (`caption`, `th` `scope`): https://html.spec.whatwg.org/multipage/tables.html
- HTML-AAM, table accessible name computation: https://www.w3.org/TR/html-aam-1.0/
- WCAG 2.2 Understanding 1.4.10 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- Adrian Roselli, Under-Engineered Responsive Tables: https://adrianroselli.com/2020/11/under-engineered-responsive-tables.html
- Base stylesheet: `packages/ui/src/base/base.css` ("Tabular figures wherever numbers are compared." `:where(table, time, output, data) { font-variant-numeric: tabular-nums; }`).
- Baseline (webstatus.dev, 2026-10-24): `table` widely available (low 2015-07-29); `font-variant-numeric` widely available (low 2020-01-15).
- Brand book: principles ("Quiet.", "Compact. Linear-class density on a fine pointer."), principle 5 ("Flat in flow, lifted when floating."), Accessibility exemptions.
- Radix Themes Table: https://www.radix-ui.com/themes/docs/components/table · shadcn Table: https://ui.shadcn.com/docs/components/table · React Aria Table: https://react-aria.adobe.com/Table · Mantine Table: https://mantine.dev/core/table/ · MUI Table: https://mui.com/material-ui/react-table/
