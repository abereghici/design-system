# Logo

Draws Stâlpul cerului, the pillar of the sky: a zigzag column between two angles, the brand's one sign. Use it once per surface, in the app header or a footer, beside or inside the link home. Not for icons (use Icon) and never redrawn, recoloured with more than one colour, or set below its minimum size.

```tsx
import { Logo } from "@platform/ui/logo";

<Logo />                                         {/* decorative, beside a visible name */}
<a href="/"><Logo label="Alexandru Bereghici, home" /></a>
<Logo className={styles.hero} />                 {/* sized by the app: inline-size: 96px */}
```

Status: draft for brand-owner review (phase 1). Source: the brand book's "Brand mark" section, `assets/marks/README.md` and `components/Mark/preview.html` in the artifact (the source's Mark, renamed Logo by spec #1). Pipeline: ticket #11, ADR-0005. Built in #11 (`src/logo/logo.tsx`): `label`, the minimum size and `logo-color`/`logo-stroke-width` match this spec. The default size, `max(1em, var(--ab-logo-min-size))`, was reconciled in #16; the path data is inline in `logo.tsx`.

## Anatomy

Svg (one `<svg viewBox="0 0 32 32">`) → one path.

- **Svg.** Inline `<svg>` on the source's 32-unit grid, `fill="none"`, `stroke="currentColor"`, `stroke-width` from `logo-stroke-width` (3 grid units), `stroke-linecap="square"`, `stroke-linejoin="miter"`. Square.
- **Path.** The source path, reproduced exactly (spec #1 user story 65): `M11 9 L5 16 L11 23 M21 9 L27 16 L21 23 M16 6 L18.5 11 L13.5 16 L18.5 21 L16 26`.
- **Colour.** `color: var(--ab-logo-color)`; the stroke follows it. One colour only. On imagery, set `--ab-logo-color` to `var(--ab-color-brand-moss)` or `var(--ab-color-brand-lichen)` on a parent.
- **Minimum size.** 16px (`logo-min-size`); the CSS clamps a smaller width.
- **Clear space.** Keep half the Logo's width free on every side. The Logo adds no margin, so the layout keeps the space.

## API

| Prop    | Type                    | Default | Notes                                                                                            |
| ------- | ----------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `label` | `string`                |         | Present: `role="img"` and `aria-label={label}`. Absent: `aria-hidden="true"`. Same rule as Icon. |
| …native | `ComponentProps<"svg">` |         | `ref`, `className` and every native SVG attribute pass through.                                  |

No `size` prop: the Logo appears from 16 px in a dense header to 96 px on a hero (source preview), so the app sizes it with CSS. By default it is `1em` square, so it scales with the text it sits in, and it never renders below `logo-min-size`: `inline-size: max(1em, var(--ab-logo-min-size))`, `min-inline-size: var(--ab-logo-min-size)`.

Names, checked against the reference libraries:

- **`Logo`**: none of Radix/shadcn, React Aria, Base UI, Ark/Chakra, MUI or Mantine document a Logo component (not found in their component lists). The name comes from spec #1 ("Renames from the source: … Mark → Logo") and the UI glossary ("**Logo**: The Stâlpul cerului brand sign, rendered as a component. _Avoid_: Mark, brand mark").
- **`label`**: the same prop as Icon, Radix AccessibleIcon's name ("Makes icons accessible by adding a label.", https://www.radix-ui.com/primitives/docs/utilities/accessible-icon). Keeping Logo and Icon on one rule is a design decision.
- **No `variant` for the brand-colour files.** The source ships `stalpul-cerului-moss.svg` and `stalpul-cerului-lichen.svg` for imagery. In an interface the Logo takes `logo-color`, which already resolves per Theme (moss in light, lichen in dark). On imagery, set `--ab-logo-color` to `var(--ab-color-brand-moss)` or `var(--ab-color-brand-lichen)` on a parent (semantic tokens product code may use). One component, no Variant to learn.

## States

| State      | How it shows                        | Exposed as                 |
| ---------- | ----------------------------------- | -------------------------- |
| rest       | One-colour stroke in `logo-color`   |                            |
| decorative | Hidden from assistive technology    | `aria-hidden="true"`       |
| labelled   | Announced as an image with its name | `role="img"`, `aria-label` |

No interactive states. Inside a link the link owns hover and focus.

## Behaviour

- Server Component, no `'use client'` (spec #1 user story 4).
- **Minimum size:** `logo-min-size` (16 px, `size-logo-min`). The CSS clamps to it, so a smaller width set by the app has no effect.
- **Clear space:** half the Logo's width on every side (brand book: "Clear space: half the mark's width"). The Logo adds no margin itself, because a margin would fight the app's layout; keeping the space free is a usage rule, shown in the docs page with an overlay (design decision).
- **Colour:** one colour (brand book). On light grounds the brand-moss file passes on `brand-lichen` (11.46:1) and `brand-sage` (12.19:1); the brand-lichen file passes on `brand-moss` (11.46:1) and the dark page (15.76:1) (source `assets/marks/README.md`).
- The stroke width is fixed in grid units, so it scales with the Logo; it never thins (unlike Icon), because the mark is drawn once at one weight (source: "stroke 3").

## Motion

None. The brand book's one slow moment is the intro, and the Logo is not it.

- **Reduced motion:** nothing to remove.
- **Instant exit:** Logo has no exit; it is static content.

## Keyboard

No APG pattern: the APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) lists none for an image. The closest role is WAI-ARIA 1.2 `img`: "An `img` represents a single graphic within a document, whether or not it is formed by a collection of drawing objects." and "authors MUST provide a label using the aria-label or aria-labelledby attribute." (https://www.w3.org/TR/wai-aria-1.2/#img).

Not focusable; no keyboard interaction. When the Logo sits in a link, the link is the tab stop (APG Link pattern, https://www.w3.org/WAI/ARIA/apg/patterns/link/).

## Accessibility

- Decorative by default: the site or product name is usually visible next to it.
- As the only content of a link home, give it a `label` (or name the link) so the link has an accessible name ("Alexandru Bereghici, home").
- Contrast: `logo-color` is `color-icon-accent`, an icon role held to 3:1 on every allowed background in every Theme by the token build.
- **More contrast:** no change; `color-icon-accent` is already the strongest accent.
- **Forced colors:** the stroke is `currentColor`; `color` and `stroke` are on the CSS Color Adjust list of "Properties Affected by Forced Colors Mode" (https://www.w3.org/TR/css-color-adjust-1/), so the Logo draws in the system text colour, still one colour.
- **Reduced transparency:** not affected (no Material).

## RTL

Never mirrored. Mozilla's list of what not to mirror includes "product logos" (https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html), and the mark is symmetric about its vertical axis except for the zigzag, which must keep its drawn direction. No logical-property concerns: the Logo is a square with no margin.

## Component tokens

All exist (ported from the source `mark-*`, renamed): `logo-color` (→ `color-icon-accent`), `logo-min-size` (→ `size-logo-min`), `logo-stroke-width` (→ `stroke-width-2xl`, 3).

No new tokens.

## Built-in labels

None. The name, when needed, comes from `label`; the design system does not hard-code the brand owner's name.

## Feedback events

None. Logo is not interactive.

## Sources

- Brand book, "Brand mark": "Construction: straight cuts only, square caps, miter joins."; "Size: never below its minimum size."; "Clear space: half the mark's width."; "Color: one color. The interface's mark color in UI; brand moss or brand lichen on imagery."
- Source `project/assets/marks/README.md`: "a zigzag column between two angles on a 32-unit grid, stroke 3, square caps, miter joins"; "Minimum size `--ab-mark-min-size` (16px); clear space half the mark's width; one colour. Drawn inline in an interface, the mark takes `--ab-mark-color`."
- Source `project/components/Mark/preview.html` (the path data and the 16 / 24 / 96 px sizes).
- Spec #1, renames ("Mark → Logo"); UI glossary, "Logo".
- ADR-0005, `docs/adr/0005-inline-svg-icons-not-sprite.md` ("Each icon (and the Logo) is an SVGO-optimised, server-safe React component exported from its own subpath").
- WAI-ARIA 1.2 `img` role: https://www.w3.org/TR/wai-aria-1.2/#img
- APG pattern index: https://www.w3.org/WAI/ARIA/apg/patterns/ ; APG Link: https://www.w3.org/WAI/ARIA/apg/patterns/link/
- Radix AccessibleIcon: https://www.radix-ui.com/primitives/docs/utilities/accessible-icon
- CSS Color Adjustment Level 1: https://www.w3.org/TR/css-color-adjust-1/
- Mozilla RTL guidelines: https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html
