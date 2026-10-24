# Slider

Picks a value, or a range with two thumbs, from a continuous or stepped scale where the exact number matters less than the feel: volume, zoom, a price range. For an exact number use NumberField; to show a value nobody sets, use Meter or Progress.

```tsx
import { Slider } from "@platform/ui/slider";
import { Field } from "@platform/ui/field";

<Field.Root name="volume">
  <Field.Label>Volume</Field.Label>
  <Slider.Root defaultValue={40}>
    <Slider.Track>
      <Slider.Range />
      <Slider.Thumb />
    </Slider.Track>
    <Slider.Value />
  </Slider.Root>
</Field.Root>

<Slider.Root name="price" defaultValue={[20, 80]} min={0} max={200} step={5} format={{ style: "currency", currency: "EUR" }}>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb aria-label="Minimum price" />
    <Slider.Thumb aria-label="Maximum price" />
  </Slider.Track>
  <Slider.Value />
</Slider.Root>
```

Status: draft for brand-owner review (phase 2). No source guide: drafted from the brand book, the platform and the reference libraries. Shares its track shape with Progress and Meter.

## Anatomy

Root → Track → Range → Thumb(s); Value (optional).

- **Root.** A `<div>`, `slider-height` (24, 32 on coarse pointers) tall: the pointer target.
- **Track.** The full scale: a `slider-track-height` (6) bar, radius `slider-track-border-radius` (full), fill `slider-track-background-color` (`color-border-default`).
- **Range.** The filled part, `slider-range-background-color` (accent): from the inline start to the thumb, or between the two thumbs.
- **Thumb.** A `<div>` drawn as a 16 px circle (`slider-thumb-size`) with fill `slider-thumb-background-color`, a 2 px border (`slider-thumb-border-width`) in `slider-thumb-border-color` (accent) and `slider-thumb-shadow`. It contains a native `<input type="range">`, visually hidden over the thumb, which is the focusable control.
- **Value.** A native `<output>` showing the formatted value or values, in `slider-value-font` with tabular figures.

## API

`Slider.Root`

| Prop                    | Type                                                                      | Default             | Notes                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `value`                 | `number \| readonly number[]`                                             |                     | Controlled. An array gives one thumb per entry.                                                                                 |
| `defaultValue`          | `number \| readonly number[]`                                             | `min`               | Uncontrolled.                                                                                                                   |
| `onValueChange`         | `(value: number \| number[], details: Slider.ChangeEventDetails) => void` |                     | On every change while dragging or stepping. `details`: `reason` (`"track-press"`, `"drag"`, `"keyboard"`), `event`, `cancel()`. |
| `onValueCommitted`      | `(value: number \| number[], details: Slider.CommitEventDetails) => void` |                     | Once, when the pointer is released or after a key step. Not called if the value did not change.                                 |
| `min` / `max`           | `number`                                                                  | `0` / `100`         |                                                                                                                                 |
| `step`                  | `number`                                                                  | `1`                 |                                                                                                                                 |
| `largeStep`             | `number`                                                                  | `10 × step`         | Page Up / Page Down and Shift+Arrow.                                                                                            |
| `minStepsBetweenValues` | `number`                                                                  | `0`                 | Range sliders: the thumbs cannot get closer than this many steps.                                                               |
| `format`                | `Intl.NumberFormatOptions`                                                |                     | Formats `aria-valuetext` and Value.                                                                                             |
| `locale`                | `Intl.LocalesArgument`                                                    | from LocaleProvider | Then the nearest `lang`, then `"en"`.                                                                                           |
| `name`                  | `string`                                                                  |                     | Each thumb's input carries it, so a range submits two `name` entries in order.                                                  |
| `disabled`              | `boolean`                                                                 | `false`             | `aria-disabled="true"` on every input; focusable; no change.                                                                    |
| …native                 | `ComponentProps<"div">`                                                   |                     |                                                                                                                                 |

`Slider.Track`, `Slider.Range`: `ComponentProps<"div">`. `Slider.Thumb`: `ComponentProps<"input">` (the hidden range input) minus `type`, `value`, `min`, `max`, `step`; `className`/`style` go on the visual thumb; `aria-label` / `aria-labelledby` name it. `Slider.Value`: `ComponentProps<"output">`; it shows the formatted values, joined by an en dash for a range.

Names, checked against the reference libraries:

- **`Slider` with `Root`, `Track`, `Range`, `Thumb`**: Radix `Slider.Root`, `Slider.Track`, `Slider.Range`, `Slider.Thumb` (https://www.radix-ui.com/primitives/docs/components/slider); Ark `Slider.Root`, `Slider.Track`, `Slider.Range`, `Slider.Thumb`; Base UI `Slider.Root`, `Slider.Track`, `Slider.Indicator`, `Slider.Thumb` (https://base-ui.com/react/components/slider); React Aria `Slider`, `SliderTrack`, `SliderFill`, `SliderThumb`; Mantine and MUI `Slider`. Radix and Ark say `Range`; spec #1 follows Radix's Part names.
- **`Slider.Value` as `<output>`**: Base UI "Value `<output>`"; React Aria `SliderOutput` (an `HTMLOutputElement`); Ark `Slider.ValueText`. Base UI's render-function `children` is left out until a product needs custom value text.
- **`value: number | number[]`**: Base UI "`value` / `defaultValue` `number | number[]`"; MUI `Array<number> | number`; React Aria number or number[]. Radix and Ark always take arrays. Three to two, and one thumb is the common case.
- **`onValueChange` / `onValueCommitted`**: Base UI `onValueChange`, `onValueCommitted` ("Does not fire if the value did not change"); Radix `onValueCommit`, Ark `onValueChangeEnd`, React Aria `onChangeEnd`. Base UI's pair, as spec #1 follows its `eventDetails`.
- **`largeStep`, `minStepsBetweenValues`, `format`, `locale`**: Base UI "`largeStep` … `10`, …when using Page Up/Page Down or Shift + Arrow Up/Arrow Down.", `minStepsBetweenValues`, `format` (`Intl.NumberFormatOptions`), `locale`. Radix and Ark say `minStepsBetweenThumbs`; Base UI's name is kept with its siblings.
- **A native `<input type="range">` inside each thumb**: Base UI "Thumb: Renders a `<div>` element and a nested `<input type="range">`."; Radix "By default, `Slider.Thumb` renders a visually hidden `input` for form submission."; React Aria SliderThumb `inputRef` "A ref for the HTML input element."; MUI and Mantine render a hidden input for `name`.
- **Not built: vertical `orientation`, marks/ticks, a value tooltip, `inverted`.** Radix, Base UI and Ark `orientation`; MUI `marks`, `valueLabelDisplay`; Mantine `marks`, `label`; Radix `inverted`. Deferred (YAGNI): no product or source guide needs them yet. Native `list`/`<datalist>` ticks are not used (webstatus.dev `datalist`: limited).

## States

| State         | How it shows                                                    | Exposed as                                                       |
| ------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| rest          | Track, accent range, thumb                                      | —                                                                |
| hovered       | Thumb shadow grows to the overlay elevation; fine pointers only | `:hover` on the thumb                                            |
| dragging      | Thumb follows the pointer 1:1                                   | `data-dragging` on Root and thumb                                |
| focus-visible | 2 px ring, 3 px offset around the thumb                         | `:focus-visible` on the input → `:has()` on the thumb            |
| invalid       | Thumb border `color-border-danger`                              | `aria-invalid="true"` (Field contract; only `validate` can fail) |
| disabled      | `opacity-disabled`; no hover; pointer ignored                   | `aria-disabled="true"` or `:disabled`                            |

## Behaviour

- **The input is the control.** Each thumb's hidden `<input type="range">` gets focus, carries `min`, `max`, `step`, `value`, `name` and `aria-valuetext`, and so gives the role, the value, form submission and reset with no ARIA. ARIA in HTML, `input type=range`: "No role other than slider , which is NOT RECOMMENDED . Authors SHOULD NOT use the aria-valuemax or aria-valuemin attributes on input type=range". The native input also lets touch screen readers adjust the value with their own gestures, which a scripted `role="slider"` may not (APG's warning: "To change the slider value, touch-based assistive technologies need to respond to user gestures for increasing and decreasing the value by synthesizing key events. This is a new convention that may not be fully implemented by some assistive technologies."; inference that the native input avoids it).
- **Why the native range is not drawn directly.** Styling its thumb and track needs `::-webkit-slider-thumb` and `::-moz-range-thumb`, which MDN marks non-standard, and a two-thumb range is impossible natively. So the visual is drawn by the component and the native input stays hidden over the thumb (as Base UI).
- **Pointer** is script: `pointerdown` on the Track (or Root) moves the nearest thumb to the pointer, `setPointerCapture` keeps the drag on the thumb, and the value snaps to `step`. Each change writes the input's `value` and dispatches `input` and `change` like a native interaction. Pointer Events are widely available.
- **Keyboard** stays on the native input for Up/Down/Home/End; Left/Right and Page Up/Down are handled in `keydown` so that Left/Right follow the visual direction (Keyboard) and `largeStep` applies.
- **Range sliders:** each thumb's native `min`/`max` is set from its neighbour (± `minStepsBetweenValues × step`), so the thumbs cannot cross. APG multi-thumb: "When the range (e.g. minimum and/or maximum value) of another slider is dependent on the current value of a slider, the values of aria-valuemin or aria-valuemax of the dependent sliders are updated when the value changes." The native attributes do that. The tab order stays by index (APG: "The tab order remains constant regardless of thumb value and visual position within the slider.").
- **`aria-valuetext`** is the formatted value (`Intl.NumberFormat(locale, format)`), set on each input. MDN, `slider` role: "The `aria-valuetext` value must be updated as the `value` or `aria-valuenow` is updated."
- **Value `<output>`** has `for` pointing at the inputs and `aria-live="off"`. Its implicit role is `status` (ARIA in HTML: "output role= status"), which would announce every step on top of the slider's own value; the input already speaks the new value (judgement call).
- Follows the Field contract. A native range input cannot be empty or out of range, so only `validate` can make it invalid.
- Disabled: pointer handlers return early; keydown is prevented; the native input keeps focus with `aria-disabled`. Native `disabled` inside a disabled Fieldset.
- Client component (`'use client'`) for every Part (shared state).

## Motion

- Dragging: none; the thumb and range follow the pointer in the same frame (direct manipulation needs no easing).
- Track press: the thumb moves to the pressed point at once. No spring: the brand reserves springs for "switch thumbs, segmented and tab indicators, the radio diamond, toast entrance", and a jump that animated would lag behind the pointer that is about to drag (judgement call).
- Keyboard steps: instant (brand book: "No motion on keyboard-initiated … actions").
- Hover: thumb shadow over `motion-duration-hover-in` / `-out`.
- **Reduced motion:** nothing moves on its own; the shadow fade stays.
- **Instant exit:** nothing exits.

## Keyboard

APG pattern: **Slider** (https://www.w3.org/WAI/ARIA/apg/patterns/slider/) and, with two thumbs, **Slider (Multi-Thumb)** (https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/): "Each thumb is in the page tab sequence and has the keyboard interactions described in the Slider Pattern."

| Key                                 | Action                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Right Arrow / Up Arrow              | "Increase the value of the slider by one step." In RTL, Left Arrow increases (see below).              |
| Left Arrow / Down Arrow             | "Decrease the value of the slider by one step." In RTL, Right Arrow decreases.                         |
| Home                                | "Set the slider to the first allowed value in its range."                                              |
| End                                 | "Set the slider to the last allowed value in its range."                                               |
| Page Up / Shift+Up / Shift+Right    | "Increase the slider value by an amount larger than the step change made by Up Arrow." By `largeStep`. |
| Page Down / Shift+Down / Shift+Left | "Decrease the slider value by an amount larger than the step change made by Down Arrow."               |
| Tab / Shift+Tab                     | Thumb to thumb in index order, then out.                                                               |

APG: "Focus is placed on the slider (the visual object that the mouse user would move, also known as the thumb." Here the focused element is the native input inside the thumb; the ring is drawn on the thumb.

**RTL:** APG says nothing about direction. Spec #1 story 54: "left and right arrow keys to follow the visual direction in … sliders". A horizontal Slider in a `:dir(rtl)` context fills from the right, so Left Arrow increases and Right Arrow decreases; the direction is read from the DOM at key time. Up/Down never swap.

## Accessibility

- Role `slider` per thumb (native), value from the native `value`, `aria-valuetext` formatted.
- **Name:** a single thumb is named by `Field.Label` (`for` the input). Each thumb of a range needs its own `aria-label` (Minimum / Maximum); the type requires it when `value` is an array (props union). APG: "If a slider has a visible label, it is referenced by aria-labelledby on the slider element. Otherwise, the slider element has a label provided by aria-label."
- MDN, `slider` role: "When `aria-valuetext` is an important feature for a slider, consider using select with option elements instead." Documented on the docs page for named steps (Low / Medium / High).
- **Contrast.** Track `color-border-default` (matrix, 3:1 on surfaces), range `background-accent-bold` (added to the matrix on every surface), thumb border `color-border-accent` (matrix) and thumb fill `surface-floating` against the range (added, 3:1).
- Targets: the Root is 24 px tall (32 on coarse pointers), so the thumb's hit area meets WCAG 2.5.8 even though the circle is 16 px.
- **More contrast:** no change needed.
- **Forced colors:** track `CanvasText` outline, range `Highlight`, thumb `ButtonFace` with a `ButtonText` border; focus ring as `outline`. Disabled `GrayText`.
- **Reduced transparency:** not affected.

## RTL

Horizontal sliders run from the inline start: in RTL the minimum is on the right and the range fills right to left; positions use `inset-inline-start` percentages. Arrow keys: see Keyboard.

## Component tokens

New component word `slider` and element word `range` (Dictionary change).

| Token                               | References                          | `$type`            | Why                                                                                                                |
| ----------------------------------- | ----------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `slider-height`                     | `size-control-xs`                   | dimension          | Pointer target height, 24 (32 coarse)                                                                              |
| `slider-track-height`               | `size-indicator`                    | dimension          | 6, as Progress and Meter                                                                                           |
| `slider-track-border-radius`        | `radius-full`                       | dimension          |                                                                                                                    |
| `slider-track-background-color`     | `color-border-default`              | color              | 3:1 on surfaces: the scale must be visible (Progress uses `border-subtle`, but a slider is a control, WCAG 1.4.11) |
| `slider-range-background-color`     | `color-background-accent-bold`      | color              | The chosen part, as the checked Checkbox fill                                                                      |
| `slider-thumb-size`                 | `size-icon-sm`                      | dimension          | 16, as the Switch thumb                                                                                            |
| `slider-thumb-border-width`         | `border-width-thick`                | dimension          | 2                                                                                                                  |
| `slider-thumb-background-color`     | `color-surface-floating`            | color              | As the Switch thumb                                                                                                |
| `slider-thumb-border-color`         | `color-border-accent`               | color              | Thumb edge on any surface                                                                                          |
| `slider-thumb-shadow`               | `elevation-raised`                  | shadow             | As the Switch thumb                                                                                                |
| `slider-value-font`                 | `type-data-sm`                      | typography         | As Progress's value                                                                                                |
| `slider-value-font-variant-numeric` | `type-data-sm-font-variant-numeric` | fontVariantNumeric | Tabular figures                                                                                                    |
| `slider-value-text-color`           | `color-text-subtle`                 | color              |                                                                                                                    |

The hovered shadow uses `elevation-overlay`, and invalid uses `color-border-danger`, directly (semantic).

## Built-in labels

None. Thumb names are the consumer's (`aria-label`), because only the product knows what each end means.

## Feedback events

None. Sliding is continuous and high-frequency; the brand marks toggles, toasts and commands with sound, not every step.

## Sources

- Brand book: Motion ("Springs. Only where the user directly causes the movement"), Accessibility.
- MDN `<input type="range">`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range · `slider` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/slider_role · `::-webkit-slider-thumb`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-slider-thumb · `<output>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output
- ARIA in HTML: https://www.w3.org/TR/html-aria/
- Baseline (webstatus.dev, 2026-10-24): `input-range` widely available; `pointer-events-api` widely available; `datalist` limited (not used); `has` widely available.
- WAI-ARIA APG Slider and Slider (Multi-Thumb): https://www.w3.org/WAI/ARIA/apg/patterns/slider/, https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/
- Radix Slider: https://www.radix-ui.com/primitives/docs/components/slider · Base UI Slider: https://base-ui.com/react/components/slider · React Aria Slider: https://react-aria.adobe.com/Slider · Ark Slider: https://ark-ui.com/react/docs/components/slider · Mantine Slider: https://mantine.dev/core/slider/ · MUI Slider: https://mui.com/material-ui/api/slider/
