Design tokens, typography, iconography and the Logo for Alexandru Bereghici. The system targets WCAG 2.2 Level AA in every theme.

This overview keeps the intent behind the system: its philosophy, guidance, personality and direction. Values, tokens and component specs live in their own views on this page.

---

## Principles

1. **Accessible by construction.** Every color pairing the roles permit must meet WCAG 2.2 AA, in every theme.
2. **Semantic first.** Product code expresses intent (`text-subtle`), never a raw value (`palette-sage-700`).
3. **Predictable names.** Tier 1 names state the value. Tiers 2 and 3 use only words defined in the dictionary.
4. **Rationed color.** Surfaces are neutral. Color signals action, state and one highlight per page.
5. **Flat in flow, lifted when floating.** In-flow content separates with space, hairlines and surface steps. Only floating layers (menus, popovers, toasts, dialogs) get elevation and material.
6. **Purposeful motion.** Fast, eased out, interruptible and optional. Springs only for direct manipulation and toggles.
7. **Keyboard first, pointer friendly.** Every action is reachable and discoverable from the keyboard; every control is comfortable by touch.
8. **Platform before script.** Native elements and CSS do the work; script only adds what the platform can't.

---

## Direction

- **Quiet.** Neutral surfaces. Color, elevation and motion are spent only where they mean something.
- **Compact.** Linear-class density on a fine pointer. Under a finger the same controls grow, so no component needs a touch variant.
- **Warm, not grey.** Moss and lichen in place of blue and grey; even the shadows carry a trace of moss in light.
- **Rooted.** Moldovan and Romanian folk signs, used as finishing touches rather than decoration (see Personality).
- **Still open.** Brand voice and imagery are not yet defined.

---

## Token architecture

| Tier          | Purpose                    | Example                                | Consumed by          |
| ------------- | -------------------------- | -------------------------------------- | -------------------- |
| 1 · Primitive | Raw values                 | `--ab-palette-moss-900`                | Tier 2 only          |
| 2 · Semantic  | Intent, resolved per theme | `--ab-color-background-accent-bold`    | Tier 3, product code |
| 3 · Component | One component's decisions  | `--ab-button-primary-background-color` | Component code       |

| #   | Rule                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| R1  | Tier 1 holds literal values only.                                                                                           |
| R2  | Tier 2 references tier 1 only, and holds no literals.                                                                       |
| R3  | Tier 3 references tier 2 only, and holds no literals.                                                                       |
| R4  | Product code never references tier 1.                                                                                       |
| R5  | Every themed color exists in `:root`, `[data-theme="light"]` and `[data-theme="dark"]`. Tier 3 is identical in every scope. |
| R6  | Patterns that aren't components (selection, highlight, focus) consume tier 2 directly.                                      |
| R7  | Every name matches its tier's grammar and uses only dictionary words.                                                       |

The model follows Material Design 3 (reference / system / component), Adobe Spectrum (global / alias / component) and GitHub Primer (base / functional / component).

---

## Naming and dictionary

Every token is prefixed `--ab-`, lowercase and hyphenated. A segment is left out when it holds the default value.

### Tier 1: names state the value

| Category                                          | Name segment means                                                   | Examples                                                            |
| ------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `palette-{hue}-{step}`                            | Step 0 = white, 50 = lightest … 950 = darkest. `-a{n}` = n % opacity | `palette-sage-500` · `palette-night-950-a64`                        |
| `dimension-{px}`                                  | Pixels                                                               | `dimension-16` = 16px                                               |
| `font-family-{typeface}`                          | Typeface name                                                        | `font-family-noto-serif` · `-figtree` · `-system-mono`              |
| `font-size-{px}`                                  | Pixels, delivered as rem                                             | `font-size-17` = 1.0625rem                                          |
| `font-size-{min}-{max}`                           | Fluid range in px                                                    | `font-size-29-33` = 29→33px                                         |
| `font-weight-{weight}`                            | CSS weight                                                           | `font-weight-500`                                                   |
| `line-height-{n}`                                 | Value × 100                                                          | `line-height-160` = 1.6                                             |
| `letter-spacing-{n}`                              | Value × 1000, in em; `minus-` = negative                             | `letter-spacing-minus-20` = −0.020em                                |
| `stroke-width-{n}` · `scale-{n}` · `saturate-{n}` | Value × 100                                                          | `stroke-width-175` = 1.75 · `scale-97` = .97 · `saturate-180` = 1.8 |
| `blur-{px}` · `opacity-{n}`                       | Pixels · percent                                                     | `blur-20` = 20px · `opacity-40` = .4                                |
| `z-index-{n}` · `duration-{ms}`                   | Literal value                                                        | `z-index-300` · `duration-200`                                      |
| `easing-{keyword}[-{qualifier}]`                  | CSS keyword plus qualifier                                           | `easing-ease` · `easing-ease-out-strong` · `easing-ease-out-ios`    |
| `easing-spring-{character}`                       | `linear()` spring approximation                                      | `easing-spring-snappy` · `-gentle` · `-bouncy`                      |
| `font-variant-numeric-*` · `text-transform-*`     | CSS value                                                            | `font-variant-numeric-tabular-nums`                                 |

### Tier 2: names state the purpose

| Pattern                                                                   | Segments                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `color-{property}-{role}-{emphasis}-{state}`                              | See the dictionary below                                                |
| `type-{category}-{size}[-{property}]`                                     | Category · size · CSS property                                          |
| `space-{axis}-{size}` · `space-section`                                   | Axis · size                                                             |
| `size-{element}-{size}`                                                   | `icon`, `control`, `container`, `target`, `toggle`, `indicator`, `mark` |
| `radius-{size}` · `stroke-width-{size}` · `border-width-{default\|thick}` | Size                                                                    |
| `elevation-{level}` · `elevation-ring` · `elevation-highlight`            | `raised` · `overlay` · `toast` · `modal` (composite shadows)            |
| `material-{blur\|saturate}-{thickness}` · `opacity-disabled`              | `thin` · `regular` · `thick`                                            |
| `focus-ring-{width\|offset}` · `underline-{thickness\|offset}`            | Property                                                                |
| `z-index-{layer}`                                                         | Layer                                                                   |
| `motion-{property}-{use}`                                                 | `duration` · `delay` · `easing` · `scale` · `distance` · `blur`         |
| `layout-*` · `breakpoint-md`                                              | Property · size                                                         |

### Tier 3

Pattern: `{component}-{variant}-{element}-{property}-{state}`

Examples: `button-primary-background-color-hovered` · `button-md-height` · `dropdown-menu-item-shortcut-text-color` · `switch-track-background-color-checked` · `command-enter-duration`

Tier 3 is declared once on `:root,[data-theme="light"],[data-theme="dark"]`, so component tokens resolve correctly inside any themed subtree.

### Dictionary

These are the only words allowed in tier 2 and tier 3 names.

| Group          | Word                                                                                                                                                                                                                                                                                                                                                   | Meaning                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Color property | `surface`                                                                                                                                                                                                                                                                                                                                              | A page layer that content sits on                                                                     |
|                | `background`                                                                                                                                                                                                                                                                                                                                           | The fill of an element                                                                                |
|                | `text` · `icon` · `border`                                                                                                                                                                                                                                                                                                                             | Foreground, a glyph, a line                                                                           |
|                | `backdrop`                                                                                                                                                                                                                                                                                                                                             | The dimming layer behind a modal                                                                      |
|                | `material`                                                                                                                                                                                                                                                                                                                                             | A translucent fill for floating chrome; always paired with `material-blur`                            |
|                | `shadow`                                                                                                                                                                                                                                                                                                                                               | A colour used only inside elevation: `ring`, `highlight`, `ambient`, `key`, `deep`                    |
|                | `brand`                                                                                                                                                                                                                                                                                                                                                | A fixed identity hue for the mark, imagery and print only                                             |
| Surface        | `default` · `raised` · `nested` · `floating`                                                                                                                                                                                                                                                                                                           | The page · one step from the page · a panel inside a raised panel · menus, popovers, dialogs          |
| Role           | _neutral_ (omitted)                                                                                                                                                                                                                                                                                                                                    | No meaning beyond structure                                                                           |
|                | `accent`                                                                                                                                                                                                                                                                                                                                               | The single brand action color                                                                         |
|                | `selected`                                                                                                                                                                                                                                                                                                                                             | The current item in a set                                                                             |
|                | `success` · `warning` · `danger`                                                                                                                                                                                                                                                                                                                       | The status of an outcome                                                                              |
|                | `highlight`                                                                                                                                                                                                                                                                                                                                            | One marked phrase per page                                                                            |
|                | `inverse`                                                                                                                                                                                                                                                                                                                                              | Content on `background-neutral-bold` (tooltips)                                                       |
| Thickness      | `thin` · `regular` · `thick`                                                                                                                                                                                                                                                                                                                           | Material opacity and blur, ascending                                                                  |
| Elevation      | `raised` · `overlay` · `toast` · `modal`                                                                                                                                                                                                                                                                                                               | Floating layers, ascending                                                                            |
|                | `disabled`                                                                                                                                                                                                                                                                                                                                             | An unavailable control (exempt from contrast)                                                         |
| Emphasis       | `subtlest` · `subtle` · _default_ · `bold`                                                                                                                                                                                                                                                                                                             | Lowest contrast that passes AA · reduced, for secondary content · standard · filled, highest emphasis |
|                | `on-{role}`                                                                                                                                                                                                                                                                                                                                            | Content placed on that role's `bold` fill                                                             |
| State          | _rest_ (omitted) · `hovered` · `pressed` · `focused` · `selected` · `checked` · `invalid` · `disabled`                                                                                                                                                                                                                                                 | Interaction state                                                                                     |
| Size           | `2xs` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl`                                                                                                                                                                                                                                                                                                       | Always ascending magnitude                                                                            |
|                | `min` · `recommended`                                                                                                                                                                                                                                                                                                                                  | WCAG 2.5.8 minimum (24px) · recommended target (44px)                                                 |
| Space axis     | `inline` · `inset` · `stack` · `section`                                                                                                                                                                                                                                                                                                               | Horizontal gap · padding · vertical gap · gap between page sections                                   |
| Type category  | `heading` · `display`                                                                                                                                                                                                                                                                                                                                  | Serif titles · serif statement                                                                        |
|                | `body` · `label`                                                                                                                                                                                                                                                                                                                                       | Sans reading text · sans control text                                                                 |
|                | `data` · `overline` · `code`                                                                                                                                                                                                                                                                                                                           | Tabular figures · uppercase group label · monospace                                                   |
| Layer          | `base` · `raised` · `sticky` · `dropdown` · `backdrop` · `modal` · `toast` · `tooltip`                                                                                                                                                                                                                                                                 | Stacking order, lowest to highest                                                                     |
| Motion use     | `press` · `hover-in` · `hover-out` · `tooltip` · `popover` · `modal` · `drawer` · `expand` · `swap` · `exit` · `entrance` · `stagger` · `toggle` · `spring` · `toast` · `loop`                                                                                                                                                                         | The interaction being animated                                                                        |
| Motion easing  | `enter` · `exit` · `move` · `drawer` · `color` · `constant` · `spring` (+ `gentle`, `bouncy`)                                                                                                                                                                                                                                                          | Appearing · leaving · moving on screen · sheet · fades · progress · direct manipulation               |
| Component      | `button` · `icon-button` · `input` · `checkbox` · `radio` · `switch` · `select` · `combobox` · `segmented-control` · `tabs` · `accordion` · `dropdown-menu` · `context-menu` · `popover` · `tooltip` · `dialog` · `sheet` · `command` · `toast` · `tag` · `badge` · `status-dot` · `card` · `kbd` · `spinner` · `link` · `separator` · `icon` · `logo` |                                                                                                       |
| Variant        | `primary` · `secondary` · `tertiary` · `neutral` · `accent` · `success` · `warning` · `danger`                                                                                                                                                                                                                                                         |                                                                                                       |
| Element        | `icon` · `label` · `helper` · `error` · `item` · `indicator` · `thumb` · `track` · `panel` · `header` · `footer` · `list` · `trigger` · `option` · `group` · `separator` · `shortcut` · `body` · `title` · `description` · `input` · `action` · `close` · `dot` · `picker` · `backdrop` · `stack` · `enter` · `exit`                                   | A named part or phase inside a component                                                              |

---

## Accessibility

Target: **WCAG 2.2 Level AA.**

- **Contrast.** Every text, icon and border role meets AA on every background it is allowed on, in every theme.
- **Not color alone.** State always pairs color with a label, a shape, a weight change or an underline.
- **Resize and reflow.** Text resizes to 200% and reflows at 320 CSS px with no loss of content.
- **Focus.** Always visible, never obscured, never suppressed.
- **Targets.** At least 24 × 24 CSS px; controls aim for a comfortable touch size.
- **System settings.** Increased contrast, reduced transparency, reduced motion and forced colors (Windows High Contrast) are all honoured.

**Exemptions.**

- The subtle hairline border is decorative and is never the only boundary of a control.
- Disabled roles are exempt. Pair them with `aria-disabled` and an explanation.

---

## Color

The palette is Moss and Lichen. The light and dark themes are designed independently; neither is an inversion of the other.

| Palette | Use                                |
| ------- | ---------------------------------- |
| Sage    | Light-theme neutrals               |
| Night   | Dark-theme neutrals                |
| Moss    | Brand green; accent in light       |
| Lichen  | Accent in dark; subtle accent fill |
| Fern    | Success                            |
| Ember   | Highlight, warning                 |
| Clay    | Danger                             |

Fern is generated so success reads distinctly from the accent.

- **Accent** is the single brand action color.
- **Highlight** marks one phrase per page.
- **Brand colors** are fixed identity hues for the mark, imagery and print only.
- **Themes** follow the system color scheme until the user picks one; then their choice is remembered.

---

## Typography

| Family           | Use                              |
| ---------------- | -------------------------------- |
| Noto Serif       | Headings and display statements  |
| Figtree          | Body, labels, data and overlines |
| System monospace | Code (no webfont)                |

- **Follow the reader.** Text follows the user's default size. Larger steps scale fluidly with the screen, never by viewport alone.
- **Roles, not sizes.** Set text by its role (heading, body, label, data, code) so size, weight and line height stay in sync.
- **Two weights.** Regular for reading, medium for headings, labels and emphasis.

---

## Shape and depth

**Concentric radius.** Nested corners share a centre: inner radius = outer radius − the padding between them. Use the pair that satisfies the equation; never eyeball it.

**Elevation.** Every floating layer is drawn the same way:

1. **Hairline ring.** It separates the layer on any background, including from other floating layers.
2. **Inner highlight.** A top highlight shows in dark only.
3. **Soft shadow.** Tinted with moss in light, so it reads as warm, not grey.

**Materials.** Translucent fills belong only on floating chrome above content, such as menus and the command palette. Never use them for in-flow content, and never for long text. Under reduced transparency every material turns solid.

---

## Motion

The motion was reviewed against Emil Kowalski's `review-animations` and `emil-design-eng` standards.

- **Easing.** Enter and exit ease out. Never ease-in.
- **Exits** are faster than entrances.
- **Origin.** Popovers and tooltips grow from their trigger, never from nothing. Modals stay centred.
- **Press.** Pressable elements give slightly under the pointer.
- **Hover** effects appear only where a precise pointer can hover.
- **Swaps** add a small lift and blur to mask the crossfade.
- **The intro** is the one slow moment, once per visit.
- **Stagger** at most four items, and never block input.
- **Interruptible.** Anything that can be triggered repeatedly can be interrupted.
- **When not to animate.** No motion on keyboard-initiated or high-frequency (100+ per day) actions.
- **Reduced motion** removes movement, scaling, blur and stagger. Opacity and color fades remain.

**Springs.** Only where the user directly causes the movement: switch thumbs, segmented and tab indicators, the radio diamond, toast entrance. Everything the system initiates eases out.

---

## Interaction principles

These rules come from Apple's Human Interface Guidelines, Nielsen Norman Group's heuristics, the Laws of UX, the WAI-ARIA Authoring Practices, and close study of Linear, Raycast, Vercel and Things. They govern placement and behaviour in every component.

| Principle                               | Basis                 | Applied                                                                                                                                                     |
| --------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reduce the distance to frequent targets | Fitts's law           | Shortcut hints, ⌘K for everything, whole-row hit areas on checks and menu items, large targets on touch                                                     |
| Cut choices at each step                | Hick's law            | One primary button per view. Menus group related actions; destructive actions sit last, behind a separator. The command palette pre-selects the best match. |
| Respond under 400ms                     | Doherty threshold     | Press feedback is immediate. Interface motion stays short. Spinners only for waits over 400ms.                                                              |
| Stay where users already are            | Jakob's law           | ⌘K, Esc and arrow-key conventions. Native controls wherever the platform has them.                                                                          |
| Keep the reference point still          | Apple HIG             | The command palette is top-anchored, so the input never moves. Busy buttons keep their width. Locking scroll never shifts the layout.                       |
| Teach shortcuts in place                | Linear, Raycast       | Tooltips and menu items show the key, and the palette footer teaches navigation. Nothing requires memorising.                                               |
| Validate after intent                   | NN/g error prevention | Errors show only after interaction. They replace the helper text, never stack on it.                                                                        |
| Prefer undo to confirm                  | NN/g, Gmail           | Reversible actions run immediately and offer Undo in a toast. Dialogs are reserved for irreversible ones.                                                   |
| One layer closes at a time              | Top layer             | Esc closes only the topmost popover or dialog, then focus returns to its invoker.                                                                           |
| Honour system settings                  | Apple HIG             | Reduced motion, reduced transparency, color scheme and coarse pointers are all respected.                                                                   |

**Sound.** Soft synthesised clicks mark toggles, toasts and running a command. Sound is on by default and always optional, and a mute is remembered.

---

## Personality

Moldovan and Romanian folk motifs (the stitched signs of the ie and the carved signs of wood), applied as finishing touches rather than decoration. Every motif is functional, and none is figurative.

| Motif                                                                | Where                                                                                                                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The **stave**, a single carved upright, as on the shepherd's _răboj_ | The spinner's turning staves                                                                                                                                   |
| The **bob**, the grain: the stitched diamond (also called _ochi_)    | The radio's selected indicator, the single-choice indicator in menus, the diamond dots in the more, info and warning glyphs, and the optional divider ornament |
| **Carved geometry**: straight cuts, 45° chamfers                     | Every icon, including the octagonal search, info and danger glyphs. Checks have square ends.                                                                   |
| **Moss and lichen**                                                  | Brand green as the primary action, and moss-tinted shadows                                                                                                     |

**Rule.** One motif per surface at most. Keep them out of copy, names and illustrations unless the brand voice later calls for it.

---

## Logo

**Stâlpul cerului**, the pillar of the sky. In Romanian folklore a column holds up the sky, and Brâncuși's _Endless Column_ grew out of the carved pillars of village architecture. Here the column is a zigzag, the old sign for lightning, held between two angles. It stands for the link between ground and sky, and a coder also reads it as `< / >`.

- **Construction:** straight cuts only, square caps, miter joins.
- **Size:** never below its minimum size.
- **Clear space:** half the mark's width.
- **Color:** one color. The interface's mark color in UI; brand moss or brand lichen on imagery.

---

## Iconography

Every icon is cut on a 24-unit grid from straight strokes with 45° chamfers, square caps and miter joins, and takes the color of the text around it. New glyphs follow the same construction.

- **Labels:** pair every icon with a visible label or an accessible name.
- **Hit area:** icon-only controls keep at least the minimum target size.
