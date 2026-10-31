# @abereghici/tokens

## 0.2.0

### Minor Changes

- fe02d2b: Add `size-control-compact-sm`, `-md` and `-lg`, the control heights for compact density, which keep the touch heights on touch screens.
- 73dbae0: Add CopyButton, which copies a text to the clipboard in one press and announces the result in a status message from the app's `copiedLabel` or `failedLabel` that clears three seconds later, and CodeBlock, which shows code as written in a ScrollArea, so keyboard users can Tab to it and scroll.
- 15fb2dd: Add the `description-list` component token sheet: the gaps between items and between a term and its value, and the type and color roles of both.
- 068ef06: Add Disclosure (`@abereghici/ui/disclosure`): one section a Trigger shows and hides, on `<details>` and `<summary>`, so it works before hydration and find-in-page opens it. `open` / `defaultOpen` / `onOpenChange` take a change request, and every press dispatches a bubbling `ab-toggle`. Its tokens ship in `@abereghici/tokens/components/disclosure.css`. Accordion's Items are now Disclosures, with no visible change; Accordion's tokens still restyle them, and `Accordion.Trigger` now requires its text in `children`, as `Disclosure.Trigger` does.
- 5ba6b3c: Add RangeCalendar (`@abereghici/ui/range-calendar`) and DateRangePicker (`@abereghici/ui/date-range-picker`). RangeCalendar chooses a start and an end day with two presses and Calendar's keyboard; every day of the range is selected, and its ends carry `data-selection-start` and `data-selection-end`, which Calendar's selected day now carries too. DateRangePicker types both dates in one field, or picks them on a RangeCalendar in `DateRangePicker.Content`; it submits them as ISO dates under `startName` and `endName`, marks an end before the start invalid with `reversedMessage`, and shows two of the browser's own date inputs with JavaScript off. Their tokens ship in `@abereghici/tokens/components/range-calendar.css` and `date-range-picker.css`.
- eb01b26: Add `Splitter`: two panels and the handle between them, which people drag, or move with the arrow keys, Home and End, and collapse with Enter. The handle is a focusable separator that announces its position, its range and the panel it resizes. The size is a Change request (`value`, `defaultValue`, `onValueChange`), Enter dispatches `ab-toggle`, and `orientation` stacks the panels. `@abereghici/tokens/components/splitter.css` holds its tokens.
- 4a56900: Add `Stepper`: the steps of a multi-step flow as an ordered list, with the current step marked for assistive technology, completed steps named by an author-written `completedLabel`, links back to completed steps through `asChild`, and a horizontal or vertical `orientation`. It is a Server Component, and `@abereghici/tokens/components/stepper.css` holds its tokens.
- c8397e5: Table: a header that stays in view and lifts off the rows once they scroll under it, `loading` with `Table.Skeleton` rows, `Table.Empty` for an EmptyState across all columns, and `SortLabel asChild` for sort links that work before hydration. Row selection, single or multiple, as change requests: `selectionMode` with `selectedKeys` or `defaultSelectedKeys` and `onSelectionChange` on `Table.Root`, a `Table.SelectAll` header cell and a `Table.SelectRow` per row, keyed by its `value`, with the selected rows highlighted from the server HTML. Table renders on the server and works before hydration; row selection works once the page hydrates, and its column hides with JavaScript off. The sticky header's fill and shadow ship as `table-header-background-color` and `table-header-shadow`.
- ba6e759: Add TagGroup (`@abereghici/ui/tag-group`): removable tags whose remove buttons read `removeLabel` before each Tag's text, with removal as a change request, a bubbling `ab-dismiss` and focus kept in the group. Its tokens ship in `@abereghici/tokens/components/tag-group.css`.
- ae6949f: Add TimeField (`@abereghici/ui/time-field`): a time of day typed in hour, minute and day-period segments, in the Locale's order and its 12- or 24-hour clock, with DateField's keyboard and validation. Its value is a `Temporal.PlainTime`, its form submits "HH:MM", and with JavaScript off it shows the browser's own time input. Its tokens ship in `@abereghici/tokens/components/time-field.css`.
- 471cbc6: Add ToggleButton, a button that stays on or off and is announced as pressed, showing a label or, named by `aria-label`, an icon alone in a square, and ToggleButtonGroup, which holds the pressed state of the buttons inside it one at a time or several with `selectionMode="multiple"`. Inside a Toolbar, the Toolbar's arrow keys move between them.
- 0b3e1ac: Add Tree (`@abereghici/ui/tree`): nested Items with the APG tree keyboard model and typeahead, expansion and selection as change requests with a bubbling `ab-toggle`, and children an app loads once an Item expands. Its tokens ship in `@abereghici/tokens/components/tree.css`.

### Patch Changes

- 5aa6327: Write the narrow-layout breakpoint in `em` (`47.5em`, still 760px at the default text size), so `space-section` and `layout-gutter` shrink on wider screens for readers with a larger default text size.

## 0.1.3

### Patch Changes

- 2d154db: Rewrite the semantic token descriptions in `tokens.json` as one line on what each token is for, and drop the generated descriptions of primitive tokens.

## 0.1.2

### Patch Changes

- ca9349c: The npm page shows the new README, keywords, and links to the source and the issue tracker.

## 0.1.1

### Patch Changes

- ade9d81: Published from CI with npm provenance, so each version links to the commit and workflow run that built it.

## 0.1.0

### Minor Changes

- 5b9eed2: First release on npm.
