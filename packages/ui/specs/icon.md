# Icon

Draws a glyph from the Bereghici icon set: straight strokes, 45° chamfers, square caps, miter joins, always `currentColor`. Use an icon beside a visible label, or give it a `label` when it carries meaning on its own. An icon is never a control: for an icon the user presses, use IconButton, which names the control.

```tsx
import { SearchIcon } from "@platform/ui/icons/search";
import { CheckCircleIcon } from "@platform/ui/icons/check-circle";
import { Icon } from "@platform/ui/icon";

<SearchIcon />                                   {/* decorative, md (20) */}
<CheckCircleIcon size="lg" label="Done" />       {/* meaningful on its own */}
<Icon size="sm"><path d="M4 12 L20 12" /></Icon> {/* a custom glyph on the 24-unit grid */}
```

Status: draft for brand-owner review (phase 1). Source guides: `components/Icon/README.md` and `assets/icons/README.md` in the artifact. Pipeline: ticket #11 (Icon and Logo pipeline), ADR-0005. Built in #11 (`src/icon/icon.tsx`, `src/icon/icons/*.tsx`): `size`, `label`, the `:where()` size rules and the `@platform/ui/icons/<name>` → `<Name>Icon` subpaths match this spec. RTL mirroring was added in #16: the generator marks the mirrored glyphs `data-mirror`, and `.root:where([data-mirror]):dir(rtl)` sets `scale: -1 1` (`:dir()` on an inline `<svg>` verified in Chromium, Firefox and WebKit).

## Anatomy

Svg (one `<svg viewBox="0 0 24 24">`) → glyph paths.

- **Svg.** Inline `<svg>` with `fill="none"`, `stroke="currentColor"`, `stroke-linecap="square"`, `stroke-linejoin="miter"`. Width, height and `stroke-width` come from the size's tokens (see API).
- **Glyph paths.** The source SVG's paths, SVGO-optimised and reproduced exactly (spec #1 user story 65). The generator keeps `viewBox`, since the stroke tokens are in 24-grid units.
- **One component per icon.** Each of the 42 source glyphs is its own component on its own subpath (`@platform/ui/icons/search` exports `SearchIcon`), built on `Icon` (ADR-0005: "Per-icon subpaths keep unused icons out of the bundle"). The source's `<Icon name="search" />` lookup and `Icon.names` are dropped: a name lookup imports every glyph.
- **`Icon`** is the shared base, public for custom glyphs drawn on the same construction. Its children are the SVG content.

## API

Same props on `Icon` and on every `<Name>Icon`.

| Prop       | Type                           | Default | Notes                                                                                                                                                     |
| ---------- | ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`     | `"sm" \| "md" \| "lg" \| "xl"` | `"md"`  | Exposed as `data-size`. 16 / 20 / 24 / 32 px with stroke 2 / 1.75 / 1.75 / 1.5 (the stroke thins as the size grows so the optical weight stays constant). |
| `label`    | `string`                       |         | Present: `role="img"` and `aria-label={label}`, no `aria-hidden`. Absent: `aria-hidden="true"`.                                                           |
| `children` | `ReactNode`                    |         | `Icon` only: the glyph's SVG content on the 24-unit grid. Generated icons pass their own paths.                                                           |
| …native    | `ComponentProps<"svg">`        |         | `ref`, `className` and every native SVG attribute pass through (`data-icon="inline-start"` for Button, for example).                                      |

Names, checked against the reference libraries:

- **`Icon`**: Chakra "Used to display an svg icon" (https://chakra-ui.com/docs/components/icon); MUI calls its base `SvgIcon`, whose `children` is "Node passed into the SVG element." (https://mui.com/material-ui/api/svg-icon/). Mantine core has no plain Icon (only `ThemeIcon`, "Render icon inside element with theme colors", https://mantine.dev/core/theme-icon/). We take Chakra's name, the brand book's word, and MUI's shape (paths as children).
- **`<Name>Icon` components, one subpath each**: Radix Icons, Lucide, Octicons and MUI all ship one component per icon (repo research `docs/research/performance.md`: "Every major React icon library we checked does this: Octicons, Radix, Lucide, MUI, Atlaskit and Polaris."). The `PlusIcon` suffix form matches the Button spec's `PlusIcon` import.
- **`size`**: React Spectrum's workflow icons use seven t-shirt sizes, "XXS, XS, S, M, L, XL, and XXL" (https://react-spectrum.adobe.com/react-spectrum/workflow-icons.html); MUI's `fontSize` is "`'inherit' | 'large' | 'medium' | 'small' | string`" (https://mui.com/material-ui/api/svg-icon/). We use `size` with the Dictionary's size words and the source's four sizes (sm 16 / md 20 / lg 24 / xl 32).
- **`label`**: Radix AccessibleIcon "Makes icons accessible by adding a label." with a required `label` string (https://www.radix-ui.com/primitives/docs/utilities/accessible-icon); Atlaskit's icon wrapper uses `role={label?'img'}` and `aria-hidden={label?undefined:true}` (quoted in `docs/research/performance.md`, https://unpkg.com/@atlaskit/icon@38.0.2/dist/esm/components/icon-new.js). MUI names it `titleAccess`: "Provides a human-readable title for the element that contains it." (https://mui.com/material-ui/api/svg-icon/). React Spectrum uses `aria-label` ("If used standalone, an `aria-label` can be provided to the icon itself."). `label` is Radix's name, the source's name and ticket #11's acceptance criterion. We render `aria-label`, not a `<title>`, so no native tooltip appears (design decision).
- **No `color` prop.** Radix Icons default `color = "currentColor"` (`docs/research/performance.md`); we fix `currentColor` and leave colour to the text around the icon (brand book: "takes the color of the text around it").
- **No `mirrored` prop.** Directional glyphs are marked by the generator (see RTL); no reference library documents a mirroring prop on an icon that we found (not found in the Chakra, MUI or Spectrum pages above).

## States

Icon has no interactive states. It takes `currentColor`, so a hovered, selected or disabled parent recolours it.

| State      | How it shows                        | Exposed as                 |
| ---------- | ----------------------------------- | -------------------------- |
| rest       | Stroke in the current text colour   | `data-size`                |
| decorative | Hidden from assistive technology    | `aria-hidden="true"`       |
| labelled   | Announced as an image with its name | `role="img"`, `aria-label` |

## Behaviour

- Server Component, no `'use client'` (spec #1 user story 4). Icons used inside a client component ship their path data in that bundle (repo research `docs/research/performance.md`, inference recorded there).
- Colour: Icon sets no `color`. The `icon-color` tokens (`icon-color`, `-hovered`, `-selected`, `-disabled`) are for the components and apps that colour a standalone icon by state; inside text or a Button the icon takes the surrounding colour.
- Size rules are wrapped in `:where()` (zero specificity), so a containing component's rule wins without a specificity battle: Button and IconButton set width, height and the matching `icon-{size}-stroke-width` for the size they use (`button-icon-size` is `size-icon-sm`, so stroke `icon-sm-stroke-width`).
- Pair every icon with a visible label or an accessible name (brand book, Iconography); icon-only controls keep at least `size-target-min` (24 px), which is IconButton's job.

## Motion

None. Icon does not animate; any colour change comes from its parent's transition.

- **Reduced motion:** nothing to remove.
- **Instant exit:** Icon has no exit. When it is swapped (Button replacing its leading icon with a Spinner), the swap is the parent's and reads correctly with no animation, because the slot keeps its size.

## Keyboard

No APG pattern: the APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) lists none for an icon or image. The closest role is WAI-ARIA 1.2 `img`: "An `img` represents a single graphic within a document, whether or not it is formed by a collection of drawing objects." and "authors MUST provide a label using the aria-label or aria-labelledby attribute." (https://www.w3.org/TR/wai-aria-1.2/#img).

Not focusable; no keyboard interaction. Tab skips it.

## Accessibility

- Decorative by default (`aria-hidden="true"`, spec #1 user story 42). Lucide does the same: "Lucide icons are hidden from screen readers by default with `aria-hidden="true"`" (https://lucide.dev/guide/advanced/accessibility).
- `label` gives `role="img"` and a name, satisfying the `img` role's "MUST provide a label". Use it only when no visible text says the same thing.
- Inside a control, name the control, not the icon. Lucide: "Put the name on the button or in visually hidden text inside the button, not on the icon." (same URL).
- Contrast: icons drawn in an `ab-color-icon-*` role meet 3:1 on every allowed background (token build's AA matrix). An icon in text takes the text colour, which meets 4.5:1.
- **More contrast:** follows its context; `color-icon-subtlest` steps up to `color-icon-subtle` under `(prefers-contrast: more)` (token media override).
- **Forced colors:** the stroke is `currentColor`; `color` and `stroke` are both on the CSS Color Adjust list of "Properties Affected by Forced Colors Mode" (https://www.w3.org/TR/css-color-adjust-1/), so the glyph follows the system text colour. No extra rule.
- **Reduced transparency:** not affected (no Material).

## RTL

Glyphs that show horizontal movement are mirrored under `:dir(rtl)` with `scale: -1 1`; the rest never mirror.

- Mirrored (set by the generator from a list, design decision for review): `arrow-right`, `arrow-up-right`, `chevron-right`, `log-out`.
- Not mirrored: `check`, `check-circle` (checkmarks), `clock`, `calendar`, `activity` (time), `code` (slash), `corner-down-left` (draws the physical Return key, inference), symmetric glyphs (`x`, `plus`, `minus`, `menu`, `more`), and `search` (drawn for right-hand use).
- Basis: Adobe Spectrum "Icons that depict horizontal movement (e.g., back icon) should be mirrored.", "Checkmarks are never mirrored in right-to-left interfaces.", "Slashes are never mirrored in right-to-left interfaces.", "Icons that refer to the passage of time (e.g., clock icon) should not be mirrored." (https://spectrum.adobe.com/page/bi-directionality). Mozilla mirrors "Icons or animations that imply directionality or motion like back/forward buttons", not "Icons that wouldn't look differently if they'd be mirrored, like X buttons", and gives `transform: scaleX(-1)` or `scale: -1 1` under `:dir(rtl)` (https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html).
- `:dir()`: "Baseline Widely available … since December 2023" (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:dir). It reads the document's direction, so no provider is needed (spec #1).
- A custom glyph drawn with `Icon` that shows direction adds its own `:dir(rtl)` rule through `className`.

## Component tokens

All exist (ported from the source): `icon-{sm,md,lg,xl}-size` (→ `size-icon-sm|md|lg|xl`), `icon-{sm,md,lg,xl}-stroke-width` (→ `stroke-width-lg|md|md|sm`, that is 2 / 1.75 / 1.75 / 1.5), `icon-color`, `icon-color-hovered`, `icon-color-selected`, `icon-color-disabled`.

No new tokens.

## Built-in labels

None. A meaningful icon's name comes from `label`.

## Feedback events

None. Icon is not interactive.

## Sources

- Source guide: artifact `project/components/Icon/README.md` ("Sizes sm 16 / md 20 / lg 24 / xl 32; stroke thins as size grows so optical weight stays constant."; "Decorative by default (`aria-hidden`); pass `label` when the icon carries meaning alone.") and `project/assets/icons/README.md` ("42 glyphs on a 24-unit grid, cut from straight strokes with 45° chamfers, square caps and miter joins").
- ADR-0005, `docs/adr/0005-inline-svg-icons-not-sprite.md`; ticket #11 acceptance ("Icons are decorative by default (`aria-hidden`); a `label` switches to `role="img"` with an accessible name"; "No `'use client'` on icons; one subpath per icon").
- WAI-ARIA 1.2 `img` role: https://www.w3.org/TR/wai-aria-1.2/#img
- APG pattern index: https://www.w3.org/WAI/ARIA/apg/patterns/
- Chakra Icon: https://chakra-ui.com/docs/components/icon
- MUI SvgIcon API: https://mui.com/material-ui/api/svg-icon/
- React Spectrum workflow icons: https://react-spectrum.adobe.com/react-spectrum/workflow-icons.html
- Radix AccessibleIcon: https://www.radix-ui.com/primitives/docs/utilities/accessible-icon
- Lucide accessibility: https://lucide.dev/guide/advanced/accessibility
- Mantine ThemeIcon: https://mantine.dev/core/theme-icon/
- Adobe Spectrum bi-directionality: https://spectrum.adobe.com/page/bi-directionality
- Mozilla RTL guidelines: https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html
- CSS Color Adjustment Level 1: https://www.w3.org/TR/css-color-adjust-1/
- MDN `:dir()`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:dir
