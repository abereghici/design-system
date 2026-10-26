# ScrollArea

A box of fixed or capped size whose content scrolls inside it: a wide Table, a long list in a side panel, a terms text. It uses the browser's own scrolling and scrollbars, fades its top and bottom edges while there is more to scroll, and makes the box reachable from the keyboard. If the page itself can scroll instead, let it: a ScrollArea is for content that must stay inside a bounded region. It does not lock or hide scrolling.

```tsx
import { ScrollArea } from "@platform/ui/scroll-area";
import { Table } from "@platform/ui/table";

<ScrollArea>
  <Table.Root>
    <Table.Caption>Invoices</Table.Caption>
  </Table.Root>
</ScrollArea>

<ScrollArea className={styles.terms}>
  <Text>These terms apply to every workspace on the plan.</Text>
</ScrollArea>
```

Status: draft for brand-owner review (phase 3). Source: the artifact's `.ab-scroll-fade` (`components/css/feedback.css`) for the edge fade; the rest drafted from the base stylesheet's scrollbar rules, the brand principles and the reference libraries.

## Anatomy

One element.

- **Root.** A `<div>` with `overflow: auto` and `tabIndex={0}`. Its size comes from the layout or from the consumer's `className`/`style` (`max-block-size`, a grid track); it has no padding, border or radius of its own. The scrollbars are the native ones, coloured by the base stylesheet's inherited `scrollbar-color` (`color-border-default` thumb on a transparent track).
- **Edge fade.** The artifact's `.ab-scroll-fade`, as is: two `mask-image` gradients `space-stack-lg` tall slide on the box's own `scroll(self block)` timeline, so the top edge fades once scrolled and the bottom edge fades while more remains. A box that does not overflow has no scroll range and shows no fade. Block axis only, as in the artifact.

## API

`ScrollArea`

| Prop      | Type                    | Default | Notes                                                                                                                                        |
| --------- | ----------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `asChild` | `boolean`               | `false` | Renders the single child element as the box, e.g. a `<section aria-labelledby>` for a named region (Behaviour).                              |
| …native   | `ComponentProps<"div">` |         | `ref`, `className`, `style`, `aria-*` and every native attribute pass through. `tabIndex` defaults to `0`; pass `-1` to opt out (Behaviour). |

No other props.

Names, checked against the reference libraries:

- **`ScrollArea`**: Radix "Augments native scroll functionality for custom, cross-browser styling." (`ScrollArea.Root`, `Viewport`, `Scrollbar`, `Thumb`, `Corner`, https://www.radix-ui.com/primitives/docs/components/scroll-area); Base UI "A native scroll container with custom scrollbars." (`Root`, `Viewport`, `Content`, `Scrollbar`, `Thumb`, `Corner`, https://base-ui.com/react/components/scroll-area); Mantine "Area with custom scrollbars" (https://mantine.dev/core/scroll-area/). All three call it ScrollArea.
- **A single plain component, no Parts.** Every library's Parts exist to draw custom scrollbars (Scrollbar, Thumb, Corner) over a native Viewport. Radix itself advises: "In most cases, it's best to rely on native scrolling and work with the customization options available in CSS." The CSS options are now Baseline: `scrollbar-color` and `scrollbar-width` (newly available), so the native scrollbar takes the brand colour with no script (judgement call: platform first, ADR 0001). With no custom scrollbar there is nothing left for Root/Viewport to split, so the component is plain (spec #1 naming rule: single-part components are plain).
- **No `type` (scrollbar visibility).** Radix `type` (default `"hover"`); Mantine `type`: "`hover`: scrollbars are visible on hover", "`scroll`", "`auto`: similar to `overflow: auto`", "`always`", "`never`: scrollbars are always hidden". Visibility is the OS's (overlay or classic scrollbars); hiding them would remove the only visual cue that the box scrolls.
- **No `scrollbars` axis prop.** Mantine "To disable horizontal scrollbars, set the `scrollbars="y"` prop." `overflow: auto` only shows a scrollbar on an axis that overflows; a consumer who wants one axis sets `overflow-x: hidden` in `className`.
- Left out (YAGNI): custom scrollbar Parts (Radix, Base UI), Base UI's overflow data attributes (`data-has-overflow-x`, `data-overflow-x-start`…, which need a script; the fade needs none), Mantine `offsetScrollbars` and `ScrollArea.Autosize` / `onOverflowChange`, `scrollbar-width: thin`, `scrollbar-gutter: stable` on the box, `overscroll-behavior`.

## States

| State         | How it shows                                                                                                 | Exposed as       |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| rest          | Content clipped to the box; native scrollbar on each overflowing axis (classic) or while scrolling (overlay) | —                |
| focus-visible | 2 px ring, 3 px offset around the box (base stylesheet ring); the edge fade is off while it shows            | `:focus-visible` |

No hover, pressed or disabled state.

## Behaviour

- **Native scrolling.** `overflow: auto`; wheel, touch, scrollbar dragging and keyboard scrolling are the browser's. Radix: "Scrolling is native; no underlying position movements via CSS transformations."
- **Keyboard reachable in every engine.** Chromium focuses a scroller by itself only when it has no focusable children: "From Chrome 130, scrollers are keyboard focusable by default if they have no keyboard focusable children. Note: To improve performance, this feature has been pushed back to Chrome 132." WebKit does not: bug 277290 "AX: Scrolling containers inoperable with keyboard" is open (status NEW, 2026-10-24). axe (`scrollable-region-focusable`): "It is better to always put a tabindex of 0 on the scrollable region or a static element within the region." So the Root always renders `tabIndex={0}`, which also satisfies axe in every engine.
- **The extra tab stop.** When the content does not overflow, or when it is a list of links that are themselves focusable, the box is still a tab stop. Chrome's own note: if the scroller contains a button, "the scroller content can already be accessed using the arrow keys, once the button is focused". The consumer passes `tabIndex={-1}` in that case. Removing the tab stop automatically would need a script that measures overflow (`ResizeObserver`) and a client component; the always-on stop is the smaller, server-safe default (judgement call). AGWG's decision on wcag#3029 (2026-10-04) keeps this conformant: "having a non-interactive element receive keyboard focus / be tab-able does not fail 2.4.3", with the guardrail "as long as it's not overdone".
- **No role and no name by default.** The same AGWG decision: "If the non-interactive element that receives focus only exposes a `role` of "generic" or similar, that's not a failure of 4.1.2, as it exposes the correct role for what it represents." `generic` cannot be named, so an `aria-label` alone would be ignored. When the region is a meaningful section (a long terms text), render a named `<section>` through `asChild` (`<ScrollArea asChild><section aria-labelledby="caption-id">`), which HTML-AAM maps to `region` when it has a name. This is Adrian Roselli's pattern (`<div role="region" aria-labelledby="Caption01" tabindex="0">`) with the native element instead of the role, as the `jsx-a11y/prefer-tag-over-role` lint rule asks. Keep it to a few per page, since `region` is a landmark.
- **Server Component.** No state, no handlers, no `'use client'`.

## Motion

None over time. Scrolling is the user's direct manipulation, handled by the browser; the component adds no smooth scrolling (`scroll-behavior` stays the document's). The edge fade is a scroll-driven animation: it follows the scroll position and has no duration.

- **Reduced motion:** the fade stays; it moves only as far as the user scrolls (the artifact keeps `.ab-scroll-fade` under reduced motion too).
- **Scroll timelines.** `scroll-driven-animations` is limited on webstatus.dev (Firefox has not shipped it), so the fade sits in `@supports (animation-timeline: scroll())`. Without that guard an unsupported engine would run the zero-length animation on the document timeline and keep its last frame, fading the top edge for good. Firefox shows no fade (progressive enhancement, Q38-1).
- **Instant exit:** ScrollArea never enters or exits; it is in-flow content.

## Keyboard

APG pattern: none (the APG has no pattern for a scrollable region; ScrollArea is not a widget). The keys are the browser's scrolling keys once the box has focus.

| Key             | Action                                                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Moves focus to / from the box (`tabIndex={0}`). axe: "ensure that a keyboard-only user can focus the scrollable region itself or a static text item within the scrollable region." |
| Arrow keys      | Scroll the box. Chrome: focusable scrollers let users "focus content using a keyboard's tab and arrow keys."                                                                       |

Page Up, Page Down, Home, End and Space also scroll a focused scroller. Build check (Playwright, trusted keys, 2026-10-24): Chromium and Firefox scroll with all of them; WebKit scrolls with Page Down, End, Home, Space and ArrowRight, but ArrowDown did not move the box. Browser behaviour, so the stories do not test it (their keys are untrusted events).

**RTL:** the browser maps the horizontal arrows to the visual direction of an RTL scroller: in the same check ArrowLeft scrolled toward the inline end in Chromium and Firefox; WebKit did not move. No script.

## Accessibility

- **2.1.1 Keyboard:** met by `tabIndex={0}` (Behaviour). Adrian Roselli: "The tabindex="0" satisfies WCAG SC 2.1.1 Keyboard (A), which allows a keyboard-only user to tab to the container (giving it focus) and scroll it using the keyboard."
- **1.4.10 Reflow:** a wide Table inside a ScrollArea scrolls inside the box instead of making the page scroll in two axes ("The overflow: auto satisfies WCAG SC 1.4.10 Reflow (AA) by preventing the entire page from having two axes of scrolling").
- **Scrollbar contrast.** WCAG 1.4.11 exempts components whose "appearance … is determined by the user agent and not modified by the author". The base stylesheet does modify the colour (`scrollbar-color: var(--ab-color-border-default) transparent` on `:root`, inherited: MDN "Inherited yes"), so the thumb must meet 3:1 against what is behind it. `color-border-default` passes 3:1 on every surface in the contrast matrix, and the track is transparent, so the thumb is compared with the surface (MDN: "authors should ensure the specified colors have enough contrast between them"). ScrollArea sets no scrollbar colour of its own.
- **Scrollbar size.** Not reduced: MDN warns "setting scrollbar-width to thin or none can make content hard or impossible to scroll".
- **Focus ring:** the base stylesheet's `:focus-visible` outline. A mask also clips the element's own outline (seen in Chromium and WebKit; `mask-clip: no-clip` does not help), so the fade is removed while `:focus-visible` matches. If a ScrollArea sits flush inside another clipping box, its 3 px offset ring can be clipped (inference; checked in the screenshot story).
- **More contrast:** no change needed; the thumb already uses the 3:1 border role.
- **Forced colors:** MDN "`@media (forced-colors: active)` sets `scrollbar-color` to `auto`", so the system scrollbar returns. The focus ring is an `outline` and takes the system colour.
- **Reduced transparency:** not affected.

## RTL

The browser places the vertical scrollbar and the initial horizontal scroll position from the box's direction (inference: which side the vertical scrollbar takes in RTL is engine behaviour; the build ticket records it per engine, and either side reads as correct). The component uses no physical properties.

## Component tokens

None. The fade height is the semantic `space-stack-lg`, as in the artifact. The thumb and track come from the base stylesheet (`scrollbar-color: var(--ab-color-border-default) transparent`, inherited), and the focus ring from `focus-ring-*` and `color-border-focused`. A `scroll-area` component word is not needed until a ScrollArea needs its own override.

## Built-in labels

None. A name, when wanted, comes from `aria-label`/`aria-labelledby` on a `<section>` rendered through `asChild` (Behaviour).

## Feedback events

None. Scrolling is not a feedback moment.

## Sources

- Base stylesheet: `packages/ui/src/base/base.css` (`scrollbar-gutter: stable; scrollbar-color: var(--ab-color-border-default) transparent;` on `:root`) and `docs/research/base-stylesheet.md`.
- MDN `scrollbar-color`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-color · `scrollbar-width`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width · `scrollbar-gutter`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter
- Baseline (webstatus.dev, 2026-10-24): `scrollbar-color` newly available (low 2025-12-12); `scrollbar-width` newly available (low 2024-12-11); `scrollbar-gutter` newly available (low 2024-12-11); `tabindex` widely available; `scroll-driven-animations` limited (an enhancement under `@supports`); `overscroll-behavior` limited (not used).
- Chrome for Developers, Keyboard focusable scrollers: https://developer.chrome.com/blog/keyboard-focusable-scrollers
- WebKit bug 277290: https://bugs.webkit.org/show_bug.cgi?id=277290
- axe `scrollable-region-focusable`: https://dequeuniversity.com/rules/axe/4.10/scrollable-region-focusable
- AGWG decision, "Must focusable elements have a role?": https://github.com/w3c/wcag/issues/3029
- Adrian Roselli, Under-Engineered Responsive Tables: https://adrianroselli.com/2020/11/under-engineered-responsive-tables.html
- WCAG 2.2 Understanding 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Radix ScrollArea: https://www.radix-ui.com/primitives/docs/components/scroll-area · Base UI ScrollArea: https://base-ui.com/react/components/scroll-area · Mantine ScrollArea: https://mantine.dev/core/scroll-area/
