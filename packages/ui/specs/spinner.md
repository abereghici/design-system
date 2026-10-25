# Spinner

Shows indeterminate progress for a wait longer than about 400 ms (Doherty threshold); below that, show nothing. Use it when the length of the wait is unknown. When progress can be measured, use Progress; for content whose shape is known, use Skeleton. Inside a busy Button, use the Button's `loading`, which renders the Spinner for you.

```tsx
import { Spinner } from "@platform/ui/spinner";

<Spinner />                                   {/* role="status", named "Loading" */}
<Spinner size="lg" aria-label="Loading results" />
<Spinner aria-hidden />                       {/* decorative: the parent announces the wait */}
```

Status: draft for brand-owner review (phase 1). Source guide: `components/Spinner/README.md` in the artifact.

## Anatomy

Status (`<span role="status">`), painted with eight staves.

- **Status.** An inline-block `<span>` sized `spinner-size` (sm, 16) or `spinner-lg-size` (lg, 24), carrying the role and the name.
- **Paint.** The span's own background, as the artifact's `.ab-spinner`: a `conic-gradient` ramp from transparent to `currentColor` (`spinner-color`), masked by a `repeating-conic-gradient` (18° staves every 45°) intersected with a `radial-gradient` ring. No child elements.
- **Staves.** Eight short radial wedges at 45° steps: the brand's stave motif ("The spinner's eight turning staves", archived brand book). Opacity falls off behind the leading stave so the turn reads. The stave is the surface's one motif (brand rule), so a Spinner never sits next to another motif such as the Separator ornament.

## API

| Prop          | Type                         | Default          | Notes                                                             |
| ------------- | ---------------------------- | ---------------- | ----------------------------------------------------------------- |
| `size`        | `"sm" \| "lg"`               | `"sm"`           | Exposed as `data-size`. 16 / 24 px.                               |
| `aria-label`  | `string`                     | `labels.loading` | The status's name. Overrides the built-in label for one instance. |
| `aria-hidden` | `boolean`                    |                  | When true, the Spinner is decorative: no `role`, no name.         |
| `locale`      | `Locale`                     | en-US            | A shipped locale; translates the name on the server.              |
| `labels`      | `Partial<Labels["spinner"]>` | English          | See Built-in labels.                                              |
| …native       | `ComponentProps<"span">`     |                  | `ref`, `className` and every native attribute pass through.       |

Names, checked against the reference libraries:

- **`Spinner`**: Chakra "Used to provide a visual cue that an action is processing" (https://chakra-ui.com/docs/components/spinner); shadcn "An indicator that can be used to show a loading state." (https://ui.shadcn.com/docs/components/spinner); Radix Themes "Displays an animated loading indicator." (https://www.radix-ui.com/themes/docs/components/spinner). Others differ: Mantine `Loader` ("Indicate loading state", https://mantine.dev/core/loader/), MUI `CircularProgress` with `variant` "Use indeterminate when there is no progress value." (https://mui.com/material-ui/api/circular-progress/), React Spectrum `ProgressCircle` with `isIndeterminate` (https://react-spectrum.adobe.com/react-spectrum/ProgressCircle.html), Ark "Progress - Circular", which has no Spinner. Spinner is the most common name (Chakra, shadcn, Radix) and the source's; spec #1 keeps it.
- **`size`**: Chakra "`'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'`"; Radix Themes `"1" | "2" | "3"`; Spectrum "`'S' | 'M' | 'L'`". All call it `size`. The values are the source's two (default and `lg`), named with the Dictionary's size words to match the tokens `spinner-size` / `spinner-lg-size`.
- **`aria-label`**: React Spectrum "An `aria-label` must be provided for accessibility."; shadcn's source sets `role="status"` and `aria-label="Loading"`. The source guide's `label="Loading results"` becomes the native attribute both libraries use.
- **No `color`, `thickness` or `animationDuration` props.** Chakra documents `borderWidth`, `animationDuration` and `colorPalette`; MUI `thickness`. Here they are the component tokens (`spinner-color`, `spinner-duration`), the supported override surface (spec #1 user story 15).
- **No `loading` prop.** Radix Themes' Spinner has `loading` "to control whether the spinner or its children are displayed"; Button owns that here (`loading`), so Spinner stays a leaf.

## States

| State          | How it shows                                              | Exposed as                                 |
| -------------- | --------------------------------------------------------- | ------------------------------------------ |
| spinning       | Staves step round, eight positions per `spinner-duration` | `role="status"`, `aria-label`, `data-size` |
| reduced motion | Whole Spinner pulses opacity, no rotation                 | `@media (prefers-reduced-motion: reduce)`  |
| decorative     | Same visual, hidden from assistive technology             | `aria-hidden="true"`                       |

## Behaviour

- Server Component, no `'use client'`: the animation is CSS only (spec #1 user story 4).
- The Spinner shows as soon as it is mounted. Waiting 400 ms before showing it is the caller's decision (it knows when the request started); the docs page shows the pattern.
- Mount it in place of the content that is loading and unmount it when the content arrives. When the region it stands in is busy, the caller sets `aria-busy="true"` on that region (MUI: "set the `aria-busy` attribute to `true` on that region until it has finished loading", https://mui.com/material-ui/api/circular-progress/).
- In a loading Button the Button renders `<Spinner aria-hidden />` in its leading slot and sets `aria-busy` itself (source: "Inside a busy Button the button sets `aria-busy` and the spinner is decorative").

## Motion

- Spin: `rotate` from 0 to 360° over `spinner-duration` (`motion-duration-loop`, 700 ms), `animation-timing-function: steps(8)`, infinite. Eight discrete steps, so each stave lands where the last one was (source: "Steps through 8 positions per `--ab-spinner-duration` (700ms)"). A step function is not an ease, so the brand's never-ease-in rule is met (inference).
- The rotation is clockwise in both directions (see RTL).
- **Reduced motion:** under `(prefers-reduced-motion: reduce)` the rotation is removed and the whole Spinner pulses `opacity` between 1 and 0.4 over twice `spinner-duration`, `motion-easing-move`, alternating (artifact `ab-pulse`) (source: "Under reduced motion it pulses opacity instead of rotating"). Opacity fades are what reduced motion keeps (spec #1 user story 47). The reduced-motion project asserts that no `rotate` runs.
- Looping past 5 s is allowed here: WCAG 2.2.2 Note 4, "An animation that occurs as part of a preload phase or similar situation can be considered essential if interaction cannot occur during that phase for all users and if not indicating progress could confuse users or cause them to think that content was frozen or broken." (https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Where the wait runs in parallel with other content the user can use, the caller should keep it short or use Progress (inference from the SC's "presented in parallel with other content").
- **Instant exit:** Spinner has no exit animation; it is unmounted when the wait ends. That reads as correct because the loaded content takes its place in the same spot (and in a Button the label never moved).

## Keyboard

No APG pattern: the APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) has no spinner or loading-indicator pattern (its "Spinbutton" is a number input, not this). The closest role is WAI-ARIA 1.2 `status`: "A type of live region whose content is advisory information for the user but is not important enough to justify an alert." and "Elements with the role status have an implicit aria-live value of polite and an implicit aria-atomic value of true." (https://www.w3.org/TR/wai-aria-1.2/#status). An indeterminate `progressbar` was considered; `status` is the source's choice and shadcn's.

Not focusable; no keyboard interaction. Tab skips it, and focus is never moved to it.

## Accessibility

- Role `status` with a name ("Loading" by default). Screen readers announce a live region's changes politely, without moving focus.
- The name is an `aria-label`; whether it is announced when the Spinner is inserted varies by screen reader (inference). The definition-of-done screen-reader pass (VoiceOver + Safari, NVDA + Firefox) records what each announces; if insertion is silent, the caller announces the outcome instead (a Toast or the loaded content).
- Decorative (`aria-hidden`) wherever something else already says "busy": a loading Button, a region with `aria-busy` and its own message.
- Contrast: the leading stave is drawn in `spinner-color` (`color-icon-subtle`), an icon role held to 3:1. The fading staves are decoration; the state is also conveyed by the role and name, so it never relies on the faded strokes.
- **More contrast:** no change; the leading stave already meets 3:1.
- **Forced colors:** the staves are background paint, which forced colors would drop, so the Spinner sets `forced-color-adjust: none` and `color: CanvasText` (artifact adaptive.css).
- **Reduced transparency:** not affected (no Material). The stave opacity is part of the glyph, not a translucent fill.

## RTL

Not mirrored: the Spinner keeps turning clockwise. Adobe Spectrum: "Icons that refer to the passage of time (e.g., clock icon) should not be mirrored." (https://spectrum.adobe.com/page/bi-directionality); a turning wait indicator shows time passing (inference). Inline placement uses logical properties only.

## Component tokens

All exist (ported from the source): `spinner-size` (→ `size-icon-sm`), `spinner-lg-size` (→ `size-icon-lg`), `spinner-color` (→ `color-icon-subtle`), `spinner-stroke-width` (→ `stroke-width-lg`), `spinner-duration` (→ `motion-duration-loop`).

No new tokens. The reduced-motion pulse uses semantic `motion-easing-move` directly. `spinner-stroke-width` was deleted: the staves are a mask.

## Built-in labels

| Label     | Default   | Used for                                          |
| --------- | --------- | ------------------------------------------------- |
| `loading` | "Loading" | The status's name when no `aria-label` is passed. |

The en-US default is `spinner` in `src/ui-provider/locales/en-US/spinner.ts`, which `enUS` composes. A Server Component can't read the UIProvider's locale, so a localised app passes the shipped object, `locale={roRO}`, as on Progress, Meter, Badge and Pagination; `labels` overrides single strings (decision Q19-1).

## Feedback events

None. Spinner is not interactive and the system starts it, so no `ab-appear` (the caller that started the wait owns any feedback).

## Sources

- Source guide: artifact `project/components/Spinner/README.md` ("Indeterminate progress for waits longer than ~400ms (Doherty threshold); below that, show nothing."; "Steps through 8 positions per `--ab-spinner-duration` (700ms). Under reduced motion it pulses opacity instead of rotating."; "`role="status"` with a label. Inside a busy Button the button sets `aria-busy` and the spinner is decorative.").
- Brand book, Personality: "The **stave**, a single carved upright, as on the shepherd's _răboj_" — "The spinner's turning staves"; "One motif per surface at most."
- WAI-ARIA 1.2 `status` role: https://www.w3.org/TR/wai-aria-1.2/#status
- APG pattern index: https://www.w3.org/WAI/ARIA/apg/patterns/
- WCAG 2.2 Understanding 2.2.2 Pause, Stop, Hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- Chakra Spinner: https://chakra-ui.com/docs/components/spinner
- shadcn/ui Spinner: https://ui.shadcn.com/docs/components/spinner
- Radix Themes Spinner: https://www.radix-ui.com/themes/docs/components/spinner
- Mantine Loader: https://mantine.dev/core/loader/
- MUI CircularProgress API: https://mui.com/material-ui/api/circular-progress/
- React Spectrum ProgressCircle: https://react-spectrum.adobe.com/react-spectrum/ProgressCircle.html
- Ark UI Progress - Circular: https://ark-ui.com/docs/components/progress-circular
- Adobe Spectrum bi-directionality: https://spectrum.adobe.com/page/bi-directionality
- CSS Color Adjustment Level 1: https://www.w3.org/TR/css-color-adjust-1/
