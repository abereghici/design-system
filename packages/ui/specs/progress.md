# Progress

Shows how far a task has got (an upload, an import, a multi-step setup), or that it is running when the amount is unknown. Use it for tasks that take long enough to watch. For a short wait of unknown length inside a control use Spinner or Button's `loading`; for a value in a range that isn't progress (storage used, password strength) use Meter.

```tsx
import { roRO } from "@platform/ui/locales/ro-RO";
import { Progress } from "@platform/ui/progress";

<Progress value={40} label="Uploading 3 files" />
<Progress value={3} max={4} label="Setup" valueLabel="Step 3 of 4" />
<Progress value={null} aria-label="Importing contacts" />
<Progress value={40} label="Se încarcă 3 fișiere" locale={roRO} />
```

Status: draft for brand-owner review (phase 1). No source guide: drafted from the brand book and the reference libraries. Shares its shape and tokens pattern with Meter.

## Anatomy

Root → header (optional: label, value) → track → indicator.

- **Root.** A `<div>` holding the header and the native `<progress>` (see Behaviour).
- **Label** (optional). The visible name, a `<span>` at the inline start of the header, referenced by the root's `aria-labelledby`.
- **Value** (optional). The visible value text, a `<span>` at the inline end of the header, in tabular figures.
- **Track.** The native `<progress>` (`appearance: none`): a 6 px rounded bar in `progress-track-background-color`.
- **Indicator.** The progress value pseudo-element (`::-webkit-progress-value`, `::-moz-progress-bar`). Indeterminate: the Root's `::after`, a segment that sweeps the track, because no engine draws a value pseudo-element for an indeterminate `<progress>` and Firefox renders no `::after` on it.

Label, value, track and indicator are internal elements, not Parts (see API).

## API

| Prop            | Type                         | Default                | Notes                                                                                                                                                                        |
| --------------- | ---------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `number \| null`             | `null`                 | `null` is indeterminate. Clamped to `0…max`.                                                                                                                                 |
| `max`           | `number`                     | `100`                  | Must be greater than 0.                                                                                                                                                      |
| `label`         | `ReactNode`                  |                        | Visible label. Without it, `aria-label` or `aria-labelledby` is required (the props type is a union that demands one of the three).                                          |
| `valueLabel`    | `ReactNode`                  | the formatted value    | Visible value text, shown when there is a `label` and the value is known. A string `valueLabel` is also the `aria-valuetext`.                                                |
| `formatOptions` | `Intl.NumberFormatOptions`   | `{ style: "percent" }` | How the default value text is formatted. With `style: "percent"` the fraction `value / max` is formatted; otherwise `value` itself.                                          |
| `locale`        | `Locale`                     | English (`"en"`)       | A shipped locale object (`@platform/ui/locales/*`); its `tag` is the locale for `Intl.NumberFormat`. Formatting runs on the server.                                          |
| …native         | `ComponentProps<"progress">` |                        | `className` and `style` go on the root; `ref`, `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-valuetext` and every other attribute go on the `<progress>`. |

Names, checked against the reference libraries:

- **`Progress`**: Radix ("`Progress.Root`, `Progress.Indicator`", https://www.radix-ui.com/primitives/docs/components/progress), Base UI (https://base-ui.com/react/components/progress), Chakra (https://chakra-ui.com/docs/components/progress), Mantine (https://mantine.dev/core/progress/) and Radix Themes call it `Progress`. React Aria calls it `ProgressBar`, MUI `LinearProgress`. `Progress` is the majority name.
- **`value` with `null` for indeterminate**: Radix "`value` | `number | null`"; Base UI "The current value. The component is indeterminate when value is `null`."; Chakra "Set the value to `null` to show an indeterminate progress bar." React Aria uses a separate `isIndeterminate` ("Whether presentation is indeterminate when progress isn't known.", https://react-aria.adobe.com/ProgressBar) and MUI a `variant` (`'determinate'`, `'indeterminate'` …, https://mui.com/material-ui/api/linear-progress/). Three libraries use `null`; it also needs no boolean.
- **`max`**: Base UI "`max` … default `100`. "The maximum value.""; Chakra "`max` (default `100`)". Radix has `max` with no documented default. The native element's default is 1 (MDN: "The default value is `1`."), but every library uses 100. No `min`: MDN "the minimum value is always 0, and the `min` attribute is not allowed for the `<progress>` element." (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress). Base UI and Chakra add `min`; a task that starts above zero is a Meter.
- **`label`**: React Spectrum "`label` … "The content to display as the label."" (https://react-spectrum.adobe.com/react-spectrum/ProgressBar.html). Base UI and Chakra compose a `Label` Part instead.
- **`valueLabel`**: React Aria "The content to display as the value's label (e.g. 1 of 4)."; React Spectrum the same. React Spectrum shows it by default with a label: "`showValueLabel` … True by default if there's a label, false by default if not." We keep that default and drop the boolean.
- **`formatOptions`**: React Aria "The display format of the value label." Default "`{ style: 'percent' }`"; Chakra "`formatOptions` (default `{ style: "percent" }`)". Base UI calls it `format`. Two to one for `formatOptions`.
- **`locale`**: Base UI "The locale used by `Intl.NumberFormat` when formatting the value. Defaults to the user's runtime locale. When server rendering, `en-US` is used until hydration."; Chakra "`locale` (default `'en-US'`): "The locale to use for formatting the value."" We keep the prop, typed as the same locale object the UIProvider takes, and default to English (Q15-2: no client leaf, see Built-in labels).
- **No `getValueLabel`** (Radix) or `getAriaValueText` (Base UI: "Accepts a function which returns a string value that provides a human-readable text alternative for the current value"). A string `valueLabel`, or a plain `aria-valuetext`, covers both with one less prop.
- **Single component, not Parts.** Radix, Base UI and Chakra are compound (Base UI: "`Progress.Root`, `Progress.Label`, `Progress.Track`, `Progress.Indicator`, `Progress.Value`"). Their Parts share the value through React context, which Server Components can't read (inference), and spec #1 requires Progress to work as a Server Component. A single component with `label` and `valueLabel`, as React Spectrum has, keeps the root a Server Component. If the phase review prefers Parts, the names would be Base UI's.
- **No `size`, `variant` or colour.** Chakra has `size` `xs`–`xl` and `colorPalette`, Radix Themes `size` `1`–`3` and `variant`. Progress has one look: the brand book's "Rationed color" gives progress the Accent only, and status belongs to Meter and Alert.

## States

| State                 | How it shows                               | Exposed as                               |
| --------------------- | ------------------------------------------ | ---------------------------------------- |
| loading (determinate) | Indicator fills `value / max` of the track | `data-state="loading"`, `value`          |
| complete              | Indicator fills the track                  | `data-state="complete"`, `value` = `max` |
| indeterminate         | Segment sweeps the track; no value text    | `data-state="indeterminate"`, no `value` |

The `data-state` values are Radix's: "`[data-state]` … "complete", "indeterminate", or "loading"".

## Behaviour

- **The native element.** Progress renders `<progress max value>`, which exposes the `progressbar` role and value itself (ladder: platform first). The bar is styled with `::-webkit-progress-inner-element`, `::-webkit-progress-bar`, `::-webkit-progress-value` and `::-moz-progress-bar`, each in its own rule. Screenshotted in Chromium, Firefox and WebKit (QVF log).
- **Values.** The `<progress>` gets `max` and the clamped `value`; for `null` it has no `value` attribute, which makes it indeterminate (`position` is −1, HTML spec).
- **Value text.** WAI-ARIA 1.2 notes that assistive technologies usually present `aria-valuenow` as a percentage of the range "unless aria-valuetext is specified", so a percent needs no `aria-valuetext`. Progress sets `aria-valuetext` only when `valueLabel` is a string (or the consumer passes one).
- **Formatting.** The default value text is `new Intl.NumberFormat(locale, formatOptions).format(…)` (spec #1: "`Intl.*` for all formatting"). It always runs on the server, in `locale.tag` or `"en"`, so the value text needs no client code and can't mismatch on hydration (decision Q15-2).
- **Indicator size** is an inline `inline-size: {percent}%` on the indicator, so it starts at the inline start in either direction and needs no transform origin.
- **Region loading.** When Progress describes a loading region, the consumer sets `aria-busy="true"` on the region and points `aria-describedby` at the Progress. MDN: "use `aria-describedby` to point to the status, and set `aria-busy="true"` on the section that is being updated, removing the `aria-busy` attribute when it has finished loading." MUI says the same on its LinearProgress page.
- The label id comes from `useId`, which the React 19 server build exports (`exports.useId` in `react/cjs/react.react-server.development.js`, react 19.3.1). Server Component: no state, no handlers, no `'use client'` (spec #1 user story 4).

## Motion

- **Value changes:** none. The indicator jumps to each new value. Uploads update many times a second, and the brand book says "No motion on keyboard-initiated or high-frequency (100+ per day) actions"; a transition would also lag behind the real value (design decision).
- **Indeterminate:** a segment 40% of the track wide sweeps from the inline start to the inline end and back, `translate` over `--ab-progress-duration` (`motion-duration-loop`, 700 ms) each way, `motion-easing-constant` (the Dictionary's easing for "progress"), `infinite alternate`, with the track clipping it. React Aria's own example uses "a fixed 40% width when indeterminate".
- **Reduced motion:** `(prefers-reduced-motion: reduce)` removes the sweep. The indicator fills the track and its `background-color` alternates between `--ab-progress-track-background-color` and `--ab-progress-indicator-background-color` over the same duration: a colour fade, which the brand book keeps ("Opacity and color fades remain."). It never rests full, so it isn't mistaken for complete.
- **Duration limit:** WCAG 2.2.2's Understanding page says an animation in a preload phase "can be considered essential" (https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Indeterminate Progress is that case, and it is replaced by a determinate one or removed when the task ends.
- **Instant exit:** Progress has no exit animation. At completion the bar is full (`data-state="complete"`) and the app removes it or replaces it with the result; the full bar has already told the user the task finished, so an instant removal reads as correct.

## Keyboard

APG pattern: **none.** The APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) has no progress bar pattern; Radix links its Progress to the Meter pattern, which itself says "The meter should not be used to indicate progress, such as loading or percent completion of a task." The closest role is WAI-ARIA 1.2 `progressbar`: "An element that displays the progress status for tasks that take a long time." (https://www.w3.org/TR/wai-aria-1.2/#progressbar), the implicit role of HTML `<progress>` (MDN: "Implicit ARIA role: `progressbar`").

Not focusable; no keyboard interaction. WAI-ARIA 1.2 says the progressbar is read-only: users can't change its value.

## Accessibility

- Name: `progressbar` is "name required" in WAI-ARIA 1.2 (Roles Supporting Name from Author). React Spectrum: "a `label`, `aria-label`, or `aria-labelledby` prop is required." The props type enforces one of the three.
- The label is the root's `aria-labelledby`; the visible value text is not read separately (its content reaches assistive technology through the element's value / `aria-valuetext`).
- Don't announce every update: Progress is not a live region. The value is read when the user reaches it.
- Indicator against track and surface: `color-icon-accent`, which the tokens build checks at 3:1 on every surface (non-text contrast). The track is decorative; the indicator's length is read against the visible value text, so the range doesn't rely on the track alone.
- **More contrast:** `progress-track-background-color` is `color-border-subtle`, which steps up to `color-border-default` under `(prefers-contrast: more)` (token media override), so the full range becomes visible.
- **Forced colors:** backgrounds are forced, so in `@media (forced-colors: active)` the track draws `outline: 1px solid CanvasText` and the indicator `background-color: CanvasText`. MDN: "When a system color is specified, it will be used instead of the value that would otherwise have been forced." (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors).
- **Reduced transparency:** not affected (no Material).

## RTL

The header is a flex row with the label at the inline start and the value at the inline end. The indicator grows from the inline start because it is sized with `inline-size`. The indeterminate sweep uses a mirrored keyframe under `:dir(rtl)` (`translate` is physical). React Spectrum: "the layout, for both determinate and indeterminate options, is automatically flipped." Percent formatting follows `locale`.

## Component tokens

New (none exist yet):

| Token                                 | References                                   | Why                                                                                                                     |
| ------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `progress-gap`                        | `semantic.space-stack-sm`                    | Space between the header and the track.                                                                                 |
| `progress-label-font`                 | `semantic.type-label-sm`                     | Label type, as other control labels (`checkbox-label-font`).                                                            |
| `progress-label-text-color`           | `semantic.color-text-default`                | Label colour.                                                                                                           |
| `progress-value-font`                 | `semantic.type-data-sm`                      | Value text in the data role.                                                                                            |
| `progress-value-font-variant-numeric` | `semantic.type-data-sm-font-variant-numeric` | Tabular figures, so the value doesn't jitter as it counts (as `badge-font-variant-numeric`).                            |
| `progress-value-text-color`           | `semantic.color-text-subtle`                 | Secondary to the label.                                                                                                 |
| `progress-track-height`               | `semantic.size-indicator`                    | 6 px bar.                                                                                                               |
| `progress-track-border-radius`        | `semantic.radius-full`                       | Rounded ends, for track and indicator.                                                                                  |
| `progress-track-background-color`     | `semantic.color-border-subtle`               | The range; steps up under more contrast. A border colour as a fill, as `switch-track-background-color`.                 |
| `progress-indicator-background-color` | `semantic.color-icon-accent`                 | The fill. An icon role because the build checks icons at 3:1 on every surface, as `status-dot-*-background-color` does. |
| `progress-duration`                   | `semantic.motion-duration-loop`              | One indeterminate sweep, as `spinner-duration`.                                                                         |

Letter spacing reads the semantic `type-*-letter-spacing` tokens directly, because the Dictionary has no `letter-spacing` property word (no existing component token sets it either). Easing uses `motion-easing-constant` directly.

Dictionary changes: the component word **`progress`**, and the element word **`value`** (the value text; Base UI's Part name is `Progress.Value`). `track` and `indicator` already exist.

## Built-in labels

None. The name comes from `label`, `aria-label` or `aria-labelledby`, and the only generated text is the number, formatted with `Intl.NumberFormat`. Locale: the `locale` prop's `tag`, else `"en-US"`, as every component without a locale. A Server Component can't read the UIProvider's client context, so the app passes the same locale object it gives the UIProvider (decision Q15-2). Only the value text depends on the locale: `aria-valuenow` is a plain number, and assistive technology presents it as a percentage itself (WAI-ARIA 1.2, see Behaviour).

## Feedback events

None. Progress isn't interactive. Completion is the app's moment (it usually shows a Toast, which dispatches `ab-appear`).

## Sources

- Brand book (artifact `project/README.md`), Principles 4 "Rationed color", Motion ("No motion on keyboard-initiated or high-frequency (100+ per day) actions."; "Reduced motion removes movement, scaling, blur and stagger. Opacity and color fades remain.")
- WAI-ARIA 1.2 `progressbar`: https://www.w3.org/TR/wai-aria-1.2/#progressbar
- WAI-ARIA APG pattern index: https://www.w3.org/WAI/ARIA/apg/patterns/; Meter pattern: https://www.w3.org/WAI/ARIA/apg/patterns/meter/
- MDN `<progress>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
- MDN `::-webkit-progress-value`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-progress-value
- MDN `forced-colors`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors
- WCAG 2.2 Understanding 2.2.2: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- Radix Progress: https://www.radix-ui.com/primitives/docs/components/progress; Radix Themes Progress: https://www.radix-ui.com/themes/docs/components/progress
- Base UI Progress: https://base-ui.com/react/components/progress
- React Aria ProgressBar: https://react-aria.adobe.com/ProgressBar; React Spectrum ProgressBar: https://react-spectrum.adobe.com/react-spectrum/ProgressBar.html
- Chakra Progress: https://chakra-ui.com/docs/components/progress
- Mantine Progress: https://mantine.dev/core/progress/
- MUI LinearProgress API: https://mui.com/material-ui/api/linear-progress/
