# @platform/tokens

The Bereghici design system's tokens. The source is DTCG 2025.10 JSON in three tiers. Style Dictionary 5 compiles it into `--ab-` CSS custom properties and into an artifact-shaped `tokens.json` for `/design-sync`. The build fails when the set breaks any of the system's rules.

## Outputs

`pnpm build` writes to `dist/`:

| Export                         | File               | What it is                                                                                                                                                                                                                                                    |
| ------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@platform/tokens/tokens.css`  | `dist/tokens.css`  | Every token as an `--ab-*` custom property inside `@layer ab.tokens`. Semantic and component tokens point at the tier below with `var()`. Themed colors use `light-dark()`.                                                                                   |
| `@platform/tokens/tokens.json` | `dist/tokens.json` | The claude.ai Design System artifact's token shape: flat `{ name, value, usage }` lists per family (`color`, `spacing`, `radius`), with the light Theme first and literal values only. There is no `var()`, `light-dark()`, `color-mix()` and no named color. |

Apps declare the layer order first (`@layer ab.reset, ab.tokens, ab.base, ab.components;`) and then import `tokens.css`. Unlayered app CSS always wins over the design system.

## Theme contract

- **No `data-theme` means the System theme.** `:root` declares `color-scheme: light dark`, so every themed color follows the operating system's light or dark preference, live, with no JavaScript.
- **`data-theme="light"` or `data-theme="dark"` forces a Theme on that element and its subtree.** The attribute only sets `color-scheme`. Nesting works: a `data-theme="light"` inside a `data-theme="dark"` subtree is light again.
- **Themed colors resolve where they are used.** `--ab-color-surface-default: light-dark(var(--ab-palette-sage-0), var(--ab-palette-night-950))` is declared once on `:root`. An unregistered custom property's computed value is its "specified value with variables substituted" (CSS Variables 1), so the `light-dark()` is inherited unresolved and picks its branch from the `color-scheme` of the element that uses it. Component tokens (`--ab-card-background-color: var(--ab-color-surface-default)`) therefore follow the Theme too.
- **Don't register themed tokens with `@property` and `syntax: "<color>"`.** A registered color property computes to one color on `:root`, and subtrees would no longer switch.
- **Brand colors (`color-brand-*`) are fixed** in every Theme.
- **The package exports nothing for switching.** Apps own the choice and its persistence: they set `data-theme` only for an explicit light or dark choice, and leave it off for System. `docs/research/theme-switching.md` has a recipe for Next.js.

## Authoring tokens

Source files live in `src/tokens/`, one per tier: `primitive.tokens.json`, `semantic.tokens.json` and `component.tokens.json`. The top-level group is the tier. The rest of the path is the token name, and the CSS name is `--ab-` plus the path joined with `-` (`semantic` → `color-text-subtle` → `--ab-color-text-subtle`).

- **Primitive tokens** hold literals only: DTCG 2025.10 color objects (`{ "colorSpace": "srgb", "components": [...], "hex": "#263316" }`) and dimension objects (`{ "value": 16, "unit": "px" }`).
- **Semantic tokens** hold exactly one reference to a primitive token (`"{primitive.palette-moss-900}"`).
- **Component tokens** hold exactly one reference to a semantic token.
- **Themed semantic colors** use `$value` for the light Theme and put the dark Theme in `$extensions`:

  ```json
  "color-surface-default": {
    "$type": "color",
    "$value": "{primitive.palette-sage-0}",
    "$extensions": { "com.bereghici.theme": { "dark": "{primitive.palette-night-950}" } }
  }
  ```

  Every semantic `color-*` token except `color-brand-*` is themed. No other token may carry a Theme value; component tokens inherit theming from the semantic tokens they reference.

- **`$description`** becomes the token's `usage` in `tokens.json`.

## Checks

The build stops with a `TokenCheckError` that lists every problem when:

1. **A tier rule is broken** (R1–R3): a primitive token references another token, a semantic token holds a literal or references something other than a primitive token, or a component token references something other than a semantic token.
2. **A name breaks its tier's grammar or uses a word outside the Dictionary** (R7). The grammar and Dictionary are carried over unchanged from the source design system, in `src/naming.ts`.
3. **A themed color is missing a Theme**, or a token that isn't a themed color carries one.
4. **An allowed pairing is below WCAG 2.2 AA in any Theme**: text on every surface and background it may sit on at 4.5:1, icons and borders at 3:1, and `on-{role}` content on its `bold` fill at 4.5:1. The matrix is in `src/contrast.ts`. Pairs whose tokens aren't defined yet are skipped.

Contrast runs only when the other checks pass.

## Scripts

| Script                          | Does                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm build`                    | Checks the source and writes `dist/tokens.css` and `dist/tokens.json`               |
| `pnpm test`                     | Vitest: feeds token sets to `buildTokens()` and asserts on its outputs and failures |
| `pnpm lint`, `pnpm check-types` | Oxlint (`oxlint.config.ts`) and `tsc --noEmit`                                      |
