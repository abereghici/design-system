# Meter

Shows a measurement within a known range: storage used, a quota, a battery level, a score. Use it when the value sits on a scale with fixed ends. Not for progress (use Progress), and not for a value the user sets (use Slider).

```tsx
import { Meter } from "@platform/ui/meter";

<Meter value={42} label="Storage" valueLabel="4.2 GB of 10 GB" />
<Meter value={92} label="Storage" low={70} high={90} optimum={0} valueLabel="92%, almost full" />
<Meter value={3} min={0} max={5} aria-label="Rating" valueLabel="3 out of 5" />
```

Status: draft for brand-owner review (phase 1). No source guide: drafted from the brand book and the reference libraries. Same shape and token pattern as Progress.

## Anatomy

Root → header (optional: label, value) → track → indicator. The same four elements as Progress:

- **Root.** A `<div>` holding the header and the native `<meter>` (see Behaviour).
- **Label** (optional). The visible name, at the inline start of the header, referenced by `aria-labelledby`.
- **Value** (optional). The visible value text, at the inline end, in tabular figures.
- **Track.** The native `<meter>` (`appearance: none`): the full range, a 6 px rounded bar.
- **Indicator.** The meter's value pseudo-element (`::-webkit-meter-*-value`, `::-moz-meter-bar`). Its colour is the Accent, or the native region's status colour when `low` / `high` are set.

## API

| Prop            | Type                                                 | Default                | Notes                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `number`                                             | required               | Clamped to `min…max`.                                                                                                                                                                          |
| `min`           | `number`                                             | `0`                    |                                                                                                                                                                                                |
| `max`           | `number`                                             | `100`                  | Must be greater than `min`.                                                                                                                                                                    |
| `low`           | `number`                                             |                        | Upper bound of the low end of the range.                                                                                                                                                       |
| `high`          | `number`                                             |                        | Lower bound of the high end of the range.                                                                                                                                                      |
| `optimum`       | `number`                                             | midpoint of `min…max`  | The preferred value; with `low` / `high` it picks which part of the range is good.                                                                                                             |
| `label`         | `ReactNode`                                          |                        | Visible label. Without it, `aria-label` or `aria-labelledby` is required (a props union).                                                                                                      |
| `valueLabel`    | `ReactNode`, or `string` when `low` / `high` are set | the formatted value    | Visible value text when there is a `label`. A string is also the `aria-valuetext`. **Required, as a string, when `low` or `high` is set**, so the judgement the colour shows is also in words. |
| `formatOptions` | `Intl.NumberFormatOptions`                           | `{ style: "percent" }` | With `style: "percent"` the fraction `(value − min) / (max − min)` is formatted; otherwise `value`.                                                                                            |
| `locale`        | `Intl.LocalesArgument`                               | the runtime's default  | Passed to `Intl.NumberFormat`. Pass the same one on the server and in the browser.                                                                                                             |
| …native         | `ComponentProps<"meter">`                            |                        | `className` and `style` go on the root; `ref`, `id`, `aria-*` and every other attribute go on the `<meter>`.                                                                                   |

Names, checked against the reference libraries:

- **`Meter`**: React Aria (https://react-aria.adobe.com/Meter), Base UI (https://base-ui.com/react/components/meter) and React Spectrum (https://react-spectrum.adobe.com/react-spectrum/Meter.html) call it `Meter`; so do HTML (`<meter>`) and the APG. A meter component in Radix, Chakra, Mantine or MUI: not found (not checked beyond their Progress pages; Radix's Progress page links the APG meter pattern).
- **`value`, `min`, `max`**: Base UI "**value** (`number`, required): "The current value."", "**min** … default `0`", "**max** … default `100`". React Aria names them `minValue` / `maxValue` ("The smallest value allowed for the input."). Base UI and the native element (MDN: "`min`: The lower numeric bound of the measured range.") use `min` / `max`. The default `max` is Base UI's 100, not the native 1 ("If unspecified, the maximum value is `1`."), to match Progress.
- **`low`, `high`, `optimum`**: no React library documents thresholds (Base UI: not mentioned; React Aria: not mentioned). The native element does: MDN "`low`: The upper numeric bound of the low end of the measured range."; "`high`: The lower numeric bound of the high end of the measured range."; "`optimum`: This attribute indicates the optimal numeric value. … The browser may color the meter's bar differently depending on whether the value is less than or equal to the optimum value." (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter). We take the platform's names (ADR-0001). React Spectrum instead has an explicit "`variant`: `'informative' | 'positive' | 'warning' | 'critical'` … "The visual style of the Meter."". We prefer thresholds: the colour then follows the value without the app recomputing it, and the meaning of each colour is the HTML spec's.
- **`label`, `valueLabel`, `formatOptions`, `locale`**: as Progress. React Spectrum Meter: "`label`: "The content to display as the label."", "`valueLabel`: "The content to display as the value's label (e.g. 1 of 4).""; React Aria Meter: "`formatOptions`: "The display format of the value label." Default: `{ style: 'percent' }`"; Base UI Meter: "**locale** … "The locale used by `Intl.NumberFormat` when formatting the value."" Base UI's `format` and `getAriaValueText` are covered by `formatOptions` and a string `valueLabel`.
- **Single component, not Parts** (Base UI: "Meter.Root … Meter.Label … Meter.Track … Meter.Indicator … Meter.Value"), for the same reason as Progress: Parts share the value through context, which a Server Component can't read (inference).

## States

| State                 | How it shows            | Exposed as                       |
| --------------------- | ----------------------- | -------------------------------- |
| no thresholds         | Indicator in the Accent | native `optimum` region          |
| optimum region        | Indicator in success    | `data-thresholds`, native region |
| suboptimal region     | Indicator in warning    | native region                    |
| even less good region | Indicator in danger     | native region                    |

**Regions** follow the HTML spec's gauge algorithm (https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element). The optimum point is `optimum`, defaulting to "the midpoint between the minimum value and the maximum value." Then:

- If it lies between `low` and `high`, "the region between the low and high boundaries of the gauge must be treated as the optimum region", and the low and high ends are suboptimal.
- If it lies below `low`, the part below `low` is the optimum region, "the region from the low boundary up to the high boundary must be treated as a suboptimal region," and "the remaining region must be treated as an even less good region." Above `high` is the mirror case.

The region names are the HTML spec's and match the engines' own pseudo-elements (`::-webkit-meter-optimum-value`, `::-webkit-meter-suboptimum-value`, `::-webkit-meter-even-less-good-value`, listed on MDN). Without `low` and `high` no region is computed (the whole range would be "optimum", which would paint every plain meter green).

## Behaviour

- **The native element.** Meter renders `<meter min max low high optimum value>`, so the browser computes the gauge region (HTML spec) and exposes the `meter` role and value. The bar is styled with the engines' pseudo-elements (`::-webkit-meter-inner-element`, `::-webkit-meter-bar`, `::-webkit-meter-{optimum,suboptimum,even-less-good}-value`, `::-moz-meter-bar` with `:-moz-meter-{optimum,sub-optimum,sub-sub-optimum}`), each in its own rule because a selector list fails whole in an engine that doesn't know one of its pseudo-elements. Screenshotted in Chromium, Firefox and WebKit (QVF log).
- **Values.** The value is clamped to `min…max` before it is formatted and set, as the native element clamps its actual value ("the actual value is the minimum value" / "the actual value is the maximum value", HTML spec).
- **Thresholds aren't exposed by ARIA.** WAI-ARIA 1.2 notes there are currently no properties for the HTML `low`, `optimum` and `high` attributes, to be "considered for ARIA version 1.3" (https://www.w3.org/TR/wai-aria-1.2/#meter). This is why a string `valueLabel` is required with thresholds: it becomes `aria-valuetext` and carries the judgement ("92%, almost full"). The APG: "the aria-valuetext property is set to a string that makes the meter value understandable." (https://www.w3.org/WAI/ARIA/apg/patterns/meter/).
- **Formatting** with `Intl.NumberFormat(locale, formatOptions)`, as Progress: in `locale`, else the runtime's default (Base UI's default); a server-rendered app passes the same `locale` on the server and in the browser. The HTML spec also asks for the value in text: "Authors are encouraged to include a textual representation of the gauge's state in the element's contents".
- **Indicator size** is an inline `inline-size: {percent}%`, as Progress.
- Server Component: no state, no handlers, no `'use client'` (spec #1 user story 4). The label id comes from `useId`, which the React 19 server build exports.

## Motion

None. A meter's value changes rarely and when it does the indicator jumps to it (the same choice as Progress; a fill animation would also be a scale-like change that reduced motion removes).

- **Reduced motion:** nothing to reduce. The region colour change is instant.
- **Instant exit:** Meter has no exit. When it is removed or its value changes, the new state is drawn in one frame; the value text changes with it, so the state never depends on watching a transition.

## Keyboard

APG pattern: **Meter** (https://www.w3.org/WAI/ARIA/apg/patterns/meter/). "A meter is a graphical display of a numeric value that varies within a defined range." Keyboard Interaction: "Not applicable."

Not focusable; no keyboard interaction. Tab skips it.

## Accessibility

- Role `meter`. WAI-ARIA 1.2: "An element that represents a scalar measurement within a known range, or a fractional value." and "Authors SHOULD NOT use the meter role to indicate progress; the progressbar role exists to address that need." The APG agrees: "The meter should not be used to indicate progress, such as loading or percent completion of a task."
- Name: `meter` is "name required" in WAI-ARIA 1.2. APG: "If the meter has a visible label, it is referenced by aria-labelledby on the element with role meter." The props type requires `label`, `aria-label` or `aria-labelledby`.
- **Never colour alone.** The region colour always comes with words: with thresholds, `valueLabel` is a required string, shown next to the label and exposed as `aria-valuetext`. Brand book: "State always pairs color with a label, a shape, a weight change or an underline."
- Indicator colours are `color-icon-accent`, `-success`, `-warning` and `-danger`, which the tokens build checks at 3:1 on every surface (non-text contrast).
- **More contrast:** the track is `color-border-subtle`, which steps up to `color-border-default` under `(prefers-contrast: more)` (token media override), so the full range is visible.
- **Forced colors:** backgrounds are forced, so in `@media (forced-colors: active)` the track draws `outline: 1px solid CanvasText` and the indicator `background-color: CanvasText`. The region colour is lost, and the value text still states it. MDN: "When a system color is specified, it will be used instead of the value that would otherwise have been forced."
- **Reduced transparency:** not affected (no Material).

## RTL

As Progress: label at the inline start, value at the inline end, indicator grows from the inline start (`inline-size`). Regions are numeric, so they don't depend on direction. React Spectrum's Meter page says its layout flips automatically for right-to-left languages such as Hebrew and Arabic.

## Component tokens

New (none exist yet), mirroring Progress:

| Token                                      | References                                   | Why                                      |
| ------------------------------------------ | -------------------------------------------- | ---------------------------------------- |
| `meter-gap`                                | `semantic.space-stack-sm`                    | Header to track.                         |
| `meter-label-font`                         | `semantic.type-label-sm`                     | Label type.                              |
| `meter-label-text-color`                   | `semantic.color-text-default`                | Label colour.                            |
| `meter-value-font`                         | `semantic.type-data-sm`                      | Value text in the data role.             |
| `meter-value-font-variant-numeric`         | `semantic.type-data-sm-font-variant-numeric` | Tabular figures.                         |
| `meter-value-text-color`                   | `semantic.color-text-subtle`                 | Secondary to the label.                  |
| `meter-track-height`                       | `semantic.size-indicator`                    | 6 px bar.                                |
| `meter-track-border-radius`                | `semantic.radius-full`                       | Rounded ends.                            |
| `meter-track-background-color`             | `semantic.color-border-subtle`               | The range; steps up under more contrast. |
| `meter-indicator-background-color`         | `semantic.color-icon-accent`                 | Fill without thresholds.                 |
| `meter-success-indicator-background-color` | `semantic.color-icon-success`                | Optimum region.                          |
| `meter-warning-indicator-background-color` | `semantic.color-icon-warning`                | Suboptimal region.                       |
| `meter-danger-indicator-background-color`  | `semantic.color-icon-danger`                 | Even less good region.                   |

The fills use icon roles, as `status-dot-*-background-color` do, because the build checks icon roles at 3:1 on every surface; the `*-bold` backgrounds are only checked against their `on-*` text. Letter spacing reads the semantic `type-*-letter-spacing` tokens directly (no `letter-spacing` property word in the Dictionary).

Dictionary changes: the component word **`meter`**, and the element word **`value`** (shared with Progress). `track`, `indicator`, `success`, `warning` and `danger` already exist.

## Author-written text

None. The name is the consumer's, the judgement is the consumer's `valueLabel` (it depends on what is measured: "almost full" is right for storage, wrong for a battery), and the default value text is a number formatted with `Intl.NumberFormat` in `locale`. The locale resolves as in Progress: the `locale` prop, else the runtime's default.

## Feedback events

None. Meter isn't interactive.

## Sources

- Brand book (artifact `project/README.md`), Accessibility: "State always pairs color with a label, a shape, a weight change or an underline."
- WAI-ARIA APG Meter pattern: https://www.w3.org/WAI/ARIA/apg/patterns/meter/
- WAI-ARIA 1.2 `meter`: https://www.w3.org/TR/wai-aria-1.2/#meter
- HTML spec, the meter element: https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element
- MDN `<meter>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter
- MDN `forced-colors`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors
- Base UI Meter: https://base-ui.com/react/components/meter
- React Aria Meter: https://react-aria.adobe.com/Meter
- React Spectrum Meter: https://react-spectrum.adobe.com/react-spectrum/Meter.html
- Radix Progress (links the APG meter pattern): https://www.radix-ui.com/primitives/docs/components/progress
