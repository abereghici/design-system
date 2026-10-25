# Calendar

A month grid for choosing one date while seeing the days around it: a delivery slot, a booking day, a deadline next to the weekends. Inline on a page, or inside DatePicker's panel. To type a known date, use DateField; for a field with a calendar on demand, DatePicker.

```tsx
import { Calendar } from "@platform/ui/calendar";

<Calendar
  aria-label="Delivery date"
  min={Temporal.Now.plainDateISO()}
  isDateUnavailable={(date) => date.dayOfWeek > 5}
  value={delivery}
  onValueChange={setDelivery}
/>;
```

Status: draft for brand-owner review (phase 6). No source guide: drafted from the brand book (Motion, Interaction principles, Shape and depth), the WAI-ARIA APG Date Picker Dialog example and Grid pattern, React Aria Calendar, Ark DatePicker and shadcn Calendar. Temporal: ADR-0004 (accepted 2026-10-24).

## Anatomy

Root → header (Previous, month heading, Next) → grid (weekday row, six week rows of day cells).

- **Root.** A `<fieldset>` (implicit role `group`; oxlint prefers it over `div[role=group]`) named by the consumer's `aria-label` / `aria-labelledby` (inside DatePicker, by the panel). Width is seven cells.
- **Header.** A flex row: Previous, heading, Next, with the heading centred.
- **Previous / Next.** `IconButton` `size="sm"` with `ChevronRightIcon`, flipped for Previous (Pagination precedent as built: `rotate: 180deg`, which composes with Icon's RTL mirror), named by the author's required `previousMonthLabel` / `nextMonthLabel` (APG: `aria-label` "Defines the accessible name of the button (e.g. "Next Year")."). `aria-disabled="true"` when the month before or after lies wholly outside `min` / `max`.
- **Heading.** An `<h2 id aria-live="polite">` with the month and year, `Intl.DateTimeFormat(tag, { month: "long", year: "numeric" })` ("October 2026", "octombrie 2026"), in `calendar-header-font`, `color-text-default`. APG: "When the month and/or year changes the content of the h2 element is updated. Indicates the h2 should be automatically announced by screen readers."
- **Grid.** A `<table role="grid" aria-labelledby={headingId}>`. APG: "Since the grid role is applied to a table element, the row, columnheader, and gridcell roles do not need to be specified because they are implied by tr, th, and td tags."
- **Weekday row.** `<thead>` with seven `<th scope="col" abbr={long}>`: short names from `Intl.DateTimeFormat(tag, { weekday: "short" })` ("Mon", "lun."), the full name in `abbr` from `{ weekday: "long" }` (APG: "each th element includes a abbr attribute containing the full spelling of the name of the day for that column."). `type-label-sm`, `color-text-subtle`. The week starts on `new Intl.Locale(tag).getWeekInfo().firstDay` (MDN: "An integer between 1 (Monday) and 7 (Sunday) indicating the first day of the week for the locale."), the same numbering as `Temporal.PlainDate.prototype.dayOfWeek` ("1 usually represents Monday in the calendar"): Sunday for en-US, Monday for ro-RO.
- **Day cell.** A `<td>` square of `calendar-cell-size` (32), radius `calendar-cell-border-radius` (8), the day number centred in `calendar-cell-font` (tabular figures) and `calendar-cell-text-color`. Days of the neighbouring months are empty, unfocusable cells with `aria-hidden="true"` (the APG example renders them as `<td class="disabled" tabindex="-1">` with no text; oxlint `control-has-associated-label` rejects an empty unlabelled cell; the screen-reader pass checks column alignment). Always six week rows, so the height never changes between months (Ark `fixedWeeks`: "This renders the calendar with 6 weeks instead of 5 or 6."; judgement call: inside a DatePicker anchored above a field a jumping height moves the panel).
- **Today.** A 1 px inset border in `calendar-today-border-color`; the selected fill covers it when today is also the value.

## API

`Calendar`

| Prop                                   | Type                                                                        | Default | Notes                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `value`                                | `Temporal.PlainDate \| null`                                                |         | Controlled.                                                                                    |
| `defaultValue`                         | `Temporal.PlainDate \| null`                                                | `null`  | Uncontrolled.                                                                                  |
| `onValueChange`                        | `(value: Temporal.PlainDate, details: Calendar.ChangeEventDetails) => void` |         | `reason`: `"day-press"` (click, Enter or Space on a day). `cancel()` keeps the previous value. |
| `min`, `max`                           | `Temporal.PlainDate`                                                        |         | Days outside are unavailable; Previous / Next stop at their months.                            |
| `isDateUnavailable`                    | `(date: Temporal.PlainDate) => boolean`                                     |         | Unavailable days stay focusable and readable, but cannot be chosen.                            |
| `previousMonthLabel`, `nextMonthLabel` | `string` (required)                                                         |         | Names of the icon-only month buttons ("Previous month", "Next month").                         |
| …native                                | `Omit<ComponentProps<"div">, "defaultValue" \| "onChange">`                 |         | `ref`, `className`, `aria-label`, `aria-labelledby` on Root. `role` is owned.                  |

Inside `DatePicker.Content`, the Calendar takes `value`, `min`, `max` and `isDateUnavailable` from the DatePicker (DatePicker spec); set them on `DatePicker.Root`.

The visible month follows the value (or today when there is none) on mount, then moves with the focused day. `details` is `{ reason, event, cancel() }` (shared contract).

Names, checked against the reference libraries:

- **`Calendar`**: React Aria "A calendar displays one or more date grids and allows users to select a single date." (https://react-aria.adobe.com/Calendar); shadcn "A calendar component that allows users to select a date or a range of dates." (https://ui.shadcn.com/docs/components/calendar); Mantine `Calendar`; Ark has no standalone Calendar (it is `DatePicker.View` / `Table` inside DatePicker, `inline` mode). Single-part: React Aria's `CalendarGrid`, `CalendarCell`, `CalendarHeading` and Ark's `ViewControl`, `PrevTrigger`, `NextTrigger`, `Table*` are drawn by the component (YAGNI: no consumer need to recompose the grid).
- **`value` / `defaultValue` / `onValueChange`**: Ark "`value` … The selected date.", `onValueChange`; React Aria `value` "The current value (controlled).", `onChange`; shadcn `selected` / `onSelect` (React DayPicker). The type is `Temporal.PlainDate` (ADR-0004).
- **`min` / `max`**: Ark DatePicker `min`, `max`; React Aria `minValue` / `maxValue` "The minimum allowed date that a user may select." DateField's names, which are the HTML attribute names.
- **`isDateUnavailable`**: React Aria "Callback that is called for each date of the calendar. If it returns true, then the date is unavailable."; Ark "`isDateUnavailable` `(date: DateValue, locale: string) => boolean` … Returns whether a date of the calendar is available." Both libraries use this name.
- **First day of the week from the `locale`**: React Aria `firstDayOfWeek` "The day that starts the week." and Ark `startOfWeek` "The first day of the week." override the locale; here the `locale`'s `getWeekInfo()` decides (YAGNI: no override prop).
- Left out (YAGNI): ranges (React Aria `RangeCalendar`, Ark `selectionMode`, shadcn `mode="range"`); several months (`visibleDuration`, `pageBehavior`, Ark `numOfMonths`); month and year pickers (React Aria `CalendarMonthPicker` / `CalendarYearPicker`, Ark `ViewTrigger` and month / year views): Shift + Page Up / Down move by year, and DateField types any year; `focusedValue` / `defaultFocusedValue` / `onFocusChange` (React Aria, Ark); `firstDayOfWeek` / `startOfWeek`; `outsideDaySelectable` (Ark) and visible outside days; week numbers; `isReadOnly`, `isInvalid` and `errorMessage` (React Aria); international calendars (Gregorian only, ADR-0004); the APG example's previous / next year buttons, OK / Cancel buttons and keyboard help text (a press chooses, Escape cancels in DatePicker).

## States

| State          | How it shows                                                                                                                                                                 | Exposed as                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| rest           | Day number in `calendar-cell-text-color`                                                                                                                                     |                                          |
| hovered        | Fill `calendar-cell-background-color-hovered`, no transition; available days, fine pointers only                                                                             | `:hover` under `@media (hover: hover)`   |
| focused        | The 2 px focus ring with no offset, on the cell; on the selected day it stands off by its width (the ring is the fill colour; React Aria and Spectrum calendars leave a gap) | `:focus-visible`                         |
| selected       | Fill `calendar-cell-background-color-selected`, text `calendar-cell-text-color-selected`                                                                                     | `aria-selected="true"`                   |
| today          | 1 px border `calendar-today-border-color`                                                                                                                                    | `aria-current="date"`                    |
| unavailable    | Text `calendar-cell-text-color-disabled`; no hover                                                                                                                           | `aria-disabled="true"`                   |
| month boundary | Previous or Next unavailable                                                                                                                                                 | `aria-disabled="true"` on the IconButton |

## Behaviour

- **Roving focus.** One day cell is in the Tab sequence (`tabindex="0"`), the rest `tabindex="-1"`. APG: "At any given time, only one gridcell within the grid is in the dialog Tab sequence." The tab stop is the focused day: on mount the value, else today, clamped into `min` / `max`; it moves with the keys below and follows a day that receives focus by pointer. Tab order inside the Calendar: Previous, Next, the day (APG example order, without the year buttons).
- **Moving.** Arrow keys, Home / End and Page keys move the focused day with Temporal arithmetic (`add({ days: 1 })`, `add({ weeks: 1 })`, `add({ months: 1 })`, `add({ years: 1 })`; month and year moves keep the day number or take the month's last day, APG: "If that day does not exist, moves focus to the last day of the month.", which is Temporal's default `overflow: "constrain"`). A move into another month shows that month; the heading's live region announces it. A move before `min` or after `max` does nothing (judgement call: APG's grid "If focus is on the … cell …, focus does not move.").
- **Previous / Next.** Show the month before or after; focus stays on the button; the tab stop takes the same day number in the new month (or its last day). Each press is an IconButton press.
- **Choosing** (`"day-press"`): a click, Enter or Space on an available day calls `onValueChange(day, details)`; `cancel()` keeps the old value. Choosing the selected day again changes nothing. An unavailable day does nothing (`aria-disabled`).
- **Today** is `Temporal.Now.plainDateISO()` (MDN: "returns the current date as a `Temporal.PlainDate` object, in the ISO 8601 calendar and the specified time zone"; the system time zone by default), read on mount and on each `focus` of the Root, so a page left open overnight moves the marker (inference).
- **Locale.** Weekday names, month heading, day numbers, the cells' accessible names and the first day of the week come from the `locale` prop (inside a DatePicker, the DatePicker's), else the runtime's default; formatters are created once per locale, lazily. The focused day follows today and the value until the user moves it, so after hydration it starts in the user's time zone.
- **Server rendering.** "Today" differs between server and client time zones, so the server renders the value's month (or the current UTC month) and the client corrects it after hydration (inference: the build ticket checks no hydration error when the server and the browser are on different dates).
- Client component (`'use client'`): one file.

## Motion

None. Month changes swap the grid in one frame: they come from keys and repeated presses (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions."), and a slide would put two months on screen while the heading already announces one. Hover and selection fills change without a transition (DropdownMenu precedent: highlight follows the pointer instantly). The IconButtons keep their own press feedback.

- **Reduced motion:** nothing to remove.
- **Instant exit:** nothing exits; the previous month is replaced in the same frame as the heading text, so what is seen and what is announced agree.

## Keyboard

APG patterns: **Date Picker Dialog** example, "Date Grid" table (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/), on the **Grid** pattern (https://www.w3.org/WAI/ARIA/apg/patterns/grid/: "Only one of the focusable elements contained by the grid is included in the page tab sequence.").

| Key               | APG                                                                                                                                                                                    | Here                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Right Arrow       | "Moves focus to the next day."                                                                                                                                                         | As APG; swapped in RTL.                                                             |
| Left Arrow        | "Moves focus to the previous day."                                                                                                                                                     | As APG; swapped in RTL.                                                             |
| Down Arrow        | "Moves focus to the same day of the next week."                                                                                                                                        | As APG.                                                                             |
| Up Arrow          | "Moves focus to the same day of the previous week."                                                                                                                                    | As APG.                                                                             |
| Home              | "Moves focus to the first day (e.g Sunday) of the current week."                                                                                                                       | The `locale`'s first day of the week.                                               |
| End               | "Moves focus to the last day (e.g. Saturday) of the current week."                                                                                                                     | The `locale`'s last day of the week.                                                |
| Page Up           | "Changes the grid of dates to the previous month. Moves focus to the day of the month that has the same number. If that day does not exist, moves focus to the last day of the month." | As APG.                                                                             |
| Page Down         | "Changes the grid of dates to the next month." (same focus rule)                                                                                                                       | As APG.                                                                             |
| Shift + Page Up   | "Changes the grid of dates to the same month in the previous year." (same focus rule)                                                                                                  | As APG.                                                                             |
| Shift + Page Down | "Changes the grid of dates to the same month in the next year." (same focus rule)                                                                                                      | As APG.                                                                             |
| Space, Enter      | "Select the date, close the dialog, and move focus to the "Choose Date" button."                                                                                                       | Chooses the day; inside DatePicker also closes and returns focus (DatePicker spec). |
| Tab / Shift + Tab | "Moves focus to next element in the dialog Tab sequence. Note that, as specified in the Grid Pattern, only one button in the calendar grid is in the Tab sequence."                    | Previous, Next, the focused day.                                                    |

Ark's DatePicker maps Home / End to "the first day of the current month" / "the last day of the current month"; APG's week rule is kept. Every key above calls `preventDefault()` (Page keys would scroll the page).

**RTL:** Left / Right swap (direction read at keydown with `element.matches(":dir(rtl)")`, shared contract): in RTL the week runs right to left, so Left is the next day. Up / Down and the Page keys never swap.

## Accessibility

- **Grid.** `role="grid"` on the `<table>`, named by the heading (APG: "Identifies the element that provides the accessible name for the grid."). No `aria-readonly` (Grid pattern: "Grids that do not provide editing functions do not include the aria-readonly attribute on any of their elements.").
- **Cell names.** Each day cell has `aria-label` from `Intl.DateTimeFormat(tag, { dateStyle: "full" })` ("Saturday, October 24, 2026"), so a screen reader that skips headers still hears the full date (judgement call: the APG example relies on the `abbr` column headers and the grid name; the screen-reader pass records both).
- **Selected.** APG: `aria-selected="true"` "Identifies the cell containing the currently selected date" and "Only set on the cell containing the currently selected date; no other cells have aria-selected specified." Grid pattern: "If the grid supports selection, when a cell or row is selected, the selected element has aria-selected set true."
- **Today.** `aria-current="date"` (MDN: "Represents the current date within a collection of dates such as the current date within a calendar.").
- **Unavailable.** `aria-disabled="true"` on the cell (WAI-ARIA allows it on `gridcell`), focusable so the user can hear why a day cannot be chosen (shared Disabled contract).
- **Month changes** are announced by the heading's polite live region (APG). It is always rendered, so it exists before its text changes (MDN live regions: "Establish the live region before updating its content.").
- **Targets.** Cells are `size-control-md` (32, growing on coarse pointers); IconButtons as their spec.
- **Contrast.** Day text `color-text-default`, weekday `color-text-subtle`, selected `color-text-on-accent` on `color-background-accent-bold`, today's border `color-border-accent` (3:1 non-text): all in the contrast matrix. Unavailable text is exempt (WCAG 2.2 1.4.3).
- **More contrast:** nothing changes: weekday names already use `color-text-subtle` (AA at 4.5:1), and the selected and today colours are the strongest roles.
- **Forced colors:** the selected cell sets `Highlight` / `HighlightText`; today keeps a 1 px `CanvasText` border; unavailable days use `GrayText`; the hover fill is dropped.
- **Reduced transparency:** not affected (the Calendar has no Material; inside DatePicker the panel follows Popover).

## RTL

Logical properties only. The table inherits `dir`, so its columns run right to left (the first day of the week at the inline start). Previous / Next swap sides with the row; their chevrons follow Pagination's rule. Left / Right keys swap (Keyboard).

## Component tokens

Existing: `icon-button-*` (Previous / Next).

Proposed new:

| Token                                     | References                                | `$type`    | Why                                             |
| ----------------------------------------- | ----------------------------------------- | ---------- | ----------------------------------------------- |
| `calendar-cell-size`                      | `size-control-md`                         | dimension  | Day cell square (32; larger on coarse pointers) |
| `calendar-cell-border-radius`             | `radius-sm`                               | dimension  | 8, as menu items                                |
| `calendar-cell-font`                      | `type-data-md`                            | typography | Tabular figures for day numbers                 |
| `calendar-cell-text-color`                | `color-text-default`                      | color      | Day number                                      |
| `calendar-cell-background-color-hovered`  | `color-background-neutral-subtle-hovered` | color      | Hover fill                                      |
| `calendar-cell-background-color-selected` | `color-background-accent-bold`            | color      | The chosen day                                  |
| `calendar-cell-text-color-selected`       | `color-text-on-accent`                    | color      | Its number                                      |
| `calendar-cell-text-color-disabled`       | `color-text-disabled`                     | color      | Unavailable days                                |
| `calendar-today-border-color`             | `color-border-accent`                     | color      | Today's marker                                  |
| `calendar-header-font`                    | `type-label-md`                           | typography | Month heading                                   |

The weekday row (`type-label-sm`, `color-text-subtle`) and gaps use semantic tokens directly. The focus ring uses `focus-ring-width` and `color-border-focused` directly. New Dictionary words: component `calendar`, modifiers `cell` (the Grid pattern's and React Aria's `CalendarCell` word) and `today`.

## Author-written text

None. The month buttons' names are required by type; weekday, month and date texts are `Intl` output in `locale`.

## Feedback events

Choosing a day dispatches nothing: it is a selection (Select, Combobox, DateField precedent). Previous / Next are IconButtons and dispatch their own `ab-press` (`{ component: "IconButton", reason: "user" }`, composition contract). No `src/events/events.ts` change.

## Testing

User-centric only (hard rule): the grid's role and name (the month heading); column headers' names; which cell is focused after each key in the table (and Left / Right swapped under `dir="rtl"`), across month and year boundaries and at `min` / `max`; the heading text after Page keys and Previous / Next; `aria-selected`, `aria-current="date"` and `aria-disabled` cells by name; the first weekday column for en-US (Sunday) and ro-RO (Monday); `onValueChange` values and `details.reason`; unavailable days not chosen; screenshots of a month with a value, today, unavailable days, focus, and RTL.

## Sources

- WAI-ARIA APG Date Picker Dialog example: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/ · Grid pattern: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
- React Aria Calendar: https://react-aria.adobe.com/Calendar (API from https://react-aria.adobe.com/Calendar.md) · Ark DatePicker: https://ark-ui.com/llms-react.txt ("# Date Picker") · shadcn Calendar: https://ui.shadcn.com/docs/components/calendar
- MDN: `Intl.Locale.prototype.getWeekInfo()` https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo · `Temporal.PlainDate` https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate · `Temporal.Now.plainDateISO()` https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Now/plainDateISO · `aria-current` https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current · Live regions https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
- Baseline (webstatus.dev, 2026-10-24): `intl-locale-info` (`getWeekInfo`) newly (low 2026-07-21); `intl` widely; `temporal` limited (ADR-0004's polyfill).
- IconButton, Icon and Pagination specs (chevron mirroring). Raw downloads: `/tmp/ab49/`.
