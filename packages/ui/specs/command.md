# Command

A keyboard-first launcher for the product's actions and destinations: type a few letters, press Enter, and the best match runs. Use `Command.Dialog` once per app, mounted near the root and opened with ⌘K / Ctrl K; use `Command.Root` inline when a searchable list of commands belongs in the page or in a Popover. To choose a form value from a long list, use Combobox; for the few actions that belong to one control, use DropdownMenu.

```tsx
import { Command } from "@platform/ui/command";
import { HomeIcon } from "@platform/ui/icons/home";
import { PlusIcon } from "@platform/ui/icons/plus";
import { SearchIcon } from "@platform/ui/icons/search";
import { Kbd } from "@platform/ui/kbd";

<Command.Dialog open={open} onOpenChange={(next) => setOpen(next)} finalFocus={triggerRef}>
  <Command.Input />
  <Command.Empty />
  <Command.List>
    <Command.Group heading="Suggestions">
      <Command.Item onClick={createDocument} aria-keyshortcuts="Meta+N Control+N">
        <PlusIcon data-icon="inline-start" />
        New document
        <Kbd keys="mod+n" aria-hidden />
      </Command.Item>
      <Command.Item onClick={openSearch} keywords={["find"]}>
        <SearchIcon data-icon="inline-start" />
        Search files
      </Command.Item>
    </Command.Group>
    <Command.Group heading="Navigation">
      <Command.Item onClick={() => router.push("/")}>
        <HomeIcon data-icon="inline-start" />
        Go to Home
      </Command.Item>
    </Command.Group>
  </Command.List>
  <Command.Footer />
</Command.Dialog>

<Command.Root inputValue={query} onInputValueChange={(next) => setQuery(next)} filter={null}>
  <Command.Input />
  <Command.Empty>No projects match.</Command.Empty>
  <Command.List>
    {projects.map((project) => (
      <Command.Item key={project.id} onClick={() => openProject(project.id)}>
        {project.name}
      </Command.Item>
    ))}
  </Command.List>
</Command.Root>
```

Status: draft for brand-owner review (phase 5). Source guide: `components/CommandPalette/README.md` in the artifact (renamed Command, with `Command.Dialog`, by spec #1).

## Anatomy

Dialog (`<dialog>` + `::backdrop`, optional) → Root → Input row → Empty · List (Groups → Items, ungrouped Items) → Footer.

- **Root.** A `<div>` that holds the query, the ranking and the highlight, and lays its children out as a column. Inline it has no surface of its own: Materials belong "only on floating chrome above content" and "Never use them for in-flow content" (brand book), so an inline Command takes the surface of the Card or Popover it sits in.
- **Dialog.** `Command.Dialog` composes Dialog (`dialog.md`): a native `<dialog>` opened with `showModal()`, wrapping a Root. It is top-anchored, `command-offset` (88; 64 below 760 px) from the top of the viewport and centred inline, `inline-size: command-width` (560) within the UA's `max-width: calc(100% - 6px - 2em)`. Surface: Material `command-background-color` (`color-material-thick`) with `backdrop-filter: blur(command-blur) saturate(command-saturate)` (32 px, 1.8), `command-shadow` (modal elevation), radius `command-border-radius` (16), no padding. The backdrop is transparent, as the artifact draws it (`.ab-command-palette::backdrop{background:transparent;backdrop-filter:none}`); the page stays inert. Source: "Top-anchored (88px from top, so the input never moves as results change) · 560 wide · thick material + 32px blur · radius 16 → list padding 8 → items radius 8 (concentric)."
- **Input.** A row `command-input-height` (40) tall with `command-input-padding-inline` (16) and a `border-width-default` hairline in `command-input-border-color` at its block end: a decorative `search` Icon (`size="md"`, `command-input-icon-color`) at the inline start, then a borderless `<input>` in `command-input-font` that fills the row, and inside `Command.Dialog` an `<Kbd keys="esc" aria-hidden>` at the inline end (prototype). The row is a `<label>`, so the whole row is the input's hit target.
- **List.** A `<div role="listbox">` that scrolls: `max-block-size: command-list-max-height` (320), `padding: command-list-padding` (8), `overflow-y: auto`, `scroll-padding-block: command-list-padding` so a scrolled-into-view Item keeps the padding (cmdk: "To scroll item into view earlier near the edges of the viewport, use scroll-padding").
- **Group.** A `<fieldset>` (implicit role `group`) labelled by its heading: a `<div aria-hidden="true">` in `command-group-label-font` (overline) / `command-group-label-text-color`, padded like an Item's text (`command-item-padding-inline`, `space-inset-xs` on the block axis). Its Items follow as a column.
- **Item.** A `<div role="option">` flex row `command-item-height` (32) tall, `command-item-padding-inline` (8), `command-item-gap` (12), radius `command-item-border-radius` (8: concentric, 16 − 8), text in `command-item-font` / `command-item-text-color`. Children, in order: an optional Icon with `data-icon="inline-start"` (`command-item-icon-color`), the label, an optional `<Kbd aria-hidden>` pushed to the inline end (the Item sets `--ab-kbd-margin-inline-start: auto`, which Kbd reads) and drawn as keycaps, as the artifact does. The highlighted Item is filled with `command-item-background-color-selected`.
- **Empty.** An `<output>` (implicit role `status`), always mounted, placed before the List. While nothing matches it shows, centred with `space-stack-sm` between them and `space-stack-xl` / `space-inset-lg` around: a decorative `search` Icon (`size="xl"`, `color-icon-subtlest`) and the text (`type-body-xs`, `command-footer-text-color`), as the artifact draws it. Otherwise it is empty and takes no space. Prototype: `<div className="ab-command-empty"><Icon name="search" size="xl" /><span>{emptyText}</span></div>`.
- **Footer.** A `<div aria-hidden="true">` row `command-footer-height` (32) tall, `command-footer-padding-inline` (16), a `border-width-default` hairline in `command-footer-border-color` at its block start, `command-footer-font` / `command-footer-text-color`, hints `space-inline-lg` apart (artifact). Default content: `↑` `↓` Navigate · `↵` Open · `Esc` Close (Close only inside `Command.Dialog`), each key a Kbd. Source: "Footer teaches the keys."; prototype: `<span><Kbd keys={['up', 'down']} />Navigate</span><span><Kbd keys="enter" />Open</span><span><Kbd keys="esc" />Close</span>`.

No Separator, Loading, Shortcut or Trigger Part (see API).

## API

`Command.Root`

| Prop                 | Type                                                                     | Default | Notes                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `inputValue`         | `string`                                                                 |         | Controlled query.                                                                                                                  |
| `defaultInputValue`  | `string`                                                                 | `""`    | Uncontrolled.                                                                                                                      |
| `onInputValueChange` | `(inputValue: string, details: Command.Root.ChangeEventDetails) => void` |         | `details`: `reason` (`"input-change"` \| `"input-clear"`), `event`, `cancel()`. `"input-clear"` is the clear on close (Behaviour). |
| `filter`             | `null`                                                                   |         | `null` turns the ranking off: every Item shows in the order rendered, for consumers that search themselves (server search).        |
| …native              | `ComponentProps<"div">`                                                  |         | `ref`, `className`, native attributes.                                                                                             |

`Command.Dialog`: every `Command.Root` prop, plus:

| Prop           | Type                                                                  | Default | Notes                                                                                                                     |
| -------------- | --------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                                                             |         | Controlled. Applied in a layout effect with `showModal()` / `close()`.                                                    |
| `defaultOpen`  | `boolean`                                                             | `false` | Uncontrolled.                                                                                                             |
| `onOpenChange` | `(open: boolean, details: Command.Dialog.ChangeEventDetails) => void` |         | `details`: `reason` (`"outside-press"` \| `"escape-key"` \| `"item-press"` \| `"none"`), `event`, `cancel()`.             |
| `finalFocus`   | `RefObject<HTMLElement \| null>`                                      |         | The app's opener (the ⌘K button). Focused on close when focus would otherwise land on `<body>` (Behaviour: focus return). |
| `labels`       | `{ dialog?: string }`                                                 | locale  | Accessible name of the dialog.                                                                                            |
| …native        | `ComponentProps<"dialog">` minus `open`                               |         | `ref`, `className`, native attributes, on the `<dialog>`.                                                                 |

`Command.Input`

| Prop          | Type                                                            | Default | Notes                                                                                                               |
| ------------- | --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `placeholder` | `string`                                                        | locale  | Native attribute; defaults to `labels.placeholder`.                                                                 |
| `labels`      | `{ search?: string; placeholder?: string }`                     | locale  | `search` is the input's accessible name (`aria-label`).                                                             |
| …native       | `ComponentProps<"input">` minus `value`, `defaultValue`, `type` |         | `ref`, `className`, `onKeyDown`, native attributes. The Input owns `role`, `aria-*` combobox attributes and `type`. |

`Command.List`: `ComponentProps<"div">` (owns `id`, `role`). `Command.Group`: `heading: string` (required) plus `ComponentProps<"div">`. `Command.Empty`: `children` (default: the Icon and `labels.empty`), `labels: { empty?: string }`, `ComponentProps<"div">`. `Command.Footer`: `children` (default: the three hints), `labels: { navigate?: string; open?: string; close?: string }`, `ComponentProps<"div">`.

`Command.Item`

| Prop       | Type                    | Default      | Notes                                                                                                    |
| ---------- | ----------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `onClick`  | `MouseEventHandler`     |              | The command. Runs on a pointer click and on Enter while the Item is highlighted (Behaviour).             |
| `value`    | `string`                | text content | The text the query is ranked against. Defaults to the Item's text without its `kbd` descendants.         |
| `keywords` | `readonly string[]`     | `[]`         | Extra words that match the query; not displayed.                                                         |
| `disabled` | `boolean`               | `false`      | `aria-disabled="true"`; shown, but never highlighted or run.                                             |
| …native    | `ComponentProps<"div">` |              | `ref`, `className`, `aria-keyshortcuts`, native attributes. The Item owns `id`, `role`, `aria-selected`. |

Names, checked against the reference libraries:

- **Component `Command`, Parts `Root`, `Input`, `List`, `Empty`, `Group`, `Item`, `Dialog`**: cmdk "⌘K is a command menu React component that can also be used as an accessible combobox." with `<Command>`, `<Command.Input />`, `<Command.List>`, `<Command.Empty>`, `<Command.Group heading="Letters">`, `<Command.Item>` and `<Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Menu">` (https://github.com/pacocoursey/cmdk/blob/v1.1.1/README.md); shadcn "Command menu for search and quick actions." with the composition "Command ├── CommandInput └── CommandList ├── CommandEmpty ├── CommandGroup │ ├── CommandItem" and `CommandDialog` (https://ui.shadcn.com/docs/components/command); Mantine Spotlight "Command center for your application" with `Spotlight.Root`, `Spotlight.Search`, `Spotlight.ActionsList`, `Spotlight.Action`, `Spotlight.ActionsGroup`, `Spotlight.Empty` (https://mantine.dev/x/spotlight/); React Aria builds its command palette from `Autocomplete` ("An autocomplete allows users to search or filter a list of suggestions.") with a `CommandPalette` example (https://react-aria.adobe.com/Autocomplete); Base UI Combobox `Input`, `List`, `Item`, `Group`, `Empty` (https://base-ui.com/react/components/combobox.md). Ark and Chakra ship no command palette (their component indexes list Combobox and Listbox only: https://ark-ui.com/llms.txt, https://chakra-ui.com/llms-components.txt). Spec #1 renames the source's CommandPalette to Command with `Command.Dialog` (cmdk, shadcn). The cmdk Root is the bare `Command`; here it is `Command.Root`, the naming rule's Root, so the namespace stays a namespace.
- **`Command.Group` `heading`**: cmdk "Groups items together with the given `heading` (`[cmdk-group-heading]`)."; shadcn `<CommandGroup heading="Suggestions">`. Mantine uses `label` ("Group label"), Base UI a `GroupLabel` Part. A prop, not a Part, because the source's groups always have one (prototype `{ label: 'Suggestions', items: [...] }`) and Group has no other content; required because "groups are labelled" (source) and APG "Each option group has an accessible name provided via aria-label or aria-labelledby."
- **`Command.Item` `onClick`**: Base UI Combobox Item "`onClick` … An optional click handler for the item when selected. It fires when clicking the item with the pointer, as well as when pressing `Enter` with the keyboard if the item is highlighted when the `Input` or `List` element has focus."; Mantine Spotlight actions `onClick: () => console.log('Home')`; DropdownMenu Item here uses `onClick`. cmdk and shadcn use `onSelect` ("`onSelect={(value) => console.log('Selected', value)}`"), React Aria `onAction`. `onSelect` is already a React DOM prop with another meaning (React: "`onSelect`: An Event handler function. Fires after the selection inside an editable element like an input changes.", https://react.dev/reference/react-dom/components/common), so overriding it on a `div` would break the native prop contract (judgement call).
- **`value`, `keywords`, `disabled`**: cmdk Item "You should provide a unique `value` for each item, but it will be automatically inferred from the `.textContent`.", "You can also provide a `keywords` prop to help with filtering." (`keywords={['fruit', 'apple']}`; "Keywords act as aliases for the item value, and can also affect the rank of the item."), `[data-disabled?]`; Mantine action `keywords` "Keywords that are used for default filtering, not displayed anywhere"; Base UI Item `disabled` "Whether the component should ignore user interaction." React Aria's equivalent of `value` is `textValue` (`<MenuItem textValue="Create new file...">`). Here `value` is only the ranked text (no highlight API needs an identity: Left out).
- **`inputValue` / `defaultInputValue` / `onInputValueChange(inputValue, details)`**: Base UI Combobox "`inputValue` … The input value of the combobox. Use when controlled.", "`onInputValueChange` `((inputValue: string, eventDetails: Combobox.Root.ChangeEventDetails) => void)`"; React Aria Autocomplete `inputValue`, `defaultInputValue`, `onInputChange`; Mantine `query` / `onQueryChange`; cmdk puts it on the Input ("`<Command.Input value={search} onValueChange={setSearch} />`"). On the Root, as Base UI, React Aria, Mantine and the Combobox spec, because the Root ranks with it.
- **`reason` values**: Base UI's union "`| 'trigger-press' | 'input-press' | 'outside-press' | 'item-press' | 'close-press' | 'escape-key' | 'list-navigation' | 'focus-out' | 'input-change' | 'input-clear' | … | 'none'`" and Dialog's "`'trigger-press' | 'outside-press' | 'escape-key' | 'close-press' | 'focus-out' | 'imperative-action' | 'none'`". Command.Dialog has no Trigger and no Close Part, so it produces only `outside-press`, `escape-key`, `item-press` and `none`.
- **`filter={null}`**: Base UI Combobox `filter` "`((item: Item, query: string, itemToString?: ((item: Item) => string)) => boolean) \| null`", used as `filter={null}` in its async example; cmdk "Or disable filtering and sorting entirely: `<Command shouldFilter={false}>`". Only `null` is accepted: the ranking is shared with Combobox and not replaceable (Left out).
- **`open` / `defaultOpen` / `onOpenChange`** on `Command.Dialog`: cmdk "Can be controlled with the `open` and `onOpenChange` props."; Base UI Dialog `onOpenChange` "Event handler called when the dialog is opened or closed."
- **`finalFocus`**: Base UI Dialog Popup "`finalFocus` … Determines the element to focus when the dialog is closed. … `RefObject`: Move focus to the ref element." Only the `RefObject` form, used only for the WebKit case (Behaviour).
- **`Command.Footer`**: no reference library has one; it is the source's ("Footer teaches the keys") and the brand book's ("the palette footer teaches navigation").
- **`labels`**: the typed `labels` prop and the root UI provider's locale (phase-4 contract 12).
- Left out (YAGNI): cmdk `Separator` (visible only "when the search query is empty", and the source separates by group headings; a listbox may not own a separator, see Accessibility), `Loading` (`progress`), `loop`, `vimBindings`, `disablePointerSelection`, `forceMount`, `useCommandState`, the controlled highlight (`value` / `onValueChange` on the Root), a custom `filter` function, `label` on Root and List, `container`; shadcn `CommandShortcut` (the Kbd child, as in DropdownMenu), `showCloseButton` and its visually hidden `description`; Mantine `limit`, `highlightQuery`, `scrollable` / `maxHeight`, `closeOnActionTrigger` (`cancel()` covers it), `shortcut` (app recipe below) and the `spotlight.open()` store (the source's `window.AB.openCommandPalette()`); React Aria `disableVirtualFocus`, `disableAutoFocusFirst`; Base UI `autoHighlight` (always on), `limit`; list height animation (cmdk `--cmdk-list-height`); nested pages (cmdk's example builds them with consumer state; here `cancel()` on `"item-press"` keeps the dialog open for that).

## States

| State            | How it shows                                                                                   | Exposed as                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| query empty      | Every Item, in document order, under its group heading                                         | Input value `""`                                                          |
| searching        | Matching Items only, best match first within each Group; Groups with no match are not rendered | Non-matching Items have `hidden`; empty Groups are `display: none` (`:has()`) |
| item highlighted | Fill `command-item-background-color-selected`, no transition                                   | `aria-selected="true"`, `data-highlighted`; Input `aria-activedescendant` |
| item disabled    | Text and icon in `command-item-{text,icon}-color-disabled`; never highlighted                  | `aria-disabled="true"`                                                    |
| no results       | Empty's icon and text; the List shows nothing                                                  | Empty's text content; no `aria-activedescendant`                          |
| dialog open      | Top-anchored surface over a transparent backdrop; page inert and not scrolling           | `[open]`, `:modal` (Dialog)                                               |
| dialog entering  | Fades in                                                                                       | `@starting-style`                                                         |
| dialog exiting   | Fades out (Chromium only)                                                                      | Transition on `display` / `overlay`                                       |

## Behaviour

- **One combobox, always expanded.** DOM focus stays on the `<input role="combobox">`; the List is its popup, rendered in place and always visible, so the Input has `aria-expanded="true"`, `aria-controls` → List id and `aria-autocomplete="list"`, and `aria-activedescendant` → the highlighted Item's id (removed when nothing is highlighted). cmdk does the same ("`role="combobox"` `aria-expanded={true}` `aria-controls={context.listId}`"). Phase-5 contract 1.
- **Ranking.** The Combobox ranking (`combobox.md`, Behaviour: Ranking: prefix > word start > subsequence, `Intl.Collator(locale, { usage: "search", sensitivity: "base" })`, word starts from `Intl.Segmenter(locale, { granularity: "word" })`, stable ties in document order), applied to each Item's `value` and `keywords`. What differs for Command:
  - **Re-sorted within groups.** Items are ordered by rank inside their Group, and ungrouped Items inside the List; Groups keep their document order (source: "re-sorted within groups"; judgement call: cmdk also moves the best Group first, "Sort groups to bottom (pushes all non-grouped items to the top)", which would make the headings jump while typing).
  - **Empty groups hide.** A Group with no matching Item is `display: none` through `:has()`, which also removes it from the accessibility tree (artifact: `.ab-command-group:not(:has(.ab-command-item:not([hidden]))){display:none}`) (source: "Empty groups hide"; APG: "All option groups contain at least one option."; cmdk: "the `hidden` attribute is applied to hide it from view"). Items and Groups stay mounted, so React state inside them survives a query.
  - **How the order is drawn.** The Group and the List are flex columns and each visible Item gets `order` from its rank, so React's DOM is never reordered (cmdk reorders DOM nodes React owns and warns it "Uses risky approaches like manual DOM ordering"). MDN warns: "Using the order property will create a disconnect between the visual presentation of content and DOM order." Here users reach Items through the Input (`aria-activedescendant` follows the ranked order, not the DOM), and each visible Item carries `aria-posinset` / `aria-setsize` within its Group so the spoken position matches the visible one (judgement call; inference that screen readers use them for options whose DOM order differs; the build ticket checks it).
  - `hidden` must win over the flex layout: the CSS keeps `[hidden] { display: none }` for Items and Groups (MDN: "changing the value of the CSS display property on a hidden element will override the hidden state").
  - **`filter={null}`**: no ranking and no hiding; the consumer renders the matching Items (Base UI's async pattern). Highlight and Empty still work.
- **Highlight.** After every query change, on open and when the rendered Items change, the highlight moves to the first enabled visible Item in ranked order (source: "first result always pre-selected so Enter acts immediately"; APG "List autocomplete with automatic selection: … the first suggestion is automatically highlighted as selected."; Base UI Autocomplete `autoHighlight: 'always'` "such as when the list is rendered inline within a dialog"). Up / Down move it (Keyboard); a highlighted Item that stops matching hands the highlight to the new first Item. The highlighted Item is scrolled into view with `scrollIntoView({ block: "nearest" })` after keyboard moves and query changes, and when it is the first Item of a Group the Group heading is scrolled into view first so the heading stays visible (cmdk: "First item in Group, ensure heading is in view"). Pointer moves never scroll.
- **Highlight follows the pointer.** `pointermove` (mouse or pen) over an enabled Item highlights it, with no transition (cmdk: "Item that becomes active on pointer enter"; source Menu: "Highlight follows the pointer instantly"). Leaving the List keeps the last highlight, so Enter always has a target (judgement call). Disabled Items never take the highlight from the pointer or the keys (cmdk skips `[aria-disabled="true"]` items when moving).
- **Running an Item.** A click on an enabled Item, or Enter in the Input while an Item is highlighted (`highlighted.click()`, MDN: "The HTMLElement.click() method simulates a mouse click on an element."), arrives as one `click` on the Item. The List handles it in the capture phase, before the Item's own handler: (1) inside `Command.Dialog`, reports `onOpenChange(false, { reason: "item-press", event, cancel })` and, unless cancelled, closes the dialog with `close()`, so focus is back on the opener before the action runs (the DropdownMenu order, for actions that open another Dialog); (2) dispatches `ab-confirm`; then the Item's `onClick` runs. (A bubble-phase `onClick` on the listbox would need a key handler for `jsx-a11y/click-events-have-key-events`, although keys reach Items only through the Input.) A keyboard run's `event.detail` is `0`, a pointer click's is at least 1 (UI Events; inference). Enter during IME composition does nothing (cmdk: "Check if IME composition is finished before triggering key binds"; `event.isComposing`). Enter with no highlighted Item does nothing. A disabled Item's click is stopped (`preventDefault()`, `stopPropagation()`), so its `onClick` never runs.
- **The pointer never takes focus from the Input.** The List calls `preventDefault()` on `mousedown`, so pressing an Item keeps DOM focus (and the caret) in the Input (inference: focus moves on mousedown's default action; the build ticket checks focus after a press).
- **Empty.** Its children render only while no Item is visible (source: "empty state appears when nothing matches"; cmdk "Automatically renders when there are no results for the search query."). Its element stays mounted as a polite live region, so the text is announced when results run out (Base UI Empty: "Announces changes politely to screen readers. This component's root element must remain mounted in the DOM to announce changes consistently across screen readers."; MDN live regions: "Establish the live region before updating its content."). It sits before the List, not inside it, as in Base UI, because a listbox may own only groups and options (Accessibility).
- **Command.Dialog** composes Dialog and keeps all of `dialog.md`'s behaviour: `showModal()`, inert page, Escape through the close watcher and outside press through `requestClose()` (both cancelable through `cancel`), scroll lock, Escape closing only the topmost layer, focus return. What it adds:
  - **Name.** The `<dialog>` has `aria-label` from `labels.dialog` ("Command palette"); there is no visible title (prototype `<dialog className="ab-command-palette" aria-label="Command palette">`; cmdk `<RadixDialog.Content aria-label={props.label}>`). shadcn renders a visually hidden `DialogTitle` instead ("Command Palette"), because Radix asks for a Title; `aria-label` is one attribute and no extra element (judgement call). Dialog's development warning ("must have a title … or an aria-label") is satisfied.
  - **Initial focus** is the Input: it is the dialog's first focusable descendant, so the native dialog focusing steps pick it (the List has `tabindex="-1"`).
  - **Query clears on close** (source). On `close`, the uncontrolled query resets to `""`, and `onInputValueChange("", { reason: "input-clear", event })` tells a controlled parent; the next open starts with every Item and the first one highlighted. Base UI documents the same reset for a Combobox inside a Dialog: "the component resets its transient state (filter query, highlighted item, and input value) when the dialog closes."
  - **Focus return.** Native: the close steps focus the element focused before `showModal()`, which is the ⌘K button or whatever had focus when ⌘K was pressed. There is no Trigger Part (the opener lives outside the lazily loaded chunk, see Splitting), so Dialog's WebKit handler cannot find one: on `close`, if `document.activeElement` is `<body>` (Safari after a mouse-opened dialog, spike #4 gap 7) and `finalFocus.current` is connected, Command.Dialog focuses it.
  - Opens only through `open` / `defaultOpen`; `reason` for opens is `"none"`.
- **Inline `Command.Root`.** The same combobox without the dialog: Escape and Tab keep their native meaning (Tab leaves; Escape reaches any enclosing layer). Nothing closes after a run.
- **⌘K / Ctrl K is app code** (phase-5 contract 5). A lazily loaded chunk cannot listen before it loads, and the libraries leave the key to the app: cmdk "Listen for ⌘K automatically? No, do it yourself to have full control over keybind context."; shadcn's dialog example binds it in the app (`if (e.key === "j" && (e.metaKey \|\| e.ctrlKey)) { e.preventDefault(); setOpen((open) => !open) }`, https://ui.shadcn.com/r/styles/new-york-v4/command-dialog.json); React Aria's `CommandPalette` example does the same with ⌘J. The app's opener shows `<Kbd keys="mod+k" aria-hidden />` and carries `aria-keyshortcuts="Meta+K Control+K"` (Kbd contract).
- **Splitting (spec #1 story 27).** `@platform/ui/command` is one subpath: `src/command/index.ts` is `export * as Command from "./index.parts.ts"`, with no module-level side effects, so an app can load it on demand and warm it on hover or focus of its opener. The design system never calls `import()` itself. Next.js: "`next/dynamic` is a composite of React.lazy() and Suspense", and "For example, you might want to defer loading a modal until a user clicks to open it." (https://nextjs.org/docs/app/guides/lazy-loading). The app keeps its palette in one client module and loads that module:

```tsx
"use client";

import { Command } from "@platform/ui/command";

export function CommandMenu({ open, onOpenChange, finalFocus }: CommandMenuProps) {
  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} finalFocus={finalFocus}>
      <Command.Input />
      <Command.Empty />
      <Command.List>{groups}</Command.List>
      <Command.Footer />
    </Command.Dialog>
  );
}
```

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@platform/ui/button";
import { Kbd } from "@platform/ui/kbd";

const loadCommandMenu = () => import("./command-menu.tsx");
const CommandMenu = dynamic(() => loadCommandMenu().then((m) => m.CommandMenu), { ssr: false });

export function CommandLauncher() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setLoaded(true);
        setOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        ref={triggerRef}
        aria-keyshortcuts="Meta+K Control+K"
        onPointerEnter={loadCommandMenu}
        onFocus={loadCommandMenu}
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
      >
        Search <Kbd keys="mod+k" aria-hidden />
      </Button>
      {loaded && <CommandMenu open={open} onOpenChange={setOpen} finalFocus={triggerRef} />}
    </>
  );
}
```

With `React.lazy` the module must resolve to `{ default }` (React: "It needs to eventually resolve to an object whose `.default` property is a valid React component type"): `lazy(() => import("./command-menu.tsx").then((m) => ({ default: m.CommandMenu })))` inside `<Suspense>`; importing the namespace directly needs `.then((m) => ({ default: m.Command.Dialog }))`. Next's named-export form is `.then((mod) => mod.Hello)`. Once loaded, the menu stays mounted (`loaded`), so the dialog's exit and the query reset run. Calling `loadCommandMenu()` on hover and again in `dynamic` loads the module once (a module is fetched once per specifier; inference). The build ticket proves the split in `apps/ui-next-fixture`: a route whose initial JavaScript does not contain Command, which loads after the dynamic import.

- Client components (`'use client'`): every Part. Root, Input, List, Group and Item share the query, ranking and highlight through context; Empty and Footer read context and the locale; Dialog holds the open state.

## Motion

The source guide has no motion line for the palette; the brand book applies.

- **Dialog enter: fade only.** `opacity` 0 → 1 from `@starting-style` over `command-enter-duration` (`motion-duration-popover`, 200 ms) with `command-easing` (ease-out). No scale, whatever opened it: the palette is opened by ⌘K, many times a day, and the brand book says "No motion on keyboard-initiated or high-frequency (100+ per day) actions." The `data-pointer` gate cannot apply either: the opener is app code, so the dialog never sees the press (judgement call). The fade stays, as in Dialog's keyboard opens, because a modal that appears with no transition flashes the whole viewport. `command-enter-scale` is therefore unused (Component tokens).
- **Top-anchored, so nothing moves while typing.** The list grows and shrinks below a still Input with no height animation (source: "so the input never moves as results change"; brand book "The command palette is top-anchored, so the input never moves.").
- **Exit:** `opacity` over `command-exit-duration` (`motion-duration-exit`, 150 ms) with `display` and `overlay` `allow-discrete`; exits are faster than entrances.
- **Highlight and re-sorting:** no transition; Items jump to their new order in the frame the query changes.
- **Reduced motion:** already fade only; nothing changes.
- **Instant exit:** spike #4: "Firefox and WebKit compute `display: none` at once." There the palette disappears in the frame Enter or Escape is pressed; the command has run or the user asked to leave, and focus is already back on the opener, so an instant close reads as correct.

## Keyboard

APG pattern: **Combobox**, listbox popup with "List autocomplete with automatic selection" (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/); `Command.Dialog` adds **Dialog (Modal)** (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Source: "⌘K / Ctrl K toggle · ↑↓ Home End move · Enter run · Esc close." APG's note applies: "DOM Focus is maintained on the combobox and the assistive technology focus is moved within the listbox using aria-activedescendant".

| Key                  | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Printable characters | "If the combobox is editable, type characters in the combobox." The ranking reruns and the first result is highlighted.                                                                                                                                                                                                                                                                                                                                                                                           |
| Down Arrow           | "If the autocomplete behavior automatically selected a suggestion before Down Arrow was pressed, focus is placed on the suggestion following the automatically selected suggestion." / "Moves focus to and selects the next option. If focus is on the last option, either returns focus to the combobox or does nothing." From the last Item, the first (wraps, as the Combobox and the APG example: "If visual focus is on the last option, moves visual focus to the first option."; the prototype wraps too). |
| Up Arrow             | "Moves focus to and selects the previous option. If focus is on the first option, either returns focus to the combobox or does nothing." From the first Item, the last (wraps).                                                                                                                                                                                                                                                                                                                                   |
| Home                 | "Either moves focus to and selects the first option or, if the combobox is editable, returns focus to the combobox and places the cursor on the first character." The first, while the query is empty; the caret's native Home once there is text.                                                                                                                                                                                                                                                                |
| End                  | "Either moves focus to the last option or, if the combobox is editable, returns focus to the combobox and places the cursor after the last character." The last Item while the query is empty; native End otherwise.                                                                                                                                                                                                                                                                                              |
| Enter                | "If the combobox is editable and an autocomplete suggestion is selected in the popup, accepts the suggestion either by placing the input cursor at the end of the accepted value in the combobox or by performing a default action on the value." Runs the highlighted Item; in `Command.Dialog` the dialog closes first.                                                                                                                                                                                         |
| Escape               | `Command.Dialog`: "Closes the dialog." (APG Dialog), through the native close watcher. Inline: not handled.                                                                                                                                                                                                                                                                                                                                                                                                       |
| Tab / Shift + Tab    | `Command.Dialog`: the Input is the only tabbable element, so focus stays inside (APG Dialog "If focus is on the last tabbable element inside the dialog, moves focus to the first tabbable element inside the dialog."). Inline: leaves the Command.                                                                                                                                                                                                                                                              |
| ⌘K / Ctrl K          | App code (Behaviour): opens, and closes again while open.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Arrow keys and the handled Home / End call `preventDefault()`. Left / Right Arrow, Backspace and the other editing keys stay native (APG: "IMPORTANT: Ensure JavaScript does not interfere with browser-provided text editing functions by capturing key events for the keys used to perform them."); that is why Home and End move the highlight only while the query is empty, as the prototype does (`!((e.key === 'Home' || e.key === 'End') && input.value)`; judgement call). Up / Down wrap (judgement call: the same as Combobox and the prototype, following the APG example rather than cmdk's default `loop` off). Alt + Down / Up do nothing: the popup is always displayed.

**RTL:** no Left / Right behaviour of its own (they move the caret natively), so nothing to swap.

## Accessibility

- **Roles.** Input: `<input type="text" role="combobox">` (ARIA in HTML, `input type=text` with no list attribute: "Roles: combobox, searchbox or spinbutton.", https://www.w3.org/TR/html-aria/) with `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant` (APG: "When a descendant of a listbox, grid, or tree popup is focused, DOM focus remains on the combobox and the combobox has aria-activedescendant set to a value that refers to the focused element within the popup."), `autocomplete="off"` and `spellcheck="false"` (prototype). List: `role="listbox"`. Items: `role="option"` with `aria-selected="true"` on the highlighted one only (APG: "when a suggested value is visually indicated as the currently selected value, the option … containing that value has aria-selected set to true."; "Selection follows focus in the listbox"). Groups: `role="group"` with `aria-labelledby` → the heading, which is `aria-hidden` so browse mode does not read it twice (cmdk: `cmdk-group-heading="" aria-hidden`); accessible-name computation still follows an `aria-labelledby` reference to hidden text.
- **Names.** The Input is named by `aria-label` from `labels.search` ("Search commands", as the prototype and React Aria's `aria-label="Search commands"`); the placeholder is a hint, not the name. The List needs no name: APG asks for one only "If the element with role listbox is not part of another widget, such as a combobox". The dialog is named by `labels.dialog`.
- **Owned elements.** A listbox may own only groups and options, so Empty sits outside it and there is no Separator Part. Hidden Items and Groups (`hidden`) leave the accessibility tree.
- **Shortcuts.** An Item's Kbd child is `aria-hidden` and the Item carries `aria-keyshortcuts` (Kbd spec), so the option's name stays its label.
- **Footer** is `aria-hidden="true"` (prototype `className="ab-command-footer" aria-hidden="true"`): it teaches sighted keyboard users keys that the combobox and dialog roles already convey to screen-reader users, who would otherwise hear "Navigate Open Close" after the results. This follows `kbd.md`'s "Components that render Kbd themselves (Command's footer) pass `aria-hidden`" (judgement call; `kbd.md` also says a footer Kbd is read in general).
- **Empty** is `role="status"` (polite), announced when it gets text (Behaviour). The Input keeps no `aria-activedescendant` while it shows.
- **Contrast.** Item text `color-text-default`, icons `color-icon-subtle`, shortcuts, group headings and the Footer `color-text-subtlest`, Empty text `color-text-subtle` on `color-surface-floating` and on the highlight `color-background-neutral-subtle-pressed`: all in the contrast matrix. The Material is `color-material-thick`, a 90 % fill of the floating surface, so text stays close to the matrix value (inference, the DropdownMenu note). Disabled text is exempt (WCAG 2.2 1.4.3).
- **Targets.** Items are `size-control-md` tall (32, 44 on coarse pointers); the Input row `size-control-lg` (40, 48).
- **More contrast:** `color-text-subtlest` steps up to `color-text-subtle` and `color-border-subtle` to `color-border-default` through the token media overrides; one rule steps the item icons to `color-icon-default`; the dialog draws a 1 px `color-border-default` border (Dialog).
- **Forced colors:** the Material and the shadow disappear, so the dialog gets a 1 px `CanvasText` border and the Input row and Footer hairlines take the system colour; the highlighted Item sets `Highlight` / `HighlightText` explicitly; disabled Items use `GrayText`; icons use `currentColor`.
- **Reduced transparency:** `color-material-thick` turns solid (token media override; brand book "Under reduced transparency every material turns solid.").

## RTL

Logical properties only: the search Icon and item icons at the inline start, Kbd at the inline end, footer hints in inline order, the dialog centred with `margin-inline: auto`. The `<dialog>` keeps its DOM parent's direction (Dialog spec; inference tested there). Kbd keeps `dir="ltr"` inside (Kbd spec). The `search` Icon is not mirrored (Icon spec). The text input follows the document direction natively.

## Component tokens

Existing (ported from the source): `command-width`, `command-offset`, `command-border-radius`, `command-background-color`, `command-blur`, `command-saturate`, `command-shadow`, `command-input-height`, `command-input-padding-inline`, `command-input-font`, `command-input-border-color`, `command-list-max-height`, `command-list-padding`, `command-group-label-font`, `command-group-label-text-color`, `command-item-height`, `command-item-padding-inline`, `command-item-gap`, `command-item-border-radius`, `command-item-font`, `command-item-text-color`, `command-item-icon-color`, `command-item-background-color-selected`, `command-item-shortcut-text-color`, `command-footer-padding-inline`, `command-footer-height`, `command-footer-text-color`, `command-footer-font`, `command-enter-scale`, `command-enter-duration`, `command-exit-duration`, `command-easing`. The backdrop uses Dialog's `dialog-backdrop-color` and `dialog-backdrop-blur`.

Proposed new:

| Token                              | References            | `$type` | Why                                                                            |
| ---------------------------------- | --------------------- | ------- | ------------------------------------------------------------------------------ |
| `command-input-icon-color`         | `color-icon-subtle`   | color   | The search Icon in the Input row                                               |
| `command-item-text-color-disabled` | `color-text-disabled` | color   | Disabled Item label (DropdownMenu precedent); the source has no disabled token |
| `command-item-icon-color-disabled` | `color-icon-disabled` | color   | Disabled Item icon                                                             |
| `command-footer-border-color`      | `color-border-subtle` | color   | Hairline above the Footer; `command-input-border-color` names the Input's      |

Flags for review:

- **`command-offset` vs the source's 88 px.** `command-offset` → `space-section`, which is 88 but 64 below 760 px wide (`"(width < 760px)": "{primitive.dimension-64}"`). The source gives one value; the smaller offset on phones keeps room for results above the keyboard (judgement call to keep the token as ported).
- **`command-enter-scale` is unused** (Motion: fade only). Keep it for a later pointer-gated scale or remove it; the build adds no rule for it.
- Empty uses semantic tokens directly (`color-icon-subtlest`, `color-text-subtle`, `type-body-sm`, `space-inset-xl`, `space-stack-sm`), as DropdownMenu does for values no app is expected to change; no new Dictionary word.

## Built-in labels

| Key                   | en-US                       | ro-RO                           | Used by                                  |
| --------------------- | --------------------------- | ------------------------------- | ---------------------------------------- |
| `command.dialog`      | "Command palette"           | "Paletă de comenzi"             | `Command.Dialog` accessible name         |
| `command.search`      | "Search commands"           | "Caută comenzi"                 | `Command.Input` accessible name          |
| `command.placeholder` | "Type a command or search…" | "Tastează o comandă sau caută…" | `Command.Input` default `placeholder`    |
| `command.empty`       | "No results"                | "Niciun rezultat"               | `Command.Empty` default text             |
| `command.navigate`    | "Navigate"                  | "Navighează"                    | `Command.Footer` hint after ↑ ↓          |
| `command.open`        | "Open"                      | "Deschide"                      | `Command.Footer` hint after ↵            |
| `command.close`       | "Close"                     | "Închide"                       | `Command.Footer` hint after Esc (Dialog) |

The English strings are the prototype's (`aria-label="Command palette"`, `aria-label="Search commands"`, `placeholder = 'Type a command or search…'`, `emptyText = 'No results'`, "Navigate", "Open", "Close"). Every Part is a client component, so each reads its keys from its `labels` prop, then the root UI provider's locale, then English. Command adds `readonly command: { … }` with these seven keys to the `Labels` type and to `en-US.ts` and `ro-RO.ts`. Group headings and Item text are the consumer's.

## Feedback events

| Event        | When                                                                                      | `reason` |
| ------------ | ----------------------------------------------------------------------------------------- | -------- |
| `ab-confirm` | When an enabled Item runs (pointer or Enter), before its `onClick`                        | `"user"` |
| `ab-dismiss` | `Command.Dialog` closed by Escape or an outside press (the composed Dialog dispatches it) | `"user"` |

`ab-confirm` detail `{ component: "Command", reason }`, dispatched from the Item; it bubbles through the app tree because the dialog is rendered in place. Running a command is a confirmation, not a press (judgement call: source "Soft confirm sound on run (mutable)" and the prototype's `sound.play('confirm')`, where DropdownMenu Items dispatch `ab-press`). `ab-dismiss` comes from the composed Dialog with `component: "Dialog"` (the PasswordField → IconButton composition precedent). Nothing for typing, highlighting, a disabled Item, an `"item-press"` close (the `ab-confirm` is the feedback), or a close through `open`. `src/events/events.ts`: add `"ab-confirm": ConfirmEvent` if AlertDialog has not, and widen its component union with `"Command"`; `ab-dismiss` already lists `"Dialog"`.

## Sources

- Source guide: artifact `project/components/CommandPalette/README.md` ("Keyboard-first launcher for every action and destination in the product; one per app, mounted once at the root."; "Top-anchored (88px from top, so the input never moves as results change) · 560 wide · thick material + 32px blur · radius 16 → list padding 8 → items radius 8 (concentric). Footer teaches the keys."; "Fuzzy ranking (prefix > word start > subsequence), re-sorted within groups; first result always pre-selected so Enter acts immediately. Empty groups hide; empty state appears when nothing matches. Query clears on close."; "⌘K / Ctrl K toggle · ↑↓ Home End move · Enter run · Esc close."; "Modal dialog; input is a combobox controlling a listbox via `aria-activedescendant`; groups are labelled. Soft confirm sound on run (mutable)."). Prototype: `project/components/overlays/CommandPalette.jsx` and `project/components/elements/ab-elements.js` (`<ab-command-palette>`) in the artifact (labels, footer, Home/End rule, wrap, confirm sound). Brand book: Materials, Interaction principles ("The command palette pre-selects the best match.", "The command palette is top-anchored, so the input never moves.", "the palette footer teaches navigation"), Motion, Sound ("Soft synthesised clicks mark toggles, toasts and running a command.").
- WAI-ARIA APG Combobox: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ · Listbox: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/ · Dialog (Modal): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- `dialog.md` (composed Dialog), `combobox.md` (the ranking), `dropdown-menu.md` (Item order of operations, highlight), `kbd.md`, spike #4 `docs/research/floating-platform.md` (exit per engine, WebKit focus gap 7).
- cmdk v1.1.1 README and source: https://github.com/pacocoursey/cmdk/blob/v1.1.1/README.md · https://github.com/pacocoursey/cmdk/blob/v1.1.1/cmdk/src/index.tsx · shadcn Command: https://ui.shadcn.com/docs/components/command, registry https://ui.shadcn.com/r/styles/base-nova/command.json and the dialog example https://ui.shadcn.com/r/styles/new-york-v4/command-dialog.json · Mantine Spotlight: https://mantine.dev/x/spotlight/ · React Aria Autocomplete (CommandPalette example): https://react-aria.adobe.com/Autocomplete · Base UI Combobox: https://base-ui.com/react/components/combobox.md · Autocomplete: https://base-ui.com/react/components/autocomplete.md · Dialog: https://base-ui.com/react/components/dialog.md · Ark: https://ark-ui.com/llms.txt · Chakra: https://chakra-ui.com/llms-components.txt
- React `lazy`: https://react.dev/reference/react/lazy · React DOM common props (`onSelect`): https://react.dev/reference/react-dom/components/common · Next.js lazy loading: https://nextjs.org/docs/app/guides/lazy-loading
- MDN `HTMLElement.click()`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click · `order`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/order · `aria-posinset`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-posinset · ARIA live regions: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions · `hidden`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden
- Baseline (webstatus.dev, 2026-10-24): `dialog` widely (low 2022-03-14); `requestclose` newly (low 2025-05-27); `starting-style` and `transition-behavior` newly (low 2024-08-06); `backdrop-filter` newly (low 2024-09-16); `has` widely (low 2023-12-19); `modal` widely (low 2022-09-02); `intl` widely (low 2017-09-28; `Intl.Collator`); `intl-segmenter` widely (low 2024-04-16); `array-by-copy` widely (low 2023-07-04; `toSorted`); `scroll-into-view` widely (low 2020-01-15); `flexbox` widely (low 2015-09-30; `order`); `js-modules` widely (low 2018-05-09; dynamic `import()` is the app's); `overlay` limited (exit enhancement, absence reads as an instant close); `prefers-reduced-transparency` limited (enhancement). MDN: `HTMLElement.click()` Baseline widely available "since July 2015"; `hidden` is HTML's own attribute.
