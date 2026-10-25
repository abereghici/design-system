# RadioGroup

A single choice among 2–6 options that should all stay visible ("Monthly" or "Yearly"). With more options use Select; for a binary choice use Switch or Checkbox.

```tsx
import { RadioGroup } from "@platform/ui/radio-group";

<RadioGroup.Root name="plan" defaultValue="yearly">
  <RadioGroup.Label>Plan</RadioGroup.Label>
  <RadioGroup.Item value="monthly">Monthly</RadioGroup.Item>
  <RadioGroup.Item value="yearly">Yearly</RadioGroup.Item>
</RadioGroup.Root>

<RadioGroup.Root name="density" value={density} onValueChange={setDensity} orientation="horizontal">
  <RadioGroup.Label>Density</RadioGroup.Label>
  <RadioGroup.Item value="compact">Compact</RadioGroup.Item>
  <RadioGroup.Item value="comfortable">Comfortable</RadioGroup.Item>
</RadioGroup.Root>
```

Status: draft for brand-owner review (phase 2). Source guide: `components/RadioGroup/README.md` in the artifact.

## Anatomy

Root (fieldset) → Label (legend) → Items (label → radio → diamond → text).

- **Root.** A native `<fieldset role="radiogroup">`, UA chrome reset. Items stack with `fieldset-gap` (vertical) or sit in a wrapping row with `radio-gap` (horizontal).
- **Label.** A native `<legend>`, the group's name, in the field label type (`fieldset-legend-font`).
- **Item.** A native `<label>` around a native `<input type="radio">` and the text; the whole row is the hit target. Gap `radio-gap` (8), text in `radio-label-font`.
- **Radio.** The input with `appearance: none`, drawn as a 16 px circle (`radio-size`, `radio-border-radius` full), `radio-border-width` hairline in `radio-border-color`, fill `radio-background-color`.
- **Diamond.** The radio's `::before` (as the source CSS): a 6 px square rotated 45°, the _ochi_ (`radio-indicator-size`, `radio-indicator-color-checked`), centred in the accent-filled circle; decorative. The brand book places the bob motif here ("The radio's selected indicator").

## API

`RadioGroup.Root`

| Prop            | Type                                                              | Default      | Notes                                                                                                               |
| --------------- | ----------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string \| null`                                                  |              | Controlled. `null`: nothing chosen.                                                                                 |
| `defaultValue`  | `string \| null`                                                  | `null`       | Uncontrolled.                                                                                                       |
| `onValueChange` | `(value: string, details: RadioGroup.ChangeEventDetails) => void` |              | Before the change commits. `details`: `reason` (`"none"`), `event`, `cancel()`.                                     |
| `name`          | `string`                                                          | a `useId()`  | Shared by every radio; the group submits `name=value`. Generated when omitted, so the radios form one native group. |
| `required`      | `boolean`                                                         | `false`      | Native on every radio: one must be chosen to submit.                                                                |
| `disabled`      | `boolean`                                                         | `false`      | Every radio `aria-disabled="true"`, change blocked.                                                                 |
| `orientation`   | `"vertical" \| "horizontal"`                                      | `"vertical"` | Layout and `aria-orientation`. Arrow keys work in both axes either way (native).                                    |
| …native         | `ComponentProps<"fieldset">`                                      |              | `ref`, `className`, `form` and native attributes.                                                                   |

`RadioGroup.Label`: `ComponentProps<"legend">`.

`RadioGroup.Item`

| Prop       | Type                                                      | Default | Notes                                                             |
| ---------- | --------------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| `value`    | `string`                                                  |         | Required.                                                         |
| `children` | `ReactNode`                                               |         | The option's label.                                               |
| `disabled` | `boolean`                                                 | `false` | This option only: `aria-disabled="true"`, cannot be chosen.       |
| …native    | `ComponentProps<"input">` minus `type`, `name`, `checked` |         | `ref`, `id` on the input; `className`, `style` on the item label. |

Names, checked against the reference libraries:

- **`RadioGroup.Root` / `RadioGroup.Item`**: Radix `RadioGroup.Root`, `RadioGroup.Item`, `RadioGroup.Indicator` (https://www.radix-ui.com/primitives/docs/components/radio-group); Ark `RadioGroup.Root`, `RadioGroup.Item`, `RadioGroup.Label` (https://ark-ui.com/react/docs/components/radio-group); React Aria `RadioGroup` (https://react-aria.adobe.com/RadioGroup); Base UI `RadioGroup` + `Radio.Root` (https://base-ui.com/react/components/radio-group); Mantine `Radio.Group`; MUI `RadioGroup`. No Indicator Part: the diamond is drawn by the Item (as Checkbox's check).
- **`RadioGroup.Label`**: Ark's Part name; React Aria composes `<Label />` inside RadioGroup. Radix and Base UI have none and label through `aria-labelledby` or a Fieldset. Rendered as a native `<legend>` (below).
- **`value` / `defaultValue` / `onValueChange(value, details)`**: Base UI "`onValueChange: ((value: Value, eventDetails: RadioGroup.ChangeEventDetails) => void)` — Callback fired when the value changes."; Radix `onValueChange: (value: string) => void`.
- **`name` generated when omitted**: Mantine "`name` attribute of child radio inputs. By default, `name` is generated randomly."; MUI "falls back to a randomly generated name".
- **`orientation`**: Radix `orientation`, React Aria "`orientation` … default `'vertical'`, The axis the Radio Button(s) should align with.", Ark `orientation`. Base UI has none.
- **No `loop` and no `dir`.** Radix has `loop` (default `true`) and `dir`; native radios always wrap, and direction is read from the DOM (spec #1).
- **Root renders `<fieldset>`.** No library does by default (Base UI and React Aria render a `<div>`, Radix a `<div role="radiogroup">`); the source does ("`<fieldset>` + `<legend>`"). ARIA in HTML allows it: `fieldset` "Roles: none , presentation or radiogroup". The legend then names the group with no `aria-labelledby` (judgement call, platform first).

## States

| State         | How it shows                                                                                                                                                | Exposed as                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| unchecked     | Hairline circle                                                                                                                                             | —                                                    |
| hovered       | Border `radio-border-color-hovered`; fine pointers only                                                                                                     | `:hover` on the item                                 |
| checked       | Accent fill `radio-background-color-checked` with the diamond                                                                                               | `:checked`                                           |
| focus-visible | 2 px ring, 3 px offset around the circle                                                                                                                    | `:focus-visible`                                     |
| invalid       | Border `radio-border-color-invalid` on every radio                                                                                                          | `aria-invalid="true"` on the radios (Field contract) |
| disabled      | radio `color-border-disabled` / `color-background-disabled`, diamond `color-icon-disabled`, label `color-text-disabled` (Disabled look, GLOSSARY); no hover | `aria-disabled="true"` or `:disabled`                |

## Behaviour

- **Native group.** Every radio shares `name`. MDN: "A radio group is defined by giving each of radio buttons in the group the same name. Once a radio group is established, selecting any radio button in that group automatically deselects any currently-selected radio button in the same group." The browser provides the arrow keys and the single tab stop (Keyboard).
- **Change and cancel** run in the radio's `click` handler, which also fires for arrow-key selection (observed in Chromium, Firefox and WebKit, #27). Root keeps the chosen value (React state when uncontrolled) and renders each radio's `checked` from it; a click on the already chosen radio changes nothing. `details.cancel()` → `preventDefault()`, which restores the previously checked radio (HTML's legacy-canceled-activation behaviour for radios; observed in all three engines).
- **Disabled group or item** (`aria-disabled`): the `click` handler prevents the change, as Checkbox. Arrow keys still move focus onto a disabled radio (APG keeps disabled items discoverable; "Options in a Listbox" sit under its convention 2), but cannot check it. Inside a disabled Fieldset, the radios are natively disabled.
- **Required:** native. MDN: "If no radio button is selected when the form is submitted, the radio group is not included in the submitted form data at all". The error belongs to a `Field.Root` around the group (Field contract); `aria-invalid` goes on each radio.
- Client component (`'use client'`) for Root and Item (context, handlers). Label is a plain element.

## Motion

- **The diamond settles with a light spring** (source: "settles with a light spring"): `scale` from 0 to 1 over `motion-duration-spring` (400 ms) with `radio-easing` (`motion-easing-spring-bouncy`), and back to 0 over `motion-duration-exit` with `motion-easing-exit` (source CSS). Press scales the circle to `motion-scale-pressed`. Brand book: springs only for direct manipulation and toggles, "the radio diamond" by name.
- Fill: colour fade over the same duration, `motion-easing-color`. The previously checked radio fades out over `motion-duration-exit` (150 ms) with no spring.
- **Reduced motion:** the diamond appears at full size with the fill fade; no scale.
- **Instant exit:** the old diamond disappears in the frame the new one is checked; nothing waits for it.
- Arrow-key changes run the colour fade only, no spring (keyboard-initiated), with the same `data-pointer` rule as Checkbox.

## Keyboard

APG pattern: **Radio Group**, not in a toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/radio/). Native radios provide it.

| Key                      | Action                                                                                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab          | "Move focus into and out of the radio group." "If a radio button is checked, focus is set on the checked button. If none of the radio buttons are checked, focus is set on the first radio button in the group." |
| Space                    | "checks the focused radio button if it is not already checked."                                                                                                                                                  |
| Right Arrow / Down Arrow | "move focus to the next radio button in the group, uncheck the previously focused button, and check the newly focused button. If focus is on the last button, focus moves to the first button."                  |
| Left Arrow / Up Arrow    | "move focus to the previous radio button in the group … If focus is on the first button, focus moves to the last button."                                                                                        |

APG notes a native difference: "In some browsers, if none of the radio buttons are selected, moving focus into the radio group with Shift + Tab will place focus on the last radio button instead of the first radio button." Accepted as native behaviour.

**RTL:** spec #1 story 54 asks for Left/Right to follow the visual direction. Whether each engine swaps them for native radios in RTL is not documented (MDN's radio page has no keyboard text). Observed with real key presses (#27): Chromium and Firefox swap them for native radios in RTL, WebKit does not. So a `keydown` handler on the Root takes Left and Right whenever the Root matches `:dir(rtl)` (spec #1: "Direction is read from the DOM when a key is pressed"): it prevents the native move and focuses and clicks the next (Left) or previous (Right) radio, wrapping, so every engine behaves the same.

## Accessibility

- Role `radiogroup` on the fieldset, named by its legend; each input is `radio` with native checkedness (ARIA in HTML: "Authors MUST NOT use the aria-checked attribute on input type=radio elements"). APG: "The radio buttons are contained in or owned by an element with role radiogroup." and "The radiogroup element has a visible label referenced by aria-labelledby or has a label specified with aria-label." The legend is the native equivalent of that visible label (inference; confirmed in the screen-reader pass).
- `aria-orientation` from `orientation`.
- Group description and error: a `Field.Root` around the group puts `aria-describedby` on the fieldset (APG: "those elements are referenced by the radiogroup element or radio elements with the aria-describedby property.").
- **Contrast.** Checked: accent fill (matrix pair added, 3:1 on every surface) and the diamond shape. Unchecked edge: `color-border-default` (matrix).
- **More contrast:** no change needed.
- **Forced colors:** checked circle `Highlight` with a `HighlightText` diamond; borders `CanvasText`; disabled `GrayText`.
- **Reduced transparency:** not affected.

## RTL

Logical properties only: the circle at the inline start of each item; horizontal groups run from the inline start. The diamond is symmetric. Arrow keys: see Keyboard.

## Component tokens

Existing (ported from the source): `radio-size`, `radio-indicator-size`, `radio-border-width`, `radio-gap`, `radio-label-font`, `radio-background-color`, `radio-border-color`, `radio-border-color-hovered`, `radio-background-color-checked`, `radio-indicator-color-checked`, `radio-duration`, `radio-easing`.

Proposed new:

| Token                        | References            | `$type`   | Why                                               |
| ---------------------------- | --------------------- | --------- | ------------------------------------------------- |
| `radio-border-radius`        | `radius-full`         | dimension | The circle; the source has no radius token for it |
| `radio-border-color-invalid` | `color-border-danger` | color     | Invalid state (Field contract)                    |

The Label reuses Fieldset's `fieldset-legend-font` and `fieldset-legend-text-color`; the vertical gap reuses `fieldset-gap`.

## Built-in labels

None.

## Feedback events

| Event       | When                                               | `reason` |
| ----------- | -------------------------------------------------- | -------- |
| `ab-toggle` | After a user change commits (pointer or arrow key) | `"user"` |

Detail: `{ component: "RadioGroup", reason }`, dispatched from the newly checked radio. One event per change (not one for the radio that turned off). Arrow-key changes dispatch it too: unlike motion, sound is the app's decision, and the event carries no input type (judgement call).

## Sources

- Source guide: artifact `project/components/RadioGroup/README.md` ("Single choice among 2–6 options that should all stay visible; more options → Select, binary → Switch or Checkbox."; "The checked indicator is a 6px diamond (the ochi) that settles with a light spring."; "`<fieldset>` + `<legend>`; native radios give arrow-key movement within the group.").
- MDN `<input type="radio">`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio · `radiogroup` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/radiogroup_role ("User interactions for `radiogroup`s must replicate the user interaction of a user entering into a group of same-named HTML radio buttons.")
- ARIA in HTML: https://www.w3.org/TR/html-aria/
- Baseline (webstatus.dev, 2026-10-24): `input-radio` widely available; `fieldset` widely available; `appearance` widely available.
- WAI-ARIA APG Radio Group: https://www.w3.org/WAI/ARIA/apg/patterns/radio/ · Keyboard interface (disabled focusability): https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- Radix RadioGroup: https://www.radix-ui.com/primitives/docs/components/radio-group · Base UI RadioGroup: https://base-ui.com/react/components/radio-group · React Aria RadioGroup: https://react-aria.adobe.com/RadioGroup · Ark RadioGroup: https://ark-ui.com/react/docs/components/radio-group · Mantine Radio: https://mantine.dev/core/radio/ · MUI RadioGroup: https://mui.com/material-ui/api/radio-group/
