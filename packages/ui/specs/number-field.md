# NumberField

Entry of a number (a quantity, a price, a percentage) formatted for the user's locale, with step buttons and arrow-key stepping. Use it for real quantities. For digits that are not a number (postal codes, card numbers, one-time codes) use TextField with `inputMode="numeric"`; to pick a value in a range by feel, use Slider.

```tsx
import { NumberField } from "@platform/ui/number-field";

<NumberField label="Seats" name="seats" defaultValue={5} min={1} max={50} />
<NumberField
  label="Price"
  name="price"
  defaultValue={19.5}
  step={0.5}
  formatOptions={{ style: "currency", currency: "EUR" }}
/>
<NumberField label="Discount" name="discount" defaultValue={0.15} formatOptions={{ style: "percent" }} step={0.05} />
```

Status: draft for brand-owner review (phase 2). No source guide: drafted from TextField, the platform and the reference libraries.

## Anatomy

Label → container (input, decrement, increment) → description or error.

- **Label, description, error, container.** As TextField (Field Parts built in, the same `input-*` chrome).
- **Input.** A native `<input type="text">` with `inputMode` `decimal` (or `numeric` when `step` and `min` allow only whole, non-negative numbers), showing the formatted value. `autocomplete="off"`, tabular figures (as Base UI's input: `autoComplete: 'off'`).
- **Decrement / increment.** Two IconButtons (`sm`, `minus` and `plus` glyphs) at the inline end, outside the tab order (`tabIndex={-1}`), `aria-controls` the input.
- **Hidden value input.** An `<input type="hidden">` carrying `name` and the raw number (`"19.5"`, never `"€19.50"`), so the form submits a parseable value.

## API

| Prop                                                                                                          | Type                                                                                                       | Default                                            | Notes                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`                                                                                                       | `number \| null`                                                                                           |                                                    | Controlled raw value. `null` is empty.                                                                                                                                                                        |
| `defaultValue`                                                                                                | `number \| null`                                                                                           | `null`                                             | Uncontrolled counterpart.                                                                                                                                                                                     |
| `onValueChange`                                                                                               | `(value: number \| null, details: NumberField.ChangeEventDetails) => void`                                 |                                                    | Called when the value commits: blur or Enter after typing, a step button, an arrow key. `details.reason`: `"input-commit"`, `"increment-press"`, `"decrement-press"`, `"keyboard"`; plus `event`, `cancel()`. |
| `min` / `max`                                                                                                 | `number`                                                                                                   |                                                    | Bounds. A committed value is clamped to them.                                                                                                                                                                 |
| `step`                                                                                                        | `number`                                                                                                   | `1`                                                | Arrow keys and step buttons move by `step`; a committed value snaps to `min + n × step` (or `n × step` without `min`).                                                                                        |
| `largeStep`                                                                                                   | `number`                                                                                                   | `10 × step`                                        | Page Up / Page Down and Shift+Arrow.                                                                                                                                                                          |
| `formatOptions`                                                                                               | `Intl.NumberFormatOptions`                                                                                 |                                                    | How the value is displayed and parsed.                                                                                                                                                                        |
| `locale`                                                                                                      | `Intl.LocalesArgument`                                                                                     | from LocaleProvider                                | Then the nearest `lang`, then `"en"` (spec #1 i18n).                                                                                                                                                          |
| `labels`                                                                                                      | `{ increment?: string; decrement?: string }`                                                               | `{ increment: "Increase", decrement: "Decrease" }` | Step button names.                                                                                                                                                                                            |
| `name`                                                                                                        | `string`                                                                                                   |                                                    | Goes on the hidden value input.                                                                                                                                                                               |
| `required`, `disabled`, `label`, `description`, `errorMessage`, `invalid`, `validate`, `size`, `startElement` | as TextField                                                                                               |                                                    | `required` goes on the visible input (empty fails `valueMissing`). `disabled`: `aria-disabled` plus `readOnly`, and the step buttons disabled.                                                                |
| …native                                                                                                       | `Omit<ComponentProps<"input">, "type" \| "value" \| "defaultValue" \| "size" \| "min" \| "max" \| "step">` |                                                    | `ref`, `id`, `placeholder`, `onBlur`… go on the visible input.                                                                                                                                                |

Names, checked against the reference libraries:

- **`NumberField`**: React Aria "A number field allows a user to enter a number, and increment or decrement the value using stepper buttons." (https://react-aria.adobe.com/NumberField); Base UI `NumberField` (https://base-ui.com/react/components/number-field); MUI's Number Field page is "composed with the Base UI `NumberField`" (https://mui.com/material-ui/react-number-field/). Ark, Chakra and Mantine say `NumberInput`. Two of the three dedicated libraries say NumberField, and it matches TextField.
- **Single component, not compound.** React Aria and Base UI compose `Group`, `Input`, `Increment`, `Decrement` Parts; Mantine's `NumberInput` is one component with `hideControls`. We follow TextField's single-component form so all text-entry fields read alike (judgement call).
- **`value: number | null`, `onValueChange(value, details)`**: Base UI "`value` `number | null` — The raw numeric value of the field.", "`onValueChange` `(value: number | null, eventDetails) => void`". Chakra and Ark use strings ("use string values instead of converting to numbers"), React Aria numbers; Base UI's shape is spec #1's.
- **`min`, `max`, `step`, `largeStep`**: Base UI `min`, `max`, `step` (default `1`), `largeStep` (default `10`, "while the shift key is held"); Ark `largeStep = 10 * step`. The native attribute names, not React Aria's `minValue`/`maxValue`.
- **`formatOptions`**: React Aria "Formatting options for the value displayed in the number field. This also affects what characters are allowed to be typed by the user."; Ark "The options to pass to the `Intl.NumberFormat` constructor". Base UI says `format`. Two to one, and it names the type it takes.
- **Commit snaps and clamps**: React Aria `commitBehavior` default `'snap'`, "'snap' will clamp the value to the min/max values, and snap to the nearest step value."; Ark `clampValueOnBlur = true`. The only behaviour here (no `'validate'` mode), so range and step errors never reach the user (judgement call).
- **No wheel change**: React Aria `isWheelDisabled`, Base UI `allowWheelScrub` default `false`. No prop: the wheel scrolls the page.
- **Not built: `smallStep` (Alt+Arrow), the scrub area, press-and-hold repeat.** Base UI and Ark offer them; deferred until a product needs them.

## States

TextField's states. The step buttons follow IconButton; a button is `aria-disabled` when its step would leave `min` / `max` (the value is already at the bound).

## Behaviour

- **Why `type="text"`.** MDN, `<input type="number">`: "If spinbutton is not an important feature for your form control, consider _not_ using `type="number"`. Instead, use inputmode="numeric" along with a pattern attribute … With `<input type="number">`, there is a risk of users accidentally incrementing a number when they're trying to do something else. Additionally, if users try to enter something that's not a number, there's no explicit feedback about what they're doing wrong." A native number input also cannot show a currency, a percent sign or grouping. React Aria: "`type: 'text', // Can't use type="number" because then we can't have things like $ in the field.`" (source, `useNumberField.ts`); Base UI renders `type: 'text'` too.
- **Parsing and formatting with `Intl`.** While focused the user types freely. On commit (blur, Enter) the text is parsed with the locale's separators (from `Intl.NumberFormat(locale).formatToParts()`: the group and decimal symbols and the currency/percent affixes), clamped, snapped to `step`, then shown formatted. Unparseable text reverts to the last committed value (React Aria's behaviour; inference from its `snap` default). Typing characters that can never be part of the format is blocked in `beforeinput`.
- **Validation** follows the Field contract. Only `valueMissing` (empty and `required`) and `validate` rules can fail, because commit clamps and snaps.
- **Step buttons** stay out of the tab order. APG: "The text field is usually the only focusable component because the increase and decrease functions are keyboard accessible via arrow keys." A pointer press on them keeps focus in the input.
- Client component (`'use client'`). It reads LocaleProvider, so it formats in the app's locale (it is not one of the Server Components that Q15-2 limits to a `locale` prop).

## Motion

TextField's border colours and IconButton's press. The value change is instant.

- **Reduced motion:** step buttons keep only their colour change.
- **Instant exit:** nothing exits.

## Keyboard

APG pattern: **Spinbutton** (https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/), keyboard map only (see Accessibility for the role).

| Key                    | Action                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Up Arrow               | "Increases the value." By `step`.                                                                                                                                         |
| Down Arrow             | "Decreases the value." By `step`.                                                                                                                                         |
| Page Up / Shift+Up     | "Increases the value by a larger step than Up Arrow." By `largeStep`.                                                                                                     |
| Page Down / Shift+Down | "Decreases the value by a larger step than Down Arrow." By `largeStep`.                                                                                                   |
| Home                   | "If the spinbutton has a minimum value, sets the value to its minimum."                                                                                                   |
| End                    | "If the spinbutton has a maximum value, sets the value to its maximum."                                                                                                   |
| Enter                  | Commits the typed text, then implicit submission (native).                                                                                                                |
| Text keys              | Native editing. APG: "Be sure that JavaScript does not interfere with browser-provided text editing functions by capturing key events for the keys used to perform them." |

Home and End move the caret (native) when there is no `min` / `max`. Up and Down never change direction in RTL (vertical keys).

## Accessibility

- **Role: `textbox`, not `spinbutton`.** APG asks for "role spinbutton". React Aria removes it on purpose: "override the spinbutton role, we can't focus a spin button with VO" (source, `useNumberField.ts`), and Base UI sets no spinbutton role either. We follow the two libraries, because a control VoiceOver cannot focus fails WCAG for its users, while the arrow-key behaviour stays available (judgement call, review item). The input gets no `aria-roledescription` (Base UI adds "Number field"; React Aria adds one except on iOS). The label already says what the value is, and a role description would be one more built-in string to localise (judgement call).
- The formatted text is the value read by screen readers ("€19.50"), so no `aria-valuetext` is needed.
- Step buttons: names from `labels` ("Increase", "Decrease"), each `aria-controls` the input.
- **More contrast, forced colors, reduced transparency:** TextField's and IconButton's.

## RTL

Logical properties only: step buttons at the inline end. The formatted number follows the locale's own digits and bidi rules from `Intl`; the input keeps `dir="auto"`. Arrow keys used are vertical, so nothing swaps.

## Component tokens

None new. TextField's `input-*` set and IconButton's `icon-button-*` set. The input keeps `input-font` (not the `type-data-*` role) so it lines up with the other fields, and adds only `font-variant-numeric: tabular-nums` so digits don't shift while stepping (judgement call).

## Built-in labels

| Key         | Default    | Used by               |
| ----------- | ---------- | --------------------- |
| `increment` | "Increase" | Increment button name |
| `decrement` | "Decrease" | Decrement button name |

## Feedback events

The step buttons are IconButtons and dispatch `ab-press` (`{ component: "IconButton", reason: "user" }`). Arrow-key stepping dispatches nothing (keyboard and high-frequency; brand book "No motion on keyboard-initiated or high-frequency (100+ per day) actions").

## Sources

- TextField spec, Field spec, IconButton spec: `packages/ui/specs/`.
- MDN `<input type="number">`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number · `inputmode`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode
- Baseline (webstatus.dev, 2026-10-24): `inputmode` widely available (low 2021-12-07).
- WAI-ARIA APG Spinbutton: https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
- React Aria NumberField: https://react-aria.adobe.com/NumberField and source https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/numberfield/useNumberField.ts
- Base UI NumberField: https://base-ui.com/react/components/number-field · Ark NumberInput: https://ark-ui.com/react/docs/components/number-input · Chakra NumberInput: https://chakra-ui.com/docs/components/number-input · Mantine NumberInput: https://mantine.dev/core/number-input/ · MUI Number Field: https://mui.com/material-ui/react-number-field/
