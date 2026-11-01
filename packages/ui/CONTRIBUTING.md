# Contributing to @abereghici/ui

Setup, workspace commands and releases are in the repository's [CONTRIBUTING.md](../../CONTRIBUTING.md). Terms in _italics_ are defined in [GLOSSARY.md](./GLOSSARY.md); architecture decisions are in [docs/adr](../../docs/adr).

## Commands

Run them from `packages/ui`, or from the root with `pnpm --filter @abereghici/ui <script>`.

| Command                         | What it does                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm storybook`                | Storybook on http://localhost:6006                                            |
| `pnpm test`                     | Every story as a browser test (axe and aria snapshots included), plus scripts |
| `pnpm test:watch`               | The same, in watch mode                                                       |
| `pnpm size`                     | Each subpath's size budget (`.size-limit.ts`)                                 |
| `pnpm build`                    | `dist/` through tsdown, as npm consumers get it                               |
| `pnpm test:screenshots:docker`  | The screenshot tests, in the Playwright image CI uses (Linux only)            |
| `pnpm icons`                    | Regenerates `src/components/icon/icons/` from `assets/icons/`                 |
| `pnpm check-types`, `pnpm lint` | tsc and oxlint                                                                |

## Project structure

```text
src/
├── components/<name>/   # one public Component per folder: @abereghici/ui/<name>
├── feedback-event/      # @abereghici/ui/feedback-event: the types of the ab-* feedback events
├── text-direction/      # @abereghici/ui/text-direction: getTextDirection, a language's ltr or rtl for <html dir>
└── internal/            # shared by Components, never exported
    ├── components/      # private Components and their Parts: Flex, Listbox, Menu, Picker, SegmentField
    ├── i18n/            # locale, dates and numbers
    ├── interactions/    # pointer, keyboard and IME input; a button that stays focusable while disabled
    ├── overlays/        # popover layers: opening, anchoring, returning focus
    ├── selection/       # choosing among items: typeahead, radio choice, a list of chosen values
    ├── state/           # controllable state and the change requests it reports
    ├── types/           # shared prop types: accessible names, invoker commands
    └── utils/           # React and DOM plumbing: Slot, mergeProps, refs, events, context
.storybook/              # the Storybook harness: decorators, docs pages, fixtures, test and screenshot helpers
scripts/                 # icon generation and the docs checks
```

Public subpaths are folders, never files: `package.json` maps `./*` to `src/components/*/index.ts` (and `dist/components/*/index.js` once published), so `internal/` is unreachable from outside. There is no root entry (ADR-0006, ADR-0007). `internal/` is grouped by concern, as React Aria splits `@react-aria/interactions`, `@react-aria/i18n`, `@react-aria/selection`, `@react-aria/overlays` and `@react-stately/utils`.

## Anatomy of a Component

A Component's folder is flat, one job per file, each file named after its main export:

```text
components/dialog/
├── index.ts               # the public surface: `export * as Dialog`
├── dialog.tsx             # the namespace: each Part under its short name, and their prop types
├── dialog-root.tsx        # one Part per file, `<component>-<part>.tsx`
├── dialog-trigger.tsx
├── dialog-controller.ts   # any other job: `<component>-<job>.ts`
├── dialog.module.css      # its styles, reading its component tokens
├── dialog.stories.tsx     # docs, browser tests and screenshots
├── dialog.test-d.ts       # type tests for the props contract
├── __snapshots__/         # aria snapshots, written by `pnpm test -u`
└── __screenshots__/       # screenshot baselines, written by CI
```

A single-part Component exports itself instead (`button/button.tsx` exports `Button`). State goes in `use-<component>-state.ts`, behaviour in `use-<component>.ts`, a hook for one more job in `use-<job>.ts`. There are no `utils/` or `hooks/` subfolders inside a Component.

## Rules

1. **One module, one job, named after its main export**, or after the concept its exports serve: `merge-props.ts` exports `mergeProps`, `use-hydrated.ts` exports `useHydrated`, `i18n/date.ts` holds the date helpers.
2. **Compose, don't bundle.** A module that needs another imports it: `slot.tsx` imports `merge-props.ts`, which imports `chain.ts` and `compose-refs.ts`. Two jobs never share a file because they share a caller.
3. **Code moves to `internal/<group>/` when a second Component needs it**, into the group that names its concern. A module made of several files gets its own folder (`internal/components/menu/`). `internal/` has no index files: import the module's file.
4. **A context lives with the Component that provides it**: `TabsContext` is in `tabs/tabs-root.tsx`. When the provider builds on the Component that reads it, the context moves to `internal/` so the reader never imports its provider: DropZone builds on FileTrigger (`internal/components/drop-zone-context.ts`), DatePicker on Calendar (`internal/components/picker/picker-context.ts`). A context its Parts can't work without comes from `createSafeContext`, whose hook throws outside the Root.
5. **Split by the deletion test.** Split a piece out when it hides real logic behind a small interface, so deleting it would push that logic back into its callers. A piece whose interface is as big as its body stays inline.
6. **Names follow the major libraries.** A hook takes react-use's name and signature where react-use has one (`useEvent`), else Radix's, React Aria's or Mantine's (`useControllableState`, `createSafeContext`); a prop or Part takes the name Radix, React Aria or Base UI give it (`asChild`, `Slottable`).
7. **Write JSX, not element-returning calls**, except in stories: Storybook's dynamic snippet prints a local component by its name, so a story inlines markup through a plain function to show the code a consumer writes.
8. **Comments are TSDoc or a critical why.** Every public export and prop has TSDoc, which the docs page renders. Anything else gets a comment only for what the code can't say, backed by a link or a test: a spec, a browser bug, an ADR.

## Where each concern lives

| Concern                                                                        | Home                                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `asChild` rendering, and content added inside the child (`Slottable`)          | `internal/utils/slot.tsx`                                                            |
| Merging a Part's props with the consumer's                                     | `internal/utils/merge-props.ts`                                                      |
| Running both handlers in order, the consumer's first                           | `internal/utils/chain.ts`                                                            |
| Running ours after the consumer's handler, unless it called `preventDefault()` | `internal/utils/compose-event-handlers.ts`                                           |
| Giving one element to two refs                                                 | `internal/utils/compose-refs.ts`                                                     |
| A Part's context and its "must be inside" error                                | `internal/utils/create-safe-context.ts`                                              |
| DOM event listeners                                                            | `internal/utils/use-event.ts`, `internal/utils/shared-listener.ts`                   |
| Whether React has hydrated                                                     | `internal/utils/use-hydrated.ts`                                                     |
| Finding an element by id                                                       | `internal/utils/get-by-id.ts`                                                        |
| An accessible name the props require (`AccessibleName`, `Labelled`)            | `internal/types/accessible-name.ts`                                                  |
| `command` and `commandfor` in a button's types                                 | `internal/types/invoker-commands.ts`                                                 |
| A button that stays focusable while disabled                                   | `internal/interactions/use-button.ts`                                                |
| A native checkbox's click                                                      | `internal/interactions/toggle-click.ts`                                              |
| Pointer modality, pointer drags and IME composition                            | `internal/interactions/` (`pointer-marker.ts`, `use-move.ts`, `composition.ts`)      |
| Typeahead, and the text an Item is matched by                                  | `internal/selection/typeahead.ts`, `internal/selection/text-of.ts`                   |
| A native radio group                                                           | `internal/selection/use-radio-choice.ts`, `follow-visual-direction.ts`               |
| A list of chosen values                                                        | `internal/selection/selection.ts`                                                    |
| _Uncontrolled state_                                                           | `internal/state/use-controllable-state.ts`                                           |
| _Change request_; a Component's public details type aliases it                 | `internal/state/change-request.ts`                                                   |
| Snapping a number to its steps                                                 | `internal/state/snap-value-to-step.ts`                                               |
| _Overlay_                                                                      | `internal/overlays/overlay.ts`                                                       |
| _Locale_ and number formatting                                                 | `internal/i18n/` (`locale-provider.tsx`, `use-locale.ts`, `use-number-formatter.ts`) |
| Dates: the one Temporal import (ADR-0004), ranges, and their formats           | `internal/i18n/date.ts`, `internal/i18n/use-date-formats.ts`                         |
| The flex layout Inline and Stack share                                         | `internal/components/flex.tsx`                                                       |
| The icon of each status _Variant_                                              | `internal/components/variant-icons.ts`                                               |
| _Listbox navigator_                                                            | `internal/components/listbox/`                                                       |
| DropdownMenu's and ContextMenu's Items and focus movement                      | `internal/components/menu/`                                                          |
| A date picker's trigger and panel, and the context its Calendar reads          | `internal/components/picker/`                                                        |
| A date or time field's segments                                                | `internal/components/segment-field/`                                                 |
| _Feedback event_: its public types, and dispatching one                        | `feedback-event/feedback-event.ts`, `internal/utils/dispatch-feedback.ts`            |
| _Field control_                                                                | `components/field/use-field.ts`                                                      |

## Adding a Component

1. **Check precedent.** Name it, its Parts and its props as Radix, React Aria or Base UI do, and build on the platform first (ADR-0001, ADR-0002).
2. **Tokens.** Add `packages/tokens/src/tokens/component/<name>.tokens.json` and import its sheet from the Component: `import "@abereghici/tokens/components/<name>.css"`.
3. **Code.** Create `src/components/<name>/` as above. Mark a module that needs the client `"use client"`; everything else stays a Server Component.
4. **TSDoc.** One paragraph on the Component (what it is for, what a consumer must provide, the keyboard behaviour, when to use a sibling instead), ending with its _Tier_ line (ADR-0008); one line per prop.
5. **Stories and tests.** Follow the rules in [`.claude/skills/ui-stories/SKILL.md`](../../.claude/skills/ui-stories/SKILL.md): a `Default` story driven by `args`, proofs as `.test()` on stories, asserting only what users and assistive technology perceive. Add `<name>.test-d.ts` for the props contract.
6. **Budget.** Add the subpath's gzipped budget to `.size-limit.ts`; `pnpm size` fails for a subpath without one.
7. **Fixture route.** Add `apps/ui-next-fixture/src/app/<name>/page.tsx` and its entry in `apps/ui-next-fixture/test/component-routes.json`, which checks the route ships only its own CSS, tokens and client modules; `test/before-hydration.spec.ts` checks it against its Tier before hydration.
8. **Changeset.** Run `pnpm changeset` from the root.

## Before you open a pull request

```sh
pnpm lint && pnpm format && pnpm check-types   # from the root
pnpm test                                      # unit, browser and size-budget tests
pnpm test:packed                               # the fixture app against the packed tarballs
```

Screenshot baselines are Linux-only: CI's visual workflow compares them, and its update workflow rewrites them.
