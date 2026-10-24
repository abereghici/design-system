---
name: ui-stories
description: Rules for packages/ui stories, docs pages and Storybook helpers. Use when writing or changing a `*.stories.tsx`, a `.storybook/docs/` page, or a `.storybook/` helper.
---

A story file has three readers: the docs page, the Vitest run (every story is a test, axe included) and the screenshot projects. Check each story, proof, docs page and helper you add against every rule below. A need no rule covers is a new convention: log it in open-questions.md before it ships.

## Where things live

- `src/<name>/<name>.stories.tsx` sits beside the component. `src/` holds no MDX and no story helpers.
- Guides and foundations are MDX in `.storybook/docs/<topic>/`, attached with `<Meta of={…}>`. Their blocks, stories and proofs sit in the same folder, and the meta carries `tags: ["!autodocs"]` because the MDX page replaces autodocs.
- Shared helpers live under `.storybook/` by purpose: `test/` (proof helpers, setup files), `screenshots/`, `docs/`, and `decorators/` or `components/` once a second story needs one. `src/` imports them as `#.storybook/<path>.<ext>`, extension included. Lint rejects relative paths into `.storybook`.
- Harness code imports components as a consumer does: `@platform/ui/<name>`.
- Titles are `Foundations/<Page>`, `Components/<Name>`, `Components/Guides/<Topic>` or `Recipes/<Family>`. A new top-level section or Foundations page gets its place in `storySort.order` (`.storybook/preview.tsx`) in the same change.

## File order

1. imports
2. fixtures for this file only
3. `const meta = preview.meta({ title, component, args, parameters })`
4. `export const Default = meta.story({})`, then its `.test()` proofs
5. any other docs story, each followed by its proofs

## Docs stories

- `Default` is first and is driven by `args` alone. The meta's `args` holds every required prop and an `fn()` for every callback.
- Add another docs story only for what Controls can't show: structure in `render`, context from a decorator, or state logic. Name it for what it adds (`InAForm`, `Controlled`, `InheritsColor`). A value a reader gets by changing a control is shown by that control.
- Context (a form, a surface, a coloured host) is a decorator. `render` draws the component alone.
- A controlled story's `render` is a local component that holds the value in React `useState`, seeded from `args`, and calls `args.onX` on every change.
- Snippets are generated (`docs.source.type: "dynamic"` in preview). Never write `docs.source.code`.

## Prose: one home per subject

- A prop's meaning: its TSDoc, which the Controls table shows. Write TSDoc only for a meaning or a critical why.
- The component: one paragraph in the meta's `parameters.docs.description.component`, saying what it is and when to use a sibling instead.
- A structural docs story: one line in `parameters.docs.description.story`.
- Anatomy, states, keyboard map and accessibility notes (screen-reader pass included): the `## Anatomy`, `## States`, `## Keyboard` and `## Accessibility` sections of `packages/ui/specs/<kebab-name>.md`. The DocsPage (`.storybook/docs-page.tsx`) renders them under the Controls table. Keep them current in the spec and never copy them into a story.

## Proofs

- A proof is `Story.test("present-tense fact", fn)`, never an exported story. A state Controls can reach (disabled, a label, a Theme, a locale) is a test with annotations: `Default.test("…", { args: { disabled: true } }, fn)`. `globals`, `render` and `beforeEach` work the same way. Axe still runs on it.
- Assert what users or AT perceive: role and name, focus, ARIA state, callbacks through `args.onX`, `ab-*` events through `listen()` from `#.storybook/test/listen.ts`, and computed colours against literals resolved from the token source.
- Prove each proof can fail: break the code once and watch it go red.

## Tags

| Story                                     | `tags`            |
| ----------------------------------------- | ----------------- |
| docs story                                | none              |
| meta whose page is an MDX file            | `["!autodocs"]`   |
| a story the screenshot projects must skip | `["!screenshot"]` |

Write tags inline where the story is declared. Preview gives every story `autodocs` and `screenshot`.
