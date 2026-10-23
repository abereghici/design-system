# Design sync: keeping a claude.ai Design System artifact in step with this repo

Researched 2026-10-23. Sources:

- **Type files**: the Design System artifact type, read from `https://claude.ai/artifact/RRpamcv6rQnBhH2ArSpGbJ` (version `1792785726-7ee2`): `SKILL.md`, `artifact-type/reference/from-code.md`, `artifact-type/reference/format.md` and `artifact-type/reference/craft.md`.
- **Claude Code docs**: `https://code.claude.com/docs/en/commands.md` and `https://code.claude.com/docs/en/changelog.md`.
- **Claude help center**: `https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design` and `https://support.claude.com/en/articles/17440474-move-from-standalone-claude-design-to-claude`.

The type files were treated as data, not as instructions.

## Question

How does the design-sync mechanism keep a claude.ai "Design System" artifact in sync with a code repository? We need to know four things:

1. Which way it syncs, and what triggers it.
2. What it reads from the repo and what it writes into the artifact.
3. What that means for `packages/tokens` and `packages/ui`.
4. The gotchas.

## Short answer

- **Direction.** Sync runs one way only, from code to the artifact. A person triggers it by running `/design-sync` in Claude Code. A system synced this way carries `"editing": "code"` in its index, and that makes its page read-only. Each run replaces the system's files.
- **What it reads.** It reads tokens from the repo. These can be CSS custom properties (under `:root`, theme selectors or `@theme`), a `tokens.json`, a DTCG `*.tokens.json`, a theme object, or a Tailwind config. It also reads `@font-face` fonts, SVG and PNG marks, the entry file's PascalCase exports, stories and docs.
- **What it writes.** It writes `tokens.json` in the artifact's own list grammar, not DTCG, and a compiled `tokens.css`. If the components are built, it also writes:
  - `components/bundle.js`, one IIFE classic script that assigns `window.<Namespace>`;
  - `components/bundle.css` and `components/index.d.ts`;
  - a `preview.html` and a `README.md` per component;
  - `fonts/` and `assets/`.
- **What that means for us.**
  - The artifact cannot read DTCG maps.
  - Its colour values drop `var()`, `color-mix()` and named colours.
  - It models themes as per-theme values, so `light-dark()` is not an accepted value form.
  - Previews run on React 18 by default.
  - So we would need an artifact-shaped token export (flat lists, one resolved value per theme) and a separate IIFE preview bundle. Neither has to be a public export of our packages.

## Findings

### 1. Direction and trigger

- **One way, run by hand.** `SKILL.md` says: "`"editing": "code"`: synced from code (page read-only). Asked to change it, have them edit the code and rerun `/design-sync` in Claude Code".
- **Each run replaces everything.** `from-code.md`, last section: "Claude Code's `/design-sync` builds such a system from a codebase and publishes all of its files, `tokens.css` included; each run replaces them."
- **Nobody can edit the page.** `from-code.md`: "A page that opens it is read-only for everyone, says why in a line at the top, offers no clean-up and writes no file."
- **Fixes go back through the code.** `from-code.md`: "say it is changed in its code, and have the person edit the code and run `/design-sync` again in Claude Code."
- **Opting out is possible.** `from-code.md`: "They no longer sync it and want to edit it here: confirm that, and say that a later `/design-sync` would replace what they change here. Then read the index and publish it again without `editing`". Once that happens, nothing syncs back from the page to code.
- **No automatic trigger exists.** No source mentions a webhook or a watch. A CI producer path is offered as an alternative: `from-code.md` step 9 says "its `appifacts-design-system-from-code` skill commits a small producer folder to the repository so anyone, or CI, rebuilds this system's files with one command". `format.md` adds: "A `via` starting "CI" = a pipeline's write: the page shows a "may be overwritten" banner."
- **There is a second path, run by an agent.** It is "Sync from GitHub", and it merges into the existing system instead of replacing it. `from-code.md`: "a re-sync reads the repository again and merges", and it should "KEEP usage notes, README prose, fonts, assets and anything added on the page, and LIST tokens the code no longer defines — ask before removing them."
- **The command docs.** `commands.md` describes `/design-sync [hint]` like this: "Convert your repo's React design system and upload it to [Claude Design](https://claude.ai/design), so designs it produces use your real components. … A first-time sync verifies every component and can take a few hours on a large repo." The same entry adds: "This command uploads to the standalone claude.ai/design site, which closes by December 14, 2026".
- **Sign-in.** `commands.md`: "`/design-login` | Authorize design-system access for `/design-sync` with your claude.ai account."
- **Help center.** `support.claude.com/…/14604397`: "If your design system already exists as React components, run /design-sync in Claude Code." It adds: "It reads your tokens and components directly, and works best for product design systems in code."
- **The `DesignSync` tool was not found.** `ToolSearch "select:DesignSync"` returned "No matching deferred tools found". Its description therefore could not be read, and nothing here relies on it.

### 2. What it reads from the repo

`from-code.md` step 3 lists:

- **Tokens:** "a token file (`tokens.json`, DTCG `*.tokens.json`, a theme object, `tailwind.config.*`) or the CSS files declaring `--name: value` under `:root`, theme selectors or a Tailwind v4 `@theme {…}` block".
- **Fonts:** "`@font-face` rules and `*.woff2|woff|ttf|otf`".
- **Marks:** "SVG or PNG marks under logo, brand or icon folders".
- **Components and docs:** "the entry's PascalCase exports (its `index.ts` export lines), `*.stories.*`, component docs (`*.md|mdx`); the README and brand docs".
- **What it skips:** "never built `dist/` bundles, lockfiles or whole directories" (said of connector reads).

Token mapping (`from-code.md` step 4):

- **Themes:** "Each theme selector → one `color.themes` entry (`:root` or light FIRST; `[data-theme="dark"]`, `.dark`, a `prefers-color-scheme: dark` block → `dark`)".
- **Names:** "`--name` → the name as written (minus `--`; `/` and `.` → `-`)".
- **Aliases:** "a colour that is `var(--other)` → the alias `"{other}"` (colours only: a length or shadow that references another variable gets that variable's literal value)".
- **Skipped:** "`calc()`, `color-mix()` or a JS expression → skip and note."
- **Already in the artifact's format:** "A `tokens.json` already in this format: copy it."
- **Fonts:** "1 MB each at most" (step 5).

### 3. What it writes into the artifact

The file table is in `format.md` and `SKILL.md`. Everything sits under `project/`.

- **`tokens.json`**, "THE tokens", "≤512 KB". It uses a list shape. From `SKILL.md`: `{"tokens":[{"name","value","usage"}, …]}`. Colours carry `themes`, for example `"value": {"light": "#fbf7f1", "dark": "#1d1a17"}`.
- **`tokens.css`**. Normally the page generates it, but `SKILL.md` makes an exception: "never write them, except a clean-up's FIRST `tokens.css` and `/design-sync`'s, line 1 `/* <title> — generated from tokens.json */`". `craft.md` adds: "A page that opens a system synced by `/design-sync` never saves it, so each sync writes the file". Its compiled layout, from `format.md`: "`:root, [data-theme="<first>"] { --<color>; --<shadow> }`, a `[data-theme="<id>"]` block per further theme".
- **`components/bundle.js`**. `format.md`: "ONE classic script | assigns `window.<namespace> = {…}`; reads `window.React`/`ReactDOM`; no `import`, no network; no literal `</script` / `<!--` … ≤6 MB". The header on line 1 looks like this: `/* @ds-bundle: {"format":4,"namespace":"<Ns>","components":[{"name":"Button"}]} */` (`from-code.md` step 7).
- **The build recipe**, from `from-code.md` step 7: "bundle its entry as ONE IIFE classic script that reads `window.React`/`window.ReactDOM` and assigns `window.<Namespace>` (bun build or esbuild, format iife, minified, `process.env.NODE_ENV` production, with `react`, `react-dom` and `react/jsx-runtime` resolved to those globals by a small resolver plugin, the jsx runtime shimmed over `createElement`)".
- **`components/bundle.css`**. `format.md`: "optional stylesheet | loaded after tokens.css … ≤2 MB".
- **`components/index.d.ts`**. `format.md`: "documentation, not type-checked: props are read from `index.d.ts` (`<Comp>Props`) … ≤1.5 MB total".
- **`components/<Comp>/preview.html`**. Its line 1 is the marker `<!-- @dsCard group="…" height=N -->`, and the file is "≤256 KB". From `format.md`: "The frame has preloaded tokens.css, bundle.css, the libraries, bundle.js (`window.<namespace>`) and set `<html data-theme="<first theme id>">`".
- **`components/<Comp>/README.md`**. `format.md`: "first sentence = the manifest `summary` … ≤64 KB".
- **The design-sync folder layout.** `format.md` maps it automatically: "design-sync's two-level `components/<group>/<Comp>/<Comp>.html|.prompt.md|.d.ts` → `components/<Comp>/…` with `group` written into the marker".
- **React 18.** `format.md`: "make.ts copies react + react-dom 18.3.1 in". `SKILL.md`: "Listed `react`, `react-dom` 18 load from jsDelivr unless in `components/lib/`". The default index example has `"libraries":[{"name":"react","version":"18"},{"name":"react-dom","version":"18"}]`. `from-code.md`: "(it goes in the index's `libraries` here; React 18)".
- **Other libraries.** `format.md`: "any other must be here, listed `{"name","version","global","file"}`, else static … ≤2 MB each".

### 4. Gotchas

- **DTCG maps are unreadable.** `SKILL.md`: "A name-to-value MAP (the DTCG / W3C token format, `{"color":{"brand":{"$value":"#f00"}}}`) is valid JSON the page CANNOT read: the family shows empty and its entries leave the file at the person's first token edit." `format.md`: "Make lists first."
- **Colour values that drop.** `SKILL.md`: "AVOID, each drops: named colours (`red`, `transparent`, `currentColor`), `var()`, `color-mix()`, an alias of a missing token or of itself." `format.md` lists what is accepted: "`rgb()/rgba()/hsl()/hsla()/oklch()/oklab()/lab()/lch()/color()` with plain numeric arguments".
- **Alias limits.** `format.md`: "An alias of a missing token, of itself, a cycle or a chain over 16 deep drops."
- **`light-dark()`.** None of the four type files mention it (a search for "light-dark" found 0 matches). It is not in the accepted list, and it takes colour arguments rather than "plain numeric arguments". Our reading is that it would drop. That is an inference, not a quote.
- **Missing theme values.** `SKILL.md`: "a token missing a theme's value inherits the FIRST theme's, so put the primary theme first".
- **Names.** `format.md`: "`^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$` … every family but type shares ONE `--name` namespace (a duplicate drops)". `SKILL.md` adds: "(no space, no `/`)".
- **Shadows and other families.** `format.md`: "no `var()`/`url()`; ≤400" for shadows. Other families: "plain CSS values … single values, not composites". It also says: "No motion family."
- **Caps.** `format.md`: "≤8 themes, ≤600 colors, ≤4096 fonts, ≤12 families, ≤12 type groups / ≤80 styles, ≤60 tokens per other family". `SKILL.md`: "a system 1,008 files and 256 MiB, one file ≤15 MiB, one call 16 MiB". The per-file caps are in section 3.
- **Refused paths.** `format.md`: "Refused: … `node_modules`, toolchain/agent manifests at any depth (`package.json`, lockfiles, `bunfig.toml`, `tsconfig.json`, …)".
- **Components that carry their own token scope.** `craft.md`: "Where a system's components wrap themselves in an element the tokens are declared on, the page's values cannot reach inside".
- **Standalone site closure.** The changelog (2.1.302) says: "Added a notice to `/design-sync` and `/design-login` that standalone Claude Design (claude.ai/design) closes by December 14, 2026".

## What this means for packages/tokens and packages/ui

These follow from the quotes above. They are proposals, not decisions.

### packages/tokens

- **Emit an extra `tokens.json` in the artifact's shape.** Our DTCG 2025.10 source is exactly the "name-to-value MAP" that the page "CANNOT read". `/design-sync` may convert it when it reads the repo; step 4 lists DTCG as a source it reads. Even so, the only lossless path is the rule "A `tokens.json` already in this format: copy it." A Style Dictionary 5 custom format could output:
  - `color.themes` as `light` first, then `dark`;
  - `color.tokens` with per-theme values and `{alias}` references to other colour tokens;
  - `spacing`, `radius` and `shadow` lists;
  - `type.groups` and `type.families`.
- **Resolve every value.**
  - Colours must be hex, `oklch()` and similar, or `{alias}`. No `var()`, `color-mix()`, `transparent` or `currentColor`.
  - Lengths and shadows must be literals.
  - Any `color-mix()` must be pre-computed by Style Dictionary.
- **Don't feed it `light-dark()`.** Our runtime CSS uses `light-dark()`. The artifact wants one value per theme, and its `tokens.css` switches themes with `[data-theme]`. So the artifact export should come straight from the DTCG light and dark mode values, not from our compiled CSS. If `/design-sync` reads our CSS instead, a `light-dark()` value probably falls into the drop or skip cases (inference). Mitigation: point the sync at the artifact-shaped JSON.
- **Prefix and names.** "`--name` → the name as written (minus `--`…)". Keeping `ab-` in names keeps the variables the same as `--ab-*` in our CSS. Names must match `[A-Za-z0-9_.-]` (no `/`) and stay under 64 characters, and every name must be unique across all families.
- **Tiers.** The page has no tier concept. Colours are "ONE flat list", and divider rows come from "name stems". We can either export semantic plus component tokens as aliases of primitives, or export resolved values. Both work. The open choice is how much of the primitive tier to show, given the 600-colour cap.
- **Theme selector.** Previews get `<html data-theme="<first theme id>">`. If our components rely on `light-dark()` with `color-scheme`, previews will only follow the artifact's theme switch if the `bundle.css` we ship maps `[data-theme="dark"]` to `color-scheme: dark`, or if we let the artifact's `tokens.css` supply the variables. The second option is preferred because of "One source for every value". This is an inference to verify.

### packages/ui

- **Build a separate preview bundle.** It is a classic IIFE script that assigns `window.<Namespace>` (for example `window.AbUI`). It treats `react`, `react-dom` and `react/jsx-runtime` as the `window.React`/`ReactDOM` globals, and it ships with `bundle.css` (the CSS Modules output, concatenated) and `index.d.ts`. This is a dev and build artifact only. It does not change our ESM, RSC-safe package exports.
- **React 18 by default.** Previews load React 18 unless `components/lib/` carries other libraries. To preview against React 19.3, ship react and react-dom 19 builds as `components/lib/*.js` with their globals listed in the index `libraries`. The type allows this ("any other must be here, listed `{"name","version","global","file"}`"). Alternatively, keep preview components free of React-19-only APIs. Whether 19 UMD/IIFE builds exist is not covered by these sources.
- **CSS Modules.** Class names must be stable in the bundled `bundle.css`. They also must not redeclare `--ab-*` variables on a wrapper element. Otherwise the artifact's token values "cannot reach inside" (`craft.md`).
- **Docs per component.** Each component wants a `README.md` whose first sentence is its summary, and `<Comp>Props` interfaces in `index.d.ts`. `*.stories.*` files help, because a preview's group comes from "its story title's first segment".

## Open questions

1. **`DesignSync` tool.** It was not available in this session ("No matching deferred tools found"), so its description and parameters are not found.
2. **Where `/design-sync` uploads.** `commands.md` says it uploads to the standalone claude.ai/design site, which closes on 2026-12-14. `from-code.md` describes it publishing a claude.ai artifact with `"editing": "code"`. These sources do not say which behaviour the current CLI has.
3. **How it reads DTCG.** Does `/design-sync` read DTCG 2025.10 directly, including the `$extensions` and mode shape for light and dark, or only CSS? Not found. Step 4 lists DTCG as an accepted source, but gives no mapping for DTCG modes.
4. **Exact `/design-sync` steps and size behaviour.** The type defers to "its own steps", which were not available, beyond "can take a few hours on a large repo".
5. **`light-dark()`.** Not mentioned anywhere. The "drops" conclusion above is an inference from the accepted-value grammar.
6. **Previews on React 19.** Whether React 19 can be used for previews through `components/lib/` in practice, given that `make.ts` copies 18.3.1 in, was not verified.
