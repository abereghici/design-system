# Baseline "newly available" is the floor, with no fallbacks

The design system may use any web feature that is Baseline newly available (or newer) without a fallback or polyfill. Browser compatibility below that line is deliberately not supported: the system is for our own apps, and supporting older engines would mean rebuilding in script what `popover`, anchor positioning, `light-dark()` and friends already do. Accessibility is not traded away by this: WCAG 2.2 AA must hold in every engine that meets the floor.
