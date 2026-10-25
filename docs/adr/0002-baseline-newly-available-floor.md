# Baseline "newly available" is the floor, with no fallbacks

The design system may use any web feature that is Baseline newly available (or newer) without a fallback or polyfill. Browser compatibility below that line is deliberately not supported: the system is for our own apps, and supporting older engines would mean rebuilding in script what `popover`, anchor positioning, `light-dark()` and friends already do. Accessibility is not traded away by this: WCAG 2.2 AA must hold in every engine that meets the floor.

Baseline is judged per compat key: a feature whose other keys are limited may be used if every key we use is newly available (e.g. anchor positioning without `position-visibility`). A declaration or media query below the floor is allowed only as a progressive enhancement that engines ignore when unknown, with no fallback code, no polyfill and nothing that accessibility or layout depends on (e.g. `interpolate-size`, `text-wrap: pretty`, a decorative scroll-driven fade inside `@supports (animation-timeline: scroll())`).

## Amendment (spec #53): the active-item indicator

WCAG 2.2 AA under this floor also covers the item a composite widget points at without DOM focus: the highlighted option in Combobox and Command (`aria-activedescendant`) and the focused segment in DateField and DatePicker. A fill alone measured 1.1:1 there, which fails SC 1.4.11 and SC 2.4.7, so the fill alone is not enough.

Decision: that item carries the 2 px focus ring, inset (`outline: var(--ab-focus-ring-width) solid var(--ab-color-border-focused)`, offset minus its width, so a scroll box does not clip it), over the existing fill. In forced colours the listbox ring takes `currentColor`. One shared rule owns it for the listboxes (`[data-highlighted]` in `ui-provider/base.css`), and the DateField segment uses the same ring on `:focus`.

The role is `color-border-focused`, not `color-border-selected`. The token glossary defines `border-focused` as the focus ring on every interactive element, and `border-selected` as the edge of the current item in a set. The highlighted option is the keyboard position, not the chosen value. IconButton and SegmentedControl follow the same split: their selected state uses `border-selected` and their focus uses `border-focused`. Both roles resolve to the same colour (lowest 11.16:1 light, 13.23:1 dark), so the choice is about meaning, not contrast.
