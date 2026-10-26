---
name: ui-stories
description: Rules for packages/ui stories, docs pages and Storybook helpers. Use when writing or changing a `*.stories.tsx`, a `.storybook/docs/` page, or a `.storybook/` helper.
---

A story file has three readers: the docs page, the Vitest run (every story is a test, axe included) and the screenshot projects. Check each story, proof, docs page and helper you add against every rule below. A need no rule covers is a new convention: log it in open-questions.md before it ships.

## Where things live

- `src/<name>/<name>.stories.tsx` sits beside the component. `src/` holds no MDX and no story helpers.
- The introduction, guides and foundations are unattached MDX in `.storybook/docs/` (`introduction.mdx`, `guides/`, `foundations/`) with `<Meta title>` and no story file. Token visuals use the `ColorPalette`, `Typeset` and `IconGallery` Doc Blocks, otherwise `TokenTable` or `ContrastTable` from `.storybook/docs/blocks/`. Values come from `@platform/tokens/tokens.json` (motion from the token source), never typed by hand. A live example is `<Canvas of={…}>` of an existing component story.
- Shared helpers live under `.storybook/` by purpose: `test/` (proof helpers, setup files), `screenshots/`, `docs/`, and `decorators/` or `components/` once a second story needs one. `src/` imports them as `#.storybook/<path>.<ext>`, extension included. Lint rejects relative paths into `.storybook`.
- Harness code imports components as a consumer does: `@platform/ui/<name>`.
- Titles are `Introduction`, `Guides/<Page>`, `Foundations/<Page>` and `Components/<Name>`, with no category level: components sort A to Z (`storySort` `method: "alphabetical"`). A new guide or foundation page gets its place in `storySort.order` (`.storybook/preview.tsx`) in the same change.

## File order

1. imports
2. fixtures for this file only
3. `const meta = preview.meta({ title, component, subcomponents, argTypes, args, parameters })`; a compound passes `subcomponents: partsOf(Namespace)` (from `#.storybook/preview.tsx`), which gives each part a props tab and its namespace in the snippet (`<Dialog.Trigger>`)
4. `export const Default = meta.story({})`, then its `.test()` proofs
5. any other docs story, each followed by its proofs

## Docs stories

- `Default` is first and is driven by `args` alone. The meta's `args` holds every required prop and an `fn()` for every callback.
- Add another docs story only for what Controls can't show: structure in `render`, context from a decorator, or state logic. Name it for what it adds (`InAForm`, `Controlled`, `InheritsColor`). A value a reader gets by changing a control is shown by that control.
- Context (a form, a surface, a coloured host) is a decorator. `render` draws the component alone.
- A controlled story's `render` is a local component that holds the value in React `useState`, seeded from `args`, and calls `args.onX` on every change. Pass it directly (`render: ControlledSelect`), so the snippet shows the JSX it returns rather than its name.
- Snippets are generated (`docs.source.type: "dynamic"`), and the preview's `transform` (`.storybook/docs/source.ts`) adds the public imports and compound namespaces. Write `docs.source.code` only where the dynamic snippet can't show the code (a `lazy()` import), with the reason in the commit.

## Prose: one home per subject

- A prop's meaning: its TSDoc, which the props table shows. Every public prop gets one short line on why or when to use it, in plain words: no element names, ARIA attributes, token names, pixel values or browser-engine notes. Where react-docgen can't read a prop (taken through `Pick<>` or a union of object types), the meta's `argTypes` gives the row (`textFieldArgTypes` in `.storybook/docs/arg-types.ts`).
- The component: one paragraph of TSDoc on the exported component (`Root` for a compound): what it is for, what a consumer must provide (a name, a label), the keyboard behaviour a user perceives, and when to use a sibling instead. The `Description` block renders it; never set `parameters.docs.description.component`.
- A structural docs story: one line in `parameters.docs.description.story`.
- `packages/ui/specs/<kebab-name>.md` is the internal design record (anatomy, states, keyboard map, screen-reader pass). Docs pages never render it: what a consumer needs moves into the component's TSDoc.

## Controls

- Controls: the preview's `meaningfulControls` enhancer keeps a control only for booleans, enums, numbers and text, and hides it for objects, elements, callbacks, `default*` props and wiring (`asChild`, `ref`, `className`, `style`, `name`, `form`, `htmlFor`). The row and its TSDoc stay. Override in the meta's `argTypes` only when docgen can't type a prop.

## Proofs

- A proof is `Story.test("present-tense fact", fn)`, never an exported story. A state Controls can reach (disabled, a label, a Theme, a locale) is a test with annotations: `Default.test("…", { args: { disabled: true } }, fn)`. `globals`, `render` and `beforeEach` work the same way. Axe still runs on it.
- Assert only what users or AT perceive (role and name, focus, keyboard, ARIA state, visible text) and the public API (callbacks through `args.onX`, `details`, `ab-*` events through `listen()` from `#.storybook/test/listen.ts`). Query by role and name; act with `userEvent`. Visuals belong to the screenshots: never assert computed styles against token literals, class names, DOM shape beyond the accessibility tree, or internal state. One exception is the override contract: unlayered app CSS with its own literal beats the component.
- Input the platform honours only when trusted (light dismiss, close watchers and Escape, `:focus-visible`, user activation) comes from `const user = await trusted()` (`#.storybook/test/trusted.ts`), Playwright's real input; `userEvent` is synthetic. A floating-layer meta sets `beforeEach: parkPointer` so hover never leaks between proofs.
- A veto is `details.cancel()` in the `on…Change` callback; prove it there. A consumer's `preventDefault()` in `onClick` keeps only its native meaning, so a proof never uses it to stop a change.
- Prove each proof can fail: break the code once and watch it go red.

## Tags

| Story                                     | `tags`            |
| ----------------------------------------- | ----------------- |
| docs story                                | none              |
| a story the screenshot projects must skip | `["!screenshot"]` |
| a story whose accessibility tree is empty | `["!aria-snapshot"]` |

Write tags inline where the story is declared. Preview gives every story `autodocs`, `screenshot` and `aria-snapshot`; an empty aria snapshot matches any tree, so it proves nothing. `.test()` proofs are hidden from the sidebar by `main.ts` `tags._test` (exclude); never tag a proof `!dev`.

## Theming, direction and lint

- Theme and Direction are toolbar globals that `applyGlobals()` (`.storybook/globals.tsx`) applies to `<html>`, for the canvas and every docs page. A story never sets `data-theme` or `dir` itself; a test passes `{ globals: { theme: "dark" } }`.
- No `oxlint-disable*` comments anywhere.
