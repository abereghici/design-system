# Checkbox

An independent on/off choice in a form that is submitted ("Email me updates", "I accept the terms"), or one item of a set where any number may be chosen. For a setting that takes effect immediately, use Switch; for one choice among several, use RadioGroup.

```tsx
import { Checkbox } from "@platform/ui/checkbox";
import { Fieldset } from "@platform/ui/fieldset";

<Checkbox name="updates" defaultChecked>Email me updates</Checkbox>

<Fieldset.Root>
  <Fieldset.Legend>Channels</Fieldset.Legend>
  <Checkbox checked={allState === true} indeterminate={allState === "some"} onCheckedChange={setAll}>
    All channels
  </Checkbox>
  <Checkbox name="channel" value="email">Email</Checkbox>
  <Checkbox name="channel" value="sms">SMS</Checkbox>
</Fieldset.Root>
```

Status: draft for brand-owner review (phase 2). Source guide: `components/Checkbox/README.md` in the artifact.

## Anatomy

Root (label) → box (native input) → check → label text.

- **Root.** A native `<label>` around everything, so the whole row is the hit target (source: "Native checkbox inside its label — the whole row is the hit target."). Gap `checkbox-gap` (8) between the box and the text; text in `checkbox-label-font` (13/500).
- **Box.** A native `<input type="checkbox">` with `appearance: none`, drawn as a 16 px square (`checkbox-size`), radius `checkbox-border-radius` (5), `checkbox-border-width` hairline in `checkbox-border-color`, fill `checkbox-background-color`. The label also points at it with `for` (MDN: "you can simultaneously nest _and_ provide `id`/`for` for maximum compatibility").
- **Check.** The `check` glyph from the icon set (`minus` while indeterminate), 14 px (`checkbox-icon-size`), in `checkbox-icon-color-checked`, drawn over the box; decorative.

## API

| Prop              | Type                                                               | Default         | Notes                                                                                                            |
| ----------------- | ------------------------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| `children`        | `ReactNode`                                                        |                 | The label text. Without children, `aria-label` or `aria-labelledby` is required (props union).                   |
| `checked`         | `boolean`                                                          |                 | Controlled.                                                                                                      |
| `defaultChecked`  | `boolean`                                                          | `false`         | Uncontrolled.                                                                                                    |
| `onCheckedChange` | `(checked: boolean, details: Checkbox.ChangeEventDetails) => void` |                 | Called before the change commits. `details`: `reason` (`"none"`), `event`, `cancel()`.                           |
| `indeterminate`   | `boolean`                                                          | `false`         | Mixed state. Sets the DOM `indeterminate` property; visual and accessibility only (see Behaviour).               |
| `name`, `value`   | `string`                                                           | `value`: `"on"` | Native. A checked box submits `name=value`.                                                                      |
| `required`        | `boolean`                                                          | `false`         | Native: must be checked to submit. Errors follow the Field contract when wrapped in a Field.                     |
| `disabled`        | `boolean`                                                          | `false`         | `aria-disabled="true"`, focusable, change blocked (spec #1).                                                     |
| …native           | `ComponentProps<"input">` minus `type`                             |                 | `ref`, `id`, `form`, `onChange`, `aria-*` go on the `<input>`. `className` and `style` go on the root `<label>`. |

Names, checked against the reference libraries:

- **`Checkbox`**, one component: Mantine "Checkbox component is based on the native `input[type="checkbox"]` element" (https://mantine.dev/core/checkbox/), MUI `Checkbox` (https://mui.com/material-ui/api/checkbox/). Radix (`Checkbox.Root`, `Checkbox.Indicator`), Base UI and Ark are compound because they draw a `<button>` or `<span>` and add a hidden input; with the native input itself as the control there is nothing for an Indicator Part to do (judgement call: the check is internal).
- **Label as `children`**: React Aria `<CheckboxButton>Label</CheckboxButton>` (https://react-aria.adobe.com/Checkbox), Base UI's examples wrap the text in the label. Mantine and the source use a `label` prop; children keep rich text (bold, a line break) and match Button.
- **`checked` / `defaultChecked` / `onCheckedChange(checked, details)`**: Base UI "`onCheckedChange` `((checked: boolean, eventDetails: Checkbox.Root.ChangeEventDetails) => void)` — Event handler called when the checkbox is ticked or unticked." (https://base-ui.com/react/components/checkbox); Radix `onCheckedChange`; spec #1's canonical names.
- **`indeterminate` as its own prop**: Base UI "`indeterminate` … Whether the checkbox is in a mixed state: neither ticked, nor unticked."; React Aria `isIndeterminate`; MUI "This sets the native input element to indeterminate"; Mantine `indeterminate`. Radix folds it into `checked: boolean | 'indeterminate'`. Four to one, and it matches the native `indeterminate` property.
- **No `readOnly`.** Base UI and Ark have one; the native checkbox does not support `readonly`, so it would be script-only. Deferred.
- **No CheckboxGroup.** Base UI, React Aria, Ark and Mantine have one (`value: string[]`). The native form already groups same-`name` checkboxes in `FormData.getAll(name)`, and a Fieldset gives the group its name; a group component is deferred until a product needs controlled arrays (judgement call).

## States

| State         | How it shows                                                                              | Exposed as                                   |
| ------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| unchecked     | Hairline box                                                                              | `:checked` not matching                      |
| hovered       | Border `checkbox-border-color-hovered`; fine pointers only                                | `:hover` on the root                         |
| pressed       | Box scales to `checkbox-scale-pressed` (0.97)                                             | `:active`                                    |
| checked       | Fill `checkbox-background-color-checked` (accent), check in `checkbox-icon-color-checked` | `:checked`, `aria-checked` from the platform |
| indeterminate | Accent fill with a `minus` glyph                                                          | `:indeterminate`                             |
| focus-visible | 2 px focus ring, 3 px offset around the box                                               | `:focus-visible` on the input                |
| invalid       | Border `checkbox-border-color-invalid`                                                    | `aria-invalid="true"` (Field contract)       |
| disabled      | `opacity-disabled`; no hover or press                                                     | `aria-disabled="true"` or `:disabled`        |

## Behaviour

- **Change and cancel.** In the input's `click` handler the box has already flipped (HTML's legacy-pre-activation behaviour), so the component calls `onCheckedChange(input.checked, details)` there. `details.cancel()` calls `event.preventDefault()`, which makes the browser restore the previous checkedness (inference from the HTML activation behaviour; the build ticket tests it in three engines). Uncontrolled: the native state is the state. Controlled: the parent's `checked` wins on the next render.
- **Indeterminate** is the DOM property, set in an effect. MDN: "This is purely a visual change. It has no impact on whether the checkbox's `value` is used in a form submission. That is decided by the `checked` state, regardless of the `indeterminate` state." A user click clears it (native); the parent decides the next state, following APG's tri-state rules ("Checking the overall checkbox checks all options in the group. Unchecking the overall checkbox will uncheck all options in the group.").
- **Disabled** (`aria-disabled`): the click handler calls `preventDefault()` and returns, so the box does not flip, no callback runs and no event is dispatched; a label click and Space reach the same handler. Inside a disabled Fieldset the input is natively disabled.
- `required` and errors follow the Field contract when the Checkbox sits in a `Field.Root` (the "accept the terms" case).
- Client component (`'use client'`): the click handler and the `indeterminate` effect.

## Motion

- Checking: the fill fades in over `checkbox-duration` (`motion-duration-toggle`, 180 ms), then the check draws from the inline start to the inline end (`stroke-dashoffset` from the path length to 0) over the same duration with `checkbox-easing` (`motion-easing-spring`), starting `calc(var(--ab-checkbox-duration) / 4)` (45 ms) after the fill. Source: "Fill fades (180ms), then the check draws left→right with a 45ms delay". The check is the stroked icon path, so the draw needs no extra artwork.
- Unchecking: fill and check fade out together over `motion-duration-exit` (150 ms); exits are faster than entrances.
- Press: scale to `checkbox-scale-pressed` over `motion-duration-press`.
- **Reduced motion:** the check does not draw; it fades in with the fill. The press scale resolves to 1 (`motion-scale-pressed` media override). Colour and opacity fades stay.
- **Instant exit:** with no transition the fill and check disappear in the same frame as `:checked` stops matching, which reads as correct.
- Keyboard toggling (Space) runs the same short fade without the draw (brand book: "No motion on keyboard-initiated … actions"): the draw runs only for pointer-initiated changes, marked by a `data-pointer` attribute set on `pointerdown` (judgement call).

## Keyboard

APG pattern: **Checkbox** (https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), dual-state and tri-state.

| Key             | Action                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------- |
| Space           | "When the checkbox has focus, pressing the Space key changes the state of the checkbox." |
| Tab / Shift+Tab | Moves focus to / from the checkbox, also when disabled.                                  |

Native; no key handler is added. Enter is not bound (APG lists Space only; Enter submits the form, natively).

## Accessibility

- Role `checkbox` from the native input; checked and mixed states are exposed by the platform (ARIA in HTML: "Authors MUST NOT use the aria-checked attribute on input type=checkbox elements"). APG: "When partially checked, it has state aria-checked set to mixed."
- Name from the label text (APG: "Visible text content contained within the element with role checkbox", here through the native label).
- **Groups:** use Fieldset. APG: "If a set of checkboxes is presented as a logical group with a visible label, the checkboxes are included in an element with role group".
- **No interactive content in the label.** MDN: "don't place additional interactive elements such as anchors or buttons inside a `<label>`." A link to the terms goes in a `Field.Description`.
- **Contrast.** The checked state is the accent fill plus the check (shape, not colour alone). `background-accent-bold` against every surface is added to the contrast matrix at 3:1 (lowest measured 12.19:1 light, 14.25:1 dark). The unchecked box edge is `color-border-default`, already in the matrix (3:1).
- Targets: the whole row is the label, at least 24 px tall through the line height plus padding (the box alone is 16 px; because the label activates the input, the row is the target for WCAG 2.5.8; inference).
- **More contrast:** no change needed (the border is already `border-default`).
- **Forced colors:** the fill disappears, so the checked box sets `background-color: Highlight` and the check `HighlightText`; the border is `CanvasText`. Disabled uses `GrayText`.
- **Reduced transparency:** not affected.

## RTL

Logical properties only: the box at the inline start. The check is not mirrored (a check mark has no reading direction); the draw runs from the inline start, so it runs right to left in RTL (judgement call: matches the reading direction). No arrow keys.

## Component tokens

Existing (ported from the source): `checkbox-size`, `checkbox-border-radius`, `checkbox-border-width`, `checkbox-gap`, `checkbox-label-font`, `checkbox-background-color`, `checkbox-border-color`, `checkbox-border-color-hovered`, `checkbox-background-color-checked`, `checkbox-icon-color-checked`, `checkbox-scale-pressed`, `checkbox-duration`, `checkbox-easing`.

Proposed new:

| Token                           | References            | `$type`   | Why                                                  |
| ------------------------------- | --------------------- | --------- | ---------------------------------------------------- |
| `checkbox-icon-size`            | `size-icon-xs`        | dimension | Check and minus glyph size (14) inside the 16 px box |
| `checkbox-border-color-invalid` | `color-border-danger` | color     | Invalid state (Field contract)                       |

Contrast matrix additions (`packages/tokens/src/contrast.ts`, non-text 3:1): `background-accent-bold` on `surface-default`, `surface-raised`, `surface-nested`, `surface-floating`.

The label text colour is `color-text-default` (semantic, directly; no source token).

## Built-in labels

None.

## Feedback events

| Event       | When                                                      | `reason` |
| ----------- | --------------------------------------------------------- | -------- |
| `ab-toggle` | After a user change commits (not cancelled, not disabled) | `"user"` |

Detail: `{ component: "Checkbox", reason }`, dispatched from the input. The source asks for a "Soft click on change". A controlled change made by the parent dispatches nothing. `events.ts` widens `ToggleEvent`'s component union with `"Checkbox"`.

## Sources

- Source guide: artifact `project/components/Checkbox/README.md` ("Independent on/off choice — in forms that are submitted; use Switch for settings that apply immediately."; "Fill fades (180ms), then the check draws left→right with a 45ms delay; press scales .97. Soft click on change (mutable)."; "Native checkbox inside its label — the whole row is the hit target.").
- MDN `<input type="checkbox">`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox · `appearance`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/appearance ("Setting `appearance: none` … does not change the element's functionality.") · `<label>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label
- ARIA in HTML: https://www.w3.org/TR/html-aria/
- Baseline (webstatus.dev, 2026-10-24): `input-checkbox` widely available; `appearance` widely available (low 2022-03-14); `indeterminate` (`:indeterminate`) widely available. `accent-color` is limited and not used.
- WAI-ARIA APG Checkbox: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
- Radix Checkbox: https://www.radix-ui.com/primitives/docs/components/checkbox · Base UI Checkbox: https://base-ui.com/react/components/checkbox · React Aria Checkbox: https://react-aria.adobe.com/Checkbox · Ark Checkbox: https://ark-ui.com/react/docs/components/checkbox · Mantine Checkbox: https://mantine.dev/core/checkbox/ · MUI Checkbox: https://mui.com/material-ui/api/checkbox/
