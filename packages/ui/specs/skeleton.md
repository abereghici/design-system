# Skeleton

Holds the place of content that is still loading, in the same shape, so the layout doesn't jump when the content arrives. Use it for a first load where the shape of the content is known (a list, a card, an avatar and name). For a wait inside a control use the Button's `loading`; for a wait of unknown shape use Spinner; for a measurable task use Progress. Like Spinner, show nothing for waits under about 400 ms (brand book, Doherty threshold).

```tsx
import { Avatar } from "@platform/ui/avatar";
import { Skeleton } from "@platform/ui/skeleton";
import { Text } from "@platform/ui/text";

<section aria-busy={isLoading} aria-labelledby="team-heading">
  <Skeleton loading={isLoading}>
    <Avatar name={user.name} src={user.avatarUrl} />
  </Skeleton>
  <Text>
    <Skeleton loading={isLoading}>{user.name ?? "Placeholder name"}</Skeleton>
  </Text>
  {isLoading && <Skeleton className={styles.chart} />}
</section>;
```

Status: draft for brand-owner review (phase 1). No source guide: drafted from the brand book (Motion, Accessibility) and the reference libraries.

## Anatomy

One element, in one of three forms:

- **Wrapping an element** (one valid React element child): the child itself is rendered as the placeholder, with the Skeleton's props merged onto it (Radix Slot). The child keeps its own size and shape, so an Avatar skeleton stays round and a Button skeleton keeps its radius. Its contents are hidden.
- **Wrapping text** (string children): an inline `<span>` that covers the text's line boxes, so the placeholder is as long as the placeholder text.
- **Empty**: a block `<span>` sized by the consumer (`className` or `style`), one line tall (`block-size: 1lh`) by default.

When `loading` is `false`, Skeleton renders its children unchanged, with no wrapper.

## API

| Prop       | Type                     | Default | Notes                                                                                                          |
| ---------- | ------------------------ | ------- | -------------------------------------------------------------------------------------------------------------- |
| `loading`  | `boolean`                | `true`  | `true` shows the placeholder; `false` renders the children. Exposed as `data-loading` while loading.           |
| `children` | `ReactNode`              |         | The content the placeholder stands for.                                                                        |
| …native    | `ComponentProps<"span">` |         | `ref`, `className`, `style` and every native attribute pass through (onto the child when wrapping an element). |

Names, checked against the reference libraries:

- **`Skeleton`**: Radix Themes, Chakra, Mantine and MUI all call it `Skeleton`.
- **`loading`**: Radix Themes "`loading` | `boolean` | `true`" and "Use the `loading` prop to control whether the skeleton or its children are displayed." (https://www.radix-ui.com/themes/docs/components/skeleton); Chakra "`loading` … Default is `true`" (https://chakra-ui.com/docs/components/skeleton). Mantine names it `visible` ("control the loading overlay visibility with the `visible` prop", https://mantine.dev/core/skeleton/). Two libraries use `loading`, which also matches Button's `loading`.
- **Wrapping children**: Radix Themes "Skeleton preserves the dimensions of children when they are hidden and disables interactive elements."; MUI "you can pass `children` and it will infer its width and height from them." (https://mui.com/material-ui/react-skeleton/). Radix renders a `Slot` for an element child and a `<span data-inline-skeleton>` otherwise (source: https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/skeleton.tsx). We follow that source.
- **No shape `variant`** (MUI's `text | circular | rectangular | rounded`, Chakra's `SkeletonCircle`, Mantine's `circle`). Wrapping the real element gives the right shape for free, and an empty Skeleton takes its shape from `className`. One fewer API (design decision).
- **No `width` / `height` props** (Radix, MUI and Mantine have them). They are physical; `className` or `style={{ inlineSize }}` sets size with logical properties, as every other component does.
- **No animation `variant`** (MUI "By default, the skeleton pulsates, but you can change the animation to a wave or disable it entirely."; Chakra `'pulse' | 'shine' | 'none'`). Skeleton has one animation, the pulse, because it survives reduced motion (see Motion), and a wave or shine is movement.

## States

| State   | How it shows                                                                                                           | Exposed as                                    |
| ------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| loading | Fill pulses between `skeleton-background-color` and `skeleton-pulse-background-color`; content hidden; not interactive | `data-loading`, `aria-hidden="true"`, `inert` |
| loaded  | The children, unchanged                                                                                                | (no Skeleton element)                         |

## Behaviour

- While loading, the placeholder element gets `aria-hidden="true"`, `inert` and `tabIndex={-1}`, as Radix Themes' source does, so nothing inside it can be focused, clicked or read. `inert` is Baseline widely available (https://api.webstatus.dev/v1/features/inert).
- CSS while loading: `color: transparent`, children `visibility: hidden`, `pointer-events: none`, `user-select: none`, and no border or shadow, so only the fill shows. A wrapped element's own `border-radius` is kept; inline and empty forms use `skeleton-border-radius`.
- The inline form sets `box-decoration-break: clone` so a placeholder that wraps across lines has rounded ends on every line (from Radix Themes' CSS).
- Skeleton doesn't set `aria-busy` itself, because it is hidden from assistive technology and a region usually holds several. The consumer sets `aria-busy="true"` on the region that is loading and removes it when done (see Accessibility).
- Server Component: no state, no handlers, no `'use client'` (spec #1 user story 4). The Slot merge is a `cloneElement`, which needs no client code.

## Motion

- **Pulse**: `background-color` alternates between `--ab-skeleton-background-color` and `--ab-skeleton-pulse-background-color` over `--ab-skeleton-duration` (`motion-duration-loop`, 700 ms) each way, `motion-easing-color`, `infinite alternate`. Radix Themes pulses the same way: "`animation: rt-skeleton-pulse 1000ms infinite alternate-reverse`", from one grey to the next (skeleton.css, same repo). It is a colour fade, not movement.
- **Reduced motion:** the pulse stays. The brand book's rule is "Reduced motion removes movement, scaling, blur and stagger. Opacity and color fades remain." The pulse moves, scales and blurs nothing.
- **Duration limit:** WCAG 2.2.2 applies to moving or blinking content that "lasts more than five seconds", but its Understanding page says an animation in a preload phase "can be considered essential", and for a loading animation "no mechanism to pause, stop or hide it needs to be provided." (https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Skeleton is exactly that case.
- **Instant exit:** Skeleton has no exit animation: when `loading` turns `false` the placeholder is replaced by the content in the same frame. Chakra fades the content in ("When `loading` is changed to `false`, the Skeleton component will fade in."); we don't, because the placeholder already had the content's size and shape, so the swap reads as the content arriving in place, with no layout shift. A fade would delay content the user is waiting for.

## Keyboard

APG pattern: **none.** The APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) has no skeleton or loading pattern. The closest WAI-ARIA construct is the `aria-busy` state on the loading region.

Not focusable; no keyboard interaction. MUI: "The skeleton is not focusable." While loading, `inert` also removes any focusable element inside a wrapped child from the tab order, so Tab skips the placeholder.

## Accessibility

- The placeholder is hidden from assistive technology (`aria-hidden`), so a screen reader never reads "Placeholder name".
- The loading region carries `aria-busy="true"`. MDN: "The `aria-busy` attribute with a value of `true` can be added to an element currently being updated or modified, to inform the assistive technology that it should wait until the modifications or changes are complete before exposing the content to the user." and "This prevents assistive technologies from announcing changes before updates are done." (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy).
- If users must be told that loading is happening (a long first load), pair the region with a Spinner (`role="status"` with a label) or a Progress, and point at it with `aria-describedby`, as MDN recommends for `<progress>`: "use `aria-describedby` to point to the status, and set `aria-busy="true"` on the section that is being updated" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress).
- The fill is decorative: it carries no information that isn't also given by `aria-busy`, so it is not held to non-text contrast (inference; the brand book likewise exempts decorative hairlines: "The subtle hairline border is decorative and is never the only boundary of a control.").
- **More contrast:** unchanged. Both fills are surface steps with no media override; the placeholder is decorative.
- **Forced colors:** backgrounds are forced, so the fill would vanish. In `@media (forced-colors: active)` the placeholder draws `background-color: GrayText` and `animation: none`. MDN: "When a system color is specified, it will be used instead of the value that would otherwise have been forced." (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors).
- **Reduced transparency:** not affected (no Material).

## RTL

No directional styling. The inline form follows the text's line boxes in either direction; sizes use logical properties (`inline-size`, `block-size`).

## Component tokens

New (none exist yet):

| Token                             | References                      | Why                                                                                                       |
| --------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `skeleton-background-color`       | `semantic.color-surface-nested` | The resting fill: one surface step below the page, visible on default and raised surfaces in both Themes. |
| `skeleton-pulse-background-color` | `semantic.color-surface-raised` | The other end of the pulse, half a step lighter in light and darker in dark, so the pulse stays quiet.    |
| `skeleton-border-radius`          | `semantic.radius-xs`            | Corners for the inline and empty forms.                                                                   |
| `skeleton-duration`               | `semantic.motion-duration-loop` | One half of the pulse; the system's loop duration, as `spinner-duration`.                                 |

Dictionary changes: the component word **`skeleton`**, and the element word **`pulse`** ("a named part or phase inside a component": the far end of the pulse). No existing word names that second colour: the state words (`hovered`, `pressed` …) would misstate it, and `highlight` is already a colour Role.

Easing uses `motion-easing-color` directly (R6-style pattern: a colour fade, as every hover).

## Author-written text

None. Skeleton has no text; the loading status message, if any, belongs to the Spinner or Progress that describes the region.

## Feedback events

None. Skeleton isn't interactive, and its appearing is not a moment for sound.

## Sources

- Brand book (artifact `project/README.md`), Motion: "Reduced motion removes movement, scaling, blur and stagger. Opacity and color fades remain."; Interaction principles: "Spinners only for waits over 400ms."
- MDN `aria-busy`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy
- MDN `<progress>` (describing a loading region): https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
- MDN `forced-colors`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors
- WCAG 2.2 Understanding 2.2.2 Pause, Stop, Hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- webstatus.dev `inert`: https://api.webstatus.dev/v1/features/inert; `lh`: https://api.webstatus.dev/v1/features/lh (widely available)
- WAI-ARIA APG pattern index: https://www.w3.org/WAI/ARIA/apg/patterns/
- Radix Themes Skeleton: https://www.radix-ui.com/themes/docs/components/skeleton; source `skeleton.tsx` and `skeleton.css` in https://github.com/radix-ui/themes
- Chakra Skeleton: https://chakra-ui.com/docs/components/skeleton
- Mantine Skeleton: https://mantine.dev/core/skeleton/
- MUI Skeleton: https://mui.com/material-ui/react-skeleton/
