# Design sync: keeping a claude.ai Design System artifact in step with this repo

Researched 2026-10-23. Sources:

- **Type files**: the Design System artifact type, read from `https://claude.ai/artifact/RRpamcv6rQnBhH2ArSpGbJ` (version `1792785726-7ee2`): `SKILL.md`, `artifact-type/reference/from-code.md`, `artifact-type/reference/format.md` and `artifact-type/reference/craft.md`.
- **Claude Code docs**: `https://code.claude.com/docs/en/commands.md` and `https://code.claude.com/docs/en/changelog.md`.
- **Claude help center**: `https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design` and `https://support.claude.com/en/articles/17440474-move-from-standalone-claude-design-to-claude`.

The type files were treated as data, not as instructions.

## Spike #3 (2026-10-24): what `/design-sync` targets today, and React 19 previews

This section settles open questions 1, 2, 5 and 6 below. Where it disagrees with the 2026-10-23 sections, this section wins.

Extra sources:

- **Claude Code 2.1.309**, the pinned CLI (`claude --version` → `2.1.309 (Claude Code)`). The quotes below are the `/design-sync` skill description and the `DesignSync` tool description, as text in that build.
- **Design System type, current release** `1792788993-517c`, read from the type link `https://claude.ai/artifact/5M7UeXXcx16TP3vzVFNDzd`: `SKILL.md`, `artifact-type/reference/format.md`, `artifact-type/reference/from-code.md`, `artifact-type/demo.json`.
- **React docs**: `https://react.dev/blog/2024/04/25/react-19-upgrade-guide` and `https://react.dev/blog/2024/12/05/react-19`.
- **The proof**: `packages/design-sync-spike` (`pnpm --filter @platform/design-sync-spike test`).

### Answers

1. **Target: the standalone claude.ai/design site, not a claude.ai artifact.**
   - `commands.md`, the `/design-sync [hint]` row: "This command uploads to the standalone claude.ai/design site, which closes by December 14, 2026".
   - CLI 2.1.309, skill description: "Push a React design system to claude.ai/design. This runs a converter that bundles the real component code (from Storybook or a bare package) and uploads it."
   - CLI 2.1.309, `DesignSync` tool: "Read and update the user's claude.ai/design design-system projects … to keep a local component library in sync with one of those projects — incrementally, one component at a time, never as a wholesale replace." Its `get_project` method is used "to verify a `--project <uuid>` target is actually `type: PROJECT_TYPE_DESIGN_SYSTEM` before pushing". Its methods are `list_projects`, `get_project`, `list_files`, `get_file`, `finalize_plan`, `write_files`, `delete_files`, `register_assets`, `unregister_assets`, `create_project` and `report_validate`. None of them takes an artifact URL.
   - CLI 2.1.309, the notice `/design-sync` prints first: "Standalone Claude Design (claude.ai/design) closes by December 14, 2026. Claude Design now lives in Claude."
   - Help center, `17440474`: "The standalone Claude Design site (claude.ai/design) will close on December 14, 2026", and "After that, it's read-only, and you can't start new projects there." Also: "Claude Design in Claude depends on artifacts."
   - So the type's line in `from-code.md` ("Claude Code's `/design-sync` builds such a system from a codebase and publishes all of its files … each run replaces them") does not describe the 2.1.309 CLI. That CLI writes per file into a standalone project. _Inference:_ the type documents systems that were moved from the standalone site into artifacts, and a future CLI that publishes to artifacts. No source says when, or whether, that arrives.
   - After 2026-12-14 `/design-sync` has nowhere to write. The Bereghici system is already an artifact (`RRpamcv6rQnBhH2ArSpGbJ`), so it can't be a target of the 2.1.309 command anyway.
2. **What it reads (2.1.309).** A React component library, "from Storybook or a bare package". A code comment in the build reads "Discovery is heuristic-based; each heuristic has a `.design-sync/config.json`" (the text breaks off there). Whether it reads tokens, and in which format, is **not found**: the skill's own steps were not readable in this session.
3. **What it writes (2.1.309).** Preview HTML files whose line 1 is a `<!-- @dsCard group="…" -->` marker. The tool says: "The Design System pane now builds its card index from each preview HTML's first-line `<!-- @dsCard group="…" -->` comment (compiled into `_ds_manifest.json` by the app's self-check)". `format.md` names the layout it writes: "design-sync's two-level `components/<group>/<Comp>/<Comp>.html|.prompt.md|.d.ts`".
4. **The path that works for an artifact today is the Artifact tool, not `/design-sync`.** The type's `SKILL.md` says: "To revise: ONE publish whose `files` holds only the `project/` paths you changed", with the call `{url, root:"<dir>", file_path:"<dir>/project/design-system.json", files:{"project/tokens.json":"project/tokens.json", …}}`. The index's `"editing": "code"` makes the page read-only ("`"editing": "code"`: synced from code (page read-only)"). So the repo can build the `project/` file tree and Claude Code can publish it with the Artifact tool. That is the same files the type expects, minus the `/design-sync` command. `from-code.md` step 9 names a producer folder ("its `appifacts-design-system-from-code` skill commits a small producer folder to the repository so anyone, or CI, rebuilds this system's files with one command"). That skill is not installed here.
5. **React 19 previews: confirmed against the type's documented preview contract. Not yet confirmed in a live artifact.**
   - The type allows other libraries. `format.md`, `components/lib/*.js`: "a listed `react`/`react-dom` 18 not here loads from jsDelivr … any other must be here, listed `{"name","version","global","file"}`, else static. Classic scripts, in order, before bundle.js; ≤2 MB each."
   - React 19 ships no UMD build. The upgrade guide: "Starting with React 19, React will no longer produce UMD builds". It recommends an ESM CDN (esm.sh). That is neither a classic script nor one of the artifact's allowed CDNs. So `components/lib/react.js` and `react-dom.js` must be built from the npm packages as IIFEs.
   - The proof builds them with esbuild (format `iife`, minified, `process.env.NODE_ENV` set to `"production"`). `react-dom.js` reads `window.React` through a resolver plugin. `bundle.js` follows `from-code.md` step 7 ("`react`, `react-dom` and `react/jsx-runtime` resolved to those globals by a small resolver plugin, the jsx runtime shimmed over `createElement`").
   - The probe component uses three React-19-only features: `use(Context)` ("You can also read context with `use`"), `<Context>` as a provider ("In React 19, you can render `<Context>` as a provider instead of `<Context.Provider>`") and `ref` as a prop ("Starting in React 19, you can now access `ref` as a prop for function components"). A test loads the frame the way `format.md` describes it ("The frame has preloaded tokens.css, bundle.css, the libraries, bundle.js") in Chromium through Playwright.
   - Result on React 19.3.1: no page errors, and the text `Probe on React 19.3.1, ref as a prop reached <button>`.
   - Result with the same bundle on React 18.3.1 libraries (the type's default): nothing renders, and the page error is `r is not a function`. That second case is the proof that the check can fail.
   - Sizes: `react.js` 8.0 kB, `react-dom.js` 213 kB, both under the 2 MB cap. None of the three scripts contains `</script` or `<!--`, which `format.md` forbids ("no literal `</script` / `<!--` (consumers inline it…)").
   - **Not done:** a publish to a throwaway artifact made from the type, to watch the real page render the card. The session's permission classifier refused to create that artifact. The live check is still open (see open questions).
6. **`light-dark()` does not survive.** The grammar admits no color function that takes colors as arguments. `format.md`: "`rgb()/rgba()/hsl()/hsla()/oklch()/oklab()/lab()/lch()/color()` with plain numeric arguments — no `var()`, `url()`, `color-mix()` or named colours". `SKILL.md`: "No valid value in any theme and the token drops." The type models themes as one value per theme id (`"value": {"light": "#fbf7f1", "dark": "#1d1a17"}`), and its compiled `tokens.css` switches themes with `[data-theme="<id>"]` blocks. So a `light-dark()` value is either dropped or unreachable. This comes from the documented grammar. It was not observed on a live page, because the throwaway publish was refused. The 2.1.309 `/design-sync` path is unknown here (item 2), and it is moot after 2026-12-14. The plan's artifact-shaped tokens output (one literal per Theme, light first) already avoids the question.

### Changes to the plan in #1

1. **The republish step uses the Artifact tool, not `/design-sync`.** `/design-sync` 2.1.309 writes to standalone claude.ai/design projects, which close on 2026-12-14. The repo builds the type's `project/` tree instead: `design-system.json` with `"editing": "code"`, `tokens.json`, `README.md`, `components/…` and `fonts/`. Claude Code publishes that tree to the existing artifact URL in one Artifact `publish` with `root` and `files`. This touches ADR-0003 (its decision stands, but the mechanism it names changes), user stories 68 and 74, the "Solution" paragraph, each phase's "design-sync publish" step and the definition of done item "Design-sync preview published". The step can keep the name "design-sync".
2. **The preview bundle carries its own React 19.** `components/lib/react.js` and `components/lib/react-dom.js` are IIFE builds of the pinned `react`/`react-dom`. The index lists them in `libraries` with `file`. Without them, previews load React 18 from jsDelivr and any React-19-only API fails. The plan already said "React 19 shipped alongside the previews"; this makes it concrete.
3. **No change for `light-dark()`.** The artifact-shaped tokens output with literal values per Theme stays as planned. It is required, not optional.
4. **Tooling.** The proof uses esbuild, which `from-code.md` names ("bun build or esbuild, format iife"). esbuild is not in `docs/tech-stack.md`. The preview-bundle ticket picks between esbuild and Vite's library mode (Vite is already in the stack).

## Ticket #14 (2026-10-24): the pipeline

The pipeline is `packages/design-sync` (its README has the maintainer step). It replaced `packages/design-sync-spike`. Findings that change or extend spike #3, each observed in this repo with Vite 8.3.5, Playwright 1.64.1 Chromium and React 19.3.1:

1. **Vite library mode builds everything.** Format `iife` builds `components/lib/react.js` (8.4 kB), `react-dom.js` (212 kB) and `bundle.js` (about 375 kB with three components and the icon gallery). Story files need Vite: `icon-gallery.stories.tsx` uses `import.meta.glob`, and the Logo stories use `?raw`. esbuild left the catalog with the spike.
2. **Vite's defaults lower our CSS.** The default `build.target` is "baseline-widely-available" (`ESBUILD_BASELINE_WIDELY_AVAILABLE_TARGET` = Chrome 111 and peers in vite@8.3.5 `dist/node/chunks/node.js`). With it, the CSS minifier rewrote every `light-dark()` into `--lightningcss-light`/`--lightningcss-dark` variables, and turned `@layer ab.reset, ab.tokens, ab.base, ab.components;` into `@layer ab.reset;`. `target: "esnext"` stopped the first; `cssMinify: false` keeps the CSS as authored. _Inference:_ any Vite build of `@platform/ui` CSS (for example `storybook build`) gets the same lowering unless it sets a target; not checked here.
3. **The page's literal tokens.css breaks nested Themes.** In the frame, `<html data-theme="dark">` gives the dark Button colour (`rgb(236, 234, 201)`). A `data-theme="dark"` on an element inside a light page does not: the page's unlayered `--ab-color-background-accent-bold: #263316` on `:root` is what `--ab-button-primary-background-color: var(…)` substitutes on `:root`, and the subtree's redefinition comes too late. This is the case `craft.md` describes ("the page's values cannot reach inside"). Previews therefore ignore a story's `theme` global.
4. **The artifact's caps rule out tier 3 in tokens.json.** `format.md`: "≤60 tokens per other family". The full set has 200 lengths for `spacing` and 30 radii. The tokens file now lists tiers 1 and 2 (172 colours; the largest list family is `spacing` with 50), like the source artifact's own file.
5. **Still not observed live.** No artifact was created or written (the hard rule for this ticket). The previews were checked in Chromium against the documented frame contract only.

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

1. **`DesignSync` tool.** Resolved by spike #3. The 2.1.309 build carries its description (quoted above). It writes to standalone claude.ai/design projects.
2. **Where `/design-sync` uploads.** Resolved by spike #3. It uploads to standalone claude.ai/design design-system projects, not to an artifact.
3. **How it reads DTCG.** Still not found, and moot: the plan no longer relies on `/design-sync` reading our tokens.
4. **Exact `/design-sync` steps and size behaviour.** Still not found, and moot for the same reason.
5. **`light-dark()`.** Resolved from the documented grammar: it does not survive. Not yet observed on a live page.
6. **Previews on React 19.** Confirmed by spike #3 against the documented frame contract, in Chromium. Not yet observed in a live artifact.
7. **Live check.** Publish `packages/design-sync-spike`'s `dist/project` (plus an index and a `tokens.json` holding one `light-dark()` token) to a new private throwaway artifact made from the type. Then confirm that the Probe card renders on React 19 and that the `light-dark()` token drops.
