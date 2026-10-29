# DatePicker

A DateField with a Calendar on demand: type the date, or open the panel and pick it from the month. Use it for most form dates (due dates, bookings, filters). For dates people type from memory (birth dates), use DateField alone; for an always-visible month, Calendar.

```tsx
import { DatePicker } from "@platform/ui/date-picker";
import { Calendar } from "@platform/ui/calendar";

<DatePicker.Root label="Due date" name="due" required>
  <DatePicker.Content>
    <Calendar />
  </DatePicker.Content>
</DatePicker.Root>

<DatePicker.Root
  label="Check-in"
  name="checkIn"
  min={Temporal.Now.plainDateISO()}
  isDateUnavailable={isFullyBooked}
  value={checkIn}
  onValueChange={setCheckIn}
>
  <DatePicker.Content>
    <Calendar />
  </DatePicker.Content>
</DatePicker.Root>
```

Status: draft for brand-owner review (phase 6). No source guide: drafted from the brand book (Motion, Interaction principles), the DateField, Calendar and Popover specs, the WAI-ARIA APG Date Picker Dialog example, React Aria DatePicker, Ark DatePicker and shadcn Date Picker. Temporal: ADR-0004 (accepted 2026-10-24).

## Anatomy

Root (DateField with a trigger in its field box) + Content (Overlay holding the consumer's Calendar).

- **Root.** Draws everything DateField draws (Label, field box, segments, hidden date input, description or error; DateField spec), plus the trigger at the inline end of the field box. It holds the value and the open state.
- **Trigger.** An `IconButton` `size="sm"` with `CalendarIcon` (not mirrored, Icon spec), the Overlay's Trigger wiring (`commandfor` → Content, `command="toggle-popover"`, `aria-expanded`), `aria-controls` → Content (HTML-AAM maps a `toggle-popover` command to `aria-details`, not `aria-controls`) and `aria-haspopup="dialog"`. Being the Content's invoker, a press on it never light-dismisses the panel (HTML: "To get the target popover … Return target", which light dismiss skips), so a second press closes with `"trigger-press"`. Its click cancels the command and toggles the panel with `showPopover({ source: fieldBox })` / `hidePopover()`, so the implicit anchor is the field box (Tooltip and ContextMenu precedent). Named by the author's required `triggerLabel` ("Choose date"); while there is a value, `aria-describedby` → a visually hidden span with the value in `Intl.DateTimeFormat(tag, { dateStyle: "full" })`.
- **Content.** `Popover.Content` (`popover="auto"`, `role="dialog"`, rendered in place, top layer, Material, overlay elevation, `popover-padding`, `popover-offset` below the field box, `side="bottom"`, `align="start"`, flipping), named by `aria-label` = `triggerLabel`, anchored to the field box rather than the trigger (the panel lines up with the field, as Combobox's list). Its width is its content's: `popover-max-width` does not apply (seven cells at 44 px on coarse pointers plus padding exceed 320). Its children mount on the first open and stay mounted (Ark `lazyMount`: "Whether to enable lazy mounting"), which is what lets an app load the Calendar lazily (Behaviour).
- **Calendar.** The consumer's `<Calendar />` (Calendar spec), which reads the DatePicker's value and limits from context.

## API

`DatePicker.Root`

| Prop                                                                                                                | Type                                                                                       | Default | Notes                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| `label`, `description`, `errorMessage`, `invalid`, `validate`, `size`, `required`, `name`, `min`, `max`, `disabled` | as DateField                                                                               |         | `min` / `max` also bound the Calendar.                                                                                  |
| `value`                                                                                                             | `Temporal.PlainDate \| null`                                                               |         | Controlled.                                                                                                             |
| `defaultValue`                                                                                                      | `Temporal.PlainDate \| null`                                                               | `null`  | Uncontrolled.                                                                                                           |
| `onValueChange`                                                                                                     | `(value: Temporal.PlainDate \| null, details: DatePicker.Root.ChangeEventDetails) => void` |         | `reason`: DateField's (`"input-change"`, `"keyboard"`) plus `"day-press"` from the Calendar.                            |
| `isDateUnavailable`                                                                                                 | `(date: Temporal.PlainDate) => boolean`                                                    |         | Unavailable in the Calendar; a typed unavailable date is invalid with the required `unavailableMessage` (DateField's).  |
| `open`                                                                                                              | `boolean`                                                                                  |         | Controlled.                                                                                                             |
| `defaultOpen`                                                                                                       | `boolean`                                                                                  | `false` | Uncontrolled.                                                                                                           |
| `onOpenChange`                                                                                                      | `(open: boolean, details: DatePicker.Root.OpenChangeEventDetails) => void`                 |         | `reason`: Popover's (`"trigger-press"`, `"outside-press"`, `"escape-key"`, `"focus-out"`, `"none"`) plus `"day-press"`. |
| `triggerLabel`                                                                                                      | `string` (required)                                                                        |         | The calendar button's and panel's name ("Choose date").                                                                 |
| `unavailableMessage`                                                                                                | `string` (required with `isDateUnavailable`)                                               |         | The error for a typed day that can't be chosen.                                                                         |
| …native                                                                                                             | as DateField                                                                               |         | `className`, `style` on the Field root, the rest on the field box (`onPointerEnter`, `onFocus`: the warm-up recipe).    |

`DatePicker.Content`: `ComponentProps<"dialog">` (`ref`, `className`, `children`), a `<dialog>` as `Popover.Content`. `id`, `open`, `popover`, `aria-label` are owned.

Names, checked against the reference libraries:

- **`DatePicker`**: React Aria "A date picker combines a DateField and a Calendar popover to allow users to enter or select a date and time value." (https://react-aria.adobe.com/DatePicker); Ark `DatePicker.Root`; shadcn "Date Picker" "A date picker component with range and presets." (https://ui.shadcn.com/docs/components/date-picker); Mantine `DatePickerInput`. React Aria's anatomy is the one taken: "`<DatePicker> <Label /> <Group> <DateInput /> <Button /> </Group> … <Popover> <Calendar /> </Popover> </DatePicker>`", a Calendar composed inside the picker's popover. shadcn composes the same way (`<PopoverContent …><Calendar mode="single" selected={date} onSelect={setDate} … /></PopoverContent>`).
- **Parts `Root`, `Content`**: Ark "`<DatePicker.Root> … <DatePicker.Positioner> <DatePicker.Content>`"; Radix Part words. Ark's `Label`, `Control`, `Input`, `Trigger`, `ClearTrigger` and React Aria's `Group`, `DateInput`, `Button` are drawn by Root (Select precedent: field Parts are built in).
- **`open` / `defaultOpen` / `onOpenChange`**: Ark "`open` … The controlled open state of the date picker", "`defaultOpen` … The initial open state of the date picker when rendered."; React Aria `isOpen`, `defaultOpen`, `onOpenChange` "Handler that is called when the overlay's open state changes."
- **Closes on choosing**: React Aria `shouldCloseOnSelect` default `true` "Determines whether the date picker popover should close automatically when a date is selected."; Ark `closeOnSelect` default `true` "Whether the calendar should close after the date selection is complete."; APG "Select the date, close the dialog, and move focus to the "Choose Date" button." Always on; the props are left out.
- **`isDateUnavailable`, `min`, `max`, `value` family**: Calendar and DateField specs.
- Left out (YAGNI): ranges (React Aria `DateRangePicker`, Ark `selectionMode`, shadcn range); times and `granularity`; `shouldCloseOnSelect` / `closeOnSelect`; Ark `ClearTrigger`, `PresetTrigger`, month and year views, `positioning`, `inline`, `openOnClick`, `unmountOnExit`, a free-text `Input` with `parse` / `format`; React Aria `pageBehavior`, `firstDayOfWeek`, `placeholderValue`; a modal panel (the APG example uses `aria-modal="true"`; React Aria, Ark and shadcn use a popover); OK / Cancel buttons (APG): choosing commits, Escape cancels; `side` / `align` on Content.

## States

The field box's states are DateField's. Added:

| State               | How it shows                                   | Exposed as                                             |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| open                | Panel below the field box (above after a flip) | `aria-expanded="true"` on the trigger; `:popover-open` |
| opened by a pointer | The Popover entry scale runs                   | `data-pointer` (Popover)                               |

## Behaviour

- **Field.** Exactly DateField's (Field contract with the hidden date input). Adds one rule: with `isDateUnavailable`, a complete typed date it rejects sets `setCustomValidity(unavailableMessage)` (after DateField's incomplete check, before `validate`). Choosing in the Calendar commits like typing: the hidden input's value changes, the Field re-reads validity, and the choice counts as an edit for the error timing.
- **One value.** The Root owns the value. Typing a complete date moves the Calendar's month to it when the panel next opens. The Calendar inside `DatePicker.Content` reads `value`, `min`, `max`, `isDateUnavailable` and its choose handler from the DatePicker context (the context lives in the private module the three date components share, so the DatePicker does not import the Calendar's code); props set on that Calendar for those four are ignored.
- **Panel.** Composes Popover (Popover spec): light dismiss, Escape, focus return to the trigger including the WebKit handler, `"focus-out"` closing on Tab out, anchoring, flipping and reasons. The anchor is the field box: DateField names it `--ab-date-field-box` (`anchor-name`, scoped to each field with `anchor-scope`) and the panel sets `position-anchor` to it. The trigger stays the popover's source (its `toggle-popover` command), and so its trigger for focus navigation (HTML focus navigation scope owner: "has a popover trigger set, then return element's popover trigger"): Tab from the trigger enters the panel and Tab out of the panel goes on to the control after the trigger; focus return goes to the trigger, which the panel records as its return target on every open (Popover's focus return; checked in three engines). A press on the trigger while the panel is open closes it with `"trigger-press"`: the trigger is the panel's invoker, so light dismiss leaves the panel to the trigger's `click` (checked in three engines).
- **Focus on open.** Moves to the Calendar's tab-stop day: the value, else today, clamped into `min` / `max`. APG: "Move focus to selected date, i.e., the date displayed in the date input text field. If no date has been selected, places focus on the current date." This departs from Popover's default (focus stays on the Trigger): the panel is operated with the keyboard map, and APG asks for it (judgement call). Mechanism: one path for eager and lazy Calendars: after each open (or on mounting into an open panel), the Calendar moves its tab stop to that day and focuses it, if focus is still on the trigger, in the panel or nowhere (WebKit does not focus a pressed button). Checked for keyboard and pointer opens with an eager and a lazy Calendar in three engines.
- **Choosing** (`"day-press"`): `onValueChange(day, details)`; then the panel closes (`onOpenChange(false, { reason: "day-press" })`) and focus returns to the trigger, whose description now reads the new date (APG: "So, when the dialog closes and focus returns to the button, screen reader users hear confirmation of the selected date."). The trigger's name stays `triggerLabel` and the date is in its description (judgement call: APG renames the button to "Change Date, DATE_STRING"; `triggerLabel` is a plain string, so the date is not interpolated into the name). `cancel()` on the value keeps the panel open.
- **Splitting** (spec #1 story 27). `@platform/ui/date-picker` and `@platform/ui/calendar` are separate subpaths with no module-level side effects, and Content mounts its children only after the first open, so an app can load the Calendar on demand and warm it on hover or focus of the field. The design system itself never calls `import()` (Command precedent):

  ```tsx
  "use client";
  import { lazy, Suspense } from "react";

  import { DatePicker } from "@platform/ui/date-picker";
  import { Spinner } from "@platform/ui/spinner";

  const loadCalendar = () => import("@platform/ui/calendar");
  const Calendar = lazy(() => loadCalendar().then((m) => ({ default: m.Calendar })));
  const warmCalendar = () => {
    void loadCalendar();
  };

  export function DueDate() {
    return (
      <DatePicker.Root
        label="Due date"
        name="due"
        onPointerEnter={warmCalendar}
        onFocus={warmCalendar}
      >
        <DatePicker.Content>
          <Suspense fallback={<Spinner />}>
            <Calendar />
          </Suspense>
        </DatePicker.Content>
      </DatePicker.Root>
    );
  }
  ```

  React `lazy`: "It needs to eventually resolve to an object whose `.default` property is a valid React component type" (Command spec quote). Temporal and its polyfill are not split: the DateField needs them to produce a value (ADR-0004), so only the grid's code is deferred (inference against the performance note's "any Temporal-dependent code": the field is Temporal-dependent too). The build ticket proves the split in `apps/ui-next-fixture`: a route whose initial JavaScript has the DatePicker and not the Calendar, which loads after the first open.

- **Disabled:** the trigger is `aria-disabled` (IconButton) and the panel does not open; the field is DateField's.
- Client components (`'use client'`): Root and Content.

## Motion

Popover's motion (Popover spec): a pointer open fades and scales from `popover-enter-scale` at the field box's block-start inline-start corner (brand book: "Popovers and tooltips grow from their trigger, never from nothing."); a keyboard open (Enter or Space on the trigger) has no transition (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions."); the exit fades over `popover-exit-duration`. Inside, the Calendar has no motion.

- **Reduced motion:** `motion-scale-enter` resolves to 1 (token media override), so pointer opens only fade.
- **Instant exit:** spike #4: "Firefox and WebKit compute `display: none` at once". The panel closes when the user chose a day, pressed Escape, pressed outside or tabbed away; the field already shows the chosen date and focus is on the trigger or where the user moved it, so a panel that disappears in that frame reads as correct.

## Keyboard

APG pattern: **Date Picker Dialog** example (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/), non-modal: the panel is a Popover (Overlay), so Tab can leave it (and closes it, `"focus-out"`) instead of APG's wrap from "OK" to "Previous Year".

| Where           | Key          | APG                                                                                                                                                                                | Here                                                                   |
| --------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Segments        | all          | (Spinbutton)                                                                                                                                                                       | DateField's map.                                                       |
| Trigger         | Space, Enter | "Open the date picker dialog. Move focus to selected date, i.e., the date displayed in the date input text field. If no date has been selected, places focus on the current date." | As APG (native button activation runs the click handler).              |
| Panel           | Escape       | "Closes the dialog and returns focus to the "Choose Date" button."                                                                                                                 | As APG (Popover light dismiss); the value is unchanged.                |
| Panel           | Tab          | "Moves focus to next element in the dialog Tab sequence."                                                                                                                          | Previous, Next, the day; from the day, out of the panel, which closes. |
| Panel, day grid | all          | "Date Picker Dialog: Date Grid" table                                                                                                                                              | Calendar's map; Space / Enter choose, close and return focus.          |

Escape inside the panel is the Popover's close request; a DatePicker inside a Dialog closes only its panel (HTML closes the topmost auto popover first; inference from the close-request steps, Popover spec).

**RTL:** the trigger sits at the inline end; the Calendar's Left / Right swap; segments follow DateField.

## Accessibility

- **Trigger.** APG: "The initial value of accessible name is "Choose Date"." Here the author's `triggerLabel`, with the value in `aria-describedby` (Behaviour). `aria-haspopup="dialog"` and `aria-expanded` (Popover).
- **Panel.** `role="dialog"` named by `aria-label` (APG: `aria-label` "Defines the accessible name for the dialog."). Not `aria-modal` (non-modal Popover).
- **Field and grid.** DateField's and Calendar's Accessibility sections apply unchanged. APG's "The description of the date format is associated with the text input via aria-describedby" is met by the named segments (DateField spec).
- **Targets.** The trigger is IconButton `sm` (28, growing on coarse pointers) inside a 32 / 40 field box.
- **More contrast, forced colors, reduced transparency:** as DateField for the field, Popover for the panel (`color-material-thick` turns solid, `backdrop-filter: none`), Calendar for the grid.

## RTL

Logical properties only. The trigger at the inline end of the field box; the panel's `inset-inline-start: anchor(self-start)` (Popover recipe) aligns it with the field box's inline start, which is the right edge in RTL; the panel inherits `dir` in the top layer (spike #4). `CalendarIcon` is not mirrored.

## Component tokens

None new. The field box uses `input-*` and `date-field-*`, the trigger `icon-button-*`, the panel `popover-*` (except `popover-max-width`, Anatomy), the grid `calendar-*`. No `date-picker` Dictionary word is needed.

## Author-written text

None. `triggerLabel` is required, `unavailableMessage` is required with `isDateUnavailable`, DateField's `incompleteMessage` applies, and the Calendar inside takes its own month-button names.

## Feedback events

The trigger is an IconButton and dispatches its `ab-press` (`{ component: "IconButton", reason: "user" }`). The panel is a Popover and dispatches `ab-dismiss` with `component: "Popover"` for Escape and outside presses (composition precedent: PasswordField → IconButton, Command.Dialog → Dialog). Choosing a day dispatches nothing (a selection; Calendar spec) and closes with `"day-press"`, which is not a dismiss. No `src/events/events.ts` change.

## Testing

User-centric only (hard rule): the trigger's role, name, description (the full date) and `aria-expanded`; the dialog's role and name; focus on the selected day (or today) after a keyboard and a pointer open, with an eager and a lazy Calendar; choosing by click, Enter and Space closes the panel, returns focus to the trigger and updates the segments and the submitted `FormData`; Escape and an outside press keep the value and return focus; Tab from the day closes the panel; a typed unavailable date shows `unavailableMessage` after leaving the field; `onValueChange` / `onOpenChange` values and `details.reason`; `ab-press` and `ab-dismiss` events; the production split in `apps/ui-next-fixture`; screenshots of the open panel (open state is the end state of `play`) in every variant.

## Sources

- WAI-ARIA APG Date Picker Dialog example: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
- React Aria DatePicker: https://react-aria.adobe.com/DatePicker (API from https://react-aria.adobe.com/DatePicker.md) · Ark DatePicker: https://ark-ui.com/llms-react.txt ("# Date Picker") · shadcn Date Picker: https://ui.shadcn.com/docs/components/date-picker · Mantine DatePickerInput: https://mantine.dev/llms/dates-date-picker-input.md
- React `lazy`: https://react.dev/reference/react/lazy (quoted in the Command spec).
- Baseline (webstatus.dev, 2026-10-24): `popover` newly (low 2025-01-27); `invoker-commands` newly (low 2025-12-12); the Popover spec's anchoring and transition rows; `temporal` limited (ADR-0004's polyfill).
- DateField, Calendar, Popover, IconButton, Command specs.
