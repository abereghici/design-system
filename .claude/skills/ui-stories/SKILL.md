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
- Titles are `Introduction`, `Guides/<Page>`, `Foundations/<Page>` and `Components/<Category>/<Name>`. A new guide or foundation page gets its place in `storySort.order` (`.storybook/preview.tsx`) in the same change; categories and components sort alphabetically.
- Categories: Actions (Button, IconButton, SegmentedControl, Toolbar) · Containers (Accordion, Card, ScrollArea, Separator, Table) · Feedback (Alert, Badge, EmptyState, Meter, Progress, Skeleton, Spinner, StatusDot, Tag, Toast, Toaster) · Forms (Calendar, Checkbox, Combobox, DateField, DatePicker, DropZone, Field, Fieldset, FileTrigger, Form, NumberField, PasswordField, RadioGroup, Select, Slider, Switch, TextArea, TextField) · Images and icons (Avatar, Icon, Logo) · Navigation (Breadcrumbs, Link, Navbar, Pagination, Sidebar, SkipLink, Tabs) · Overlays (AlertDialog, Command, ContextMenu, Dialog, DropdownMenu, Popover, Sheet, Tooltip) · Typography (Heading, Kbd, Text) · Utilities (Provider, VisuallyHidden). A component outside this list needs a category precedent (Atlassian, Canvas Kit, Carbon) named in the PR.

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
- The component: one paragraph of TSDoc on the exported component (`Root` for a compound), saying what it is and when to use a sibling instead. The `Description` block renders it; never set `parameters.docs.description.component`.
- A structural docs story: one line in `parameters.docs.description.story`.
- Anatomy, states, keyboard map and accessibility notes (screen-reader pass included): the `## Anatomy`, `## States`, `## Keyboard` and `## Accessibility` sections of `packages/ui/specs/<kebab-name>.md`. The DocsPage (`.storybook/docs-page.tsx`) renders them under the Controls table. Keep them current in the spec and never copy them into a story.

## Proofs

- A proof is `Story.test("present-tense fact", fn)`, never an exported story. A state Controls can reach (disabled, a label, a Theme, a locale) is a test with annotations: `Default.test("…", { args: { disabled: true } }, fn)`. `globals`, `render` and `beforeEach` work the same way. Axe still runs on it.
- Assert only what users or AT perceive (role and name, focus, keyboard, ARIA state, visible text) and the public API (callbacks through `args.onX`, `details`, `ab-*` events through `listen()` from `#.storybook/test/listen.ts`). Query by role and name; act with `userEvent`. Visuals belong to the screenshots: never assert computed styles against token literals, class names, DOM shape beyond the accessibility tree, or internal state. One exception is the override contract: unlayered app CSS with its own literal beats the component.
- Input the platform honours only when trusted (light dismiss, close watchers and Escape, `:focus-visible`, user activation) comes from `const user = await trusted()` (`#.storybook/test/trusted.ts`), Playwright's real input; `userEvent` is synthetic. A floating-layer meta sets `beforeEach: parkPointer` so hover never leaks between proofs.
- Prove each proof can fail: break the code once and watch it go red.

## Tags

| Story                                     | `tags`            |
| ----------------------------------------- | ----------------- |
| docs story                                | none              |
| a story the screenshot projects must skip | `["!screenshot"]` |

Write tags inline where the story is declared. Preview gives every story `autodocs` and `screenshot`. `.test()` proofs are hidden from the sidebar by `main.ts` `tags._test` (exclude); never tag a proof `!dev`.

## Theming, direction and lint

- Theme and Direction are toolbar globals that `applyGlobals()` (`.storybook/globals.tsx`) applies to `<html>`, for the canvas and every docs page. A story never sets `data-theme` or `dir` itself; a test passes `{ globals: { theme: "dark" } }`.
- No `oxlint-disable*` comments anywhere.
