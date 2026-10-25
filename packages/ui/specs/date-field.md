# DateField

Entry of one calendar date by keyboard: a due date, a birth date, a start date. Each part of the date (day, month, year) is its own editable segment, in the order and with the separators of the `locale` (else the runtime's). Use it when the user knows the date and typing is fastest (birth dates, dates copied from a document). To pick a date while seeing the month around it, use DatePicker (a DateField plus a Calendar); to show a month without a field, use Calendar.

```tsx
import { DateField } from "@platform/ui/date-field";

<DateField label="Date of birth" name="birthDate" required />

<DateField
  label="Start date"
  name="start"
  description="The first day of the contract."
  min={Temporal.PlainDate.from("2026-01-01")}
  value={start}
  onValueChange={setStart}
/>
```

Status: draft for brand-owner review (phase 6). No source guide: drafted from the brand book (Motion, Interaction principles, Personality), the Field spec, the WAI-ARIA APG Spinbutton pattern, React Aria DateField and Ark DateInput. Temporal: ADR-0004 (accepted 2026-10-24).

## Anatomy

Label → field box (segments and separators) → description or error. A visually hidden native date input carries the form value and the constraint validation.

- **Label, description, error.** The Field Parts, built in (Field spec), as Select and Combobox. The Label is a `<label for>` pointing at the hidden input; a click on it focuses the first segment (Behaviour).
- **Field box.** A `<fieldset aria-labelledby={labelId} aria-describedby>` (implicit role `group`; no legend, the Label names it) drawn with TextField's container chrome (`input-*`: height 32 / 40, radius 8, hairline, raised elevation), `dir` inherited. A pointer press on the box outside a segment focuses the first empty segment, or the last one when all are filled.
- **Segment.** One `<input type="text" role="spinbutton" inputmode="numeric" enterkeyhint="next" autocomplete="off">` per date part, sized with `field-sizing: content` (newly available, low 2026-06-16) (`day`, `month`, `year`), in the order `Intl.DateTimeFormat(tag, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts()` gives for the `locale`: en-US "MM/DD/YYYY", ro-RO "DD.MM.YYYY". Text in `input-font` with `font-variant-numeric: tabular-nums`, so the box does not change width while typing. Empty, it shows its `placeholder` (the author's optional `placeholders`, such as `{ day: "dd", month: "mm", year: "yyyy" }`) in `input-placeholder-color`. Focused, it fills with `date-field-segment-background-color-focused`, text `date-field-segment-text-color-focused`, radius `date-field-segment-border-radius`, with no caret (`caret-color: transparent`).
- **Separator text.** Each `literal` part of `formatToParts()` ("/", ".", " ") as an `aria-hidden` `<span>` in `input-placeholder-color` while the segments on both sides are empty, `input-text-color` otherwise.
- **Hidden input.** `<input type="date" tabindex="-1" aria-hidden="true">`, visually hidden (the VisuallyHidden rule), holding the ISO value (`value.toString()`, "YYYY-MM-DD"; empty when there is no complete date), with `name`, `form`, `required`, `min`, `max`. It is what the form submits and what constraint validation reads.

## API

`DateField`

| Prop                                                                                      | Type                                                                                 | Default | Notes                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`, `description`, `errorMessage`, `invalid`, `validate`, `size`, `required`, `name` | as Select                                                                            |         | `size`: `"md"` \| `"lg"`, exposed as `data-size`. `validate` receives the ISO string (`""` when there is no complete date).                                                                                  |
| `value`                                                                                   | `Temporal.PlainDate \| null`                                                         |         | Controlled. `null` is no date.                                                                                                                                                                               |
| `defaultValue`                                                                            | `Temporal.PlainDate \| null`                                                         | `null`  | Uncontrolled.                                                                                                                                                                                                |
| `onValueChange`                                                                           | `(value: Temporal.PlainDate \| null, details: DateField.ChangeEventDetails) => void` |         | Called when the complete date changes, or becomes incomplete (`null`). `reason`: `"input-change"` (typing, Backspace, Delete), `"keyboard"` (arrow keys, Home, End). `cancel()` keeps the previous segments. |
| `min`, `max`                                                                              | `Temporal.PlainDate`                                                                 |         | Written to the hidden input as ISO strings, so `rangeUnderflow` / `rangeOverflow` and the browser's message apply.                                                                                           |
| `disabled`                                                                                | `boolean`                                                                            | `false` | `aria-disabled="true"` on the group and every segment: focusable, nothing changes, the value still submits.                                                                                                  |
| `incompleteMessage`                                                                       | `string` (required)                                                                  |         | The error for a date typed only in part ("Enter a complete date").                                                                                                                                           |
| `placeholders`                                                                            | `Partial<Record<"day" \| "month" \| "year", string>>`                                |         | Hints in the empty segments.                                                                                                                                                                                 |
| `className`, `style`                                                                      |                                                                                      |         | On the Field root.                                                                                                                                                                                           |
| …native                                                                                   | `Omit<ComponentProps<"div">, "defaultValue" \| "onChange">`                          |         | `ref`, `id`, `aria-*` go on the group; `form` goes on the hidden input.                                                                                                                                      |

`details` is `{ reason, event, cancel() }` (shared contract).

Names, checked against the reference libraries:

- **`DateField`**: React Aria "A date field allows users to enter and edit date and time values using a keyboard. Each part of a date value is displayed in an individually editable segment." (https://react-aria.adobe.com/DateField); Ark calls the same component `DateInput` (`DateInput.Root > Label, Control > SegmentGroup > Segment, HiddenInput`, https://ark-ui.com/llms-react.txt); Mantine `DateInput` "Free form date input" (https://mantine.dev/llms/dates-date-input.md). Spec #1 already names it DateField (Phase 6 list), and React Aria's word says what it is (a Field, with the Field contract). Single-part: every Part a library exposes (React Aria `DateInput` / `DateSegment`, Ark `Control` / `SegmentGroup` / `Segment`) is drawn by the component, as Select draws its trigger.
- **Why not a visible `<input type="date">`** (the platform's own control, widely available): MDN "The appearance of the date picker input UI varies based on the browser and operating system." and "the displayed date is formatted _based on the locale of the user's browser_". It would ignore the `locale` prop (a ro-RO app in an en-US browser shows MM/DD/YYYY), its parts cannot be styled with standard CSS, and its own picker would compete with DatePicker's Calendar. It is still used, hidden, for what it does well: the ISO form value and constraint validation (judgement call, platform first where it fits).
- **Segments as spinbuttons**: Ark DateInput "Complies with the [Spinbutton WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)."; React Aria `DateSegment` renders a `span` (`DOMRenderFunction<"span", DateSegmentRenderProps>`).
- **`value` / `defaultValue` / `onValueChange(value, details)`**: Ark DateInput "`onValueChange` … Function called when the value changes.", "`defaultValue` … The initial selected date(s) when rendered."; React Aria `value` / `defaultValue` / `onChange` "Handler that is called when the value changes." The type is `Temporal.PlainDate` (ADR-0004, spec #1 story 26), not React Aria's and Ark's `@internationalized/date` `DateValue`. Reasons reuse NumberField's `"keyboard"` and Base UI's `"input-change"`.
- **`min` / `max`**: Ark "`min` … The minimum date that can be selected.", "`max` … The maximum date that can be selected."; React Aria `minValue` / `maxValue` "The minimum allowed date that a user may select." The HTML attribute names win (they are what the hidden input takes).
- **`name` submits ISO 8601**: React Aria "Use the `name` prop to submit the selected date to the server as an ISO 8601 string."; Ark "`name` … The `name` attribute of the input element."; MDN `<input type="date">`: "the parsed `value` is always formatted `yyyy-mm-dd`."
- **`required`, `disabled`, `invalid`**: Ark Root `required`, `disabled`, `invalid`; React Aria `isRequired`, `isDisabled`, `isInvalid`.
- Left out (YAGNI): times and `granularity` / `hourCycle` / `hideTimeZone` / `timeZone` (React Aria, Ark): dates only, `Temporal.PlainDate` only; `ZonedDateTime` and `PlainDateTime` values; `placeholderValue` / `defaultPlaceholderValue` (React Aria, Ark: "A placeholder date that influences the format of the placeholder shown when no value is selected."); `shouldForceLeadingZeros` (React Aria, Ark: always two digits here, Behaviour); `isDateUnavailable` (React Aria; it lives on Calendar and DatePicker); `readOnly` (Ark); `selectionMode: "range"` (Ark); international calendars (React Aria `<I18nProvider>`, Ark `createCalendar`: Gregorian only, ADR-0004); `translations` (Ark: our author-text props `incompleteMessage`, `unavailableMessage`, `placeholders`); `ClearTrigger` (Ark: Backspace or Delete clear); paste of a whole date.

## States

| State            | How it shows                                                                                                                                                               | Exposed as                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| empty            | Every segment shows its placeholder; separators in the placeholder colour                                                                                                  | no `aria-valuenow` or `aria-valuetext` on an empty segment                            |
| hovered          | Border `input-border-color-hovered`; fine pointers only                                                                                                                    | `:hover` under `@media (hover: hover)`                                                |
| focused          | Border `input-border-color-focused` and the 2 px focus ring on the field box; the focused segment fills and carries the inset focus ring (ADR 0002, active-item indicator) | `:focus-within` on the group, `:focus-visible` on the segment                         |
| partially filled | The filled segments show digits; the empty ones their placeholder                                                                                                          | `aria-valuenow` on filled segments only                                               |
| complete         | Every segment shows digits                                                                                                                                                 | hidden input `value`                                                                  |
| invalid          | Border `input-border-color-invalid`; error replaces the description                                                                                                        | `aria-invalid="true"` on every segment, `data-invalid` (Field contract)               |
| disabled         | TextField's disabled colours; no hover                                                                                                                                     | `aria-disabled="true"`, or `:disabled` on the hidden input inside a disabled Fieldset |

## Behaviour

- **Field.** Follows the Field contract (`field.md`) with one departure, because the control the user edits is not a form control:
  1. Validation is the platform's: the hidden `<input type="date">` carries `required`, `min` and `max`, so `valueMissing`, `rangeUnderflow` and `rangeOverflow` and their localised `validationMessage` come from the browser (MDN `min`: "If the value entered into the element occurs beforehand, the element fails constraint validation."). `validate` and server errors write through its `setCustomValidity()`.
  2. Timing follows `:user-invalid`'s rule, applied by the DateField itself: a script-set value never sets user validity (HTML: user validity turns true when "the user commits the change"), so the DateField treats focus leaving the group after an edit as the commit, and the hidden input's `invalid` event (a submit attempt) as the submit. Reset clears it. Inference: the result matches `:user-invalid` timing; the build ticket checks the error appears after Tab out of an empty required DateField that was edited, and after a failed submit, and not before.
  3. A failed submit focuses the hidden input (HTML interactive validation focuses the first invalid control); its `focus` listener moves focus to the first empty segment, or the first segment. WebKit neither focuses the visually hidden input on a failed submit nor on a Label click (it forwards a click), so the input's `invalid` handler (when it is the form's first invalid control) and its `click` handler move focus too (verified in the three engines).
  4. **Incomplete entry.** While some but not all segments are filled, the value is `null`, the hidden input is empty and carries `setCustomValidity(incompleteMessage)` ("Enter a complete date"), so a half-typed date never submits as empty without a message. A native date input reports the same case as `badInput` (MDN `badInput`: "indicates if the user has provided input that the browser is unable to convert"; inference that engines set it for a partial date). Precedence: incomplete, then `validate`, then server errors. A server error clears on the first segment edit, as on every Field control (Field spec, Server errors).
- **Value.** When all three segments hold a number, the DateField builds `Temporal.PlainDate.from({ year, month, day }, { overflow: "constrain" })` (MDN: "When using the `overflow: "constrain"` option, invalid dates are fixed to a valid one"), so 31 February becomes 28 or 29 February and the day segment shows the fixed day. `onValueChange` runs when that date differs from the previous one (`PlainDate.prototype.equals`), and with `null` when a segment is cleared. `cancel()` restores the previous segments.
- **Typing a segment.** Digits only (`beforeinput` is prevented and its `data` read, so the DOM text is always the component's; IME composition is ignored while `isComposing`). Each segment keeps a typed buffer:
  - Month (1–12) and day (1–`daysInMonth`, or 31 while the month or year is unknown): a digit that cannot start a longer valid number (month 2–9, day 4–9), or a second digit, commits the segment and moves focus to the next one. A digit that would overflow starts a new number (typing 1 then 3 in the month gives 3).
  - Year: four digits commit and move on. Fewer digits stay as typed (year 26 is year 26; judgement call: no two-digit year guessing).
  - The `locale`'s separator key (the `literal` text, or `/`, `.`, `-`) commits the segment and moves on.
  - Committed month and day show two digits ("05"): one width for every value (judgement call against React Aria's and Ark's locale default, "When false, formatting follows the locale default (e.g. "1" instead of "01")").
- **Focus.** Each segment is a tab stop. Focus on the group's empty area or on the Label goes to the first empty segment (all empty: the first one). The segments keep no DOM selection (`caret-color: transparent`; inference: the build ticket checks no caret or selection highlight in three engines).
- **Contenteditable (superseded at build).** Segments are native text inputs with `role="spinbutton"` (ARIA in HTML allows it on `input type=text`): the browser inserts the character, the `input` event's `data` is read and the controlled value is re-rendered, so typing, IME and the mobile numeric keyboard are native. oxlint `jsx-a11y/prefer-tag-over-role` rejects a `span` with `role="spinbutton"`, and a contenteditable span gave nothing an input does not. Original draft: `contenteditable="plaintext-only"` with `inputmode="numeric"` makes touch devices show a numeric keyboard on a segment (MDN `inputmode`: "This allows a browser to display an appropriate virtual keyboard." and "It is used primarily on `<input>` elements, but is usable on any element in `contenteditable` mode."). Inference: a focusable non-editable `span` opens no virtual keyboard, which is why the segment is editable at all; the build ticket checks iOS Safari and Android Chrome.
- **Disabled** (`aria-disabled`): keys and typing do nothing, segments stay focusable, the value submits. Inside a disabled Fieldset the hidden input is natively disabled and not submitted (native).
- **Locale.** Order, separators, the month's spoken name and the segment names come from the `locale` prop (else the runtime's default) through `Intl.DateTimeFormat` and `Intl.DisplayNames`; nothing is hard-coded per locale. Formatters are created once per locale, lazily, never at import.
- **Server rendering.** The segments are computed from the tag and the value, so the server renders the same text as the client. `'use client'` on the one component file (state, listeners).

## Motion

None. Typing is keyboard-initiated and high-frequency (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions."): the segment fill and digits change in one frame. The field box's border colour change is TextField's.

- **Reduced motion:** nothing to remove.
- **Instant exit:** nothing exits; the error replaces the description in one frame (Field spec).

## Keyboard

APG pattern: **Spinbutton** (https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/), one per segment, with a direct-edit text field. APG: "Typically, the text field also allows users to directly edit the value." and "Focus remains on the text field during operation."

| Key                | APG                                                                                                                               | Here                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Up Arrow           | "Increases the value."                                                                                                            | +1, wrapping from the maximum to the minimum (12 → 1). An empty segment starts at today's part (`Temporal.Now.plainDateISO()`). |
| Down Arrow         | "Decreases the value."                                                                                                            | −1, wrapping from the minimum to the maximum. Empty: today's part.                                                              |
| Home               | "If the spinbutton has a minimum value, sets the value to its minimum."                                                           | Month 1, day 1, year 1.                                                                                                         |
| End                | "If the spinbutton has a maximum value, sets the value to its maximum."                                                           | Month 12, day `daysInMonth` (31 when unknown), year 9999.                                                                       |
| Digits             | "Printable Characters: Type characters in the textbox." "many implementations allow only certain characters as part of the value" | Typing rules (Behaviour); other characters are ignored, except the separator, which moves on.                                   |
| Backspace          | Standard editing key                                                                                                              | Removes the last typed digit; on an empty segment, moves focus to the previous segment.                                         |
| Delete             | Standard editing key                                                                                                              | Clears the segment.                                                                                                             |
| Left / Right Arrow | (not in APG)                                                                                                                      | Previous / next segment in visual order; swapped in RTL.                                                                        |
| Tab / Shift + Tab  | (page Tab sequence)                                                                                                               | Next / previous segment, then out of the field.                                                                                 |
| Enter              | (not in APG)                                                                                                                      | Implicit submission of the form (inference: the build ticket checks `requestSubmit` runs, since a segment is not an input).     |

Page Up / Page Down ("(Optional): Increases the value by a larger step than Up Arrow.") are left out (YAGNI). Up, Down, Home, End, Backspace, Delete and digits call `preventDefault()`; Tab and every modified key (Ctrl, Meta, Alt) are the browser's. APG: "IMPORTANT: Be sure that JavaScript does not interfere with browser-provided text editing functions by capturing key events for the keys used to perform them."

**RTL:** Left / Right swap (direction read at keydown with `element.matches(":dir(rtl)")`, shared contract). Up / Down never swap.

## Accessibility

- **Roles.** The field box is `role="group"` named by the Label (`aria-labelledby`), described by the Description or Error (`aria-describedby`, Field contract). APG: "The focusable element serving as the spinbutton has role spinbutton."
- **Segment names.** Each segment has `aria-label` = `new Intl.DisplayNames(tag, { type: "dateTimeField" }).of("day" | "month" | "year")` (MDN: "Example using `dateTimeField` as a type option, will return the localized date time names strings."; `dn.of("month"); // 'mês'` for `"pt"`) and `aria-describedby` → the group's description, so the field label is read from the group on entry (inference: the screen-reader pass records VoiceOver and NVDA reading "Date of birth, group, month, …").
- **Values.** APG: "The spinbutton element has the aria-valuenow property set to a decimal value representing the current value"; `aria-valuemin` / `aria-valuemax` as in the Keyboard table. The month adds `aria-valuetext` with its name (`Intl.DateTimeFormat(tag, { month: "long" })`, "October"; APG: "If the value of aria-valuenow is not user-friendly … the aria-valuetext property is set"). Empty segments have no `aria-valuenow` and no `aria-valuetext`; the author's `placeholders` show as their placeholder text.
- **Invalid.** APG: "The spinbutton element has aria-invalid set to true if the value is outside the allowed range." `aria-invalid` goes on every segment, mirroring the Field contract's state (ARIA 1.2 does not list `aria-invalid` for `group`).
- **Required.** The Label shows the decorative `*`; the hidden input's `required` is not in the accessibility tree, so each segment carries `aria-required="true"` (MDN `aria-required` "Used in roles" lists `spinbutton`, not `group`).
- **Hidden input.** `aria-hidden="true"` with `tabindex="-1"`: out of the Tab order and the tree, focused only by the browser's validation, which forwards focus to a segment.
- **Targets.** Segments are at least 24 px wide including padding (`size-target-min`).
- **More contrast:** the field box is TextField's; the focused-segment fill is `color-background-selected` with `color-text-selected`, both in the contrast matrix.
- **Forced colors:** the field box draws TextField's 1 px `CanvasText` border; the focused segment sets `Highlight` / `HighlightText` inside its ring; placeholders use `GrayText`.
- **Reduced transparency:** not affected.

## RTL

Logical properties only. The group inherits `dir`; the segment order is the `locale`'s `formatToParts()` order laid out in the inline direction. Left / Right follow the visual order (Keyboard).

## Component tokens

Existing: the field box's `input-*` set (TextField spec), including `input-placeholder-color` for placeholders and empty separators.

Proposed new:

| Token                                         | References                  | `$type`   | Why                                     |
| --------------------------------------------- | --------------------------- | --------- | --------------------------------------- |
| `date-field-segment-background-color-focused` | `color-background-selected` | color     | The focused segment's fill              |
| `date-field-segment-text-color-focused`       | `color-text-selected`       | color     | Text on that fill                       |
| `date-field-segment-border-radius`            | `radius-xs`                 | dimension | 5: concentric inside the 8 px field box |

New Dictionary words: component `date-field`, modifier `segment` (React Aria's and Ark's Part word). The focus ring uses `focus-ring-width` and `color-border-focused` directly.

## Author-written text

None. `incompleteMessage` is required by type (a half-typed date must be invalid with a message), `placeholders` are optional, and segment names, order and separators come from `Intl`.

## Feedback events

None. Entering a date is typing, not a toggle or a command (Select and Combobox precedent; brand book: "Soft synthesised clicks mark toggles, toasts and running a command."). No `src/events/events.ts` entry.

## Testing

User-centric only (hard rule): the group's role, name and description; each segment's role `spinbutton`, name, `aria-valuenow` / `aria-valuetext` after typing, arrows, Home / End, Backspace and Delete; focus moving between segments on typing, the separator key, Left / Right (and swapped under `dir="rtl"`), Tab; segment order and separators in en-US and ro-RO; `onValueChange` values (`Temporal.PlainDate`, `null`) and `details.reason`; the submitted `FormData` (ISO string); the error after Tab out of an edited empty required field, after a failed submit, for a partial date and below `min`, and focus on the first segment after a failed submit; screenshots of empty, partial, complete, focused, invalid and disabled.

## Sources

- WAI-ARIA APG Spinbutton: https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/ · Date Picker Dialog example (date-format description): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
- React Aria DateField: https://react-aria.adobe.com/DateField (API from https://react-aria.adobe.com/DateField.md) · Ark DateInput: https://ark-ui.com/llms-react.txt ("# Date Input") · Mantine DateInput: https://mantine.dev/llms/dates-date-input.md
- MDN: `<input type="date">` https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date · `Intl.DateTimeFormat.prototype.formatToParts()` https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts · `Intl.DisplayNames()` https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames/DisplayNames · `Temporal.PlainDate` https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate · `Temporal.Now.plainDateISO()` https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Now/plainDateISO · `inputmode` https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode · `ValidityState.badInput` https://developer.mozilla.org/en-US/docs/Web/API/ValidityState/badInput · `aria-required` https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-required- HTML Living Standard, user validity and interactive validation: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
- Baseline (webstatus.dev, 2026-10-24): `input-date-time` widely (low 2021-10-05); `intl-display-names` widely (low 2021-04-26); `input-event` (includes `beforeinput`) widely (low 2020-01-15); `inputmode` widely (low 2021-12-07); `contenteditable-plaintextonly` newly (low 2025-03-04); `user-pseudos` widely; `temporal` limited (no Safari: ADR-0004's polyfill).
- Field spec `packages/ui/specs/field.md`; Select, TextField, NumberField specs. Raw downloads: `/tmp/ab49/`.
