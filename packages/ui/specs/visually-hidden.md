# VisuallyHidden

Hides content from the screen while keeping it in the accessibility tree, for text that only assistive technology needs: a label that the visual design already conveys, "(opens in a new tab)" after a link icon, a heading for a region that is obvious visually. To name an icon-only control, use IconButton's `aria-label` instead. To show content on focus (a skip link), use SkipLink. To hide content from everyone, use the `hidden` attribute.

```tsx
import { VisuallyHidden } from "@platform/ui/visually-hidden";

<Link href="https://github.com/abereghici" target="_blank">
  GitHub <ExternalIcon data-icon="inline-end" />
  <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
</Link>

<section aria-labelledby="filters-title">
  <VisuallyHidden asChild><h2 id="filters-title">Filters</h2></VisuallyHidden>
  …
</section>
```

Status: draft for brand-owner review (phase 1). Source guide: none. Drafted from the reference libraries and the established CSS technique.

## Anatomy

One part: a `<span>` holding the hidden content, styled with the visually-hidden technique (see Behaviour). It has no visual form at all.

## API

| Prop      | Type                     | Default | Notes                                                                                                               |
| --------- | ------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `asChild` | `boolean`                | `false` | Applies the hiding styles to the single child element (Radix Slot) instead of rendering a `<span>`, e.g. a heading. |
| …native   | `ComponentProps<"span">` |         | `ref`, `className`, `id` and every native attribute pass through unchanged.                                         |

Names, checked against the reference libraries:

- **`VisuallyHidden`**: every library that has one uses this name. Radix "Hides content from the screen in an accessible way." (https://www.radix-ui.com/primitives/docs/utilities/visually-hidden); React Aria "VisuallyHidden hides its children visually, while keeping content visible to screen readers." (https://react-aria.adobe.com/VisuallyHidden); Chakra "Used to hide content visually but keep it accessible to screen readers." (https://chakra-ui.com/docs/components/visually-hidden); Mantine "Hide element visually but keep it accessible for screen readers" (https://mantine.dev/core/visually-hidden/); MUI ships it as a style object, `visuallyHidden` in `@mui/utils` (https://github.com/mui/material-ui/blob/master/packages/mui-utils/src/visuallyHidden/visuallyHidden.ts). Base UI has none (not in its component list, https://base-ui.com/react/overview/quick-start).
- **Plain, not `VisuallyHidden.Root`.** Radix exports both (`export { VisuallyHidden, VisuallyHidden as Root }`, Radix source); spec #1 makes single-part components plain.
- **`asChild`**: Radix `asChild` "`boolean`" "`false`"; Chakra "Using the asChild prop, you can pass a child element to the VisuallyHidden component." React Aria uses `elementType` ("The element type for the container.", default "`'div'`"); spec #1 picks `asChild`.
- **`<span>`, not `<div>`.** Radix renders `Primitive.span`; React Aria defaults to `'div'`. A span is valid inside a `<button>` or `<a>` (phrasing content), which is where hidden text most often goes (inference from the HTML content models; judgement call).
- **No `isFocusable`.** React Aria's `isFocusable` is "Whether the element should become visible on focus, for example skip links." That case is SkipLink, so VisuallyHidden stays hidden on focus. Don't put focusable content in it (see Accessibility).

## States

None. VisuallyHidden has no interactive or visual state.

## Behaviour

- The technique (MUI's set, written with logical properties):

  ```css
  .root {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ```

  MUI's `visuallyHidden`: "`border: 0, clipPath: 'inset(50%)', height: '1px', margin: '-1px', overflow: 'hidden', padding: 0, position: 'absolute', whiteSpace: 'nowrap', width: '1px'`". The A11Y Project's `.visually-hidden` is the same pattern ("`clip: rect(0 0 0 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px;`", https://www.a11yproject.com/posts/how-to-hide-content/), and Bootstrap's mixin, which Radix's styles cite (`// See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss`), is a variant of it.

- **No `clip`.** Radix and React Aria still add `clip: rect(0, 0, 0, 0)`. MDN: "The CSS Masking specification deprecated the `clip` property." and "Authors are encouraged to use the `clip-path` property instead." (https://developer.mozilla.org/en-US/docs/Web/CSS/clip). `clip-path` is Baseline "Widely available … since January 2020" (https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path), above the ADR-0002 floor, so `clip-path: inset(50%)` alone is enough.
- The 1px sizes are literals, not tokens: they are the technique, not a design decision an app would override (judgement call; every library above hard-codes them).
- **Positioned ancestor.** React Aria: "VisuallyHidden is positioned absolutely, so it must have a position: relative or position: absolute ancestor. Otherwise, undesired scrollbars may appear." Components that place VisuallyHidden inside themselves set `position: relative`; in app layouts the consumer does.
- Never `display: none`, `visibility: hidden` or `hidden`: the A11Y Project notes `display: none` "can be problematic for people who use screen readers, especially if the hidden content was meant to be for them to discover".
- Server Component: no `'use client'`, no script.

## Motion

None. VisuallyHidden is never seen.

- **Reduced motion:** nothing to remove.
- **Instant exit:** it never appears or exits; mounting or unmounting it changes only what assistive technology reads, which has no visual transition to look wrong.

## Keyboard

APG pattern: **none.** VisuallyHidden is not a widget and has no ARIA role (a `<span>` has the generic role). **Not focusable; no keyboard interaction.** If a focusable element is put inside (or made the child with `asChild`), it would receive focus while invisible, which fails WCAG 2.4.7 Focus Visible; that is a misuse. The A11Y Project: "If the .visually-hidden class is applied to natively focusable elements (such as a , button , input , etc) they must become visible when they receive keyboard focus." That version is SkipLink.

## Accessibility

- Content stays in the accessibility tree and is read in document order, as part of its parent's accessible name when inside a button or link.
- Prefer `aria-label` / `aria-labelledby` for naming controls (IconButton requires it). Radix positions VisuallyHidden as "an alternative to traditional labelling with aria-label or aria-labelledby", useful when the hidden text must be real DOM text (inference, not verified: real text is translated and copied with the page, an attribute may not be).
- **More contrast:** not affected (nothing is drawn).
- **Forced colors:** not affected (nothing is drawn).
- **Reduced transparency:** not affected.

## RTL

Not affected. The A11Y Project: "Unlike CSS positioning and negative text-indent techniques, the "clip pattern" also works with RTL (Right-to-Left) languages for localization." The CSS uses logical properties only.

## Component tokens

None, existing or new. Nothing is drawn; the technique's values are constants.

## Author-written text

None. The content is the children.

## Feedback events

None. VisuallyHidden has no interaction.

## Sources

- Radix VisuallyHidden: https://www.radix-ui.com/primitives/docs/utilities/visually-hidden, source https://github.com/radix-ui/primitives/blob/main/packages/react/visually-hidden/src/visually-hidden.tsx
- React Aria VisuallyHidden: https://react-aria.adobe.com/VisuallyHidden, source https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/visually-hidden/VisuallyHidden.tsx (`clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: '1px', margin: '-1px', overflow: 'hidden', padding: 0, position: 'absolute', width: '1px', whiteSpace: 'nowrap'`)
- Chakra VisuallyHidden: https://chakra-ui.com/docs/components/visually-hidden
- Mantine VisuallyHidden: https://mantine.dev/core/visually-hidden/
- MUI `visuallyHidden`: https://github.com/mui/material-ui/blob/master/packages/mui-utils/src/visuallyHidden/visuallyHidden.ts
- Bootstrap `visually-hidden` mixin: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
- The A11Y Project, How-to: Hide content: https://www.a11yproject.com/posts/how-to-hide-content/
- MDN `clip`: https://developer.mozilla.org/en-US/docs/Web/CSS/clip; MDN `clip-path`: https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path
