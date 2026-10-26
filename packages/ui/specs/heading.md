# Heading

Titles a section of the page in the serif heading type. Use one per section, at the level that fits the document outline. Don't use it to make text bigger: for a serif statement that isn't a section title use Text `variant="display"`, and for a title inside a Card or Dialog use that component's title Part.

```tsx
import { Heading } from "@platform/ui/heading";

<Heading as="h1">Invoices</Heading>
<Heading as="h2">Overdue</Heading>
<Heading as="h2" size="sm">Filters</Heading>
```

Status: draft for brand-owner review (phase 1). No source guide: drafted from the brand book's Typography section ("Roles, not sizes. Set text by its role … so size, weight and line height stay in sync.") and the reference libraries.

## Anatomy

One element: a native `<h1>`–`<h6>`. Its type comes from one `type-heading-*` role (Noto Serif, weight 500). No margins: spacing between a heading and its content belongs to the layout around it.

## API

| Prop    | Type                                           | Default   | Notes                                                                                                                                    |
| ------- | ---------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `as`    | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | required  | The heading level. Purely semantic.                                                                                                      |
| `size`  | `"xs" \| "sm" \| "md" \| "lg"`                 | from `as` | Exposed as `data-size`. Maps to `type-heading-{size}`. When omitted it follows the level: h1 → `lg`, h2 → `md`, h3 → `sm`, h4–h6 → `xs`. |
| …native | `ComponentProps<"h1">`                         |           | `ref`, `className`, `id` and every native attribute pass through.                                                                        |

**Level and size are decoupled.** `as` sets only the element, `size` sets only the type role. The level-derived default means the common case needs one prop, and `size` overrides it when the outline and the visual hierarchy differ (a sidebar's `h2` that should look small).

Names, checked against the reference libraries:

- **`Heading`**: Radix Themes, Chakra and React Aria use `Heading`; Mantine uses `Title`, MUI `Typography`. `Heading` is the majority name.
- **`as`**: Radix Themes "`as` | `"h1" | "h2" | "h3" | "h4" | "h5" | "h6"` | `"h1"`" and "Use the `as` prop to change the heading level. This prop is purely semantic and does not change the visual appearance." (https://www.radix-ui.com/themes/docs/components/heading); Chakra "Use the `as` prop to render the heading as another HTML element." (https://chakra-ui.com/docs/components/heading). Mantine names it `order`: "Set the `order` prop to render a specific element (h1-h6); the default order is `1`" (https://mantine.dev/core/title/). MUI uses `component`. React Aria's `level`: page not found (https://react-aria.adobe.com/Heading returned 404). Two of the libraries use `as`, so we use `as`.
- **`size`**: Radix Themes "`size` | `Responsive<enum>` | `"6"`"; Chakra "`xs` … `7xl`. The default is `xl`." Mantine: "You can change the Title `size` independent of its `order`". Every library calls it `size`. The values are the Dictionary's size words for the four heading roles.
- **Default size from the level** follows Mantine, where `order` alone sets the look. Radix and Chakra use one fixed default size for every level. We take Mantine's behaviour because a fixed default makes every `h3` look like an `h1` until someone sets `size` (design decision).
- **`as` is required** (design decision; no library requires it, Radix defaults to `h1`, Mantine to order 1). A default level is wrong on most pages: MDN says "Do not skip heading levels: always start from <h1>, followed by <h2> and so on." (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements). Only the author knows the outline, so the type makes them say it.
- **No `weight`, `color`, `align`, `truncate`, `wrap`, `trim` or `asChild`.** Radix Themes documents all of these. The brand book fixes weight per role ("Two weights. Regular for reading, medium for headings, labels and emphasis."), headings are always default text colour, alignment is the layout's job (`text-align: start` by default), and truncation hides content at 200% zoom and 320 px reflow. `className` covers the rare exception.

## States

| State | How it shows                                  | Exposed as  |
| ----- | --------------------------------------------- | ----------- |
| rest  | `type-heading-{size}` in `color-text-default` | `data-size` |

No interactive states. A heading that links somewhere wraps a Link.

## Behaviour

- CSS: `font: var(--ab-type-heading-{size}); letter-spacing: var(--ab-type-heading-{size}-letter-spacing); color: var(--ab-color-text-default)`. The `font` shorthand can't set letter spacing, which is why the tokens package keeps it as its own `type-*-letter-spacing` token (tokens README, "Value types").
- `text-wrap: balance`. MDN: "Text is wrapped in a way that best balances the number of characters on each line, enhancing layout quality and legibility. … this value is only supported for blocks of text spanning a limited number of lines (six or less for Chromium and ten or less for Firefox)." (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap). Headings are short, so the limit doesn't bite. Baseline: `text-wrap-balance` is "newly", `low_date` 2024-05-13 (https://api.webstatus.dev/v1/features/text-wrap-balance), within ADR-0002's floor.
- `heading-lg`, `-md` and `-sm` are fluid (`font-size-29-33`, `-24-26`, `-19-21`), so they scale with the viewport and with the user's text size.
- Server Component: no state, no handlers, no `'use client'` (spec #1 user story 4).

## Motion

None. Heading never animates.

- **Reduced motion:** nothing to reduce.
- **Instant exit:** Heading has no exit. When it is removed or its text changes, the change is instant, as for any static text.

## Keyboard

APG pattern: **none.** The APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) lists no heading pattern. The closest platform element is HTML `<h1>`–`<h6>`, with "Implicit ARIA role: heading" (MDN, URL above).

Not focusable; no keyboard interaction. Screen reader users move by heading with their reader's own commands. MDN: "A common navigation technique for users of screen reading software is to quickly jump from heading to heading in order to determine the content of the page."

## Accessibility

- Role `heading` and its level come from the native element. Never `role="heading"` on a `div`.
- MDN: "Do not use heading elements to resize text. Instead, use the CSS font-size property." This is why `size` exists: the level follows the outline and the size follows the design.
- MUI states the same rule: "Based on the W3 guidelines, don't skip heading levels. Make sure to separate the semantics from the style." (https://mui.com/material-ui/react-typography/).
- Text resizes: the type tokens are in `rem` and fluid steps stay within the brand book's 200% rule.
- **More contrast:** `color-text-default` already has the highest text contrast. Nothing changes.
- **Forced colors:** text colour is forced to `CanvasText` by the browser; nothing to redraw.
- **Reduced transparency:** not affected (no Material).

## RTL

Text direction and alignment follow `dir` from the document. Alignment is `text-align: start`, never `left`. `text-wrap: balance` works in either direction.

## Component tokens

None. Heading sets type from one semantic `type-heading-*` role and colour from `color-text-default`, which the ui-scaffold rules allow ("only `--ab-*` semantic or component tokens"). A `heading-{size}-font` token per size would only repeat the semantic role one-to-one, and an app that wants a different heading face should change the role, not one component. Components that need their own title type already have it (`card-title-font`, `dialog-title-font`, `sheet-title-font`).

No new Dictionary words.

## Author-written text

None. Every string comes from the children.

## Feedback events

None. Heading isn't interactive.

## Sources

- Brand book (artifact `project/README.md`), Typography: "Roles, not sizes."; "Two weights."
- MDN heading elements: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements
- MDN `text-wrap`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap
- webstatus.dev `text-wrap-balance`: https://api.webstatus.dev/v1/features/text-wrap-balance
- WAI-ARIA APG pattern index: https://www.w3.org/WAI/ARIA/apg/patterns/
- Radix Themes Heading: https://www.radix-ui.com/themes/docs/components/heading
- Chakra Heading: https://chakra-ui.com/docs/components/heading
- Mantine Title: https://mantine.dev/core/title/
- MUI Typography: https://mui.com/material-ui/react-typography/
- React Aria Heading: https://react-aria.adobe.com/Heading (404, not found)
