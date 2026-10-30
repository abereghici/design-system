# Separator

A hairline between groups of content. Prefer space first: use a Separator only when space alone leaves the grouping ambiguous. The ornament Variant (the ochi diamond) is for editorial pages only, never inside dense UI. For a separator the user drags to resize panes, use a window splitter (not part of this component).

```tsx
import { Separator } from "@platform/ui/separator";

<Separator />                                 {/* <hr>, role separator */}
<Separator orientation="vertical" />          {/* between toolbar groups */}
<Separator decorative />                      {/* visual only: role="none" */}
<Separator variant="ornament" />              {/* editorial pages only */}
```

Status: draft for brand-owner review (phase 1). Source guide: `components/Divider/README.md` in the artifact (the source's Divider, renamed Separator by spec #1).

## Anatomy

Line (one `<hr>`) → ornament (optional, drawn by the same element).

- **Line.** A native `<hr>` with its UA margin, border and height reset. Horizontal: full inline size, one `border-block-start` of `separator-border-width` in `separator-border-color`. Vertical: `align-self: stretch`, one `border-inline-start`. No margin: the parent's `gap` spaces it (spec: space first).
- **Ornament** (`variant="ornament"`, horizontal only). The ochi diamond centred on the line: an outlined square of `separator-dot-size` (content box) turned 45°, its `separator-border-width` edge in `separator-dot-color`, as the artifact's `.ab-divider[data-ornament]>i`, with `separator-gap` of empty line on each side. `<hr>` is a void element, so the diamond is its `::before` and the two line segments are background layers (`linear-gradient`) on the `<hr>` itself. Verified rendering in Chromium, Firefox and WebKit. The bob is the surface's one motif (brand rule).

## API

| Prop          | Type                         | Default        | Notes                                                                                                                                             |
| ------------- | ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Exposed as `data-orientation`; vertical also sets `aria-orientation="vertical"` (horizontal is the role's implicit value).                        |
| `variant`     | `"solid" \| "ornament"`      | `"solid"`      | Exposed as `data-variant`. Typed so `"ornament"` is only accepted with `orientation="horizontal"` (a discriminated union, spec #1 user story 13). |
| `decorative`  | `boolean`                    | `false`        | `role="none"`: removed from the accessibility tree, for a purely visual line.                                                                     |
| …native       | `ComponentProps<"hr">`       |                | `ref`, `className` and every native attribute pass through.                                                                                       |

Names, checked against the reference libraries:

- **`Separator`**: Radix "Visually or semantically separates content." (https://www.radix-ui.com/primitives/docs/components/separator); shadcn, same words (https://ui.shadcn.com/docs/components/separator); Base UI "A separator element accessible to screen readers." (https://base-ui.com/react/components/separator); React Aria "A separator is a visual divider between two groups of content, e.g. groups of menu items or sections of a page." (https://react-aria.adobe.com/Separator); Chakra "Used to visually separate content" (https://chakra-ui.com/docs/components/separator). MUI and Mantine call it `Divider` ("Horizontal line with optional label or vertical divider", https://mantine.dev/core/divider/). Five of seven say Separator; spec #1 renames Divider → Separator, and the glossary lists Divider under _Avoid_.
- **`orientation`**: Radix "`orientation` … enum … `"horizontal"`"; Base UI "`'horizontal' | 'vertical' | undefined`", default `'horizontal'`, "The orientation of the separator."; Chakra "`'vertical' | 'horizontal'`"; MUI "`'horizontal' | 'vertical'`" (https://mui.com/material-ui/api/divider/). Every library agrees.
- **`decorative`**: Radix only (`decorative`, boolean). Kept because it is the Radix name for a real need (a line that must not be announced) and the brief's Part-naming reference is Radix. It is a semantic flag, not a Variant, so spec #1's "Variants and sizes as string unions, never booleans" does not apply (design decision).
- **`variant`**: Chakra "`'solid' | 'dashed' | 'dotted'`", default `'solid'`; MUI "`'fullWidth'`, `'inset'`, `'middle'`" (a spacing variant); Mantine demos `dashed` / `dotted`. The source's boolean `ornament` becomes a Variant value because spec #1 forbids boolean Variants; the default takes Chakra's name `solid`. Dashed and dotted are not added: the source doesn't use them.
- **No `label`.** Mantine has `label` and `labelPosition` (`"left"`, `"center"`, `"right"`), Chakra a "Label" example. The source has no labelled divider, so none is added.
- **Native `<hr>`, not a `<div role="separator">`.** MDN: "The `<hr>` HTML element represents a thematic break between elements", implicit role `separator` (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr). React Aria's render prop allows `"div" | "hr"`. Platform before script (ADR-0001).

## States

| State      | How it shows                               | Exposed as                                                   |
| ---------- | ------------------------------------------ | ------------------------------------------------------------ |
| horizontal | Hairline across                            | `data-orientation="horizontal"`                              |
| vertical   | Hairline down, stretched to the row        | `data-orientation="vertical"`, `aria-orientation="vertical"` |
| ornament   | Line, gap, diamond, gap, line              | `data-variant="ornament"`                                    |
| decorative | Same visual, not in the accessibility tree | `role="none"`                                                |

No interactive states.

## Behaviour

- Server Component, no `'use client'` (spec #1 user story 4).
- `<hr>` is valid inside `<select>` between options (MDN: "The `<hr>` element is allowed inside a `<select>` element to create a visual separator between `<option>` elements."), so a native Select can use it. Compound components use their own `X.Separator` Part (Radix Part name), built on the same styles.
- In lists, menus and toolbars the separator sits between groups, never first or last (inference from React Aria's "between two groups of content").

## Motion

None.

- **Reduced motion:** nothing to remove.
- **Instant exit:** Separator has no exit; it is static structure and appears or disappears with the content around it.

## Keyboard

No APG pattern for a static separator. The APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) has only "Window Splitter" ("A window splitter is a moveable separator between two sections, or panes, of a window"), which is the focusable kind and out of scope. WAI-ARIA 1.2 `separator`: "A divider that separates and distinguishes sections of content or groups of menuitems." Non-focusable separators are "a static structure that provides only a visible boundary", and "If a separator is not focusable, it is revealed to assistive technologies as a static structural element." (https://www.w3.org/TR/wai-aria-1.2/#separator).

Not focusable; no keyboard interaction. Tab skips it.

## Accessibility

- Role `separator` from the native `<hr>`; Radix: "Adheres to the separator role requirements." WAI-ARIA 1.2: "Elements with the role separator have an implicit aria-orientation value of horizontal.", so only vertical sets `aria-orientation`.
- `decorative` renders `role="none"`. ARIA in HTML allows it on `hr`: "Roles: none or presentation. (separator is also allowed, but NOT RECOMMENDED.)" (https://www.w3.org/TR/html-aria/).
- The hairline is never the only boundary of a control (brand book exemption for `border-subtle`), so it is held to no contrast ratio; the ornament is decoration.
- **More contrast:** `separator-border-color` is `color-border-subtle`, which steps up to `color-border-default` under `(prefers-contrast: more)`; `separator-dot-color` is `color-border-default` already (token media overrides).
- **Forced colors:** the line is a border, and `border-color` is on the "Properties Affected by Forced Colors Mode" list (https://www.w3.org/TR/css-color-adjust-1/), so it draws in a system colour. The ornament's diamond is a filled box and its line segments are gradients, both of which forced colors would remove; in `@media (forced-colors: active)` the ornament `<hr>` sets `forced-color-adjust: none` and draws both in `CanvasText`. The spec allows `none` when authors "are themselves adjusting the colors".
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only (`border-block-start`, `border-inline-start`, `inline-size`). The ornament is symmetric, so nothing mirrors. A vertical separator sits between groups in source order and follows the row's direction.

## Component tokens

Existing (ported from the source `divider-*`, renamed): `separator-border-color` (→ `color-border-subtle`), `separator-border-width` (→ `border-width-default`).

Proposed new tokens, for the ornament (the source drew it with no tokens of its own):

| Token                 | References                        | `$type`   | Why                                                                                           |
| --------------------- | --------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `separator-dot-size`  | `{semantic.size-indicator}`       | dimension | The diamond's side, 6 px: the same bob as the radio indicator (`radio-group-indicator-size`). |
| `separator-dot-color` | `{semantic.color-border-default}` | color     | The diamond's edge, as the artifact draws it (`border … var(--ab-color-border-default)`).     |
| `separator-gap`       | `{semantic.space-inline-sm}`      | dimension | Empty line on each side of the diamond, 8 px.                                                 |

All words are in the Dictionary (`separator`, element `dot`, properties `size`, `color`, `gap`). No new Dictionary words.

## Author-written text

None.

## Feedback events

None. Separator is not interactive.

## Sources

- Source guide: artifact `project/components/Divider/README.md` ("Hairline separator between groups; prefer space first, a divider only when space alone is ambiguous."; "`ornament`: the ochi diamond, a quiet folk motif. Editorial pages only, never inside dense UI.").
- Brand book, Personality: the bob "(also called _ochi_)" — "the optional divider ornament"; "One motif per surface at most."
- Spec #1, renames ("Divider → Separator"); UI glossary, "Separator".
- WAI-ARIA 1.2 `separator` role: https://www.w3.org/TR/wai-aria-1.2/#separator
- APG pattern index (Window Splitter): https://www.w3.org/WAI/ARIA/apg/patterns/
- ARIA in HTML: https://www.w3.org/TR/html-aria/
- MDN `<hr>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr
- Radix Separator: https://www.radix-ui.com/primitives/docs/components/separator
- shadcn/ui Separator: https://ui.shadcn.com/docs/components/separator
- Base UI Separator: https://base-ui.com/react/components/separator
- React Aria Separator: https://react-aria.adobe.com/Separator
- Chakra Separator: https://chakra-ui.com/docs/components/separator
- MUI Divider API: https://mui.com/material-ui/api/divider/
- Mantine Divider: https://mantine.dev/core/divider/
- CSS Color Adjustment Level 1: https://www.w3.org/TR/css-color-adjust-1/
