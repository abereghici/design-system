# @platform/design-sync

Builds the "Bereghici Design System" claude.ai artifact (https://claude.ai/artifact/RRpamcv6rQnBhH2ArSpGbJ) from the repo. The artifact is a read-only mirror (ADR-0003): change tokens, components and the brand book here, then republish. Nothing in this package ships to apps; it is dev tooling only.

The step keeps the name "design-sync", but it does not use Claude Code's `/design-sync` command. That command uploads to the standalone claude.ai/design site, which closes on 2026-12-14, and it cannot target an artifact (spike #3, `docs/research/design-sync.md`). Instead this package writes the artifact type's `project/` file tree, and Claude Code publishes it with the Artifact tool, as the type's `SKILL.md` describes ("To revise: ONE publish whose `files` holds only the `project/` paths you changed").

## What it builds

`pnpm build` writes `dist/project/` (the artifact's paths) and `dist/build.json`:

| Path under `project/`                         | From                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `README.md`                                   | `content/README.md`, the brand book (written here, published as is)                                               |
| `components/Cover/preview.html`               | `content/components/Cover/preview.html`                                                                           |
| `tokens.json`                                 | `@platform/tokens` `dist/tokens.json` (the artifact-shaped tokens: tiers 1 and 2)                                 |
| `tokens.css`                                  | Compiled from `tokens.json` in the layout the type's `format.md` gives, plus `@platform/tokens/fonts.css`         |
| `fonts/*.woff2`, `assets/fonts/*-OFL.txt`     | `packages/tokens/fonts/`                                                                                          |
| `assets/icons/*.svg`, `assets/logo/*.svg`     | `packages/ui/assets/` (the READMEs come from `content/assets/`)                                                   |
| `components/lib/react.js`, `react-dom.js`     | React and React DOM from `node_modules`, each bundled as a classic script (React 19 has no UMD build)             |
| `components/bundle.js`, `bundle.css`          | Every `@platform/ui` story file, bundled as one classic script that assigns `window.BereghiciDesignSystem_3cd4fc` |
| `components/index.d.ts`                       | `tsc --emitDeclarationOnly` output of each public entry that has stories                                          |
| `components/<Name>/preview.html`, `README.md` | One card per story file; a README per component                                                                   |

The index, `project/design-system.json`, is written by `pnpm plan`, because it must be merged into the live one (below).

## How components get in

Nothing is listed by hand. A story file (`packages/ui/src/**/*.stories.tsx`) becomes a card:

- The story title gives the card: `"Components/Button"` → group `Components`, card `Button`.
- If the `index.ts` beside it exports that name, the card is a component: it goes in the bundle header and gets `components/Button/README.md`. Otherwise it is a showcase page (`page` in the marker) named after its whole title, so it never takes a component's folder: `Foundations/Logo` → `components/FoundationsLogo/`.
- The README's first paragraph is the component's JSDoc (the artifact shows its first sentence as the summary). A component without a JSDoc comment on its exported function fails the build.
- The preview renders every story of the file, in source order, with the story's `args`, `render` and `dir` global. The `theme` global is not applied: the page's Theme switch shows every story in both Themes (a nested `data-theme` can't reach component tokens computed on `:root` once the page's literal tokens.css loads).
- Story files are bundled with a small stand-in for Storybook (`src/runtime/storybook.ts`), so the artifact never runs Storybook, the test runner or axe. Test bodies are never called.

So a later phase adds a component, its stories and its JSDoc, and the next `pnpm build` picks it up.

## Commands

| Command                                     | Does                                                                                                                                                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build`                                | Writes `dist/project/` and `dist/build.json`. Needs `@platform/tokens` built (`pnpm --filter @platform/tokens build`; turbo does it for `pnpm test`)                                                             |
| `pnpm plan --index <file> --listing <file>` | Merges the live index into `dist/project/design-system.json` and writes `dist/publish.json`, the Artifact calls to make                                                                                          |
| `pnpm test`                                 | Builds the tree into a temp dir and renders every card in Chromium the way the artifact's frame does (tokens.css, bundle.css, the libraries, bundle.js, `<html data-theme>`), plus the plan and tokens.css units |

## Publishing (the maintainer step)

Run after each phase, from the repo root, in Claude Code. Publishing replaces the artifact's files for everyone, so a person runs it.

1. Build: `pnpm --filter @platform/tokens build && pnpm --filter @platform/design-sync build`.
2. Read the live artifact (Artifact tool, nothing is written):
   - `{action: "read", url: "https://claude.ai/artifact/RRpamcv6rQnBhH2ArSpGbJ", path: "project/design-system.json"}`; save the returned JSON to `packages/design-sync/dist/live-index.json`.
   - `{action: "list", url: "https://claude.ai/artifact/RRpamcv6rQnBhH2ArSpGbJ", scope: "files"}`; save the listing text to `packages/design-sync/dist/listing.txt` (rows like `- "project/README.md"  text/markdown  17618 bytes`).
3. Plan: `pnpm --filter @platform/design-sync plan --index dist/live-index.json --listing dist/listing.txt`. It refuses an index without its `createdOnFiles`/`convertedFrom` marker.
4. Publish: for each entry of `dist/publish.json` `calls`, in order, one Artifact publish `{url, root, file_path, files}` with `url` and `root` from the file. A call holds at most 255 paths, and the last one carries the index (`"The index goes ONCE, in the LAST call of your work"`, SKILL.md). `null` in `files` removes that path.
5. Open the artifact and check the Components view and the Overview.

What a publish changes: every generated path is written. Under the managed paths (`components/`, `assets/icons/`, `assets/logo/`, `assets/marks/`, `assets/fonts/`, `fonts/`, `tokens/`, `scripts/`, `tokens.json`, `tokens.css`, `README.md`), a published file the tree doesn't have is removed: the prototype component code, the old guides and previews, the old `marks` group and the old token exports. Everything else stays as it is (`guidelines/`, `explorations/`, `uploads/`, `archived/`, `assets/notes/`). The index keeps every key and the marker, and gets `"editing": "code"` (page read-only), the React 19 `libraries`, the asset groups and a `lastChange`.

## Choices

- **Vite library mode, format `iife`** builds both the libraries and the bundle (Vite is the stack's build tool; the type's `from-code.md` names esbuild or bun, and Vite's story-file features, `import.meta.glob` and `?raw`, need Vite). `process.env.NODE_ENV` is defined because library mode leaves `process.env.*` alone "so that consumers of your library can dynamically change it" (vite.dev/guide/build, Library Mode).
- **No lowering, CSS unminified.** With Vite's default target (Chrome 111 and peers) Lightning CSS rewrote `light-dark()` into `--lightningcss-light` fallbacks and cut the `@layer ab.reset, ab.tokens, ab.base, ab.components` statement down to `@layer ab.reset` (observed). The build sets `target: "esnext"` and `cssMinify: false`.
- **React** is resolved to `window.React`/`window.ReactDOM` by a resolver plugin, the JSX runtime shimmed over `createElement`, as `from-code.md` step 7 asks.
- **bundle.css carries the full token set** (`@platform/tokens/tokens.css` through `.storybook/preview.css`). The page's `tokens.css` holds tiers 1 and 2 as literals and loads first; both say the same values, and the component tokens come only from bundle.css. `@platform/tokens/fonts.css` is aliased to an empty sheet in the bundle: tokens.css already declares the faces, and library mode inlined each woff2 as a data URI (700 kB, observed).
