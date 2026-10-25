# Toolbar

Groups three or more related controls (IconButtons, Buttons, a SegmentedControl) into one tab stop, with the arrow keys moving between them: an editor's formatting row, a list's bulk actions, a panel header's tools. For one or two controls, place them directly (APG: "Use toolbar as a grouping element only if the group contains 3 or more controls."). Do not put text fields, Selects or Sliders in a Toolbar: they need the same arrow keys.

```tsx
import { Button } from "@platform/ui/button";
import { IconButton } from "@platform/ui/icon-button";
import { CopyIcon } from "@platform/ui/icons/copy";
import { DownloadIcon } from "@platform/ui/icons/download";
import { PinIcon } from "@platform/ui/icons/pin";
import { SegmentedControl } from "@platform/ui/segmented-control";
import { Separator } from "@platform/ui/separator";
import { Toolbar } from "@platform/ui/toolbar";

<Toolbar aria-label="Report">
  <IconButton aria-label="Pin" defaultPressed={false}>
    <PinIcon />
  </IconButton>
  <IconButton aria-label="Copy link">
    <CopyIcon />
  </IconButton>
  <IconButton aria-label="Download" disabled>
    <DownloadIcon />
  </IconButton>
  <Separator orientation="vertical" />
  <SegmentedControl.Root aria-label="View" defaultValue="list">
    <SegmentedControl.Item value="list">List</SegmentedControl.Item>
    <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
  </SegmentedControl.Root>
  <Separator orientation="vertical" />
  <Button variant="tertiary" size="sm">
    Share
  </Button>
</Toolbar>;
```

Status: draft for brand-owner review (phase 3). No source guide: drafted from the APG Toolbar pattern, its keyboard-interface practice, the brand book (density, motion, accessibility) and the reference libraries.

## Anatomy

Container → items (any Buttons, IconButtons, links and SegmentedControls) → Separators (optional).

- **Container.** A `<div role="toolbar">`: an inline flex row, `align-items: center`, `gap: toolbar-gap` (4), `flex-wrap: wrap`. No fill, border or padding of its own: it sits on whatever surface hosts it.
- **Items.** The consumer's own components, unchanged. The Toolbar does not render or wrap them.
- **Separators.** The existing Separator with `orientation="vertical"` between groups ("between toolbar groups" is already its documented use). Not focusable, so the arrow keys skip it.

## API

`Toolbar`

| Prop                             | Type                    | Default | Notes                                     |
| -------------------------------- | ----------------------- | ------- | ----------------------------------------- |
| `aria-label` / `aria-labelledby` | `string`                |         | One of them required in the type.         |
| `children`                       | `ReactNode`             |         | The controls and Separators.              |
| …native                          | `ComponentProps<"div">` |         | `ref`, `className` and native attributes. |

Names, checked against the reference libraries:

- **`Toolbar`**: Radix "A container for grouping a set of controls, such as buttons, toggle groups or dropdown menus." (https://www.radix-ui.com/primitives/docs/components/toolbar); Base UI "A container for grouping a set of buttons and controls." (https://base-ui.com/react/components/toolbar); React Aria "A toolbar is a container for a set of interactive controls, such as buttons, dropdown menus, or checkboxes, with arrow key navigation." (https://react-aria.adobe.com/Toolbar). Every library says Toolbar.
- **One component, not `Toolbar.Root` + item Parts.** Radix composes `Toolbar.Root`, `Toolbar.Button`, `Toolbar.Link`, `Toolbar.ToggleGroup`, `Toolbar.ToggleItem`, `Toolbar.Separator`; Base UI `Toolbar.Root`, `Toolbar.Button`, `Toolbar.Link`, `Toolbar.Input` ("A native input element that integrates with Toolbar keyboard navigation."), `Toolbar.Group`, `Toolbar.Separator`. React Aria's `<Toolbar>` takes any child: its anatomy puts plain `<Button />`, `<ToggleButtonGroup>`, `<Separator />`, `<Group>` and `<Select />` inside. We follow React Aria: the Toolbar finds its items in the DOM (Behaviour), so Button, IconButton and SegmentedControl need no Toolbar variant and know nothing about Toolbar. With a single Part, spec #1's rule makes it a plain `Toolbar`, not a namespace (judgement call).
- **No `Toolbar.Separator`.** Separator already exists with `orientation`; React Aria uses its plain `<Separator />` inside Toolbar.
- **Named in the type.** APG: "If the toolbar has a visible label, it is referenced by aria-labelledby on the toolbar element. Otherwise, the toolbar element has a label provided by aria-label."
- **Disabled items stay in the arrow-key path.** Base UI `Toolbar.Button` `focusableWhenDisabled` default `true`, "When true the item remains focusable when disabled."; Base UI on popups: "Set disabled on `<Toolbar.Button>` rather than on the trigger, so the button stays in the toolbar's keyboard navigation." Our Buttons are already focusable when disabled (`aria-disabled`, spec #1), so nothing is needed.
- **Wraps.** Radix `loop` default `true`; Base UI `loopFocus` default `true`, "If true, using keyboard navigation will wrap focus to the other end of the toolbar once the end is reached." Always on; no prop.
- **Left out (YAGNI):** `orientation` / vertical toolbars (Radix, Base UI, React Aria; APG "If the controls are arranged vertically, the toolbar element has aria-orientation set to vertical."), `loop` / `loopFocus`, `dir` (Radix), Root `disabled` (Base UI), `Toolbar.Group` (Base UI, React Aria `Group`; a native `<div role="group" aria-label>` works if a named subgroup is ever needed), `Toolbar.Input` and text fields in general, Radix `Toolbar.ToggleGroup` (SegmentedControl or toggle IconButtons cover it), React Aria's nested-toolbar role swap, and a shortcut key to reach the toolbar (APG recommends one for editors; the app binds it).

## States

The Toolbar has no visual states of its own. Each item shows its own (hover, pressed, selected, disabled, focus-visible).

| State    | How it shows                   | Exposed as                  |
| -------- | ------------------------------ | --------------------------- |
| tab stop | The one item reached by Tab    | `tabindex="0"` on that item |
| other    | Reached by the arrow keys only | `tabindex="-1"`             |

## Behaviour

- **Items** are the Toolbar's descendants matching `button, a[href], input:not([type="hidden"])`, minus `:disabled` ones and anything inside a `[popover]` (a Floating layer opened from a toolbar button sits in the toolbar's DOM but is not part of it), in document order. That covers Button, IconButton (also with `asChild` around a link) and each radio of a SegmentedControl. The list is read from the DOM whenever it is needed, so items the consumer adds or removes need no registration.
- **Roving tabindex, applied from the DOM.** After hydration the Toolbar sets `tabindex="0"` on one item and `tabindex="-1"` on the rest (APG: "When the component container is loaded or created, set tabindex="0" on the element that will initially be included in the tab sequence and set tabindex="-1" on all other focusable elements it contains."). The initial item is the first one without `aria-disabled="true"` (APG: "If focus is moving into the toolbar for the first time, focus is set on the first control that is not disabled."). On `focusin` the focused item becomes the tab stop, so Tab returns to the control used last (APG: "If the toolbar has previously contained focus, focus is optionally set on the control that last had focus."). A `MutationObserver` (childList, subtree) re-applies the tabindex values when items change. Before hydration every item is its own tab stop, which still works.
- **Why the DOM, not context.** Radix and Base UI make each item a Toolbar Part that registers itself. Reading the DOM keeps all toolbar knowledge in one place: Button, IconButton and SegmentedControl stay unaware of Toolbar and render the same everywhere, and any focusable child works (React Aria's `useToolbar` also works from the DOM, with a focus manager over the toolbar's focusable descendants). The cost is that the Toolbar writes `tabindex` on elements it does not render; React only writes an attribute when its own prop changes, and these components never set `tabIndex` (inference; the build tests a re-rendering child keeps the Toolbar's value).
- **Arrow keys** are handled in the Toolbar's `keydown` (bubbling) only when the target is an item and the event is not already `defaultPrevented`, so a contained control that uses a key itself (a future menu button's Down Arrow) keeps it. Handled keys call `preventDefault()` and `focus()` the next item.
- **Radios inside.** Up and Down duplicate Left and Right (APG: "Up Arrow and Down Arrow can duplicate Left Arrow and Right Arrow, respectively"). Cancelling every arrow key stops native radios from checking on arrows, which gives APG's toolbar radio behaviour: "when navigating through a radio group in a toolbar with arrow keys, the button that is checked does not change", and Space checks (native). That `preventDefault()` on `keydown` cancels the native radio arrow behaviour is proven in Chromium, Firefox and WebKit by the story proofs.
- **Narrow widths.** The row wraps onto more lines (WCAG 1.4.10 reflow); APG allows it: "In toolbars with multiple rows of controls, Left Arrow and Right Arrow can provide navigation that wraps from row to row".
- Client component (`'use client'`): key and focus handlers and the observer, attached in a ref callback that returns its cleanup. Its children can be Server Components.
- The container has `tabindex="-1"`: lint (`jsx-a11y/interactive-supports-focus`) requires an element with the interactive `toolbar` role to be focusable, and Radix's roving group does the same; `-1` keeps it out of the tab order, so Tab still lands on an item.

## Motion

None of its own. Items keep their own press and hover motion; moving focus with the arrow keys is instant (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions.").

- **Reduced motion:** nothing to remove.
- **Instant exit:** the Toolbar has no exit; it appears and disappears with its host.

## Keyboard

APG pattern: **Toolbar**, horizontal (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

| Key             | Action                                                                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | "Move focus into and out of the toolbar." Focus lands on the first control that is not disabled, or on the control that last had focus.                                                                           |
| Right Arrow     | "Moves focus to the next control." Wraps: "Optionally, focus movement may wrap from the last element to the first element."                                                                                       |
| Left Arrow      | "Moves focus to the previous control." Wraps: "Optionally, focus movement may wrap from the first element to the last element."                                                                                   |
| Down / Up Arrow | As Right / Left ("Up Arrow and Down Arrow can duplicate Left Arrow and Right Arrow, respectively, or can be reserved for operating controls, such as spin buttons that require vertical arrow keys to operate."). |
| Home            | "(Optional): Moves focus to first element."                                                                                                                                                                       |
| End             | "(Optional): Moves focus to last element."                                                                                                                                                                        |
| Space / Enter   | Operate the focused item (native: a button activates; Space checks a SegmentedControl radio).                                                                                                                     |

Disabled items are reached by the arrow keys and announced, but do nothing. APG's default is the opposite ("Typically, disabled elements are not focusable when navigating with a keyboard."), with the exception "in circumstances where discoverability of a function is crucial, it may be helpful if disabled controls are focusable", and its keyboard practice cites "The “Copy”, “Cut”, and “Paste” buttons in the Toolbar" as `aria-disabled` items that stay focusable. Spec #1 makes focusable-when-disabled the rule (user story 51).

**RTL:** the Toolbar reads `:dir(rtl)` on itself at keydown and swaps Left and Right, so Left moves to the next item in visual order (spec #1 user story 54; React Aria's `useToolbar` does the same: `const shouldReverse = direction === 'rtl' && orientation === 'horizontal';`). Up and Down keep document order; Home and End are logical.

## Accessibility

- Role `toolbar` on a `div` (ARIA in HTML lets a `div` take any role), named by `aria-label` / `aria-labelledby` (required). `aria-orientation` is not set: APG "The default orientation is horizontal."
- Items keep their own roles and names. A SegmentedControl inside keeps its `radiogroup`.
- **Contrast.** Nothing of its own; items and Separators carry their own pairs.
- **More contrast:** no change; Separator steps up its own hairline.
- **Forced colors:** nothing of its own to force.
- **Reduced transparency:** not affected.

## RTL

Logical layout: the row runs from the inline start and wraps in the inline direction. Items and Separators handle their own mirroring. Arrow keys: see Keyboard.

## Component tokens

Existing: none (no source tokens).

Proposed new:

| Token         | References                   | `$type`   | Why                                                                                                                                           |
| ------------- | ---------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `toolbar-gap` | `{semantic.space-inline-xs}` | dimension | Space between items and around Separators, 4 px: a dense row of IconButtons (brand book density); the override surface for a roomier toolbar. |

New Dictionary component word: `toolbar`. `gap` is an existing property.

## Author-written text

None. The consumer names the toolbar.

## Feedback events

None of its own. Items dispatch their own (`ab-press` from Button and IconButton, `ab-toggle` from a toggle IconButton or a SegmentedControl, with their own `component` names). Moving focus dispatches nothing.

## Sources

- WAI-ARIA APG Toolbar: https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/ ("A toolbar is a container for grouping a set of controls, such as buttons, menubuttons, or checkboxes."; "Implement focus management so the keyboard tab sequence includes one stop for the toolbar and arrow keys move focus among the controls in the toolbar."; "Avoid including controls whose operation requires the pair of arrow keys used for toolbar navigation.").
- WAI-ARIA APG Radio Group, "For Radio Group Contained in a Toolbar": https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- WAI-ARIA APG keyboard interface (roving tabindex; focusability of disabled controls): https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- ARIA in HTML: https://www.w3.org/TR/html-aria/
- Baseline (webstatus.dev, 2026-10-24): `mutationobserver` widely; `dir-pseudo` widely.
- Radix Toolbar: https://www.radix-ui.com/primitives/docs/components/toolbar · Base UI Toolbar: https://base-ui.com/react/components/toolbar · React Aria Toolbar: https://react-aria.adobe.com/Toolbar · React Aria `useToolbar` source: https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/toolbar/useToolbar.ts
- Separator spec (`separator.md`), IconButton spec (`icon-button.md`: "In a Toolbar (phase 3) arrow keys move between IconButtons; that belongs to Toolbar, not IconButton."), SegmentedControl spec.
