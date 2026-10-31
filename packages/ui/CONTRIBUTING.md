# Contributing to @abereghici/ui

Setup, checks and releases are in the repository's [CONTRIBUTING.md](../../CONTRIBUTING.md). The terms below are defined in [GLOSSARY.md](./GLOSSARY.md).

## Where code goes

`src/` holds the shipped Components, their CSS, stories and type tests. Each `src/<name>/index.ts` is the public subpath `@abereghici/ui/<name>`. `src/internal/` is shared by Components and never exported: `package.json` maps `./internal/*` to `null`.

### The rule

1. **One module, one job, named after its main export.** Each file does one job and takes its main export's name: `merge-props.ts` exports `mergeProps`, `use-hydrated.ts` exports `useHydrated`. A module that stands alone is a folder holding that one file, named after it (`internal/merge-props/`) or after the concept its hook serves (`internal/hydration/use-hydrated.ts`, `internal/uncontrolled-state/use-controllable-state.ts`). A folder holds several files only when they implement one concept together, such as `internal/listbox/`, `internal/menu/` or `internal/picker/`, or serve one concern without depending on each other, as `internal/interaction/` holds pointer modality, pointer drags and IME composition. Each file in it still does one job.
2. **Compose, don't bundle.** A module that needs another imports it: `slot` imports `merge-props`, which imports `chain` and `compose-refs`; `uncontrolled-state` imports `change-request` and `dom-event`. Two jobs never share a file because they share a caller.
3. **A Component's own code sits flat in its folder**, one file per job, named after its export:
   - each Part in `<component>-<part>.tsx`, one Part per file (`dialog/dialog-title.tsx`);
   - its state in `use-<component>-state.ts` (`search-field/use-search-field-state.ts`);
   - its behaviour in `use-<component>.ts` (`combobox/use-combobox.ts`);
   - a hook for one more job in `use-<job>.ts` (`toaster/use-timers.ts`), and any other job in `<component>-<job>.ts` (`tree/tree-navigation.ts` exports `treeNavigation`, `combobox/combobox-props.ts` exports `comboboxProps`);
   - no `utils/` or `hooks/` subfolders.
4. **A context lives with the Component that provides it**: `TabsContext` is in `tabs/tabs-root.tsx`, and ToggleButton reads `toggle-button-group/toggle-button-group-context.ts`. When the provider builds on the Component that reads its context, the context lives in `internal/` instead, so the reader never imports its provider: DropZone builds on FileTrigger (`internal/drop-zone-context/drop-zone-context.ts`), DatePicker on Calendar (`internal/picker/picker-context.ts`). A context its Parts can't work without comes from `createSafeContext`, whose hook throws when a Part is outside its Root.
5. **Code moves to `internal/<module>/` when a second Component needs it.** `internal/` has no index files: import the module's file.
6. **Split by the deletion test.** Split a piece out when it hides real logic behind a small interface, so deleting it would push that logic back into its callers. Don't split out a piece whose interface is as big as its body: it only passes through.
7. **Hooks take react-use's name**, and its signature where it fits, when react-use has the hook (`useEvent`), else Radix's, React Aria's or Mantine's (`useControllableState`, `createSafeContext`). `drop-zone/use-drop-target.ts` keeps its own name: react-use's `useDropArea` rejects nothing by `accept` and fills no hidden input.

### Where each concept lives

| Concept                                                                        | Home                                                                                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Feedback event                                                                 | `feedback-event/feedback-event.ts`, whose types are public as `@abereghici/ui/feedback-event`                            |
| Change request                                                                 | `internal/change-request/change-request.ts`; a Component's public details type aliases it (`CheckboxChangeEventDetails`) |
| Uncontrolled state                                                             | `internal/uncontrolled-state/use-controllable-state.ts`                                                                  |
| A Part's context and its "must be inside" error                                | `internal/create-safe-context/create-safe-context.ts`                                                                    |
| `asChild` rendering                                                            | `internal/slot/slot.tsx`                                                                                                 |
| Merging a Part's props with the consumer's                                     | `internal/merge-props/merge-props.ts`                                                                                    |
| Giving one element to two refs                                                 | `internal/compose-refs/compose-refs.ts`                                                                                  |
| Running ours after the consumer's handler, unless it called `preventDefault()` | `internal/compose-event-handlers/compose-event-handlers.ts`                                                              |
| Running both handlers in order, the consumer's first                           | `internal/chain/chain.ts`                                                                                                |
| `command` and `commandfor` in a button's types                                 | `internal/invoker-commands/invoker-commands.ts`                                                                          |
| An accessible name the props require (`AccessibleName`, `Labelled`)            | `internal/accessible-name/accessible-name.ts`                                                                            |
| DOM event listeners                                                            | `internal/dom-event/` (`use-event.ts`, `shared-listener.ts`)                                                             |
| Pointer modality, pointer drags and IME composition                            | `internal/interaction/` (`pointer-marker.ts`, `use-move.ts`, `composition.ts`)                                           |
| Finding an element by id                                                       | `internal/get-by-id/get-by-id.ts`                                                                                        |
| A button that stays focusable while disabled                                   | `internal/use-button/use-button.ts`                                                                                      |
| A native checkbox's click                                                      | `internal/toggle-click/toggle-click.ts`                                                                                  |
| A native radio group                                                           | `internal/radio-choice/` (`use-radio-choice.ts`, `follow-visual-direction.ts`)                                           |
| A list of chosen values                                                        | `internal/selection/selection.ts`                                                                                        |
| Snapping a number to its steps                                                 | `internal/snap-value-to-step/snap-value-to-step.ts`                                                                      |
| The icon of each status Variant                                                | `internal/variant-icons/variant-icons.ts`                                                                                |
| Overlay                                                                        | `internal/overlay/overlay.ts`                                                                                            |
| Listbox navigator                                                              | `internal/listbox/`                                                                                                      |
| Typeahead, and the text an Item is matched by                                  | `internal/typeahead/` (`typeahead.ts`, `text-of.ts`)                                                                     |
| DropdownMenu's and ContextMenu's Items and focus movement                      | `internal/menu/`                                                                                                         |
| A date picker's trigger and panel, and the context its Calendar reads          | `internal/picker/`                                                                                                       |
| A date or time field's segments                                                | `internal/segment-field/`                                                                                                |
| The file input a DropZone lends the FileTrigger inside                         | `internal/drop-zone-context/drop-zone-context.ts`                                                                        |
| The flex layout Inline and Stack share                                         | `internal/flex/flex.tsx`                                                                                                 |
| Locale                                                                         | `internal/locale/`                                                                                                       |
| Whether React has hydrated                                                     | `internal/hydration/use-hydrated.ts`                                                                                     |
| Dates                                                                          | `internal/date/date.ts`                                                                                                  |
| Field control                                                                  | `field/use-field.ts`                                                                                                     |
