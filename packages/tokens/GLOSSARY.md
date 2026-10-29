# Tokens

The named design decisions of the Bereghici design system (color, type, space, shape, depth, motion), shared by every surface that renders the brand.

## Language

### Tiers

**Primitive token**:
A token whose name states its literal value (`palette-moss-900`, `dimension-16`). Only semantic tokens may use it.
_Avoid_: Base token, global token, reference token

**Semantic token**:
A token whose name states its purpose (`color-text-subtle`), resolved per theme from primitive tokens. What product code uses.
_Avoid_: Alias token, system token, functional token

**Component token**:
A token holding one component's decision (`button-primary-background-color`), referencing semantic tokens only.
_Avoid_: Local token

**Dictionary**:
The closed set of words a semantic or component token name may contain.

### Color

**Theme**:
A complete, independently designed resolution of every themed color: Light or Dark. Never an inversion of another theme.
_Avoid_: Mode, color mode, skin

**System theme**:
No theme chosen: the interface follows the operating system's light or dark preference, live.
_Avoid_: Auto, default theme

**Surface**:
A page layer that content sits on: default, raised, nested or overlay.
_Avoid_: Layer, canvas

**Background**:
The fill of a single element, as opposed to the surface it sits on.
_Avoid_: Fill, bg

**Role**:
The meaning a color carries: neutral, accent, selected, success, warning, danger, highlight or inverse.
_Avoid_: Intent, tone, kind

**Emphasis**:
How strongly a role is expressed against the page: subtlest, subtle, default or bold.
_Avoid_: Weight, level, prominence

**Accent**:
The single brand action color.
_Avoid_: Primary color, brand color

**Highlight**:
The color marking the one emphasised phrase on a page.

**Brand color**:
A fixed identity hue for the Logo, imagery and print, never used for interface roles.

### Depth

**Elevation**:
The composite shadow (hairline ring, inner highlight, soft shadow) given to an overlay: raised, overlay, toast or modal.
_Avoid_: Shadow, z-depth

**Material**:
A translucent, blurred fill reserved for overlay chrome above content.
_Avoid_: Glass, frosted, blur

### Type

**Type role**:
The job a piece of text does (heading, display, body, label, data, code, overline, kbd), at a size (`xs`–`lg`). One role fixes family, size, weight and line height together (`type-body-md`).
_Avoid_: Text style, font style, type scale step

**Subset**:
One file of a family that covers one `unicode-range` (`latin` or `latin-ext`). The browser fetches a subset only when the page uses a character in its range.
_Avoid_: Font slice, charset
