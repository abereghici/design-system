# SkipLink

Lets keyboard users jump past the repeated header and navigation to the main content. Render one as the first element of every page layout that has repeated blocks before the main content. It is hidden until it has focus. For any other navigation, use a Link.

```tsx
import { SkipLink } from "@platform/ui/skip-link";

// app/layout.tsx (Server Component)
<body>
  <SkipLink href="#main" />
  <Navbar>…</Navbar>
  <main id="main" tabIndex={-1}>
    …
  </main>
</body>;
```

Status: draft for brand-owner review (phase 1). Source guide: none. Drafted from WCAG 2.4.1 and technique G1, the brand principles and the reference libraries.

## Anatomy

One part: a native `<a href="#…">` with a text label.

- **Hidden at rest** with the VisuallyHidden technique (see the VisuallyHidden spec), applied while the link does not have focus, so it stays in the tab order and in the accessibility tree.
- **On focus** it is shown as a small chip fixed at the top inline-start corner of the viewport, offset `skip-link-offset`: the inverse treatment (`skip-link-background-color` on `color-background-neutral-bold`, `skip-link-text-color` on `color-text-inverse`, the pair Tooltip uses), radius `skip-link-border-radius`, padding `skip-link-padding-block` / `skip-link-padding-inline`, type `skip-link-font` (label md). The inverse fill reads on any Surface in both Themes, so it needs no elevation.
- **Target** is the consumer's `<main>` with the matching `id` and `tabIndex={-1}` (see Behaviour). Not a Part.

## API

| Prop       | Type                  | Default                             | Notes                                                                 |
| ---------- | --------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| `href`     | `` `#${string}` ``    | required                            | The fragment of the main content's `id`.                              |
| `children` | `ReactNode`           | `labels.label`                      | The link text.                                                        |
| `labels`   | `{ label?: string }`  | `{ label: "Skip to main content" }` | Built-in string (spec #1). Ignored when `children` is given.          |
| …native    | `ComponentProps<"a">` |                                     | `ref`, `className` and every native attribute pass through unchanged. |

Names, checked against the reference libraries:

- **`SkipLink`.** Spec #1 already names it SkipLink. Among the reference libraries only Chakra (v2) ships one, as a pair: "Skip Nav Link allows keyboard users to skip to the main content of the page." with `SkipNavLink` and `SkipNavContent` (https://v2.chakra-ui.com/docs/components/skip-nav). Not found in Radix, React Aria, Base UI, MUI or Mantine (Base UI's component list, https://base-ui.com/react/overview/quick-start, has none; a search of the others' docs returned no skip-link component). React Aria documents the use case on VisuallyHidden instead: `isFocusable` "Whether the element should become visible on focus, for example skip links." (https://react-aria.adobe.com/VisuallyHidden). WCAG calls it a "skip" link (2.4.1 Understanding) and GOV.UK's component is "Skip link" (https://design-system.service.gov.uk/components/skip-link/). With no library majority, we keep the spec's name, which is the WCAG/GOV.UK term (judgement call).
- **No target Part.** Chakra's `SkipNavContent` "Renders a `div` that serves as the link's target", which adds a wrapper. The app already has a `<main>`; giving it an `id` and `tabIndex={-1}` is all the target needs, so SkipLink stays single-part (judgement call).
- **`href` is required**, with no default `id`. Chakra matches the two halves by a shared `id` ("you will have to use this prop and value in both components, or they will not match"); a default `id` that the page doesn't have would fail silently, so the consumer names it.

## States

| State   | How it shows                                                                                       | Exposed as     |
| ------- | -------------------------------------------------------------------------------------------------- | -------------- |
| rest    | Visually hidden; still focusable and announced                                                     | `:not(:focus)` |
| focused | Chip at the top inline-start corner, with the 2 px focus ring, 3 px offset, `color-border-focused` | `:focus`       |

`:focus`, not `:focus-visible`: G1 asks that the link be "either always visible or visible when it has keyboard focus", and showing it on any focus is never wrong.

## Behaviour

- Activating the link navigates to the fragment. HTML's fragment navigation then runs "Scroll target into view…", "Run the focusing steps for target, with the Document's viewport as the fallback target." and "Move the sequential focus navigation starting point to target." (https://html.spec.whatwg.org/multipage/browsing-the-web.html). The focusing steps fall back to the viewport when the target "is not a focusable area", so `<main>` needs `tabIndex={-1}` to receive focus itself. MDN: "A negative value … means that the element is not reachable via sequential keyboard navigation", and an element with any valid tabindex "can be focused with JavaScript … or visually by clicking" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex). The next Tab then goes to the first control inside `<main>`.
- No script: the platform does the jump. GOV.UK v4.0.0 "Added JavaScript that moves focus to the skip link’s target to improve the consistency of screen reader behaviour."; with `tabIndex={-1}` on the target, the native focusing steps do the same, so we don't (inference from the HTML steps above).
- Plain `<a href="#main">`, never a router link: a same-page fragment needs no client routing.
- Several SkipLinks may follow each other (WCAG 2.4.1 sufficient technique "G124: Adding links at the top of the page to each area of the content"), each with its own `href` and text.
- Server Component: no `'use client'`. The label comes from `children` or `labels`; the optional `LocaleProvider` is a client context that a Server Component can't read, so an app that localises passes `labels` (or children) in its layout (judgement call).

## Motion

None. The link appears and disappears instantly. It only ever shows because of a keyboard action (Tab), and the brand book says "No motion on keyboard-initiated or high-frequency (100+ per day) actions."

- **Reduced motion:** nothing to remove.
- **Instant exit:** the exit is always instant by design. When focus leaves, the chip vanishes in the same frame as the focus ring moves to the next control, so the eye follows the ring, not the chip.

## Keyboard

APG pattern: **none for skip links.** A SkipLink is a link, so the **Link** pattern applies (https://www.w3.org/WAI/ARIA/apg/patterns/link/), and the requirement comes from WCAG 2.2 SC 2.4.1 Bypass Blocks: "A mechanism is available to bypass blocks of content that are repeated on multiple web pages." (https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html), sufficient technique G1: "The first interactive item in the web page is a link to the beginning of the main content." (https://www.w3.org/WAI/WCAG22/Techniques/general/G1).

| Key                           | Action                                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab (first press on the page) | Focuses the SkipLink and shows it. G1 test: "Check that a link is the first focusable control on the web page."                                                                                 |
| Enter                         | "Executes the link and moves focus to the link target." (APG Link). Focus lands on `<main>`. G1 test: "Check that after activating the link, the keyboard focus has moved to the main content." |
| Tab (without Enter)           | Hides the SkipLink and moves on to the header, as normal.                                                                                                                                       |

## Accessibility

- Role `link` from the native `<a href>`. The text says where it goes: G1 test "Check that the description of the link communicates that it links to the main content."
- It sits outside every landmark, first in `<body>`. GOV.UK: "Bypass links do not need to be within a landmark."
- Hidden visually only, never with `display: none` or `hidden`, so it stays focusable and screen readers list it among the page's links.
- The landed-on `<main>` shows the focus ring (`:focus-visible` after a keyboard jump). That is intended: it tells the keyboard user where they are, and the brand book says focus is "never suppressed".
- Focus not obscured (WCAG 2.4.11): the chip sits at `z-index-tooltip`, above sticky headers (`z-index-sticky`). Only the top layer is above it, and while a modal is open the page behind is inert anyway.
- **More contrast:** no change; `color-text-inverse` on `color-background-neutral-bold` is in the AA matrix (`["text-inverse", "background-neutral-bold"]`, `packages/tokens/src/contrast.ts`).
- **Forced colors:** the inverse fill is forced away (CSS Color Adjust 1: "its used value is instead forced to a system color", https://www.w3.org/TR/css-color-adjust-1/), so in `@media (forced-colors: active)` the chip draws a 1 px `CanvasText` border to stay visible as a box. The focus ring is an `outline`, so the system colour applies.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only: `inset-block-start` and `inset-inline-start`, so the chip sits top-left in LTR and top-right in RTL. No arrow-key behaviour.

## Component tokens

All new. `skip-link` is a new component word (Dictionary change). No other new words.

| Token                        | References                                 | `$type`    | Why                                                      |
| ---------------------------- | ------------------------------------------ | ---------- | -------------------------------------------------------- |
| `skip-link-background-color` | `{semantic.color-background-neutral-bold}` | color      | Inverse chip fill, readable on every Surface.            |
| `skip-link-text-color`       | `{semantic.color-text-inverse}`            | color      | The AA pair for that fill.                               |
| `skip-link-border-radius`    | `{semantic.radius-sm}`                     | dimension  | Same radius as a sm control.                             |
| `skip-link-padding-block`    | `{semantic.space-inset-sm}`                | dimension  | Chip padding.                                            |
| `skip-link-padding-inline`   | `{semantic.space-inset-md}`                | dimension  | Chip padding.                                            |
| `skip-link-font`             | `{semantic.type-label-md}`                 | typography | Control text.                                            |
| `skip-link-offset`           | `{semantic.space-inset-sm}`                | dimension  | Distance from the viewport's top and inline-start edges. |

Consumed as semantic tokens directly: `z-index-tooltip` (a stacking decision, not a look an app overrides), `focus-ring-width`, `focus-ring-offset`, `color-border-focused` (R6).

## Built-in labels

| Key     | English default        | Used for                                  |
| ------- | ---------------------- | ----------------------------------------- |
| `label` | "Skip to main content" | The link text when no children are given. |

## Feedback events

None. A skip is navigation, not one of the feedback moments, and SkipLink has no client code.

## Sources

- WCAG 2.2 Understanding SC 2.4.1 Bypass Blocks: https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html
- WCAG technique G1: https://www.w3.org/WAI/WCAG22/Techniques/general/G1
- WAI-ARIA APG Link pattern: https://www.w3.org/WAI/ARIA/apg/patterns/link/
- HTML fragment navigation and focusing steps: https://html.spec.whatwg.org/multipage/browsing-the-web.html, https://html.spec.whatwg.org/multipage/interaction.html
- MDN `tabindex`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex
- Chakra (v2) Skip Nav: https://v2.chakra-ui.com/docs/components/skip-nav
- React Aria VisuallyHidden (`isFocusable`): https://react-aria.adobe.com/VisuallyHidden
- GOV.UK Design System Skip link: https://design-system.service.gov.uk/components/skip-link/
- CSS Color Adjustment 1: https://www.w3.org/TR/css-color-adjust-1/
