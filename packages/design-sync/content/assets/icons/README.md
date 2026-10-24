The carved icon set: 42 glyphs on a 24-unit grid, cut from straight strokes with 45° chamfers, square caps and miter joins.

- Each file strokes in `currentColor` at 1.75, so shown through `<img>`, as here, it draws in black. In an interface render a glyph with its icon component (`@platform/ui/icons/<name>`, for example `SearchIcon` from `@platform/ui/icons/search`), which inherits the text colour: `--ab-icon-color` (rest), `--ab-icon-color-hovered`, `--ab-icon-color-selected`, `--ab-icon-color-disabled`, or an `ab-color-icon-*` role.
- Sizes and strokes: `--ab-icon-sm-size` 16 with stroke 2, `--ab-icon-md-size` 20 with 1.75, `--ab-icon-lg-size` 24 with 1.75, `--ab-icon-xl-size` 32 with 1.5.
- Pair every icon with a visible label or an accessible name (the `label` prop); icon-only controls keep at least `--ab-size-target-min` (24px).
