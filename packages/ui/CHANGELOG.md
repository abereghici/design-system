# @abereghici/ui

## 0.2.0

### Minor Changes

- c846c60: Add `selectionMode="multiple"` to Combobox: the list stays open while people choose several Items, shown as tags in the field that Backspace removes from the end, and each value submits with its form. `value`, `defaultValue` and `onValueChange` take a list of values, and `removeLabel` names the tags' remove buttons. The server now renders the chosen Item's text, so the field no longer changes on hydration, and Combobox's description says that before hydration its form submits the starting value whatever is typed.
- a1696aa: Add ContextualHelp (`@abereghici/ui/contextual-help`): a small help or info icon button beside a field's label that opens a Popover with a `title` and the app's help text. It opens before hydration too, and Escape or a press outside closes it. Add `HelpIcon` (`@abereghici/ui/icons/help`).
- 73dbae0: Add CopyButton, which copies a text to the clipboard in one press and announces the result in a status message from the app's `copiedLabel` or `failedLabel` that clears three seconds later, and CodeBlock, which shows code as written in a ScrollArea, so keyboard users can Tab to it and scroll.
- 36bd8bd: Inside `data-density="compact"`, Table rows get shorter and Select, Combobox and Command options, DropdownMenu and ContextMenu items, Tabs, Tree items, ToggleButtons and Stepper steps take the compact sizes; touch screens keep the touch heights.
- fe02d2b: Set `data-density="compact"` on any element to make the Buttons, IconButtons, SegmentedControls and single-line Field controls inside it compact, and `"comfortable"` to go back; the nearest setting wins, and touch screens keep the touch size.
- 15fb2dd: Add `DescriptionList` (`Root`, `Item`, `Term`, `Details`) on a native `<dl>`, for the details of one record: values line up in a column while there is room and move below their term in a narrow container. Every Part is a Server Component.
- 068ef06: Add Disclosure (`@abereghici/ui/disclosure`): one section a Trigger shows and hides, on `<details>` and `<summary>`, so it works before hydration and find-in-page opens it. `open` / `defaultOpen` / `onOpenChange` take a change request, and every press dispatches a bubbling `ab-toggle`. Its tokens ship in `@abereghici/tokens/components/disclosure.css`. Accordion's Items are now Disclosures, with no visible change; Accordion's tokens still restyle them, and `Accordion.Trigger` now requires its text in `children`, as `Disclosure.Trigger` does.
- 4e2c6ad: `@abereghici/ui/events` is now `@abereghici/ui/feedback-event` and holds only the Feedback event types (`PressFeedbackEvent`, `ToggleFeedbackEvent`, `DismissFeedbackEvent`, `AppearFeedbackEvent`, `ConfirmFeedbackEvent`, `FeedbackEventDetail`). A Feedback event's `detail.reason` (`"user"` or `"programmatic"`) is now `detail.userInitiated` (`true` or `false`), as the Navigation API's `NavigateEvent.userInitiated` is, and `FeedbackReason` is gone. The generic `ChangeEventDetails` is no longer exported: type an `on…Change` callback with its Component's own type, such as `CheckboxChangeEventDetails`, which is unchanged.
- 9ba5b36: Add `name` to SegmentedControl, so the chosen segment submits with its form. RadioGroup, SegmentedControl and Slider return to their default value when their form resets, and report the next change. Field describes its control from the server HTML, so descriptions are announced before hydration. NumberField's description says that before hydration its form submits the starting value.
- 5686da1: IconButton no longer takes `pressed`, `defaultPressed` or `onPressedChange`, and `IconButtonChangeEventDetails` is gone: an IconButton is an action. For an icon that stays on or off, write `<ToggleButton value="pin" aria-label="Pin"><PinIcon /></ToggleButton>`, which takes the same three props, shows the icon in a square and can join a ToggleButtonGroup. PasswordField's show-password toggle is now a ToggleButton, so its `ab-toggle` names `component: "ToggleButton"`.
- eb0a528: Add the `Stack`, `Inline` and `Grid` layout primitives, each on its own subpath. Their `gap` (and Grid's `min`) take space and size token names only, `align` and `justify` follow the reading direction, Grid reflows with no breakpoints, and `asChild` renders them as your own element, such as a list. All three are Server Components.
- e4ea4cd: Add OTPField (`@abereghici/ui/otp-field`): a one-time code in one input (`autocomplete="one-time-code"`, `inputmode="numeric"`, a `pattern` and `maxlength` from `length`, 6 by default), drawn as a box per digit in CSS. Paste and SMS autofill fill the whole code, screen readers hear one labelled field with its description and error, and its form submits the code with JavaScript off. The caret stays in the boxes: after the last digit, the last box draws it.
- 0503494: Add `PageLayout` (`Root`, `Header`, `Navigation`, `Content`, `Aside`), the shell every screen starts from: it places your Navbar and Sidebar in a banner, navigation, main and optional complementary region, and lays them out by its own width, stacking them in reading order in a narrow container. A Server Component, built on Stack and Inline.
- 5ba6b3c: Add RangeCalendar (`@abereghici/ui/range-calendar`) and DateRangePicker (`@abereghici/ui/date-range-picker`). RangeCalendar chooses a start and an end day with two presses and Calendar's keyboard; every day of the range is selected, and its ends carry `data-selection-start` and `data-selection-end`, which Calendar's selected day now carries too. DateRangePicker types both dates in one field, or picks them on a RangeCalendar in `DateRangePicker.Content`; it submits them as ISO dates under `startName` and `endName`, marks an end before the start invalid with `reversedMessage`, and shows two of the browser's own date inputs with JavaScript off. Their tokens ship in `@abereghici/tokens/components/range-calendar.css` and `date-range-picker.css`.
- 5ff9e98: Add SearchField (`@abereghici/ui/search-field`): a native `type="search"` input with the Search Enter key, its Field's label, description and validation, and a clear button named by `clearLabel` that replaces the browser's own. The clear button and Escape empty the field as a change request (`clear-press`, `escape-key`) and keep focus in it. With JavaScript off, its form still submits the text; the clear button is hidden.
- 1295e3e: Sidebar.Group no longer takes `collapsible` or `defaultOpen`. For a group people can fold, write `<Sidebar.CollapsibleGroup label="Settings" defaultOpen>` instead. It is built on Disclosure, so it also takes `open` and `onOpenChange` (which can cancel the change; type its `details` as `Sidebar.ChangeEventDetails`), opens for find-in-page, and dispatches `ab-toggle` with `component: "Sidebar"`.
- eb01b26: Add `Splitter`: two panels and the handle between them, which people drag, or move with the arrow keys, Home and End, and collapse with Enter. The handle is a focusable separator that announces its position, its range and the panel it resizes. The size is a Change request (`value`, `defaultValue`, `onValueChange`), Enter dispatches `ab-toggle`, and `orientation` stacks the panels. `@abereghici/tokens/components/splitter.css` holds its tokens.
- 4a56900: Add `Stepper`: the steps of a multi-step flow as an ordered list, with the current step marked for assistive technology, completed steps named by an author-written `completedLabel`, links back to completed steps through `asChild`, and a horizontal or vertical `orientation`. It is a Server Component, and `@abereghici/tokens/components/stepper.css` holds its tokens.
- c8397e5: Table: a header that stays in view and lifts off the rows once they scroll under it, `loading` with `Table.Skeleton` rows, `Table.Empty` for an EmptyState across all columns, and `SortLabel asChild` for sort links that work before hydration. Row selection, single or multiple, as change requests: `selectionMode` with `selectedKeys` or `defaultSelectedKeys` and `onSelectionChange` on `Table.Root`, a `Table.SelectAll` header cell and a `Table.SelectRow` per row, keyed by its `value`, with the selected rows highlighted from the server HTML. Table renders on the server and works before hydration; row selection works once the page hydrates, and its column hides with JavaScript off. The sticky header's fill and shadow ship as `table-header-background-color` and `table-header-shadow`.
- c9fe0ac: Tabs: the browser's find-in-page searches hidden panels and opens the tab holding a match, as a change request with reason `"find"`; cancelling it hides the panel again. Engines without `hidden="until-found"` keep today's behaviour.
- ba6e759: Add TagGroup (`@abereghici/ui/tag-group`): removable tags whose remove buttons read `removeLabel` before each Tag's text, with removal as a change request, a bubbling `ab-dismiss` and focus kept in the group. Its tokens ship in `@abereghici/tokens/components/tag-group.css`.
- ae6949f: Add TimeField (`@abereghici/ui/time-field`): a time of day typed in hour, minute and day-period segments, in the Locale's order and its 12- or 24-hour clock, with DateField's keyboard and validation. Its value is a `Temporal.PlainTime`, its form submits "HH:MM", and with JavaScript off it shows the browser's own time input. Its tokens ship in `@abereghici/tokens/components/time-field.css`.
- 471cbc6: Add ToggleButton, a button that stays on or off and is announced as pressed, showing a label or, named by `aria-label`, an icon alone in a square, and ToggleButtonGroup, which holds the pressed state of the buttons inside it one at a time or several with `selectionMode="multiple"`. Inside a Toolbar, the Toolbar's arrow keys move between them.
- 0b3e1ac: Add Tree (`@abereghici/ui/tree`): nested Items with the APG tree keyboard model and typeahead, expansion and selection as change requests with a bubbling `ab-toggle`, and children an app loads once an Item expands. Its tokens ship in `@abereghici/tokens/components/tree.css`.

### Patch Changes

- 0f958bc: Before hydration, a single-choice Combobox submits the typed text with its form, and its chosen Item's value once hydrated. CodeBlock works before hydration: it is a Server Component, and always a Tab stop so keyboard users can scroll it. With scripting off, DropdownMenu hides its Trigger, Command hides itself, and DropZone shows no drop target while its FileTrigger picks files. Every tier line uses the same wording.
- acccb28: Name and describe Dialog, AlertDialog and Sheet from the server HTML, so they are announced before hydration. With scripting off, hide the controls only script can run: Alert's dismiss button, Calendar's month buttons, DatePicker's calendar button, NumberField's step buttons, PasswordField's show-password toggle and every tab but the selected one. Each Component's description now states its before-hydration tier.
- a48f048: Dialog.Close and Popover.Close press as IconButton and Alert.Close do: `disabled` keeps them focusable and announced while blocking presses, and pressing the `x` button dispatches one Feedback event, its `ab-dismiss`.
- b137553: Command.Dialog returns focus to `finalFocus` when it closes with focus left on the page or inside the closed palette, not only on the page, by the same rule as every other Overlay. The Toaster returns focus after Escape or a dismiss by that rule too.
- 41565eb: CopyButton: hidden while scripting is off, since it copies only through script.
- 23bebd4: A Part rendered outside its Root throws one consistent error, naming the Part and where it belongs (`Tabs.Trigger must be inside Tabs.Root`); Dialog, Command, Slider, Popover, Tooltip and the menu Parts now name the Part too.
- 552d8b6: With JavaScript off, DateField and DatePicker show the browser's own date input in place of their segments, which only script can edit, so the date can still be typed and submitted.
- 460c2a3: IconButton is announced as unavailable while `loading`, as Button already was, not only while `disabled`. Button, IconButton, ToggleButton and Alert.Close share one rule for a disabled press: it stays focusable, it is announced as unavailable and a press does nothing, and an `aria-disabled` you pass wins.
- 084a289: Field now checks all its controls in one place. A DatePicker or DateField whose starting date is unavailable or fails `validate` blocks the submit and shows why, a date typed in part right after a server error stays invalid, and a drop or Clear on a DropZone updates its error at once.
- f56f764: FileTrigger works with JavaScript off: the browser's own file input takes the trigger's place, named by the trigger's text and in the tab order, so the form still submits the chosen files. Once hydrated, nothing changes: the trigger opens the picker and the input stays hidden. A DropZone's file input does the same.
- 3a0e1ef: Button, IconButton, ToggleButton, Alert.Close, Tabs.Trigger, Tooltip.Trigger and Table.SortLabel type the `command` and `commandfor` invoker attributes for an app that installs the package, not only inside this repository: their props now include the `InvokerCommands` the augmentation adds.
- 73dda18: Combobox scrolls the first option's group heading into view when it opens or filters, as Command does, and ranks, numbers and highlights the Items a child adds or renames without the Combobox itself re-rendering. A Combobox group's heading is now hidden from assistive technology, which hears it as the group's name, as in Command.
- 181a16e: Meter and Progress say where their props go: `className` and `style` style the whole component, its label and value included, while `ref`, `id` and the other attributes reach the bar that assistive technology reads.
- 6db0ac0: Component files do one job each: Tree's and Slider's state and Tree's keyboard navigation sit beside their Root; the Toaster's timers, stacking, announcements, swipe and topmost-modal tracking, DropZone's `accept` matching and drop target, and the menus' focus movement sit in files of their own; and Slider, Splitter and the Toaster's swipe share one pointer drag. Nothing changes for consumers.
- 330c763: The shared internals do one job per module: `asChild` rendering, prop merging, handler chaining and ref composition are separate modules, as are the checkbox click, the radio group choice, the multi-value selection list, typeahead, the invoker-command types and the date pickers' contexts, and ToggleButtonGroup owns the context its ToggleButtons read. Nothing else changes for consumers, but for NumberField's step buttons, whose `aria-controls` now names the input's own `id`, one you pass included.
- 5bfdf89: ContextMenu now owns where focus returns when it closes and how it tells a pointer open from a keyboard one, and DatePicker and DateRangePicker return focus to their calendar button the same way, so the overlay they share holds no rules for one Component. Nothing changes for consumers.
- 0bec763: Tooltip, Popover, DropdownMenu, ContextMenu, Combobox and the date pickers find their own parts without `document.getElementById`: through a ref, the trigger's `commandfor` link, or an escaped selector. Nothing changes for consumers.
- 1124539: DatePicker and DateRangePicker name themselves in the `ab-dismiss` their calendar panel dispatches, which named Popover, and `DismissFeedbackEvent` lists them.
- ed47cac: OTPField keeps each digit in its own box under a reader's letter spacing, CopyButton announces every copy, a second identical one included, and a multiple-choice Combobox takes `value` or `defaultValue`, not both.
- 7015b71: Select's chevron turns only when a pointer opens or closes it, and never with reduced motion on, as Disclosure, Tabs, SegmentedControl and RadioGroup already do.
- 0ea5f82: Components that hold their own value or open state, or follow the app's, now share one implementation of it, form reset included, so a DateRangePicker or a range Slider resets once per form reset; Stack and Inline share one body, DatePicker and DateRangePicker one calendar button and panel, and the date and time components one cache of locale formats. Nothing changes for consumers.
- a5d8f98: Slider: a value snaps to the steps counted from `min`, as in NumberField, so a Slider whose `min` has more decimals than its `step` (`min={0.05} step={0.1}`) moves to 0.15 instead of jumping to a value off its own steps.
- 7b18138: Slider: while scripting is off, it shows the browser's own slider, which follows the pointer and the keys, instead of a thumb, fill and value text that stayed where they started.
- d9102cb: Splitter: its handle is hidden while scripting is off, since it moves only through script; the panels keep their sizes.
- aa3e8c7: Tabs: panels hidden until found stay out of the accessibility tree after hydration, as they are before it.
- c1cfa89: Text renders its element through the shared Slot instead of a cast, so every prop it sets is type-checked. Nothing changes for consumers.
- 89276ec: A toast action's `shortcut` with `alt` now works on macOS, where Option with a letter types another character: the letter also matches by its key, as the Toaster's own Alt+T does.
- 022db35: ToggleButton: hidden while scripting is off, since it toggles only through script; so are a ToggleButtonGroup's buttons.
- 5aa6327: A Select option, and a menu item in forced colors, no longer keep their hover highlight after a tap on a touch screen; keyboard focus still highlights them.
- Updated dependencies [fe02d2b]
- Updated dependencies [73dbae0]
- Updated dependencies [15fb2dd]
- Updated dependencies [068ef06]
- Updated dependencies [5aa6327]
- Updated dependencies [5ba6b3c]
- Updated dependencies [eb01b26]
- Updated dependencies [4a56900]
- Updated dependencies [c8397e5]
- Updated dependencies [ba6e759]
- Updated dependencies [ae6949f]
- Updated dependencies [471cbc6]
- Updated dependencies [0b3e1ac]
  - @abereghici/tokens@0.2.0

## 0.1.2

### Patch Changes

- ca9349c: The npm page shows the new README, keywords, and links to the source and the issue tracker.
- Updated dependencies [ca9349c]
  - @abereghici/tokens@0.1.2

## 0.1.1

### Patch Changes

- ade9d81: Published from CI with npm provenance, so each version links to the commit and workflow run that built it.
- Updated dependencies [ade9d81]
  - @abereghici/tokens@0.1.1

## 0.1.0

### Minor Changes

- 5b9eed2: First release on npm.

### Patch Changes

- Updated dependencies [5b9eed2]
  - @abereghici/tokens@0.1.0
