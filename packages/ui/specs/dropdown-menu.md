# DropdownMenu

A list of actions or options revealed from a button: "Duplicate", "Rename…", "Sort by", "Delete". Use it for commands that act on the thing next to the Trigger. To choose a form value, use Select (or Combobox for long lists); to open the same actions with a right click on an area, use ContextMenu; for a panel of arbitrary content, use Popover.

```tsx
import { DropdownMenu } from "@platform/ui/dropdown-menu";
import { IconButton } from "@platform/ui/icon-button";
import { CopyIcon } from "@platform/ui/icons/copy";
import { MoreIcon } from "@platform/ui/icons/more";
import { TrashIcon } from "@platform/ui/icons/trash";
import { Kbd } from "@platform/ui/kbd";

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <IconButton aria-label="More actions">
      <MoreIcon />
    </IconButton>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item onClick={duplicate} aria-keyshortcuts="Meta+D Control+D">
      <CopyIcon data-icon="inline-start" />
      Duplicate
      <Kbd keys="mod+d" aria-hidden />
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
      <DropdownMenu.Label>Sort</DropdownMenu.Label>
      <DropdownMenu.RadioItem value="newest">Newest</DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="oldest">Oldest</DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
    <DropdownMenu.Separator />
    <DropdownMenu.CheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
      Show archived
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.Separator />
    <DropdownMenu.Item variant="danger" onClick={remove}>
      <TrashIcon data-icon="inline-start" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>;
```

Status: draft for brand-owner review (phase 4). Source guide: `components/Menu/README.md` in the artifact (one guide for DropdownMenu and ContextMenu).

## Anatomy

Root (no DOM) → Trigger (button) → Content (`[popover]` menu, rendered next to the Trigger) → Items, CheckboxItems, RadioGroups (Label → RadioItems), Groups (Label → Items), Separators.

- **Root.** Holds the open state and the ids. Renders no element.
- **Trigger.** A native `<button type="button">` with `commandfor` → Content and `command="toggle-popover"`, `aria-haspopup="menu"` and `aria-expanded`. With `asChild`, a Button or IconButton is the Trigger.
- **Content.** A `<div popover="auto" role="menu" tabindex="-1">`, rendered right after the Trigger in the DOM (no portal), shown in the top layer. Material `dropdown-menu-background-color` (`color-material-thick`) with `backdrop-filter: blur(dropdown-menu-blur) saturate(dropdown-menu-saturate)`, `dropdown-menu-shadow` (overlay elevation: hairline ring, highlight, moss-tinted shadow), radius `dropdown-menu-border-radius` (12), padding `dropdown-menu-padding` (4), at least `dropdown-menu-min-width` (224) and at least as wide as the Trigger, `dropdown-menu-offset` (4) from it.
- **Item.** A native `<button type="button" role="menuitem" tabindex="-1">`, a flex row `dropdown-menu-item-height` (28) tall, `dropdown-menu-item-padding-inline` (8), `dropdown-menu-item-gap` (8), radius `dropdown-menu-item-border-radius` (8: concentric, 12 − 4), text in `dropdown-menu-item-font` / `dropdown-menu-item-text-color`. Children, in order: an optional Icon with `data-icon="inline-start"` (`size="sm"`, `dropdown-menu-item-icon-color`), the label, an optional `<Kbd aria-hidden>` pushed to the inline end (`margin-inline-start: auto`). The Kbd keeps its keycap, as the zip draws it, with its text in `dropdown-menu-item-shortcut-text-color` (source: "Shortcut hints right-aligned in subtlest text."); the Item sets Kbd's own custom properties (`--ab-kbd-text-color`, and `--ab-kbd-margin-inline-start: auto`, a hook Kbd reads) rather than reaching into the child. The whole row is the hit target.
- **CheckboxItem / RadioItem.** The same row with `role="menuitemcheckbox"` / `role="menuitemradio"` and `aria-checked`. A 16 px indicator box sits at the inline start, where an Item's icon goes, so labels line up: the `check` Icon (CheckboxItem) or the bob diamond, a `size-indicator` (6 px) square rotated 45° (RadioItem), both in `dropdown-menu-item-icon-color-selected` and decorative; the box is empty while unchecked. Brand book: the bob is "the single-choice indicator in menus".
- **RadioGroup.** A `<fieldset>` (implicit role `group`) labelled by its Label (`aria-labelledby`).
- **Group.** A `<fieldset>` (implicit role `group`) labelled by its Label.
- **Label.** A `<div>` inside a Group or RadioGroup, in `dropdown-menu-group-label-font` (overline) / `dropdown-menu-group-label-text-color`, padded like an Item's text (`dropdown-menu-item-padding-inline`, `space-inset-xs` on the block axis). Not focusable.
- **Separator.** An `<hr>` (implicit role `separator`): a `border-width-default` line in `dropdown-menu-separator-border-color` at its block start, `dropdown-menu-padding` above and below, bleeding to the Content's edges (negative `dropdown-menu-padding` inline margins). Brand book: "destructive actions sit last, behind a separator."

No Portal, Positioner, ItemIndicator, Shortcut, Sub or Arrow Part (see API).

## API

`DropdownMenu.Root`

| Prop           | Type                                                                     | Default | Notes                                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                                                                |         | Controlled. Applied in a layout effect with `showPopover({ source: trigger })` / `hidePopover()`.                                                                                                        |
| `defaultOpen`  | `boolean`                                                                | `false` | Uncontrolled.                                                                                                                                                                                            |
| `onOpenChange` | `(open: boolean, details: DropdownMenu.Root.ChangeEventDetails) => void` |         | `details`: `reason` (`"trigger-press"` \| `"outside-press"` \| `"escape-key"` \| `"item-press"` \| `"focus-out"` \| `"none"`), `event`, `cancel()`. See Behaviour for which reasons `cancel()` can stop. |
| `children`     | `ReactNode`                                                              |         | Trigger and Content.                                                                                                                                                                                     |

`DropdownMenu.Trigger`

| Prop      | Type                       | Default | Notes                                                                                                                                 |
| --------- | -------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `asChild` | `boolean`                  | `false` | Renders the single child (Button, IconButton) with the Trigger's props and attributes (Radix Slot).                                   |
| …native   | `ComponentProps<"button">` |         | `ref`, `className`, `onClick`, native attributes. The Trigger owns `type`, `commandfor`, `command`, `aria-haspopup`, `aria-expanded`. |

`DropdownMenu.Content`

| Prop    | Type                    | Default    | Notes                                                                                                           |
| ------- | ----------------------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| `side`  | `"top" \| "bottom"`     | `"bottom"` | Preferred side; flips to the other one when it does not fit (Behaviour).                                        |
| `align` | `"start" \| "end"`      | `"start"`  | Logical: `start` lines the menu up with the Trigger's inline-start edge.                                        |
| …native | `ComponentProps<"div">` |            | `ref`, `className`, native attributes. The Content owns `id`, `popover`, `role`, `tabindex`, `aria-labelledby`. |

`DropdownMenu.Item`

| Prop           | Type                       | Default     | Notes                                                                                                 |
| -------------- | -------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `variant`      | `"default" \| "danger"`    | `"default"` | `data-variant`. Danger for destructive actions, placed last after a Separator (source).               |
| `closeOnClick` | `boolean`                  | `true`      | Close the menu when the Item is activated (click, Enter, Space).                                      |
| `disabled`     | `boolean`                  | `false`     | `aria-disabled="true"`; stays focusable, activation blocked (APG).                                    |
| `onClick`      | `MouseEventHandler`        |             | The action. With `closeOnClick` it runs after the menu has closed (Behaviour).                        |
| …native        | `ComponentProps<"button">` |             | `ref`, `className`, `aria-keyshortcuts`, native attributes. The Item owns `type`, `role`, `tabindex`. |

`DropdownMenu.CheckboxItem`: `checked`, `defaultChecked` (`false`), `onCheckedChange(checked: boolean, details)` (reason `"item-press"`), `closeOnClick` (default `false`), `disabled`, `ComponentProps<"button">`.

`DropdownMenu.RadioGroup`: `value`, `defaultValue`, `onValueChange(value: string, details)` (reason `"item-press"`), `ComponentProps<"div">`. `DropdownMenu.RadioItem`: `value: string` (required), `closeOnClick` (default `false`), `disabled`, `ComponentProps<"button">`.

`DropdownMenu.Group`: `ComponentProps<"fieldset">`; `DropdownMenu.Label`: `ComponentProps<"div">`; `DropdownMenu.Separator`: `ComponentProps<"hr">`. The Trigger also owns its `id` (the Content's `aria-labelledby`). Down / Up Arrow on the Trigger of an open menu move focus to its first / last item.

Names, checked against the reference libraries:

- **Component `DropdownMenu`**: Radix "Dropdown Menu … Displays a menu to the user—such as a set of actions or functions—triggered by a button." (https://www.radix-ui.com/primitives/docs/components/dropdown-menu); shadcn "Dropdown Menu" with the same sentence (https://ui.shadcn.com/docs/components/dropdown-menu). Base UI calls it Menu ("A list of actions in a dropdown, enhanced with keyboard navigation.", https://base-ui.com/react/components/menu), as do Ark, React Aria ("A menu displays a list of actions or options that a user can choose.", https://react-aria.adobe.com/Menu), MUI and Mantine ("Combine a list of secondary actions into single interactive area", https://mantine.dev/core/menu/). Spec #1 names DropdownMenu and ContextMenu as two components (Radix, shadcn; Base UI also ships ContextMenu separately), so the token words are `dropdown-menu` and `context-menu`.
- **Parts `Root`, `Trigger`, `Content`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `Label`, `Separator`**: Radix anatomy `DropdownMenu.Root`, `Trigger`, `Portal`, `Content`, `Label`, `Item`, `Group`, `CheckboxItem`, `ItemIndicator`, `RadioGroup`, `RadioItem`, `Sub`, `SubTrigger`, `SubContent`, `Separator`, `Arrow`; Radix Trigger "The button that toggles the dropdown menu."; Content "The component that pops out when the dropdown menu is open."; Group "Used to group multiple DropdownMenu.Items."; Label "Used to render a label. It won't be focusable using arrow keys." Base UI has `Group` and `GroupLabel` ("An accessible label that is automatically associated with its parent group.") and `Popup` for Content; Ark `Content`, `ItemGroup`, `ItemGroupLabel`. Part words follow Radix (spec #1 naming rule).
- **No Portal, no Positioner**: the Content is a native popover rendered in place (phase-4 contract 1); the top layer replaces the portal and CSS anchor positioning replaces the positioner.
- **No ItemIndicator**: Radix "Renders when the parent DropdownMenu.CheckboxItem or DropdownMenu.RadioItem is checked."; Base UI `CheckboxItemIndicator`, `RadioItemIndicator`. The Item draws the check and the diamond itself, as Checkbox draws its check (judgement call: one look, fewer Parts).
- **No Shortcut Part**: shadcn alone has one ("Add `DropdownMenuShortcut` to show keyboard hints.", `<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>`); Radix, Base UI and Ark have none; React Aria composes its `<Keyboard>` component (`<Keyboard>⌘O</Keyboard>`), Mantine a `rightSection`, MUI a `Typography`. Here the Kbd component is the child, as in React Aria, so platform glyphs (⌘ / Ctrl) come for free.
- **`open` / `defaultOpen` / `onOpenChange(open, details)`**: Base UI "`onOpenChange` `((open: boolean, eventDetails: Menu.Root.ChangeEventDetails) => void)` … Event handler called when the menu is opened or closed."; Radix `defaultOpen`, `open`, `onOpenChange` "`(open: boolean) => void`".
- **`reason` values**: Base UI "`type MenuRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'focus-out' | 'list-navigation' | 'escape-key' | 'item-press' | 'close-press' | 'sibling-open' | 'cancel-open' | 'imperative-action' | 'none';`". The subset this menu can produce is kept with Base UI's spelling.
- **`side` / `align`**: Radix Content `side` default `"bottom"`, `align` default `"center"`; Base UI Positioner side `'bottom'`, align `'center'`; shadcn's wrapper defaults `align = "start"` and `sideOffset = 4`. Start alignment follows shadcn and the source (menus open from their trigger corner), so `"center"` is dropped (judgement call). Left and right sides are dropped too: without submenus nothing needs them.
- **`closeOnClick`**: Base UI Item "`closeOnClick` … `true` … Whether to close the menu when the item is clicked." and CheckboxItem / RadioItem default `false`; Ark `closeOnSelect` "Whether to close the menu when an option is selected"; Mantine `closeMenuOnClick` and "By default, clicking a checkbox item does not close the menu". Radix uses `event.preventDefault` in `onSelect` instead ("Calling `event.preventDefault` in this handler will prevent the dropdown menu from closing when selecting that item.").
- **`onClick`**: Base UI Item "`onClick` … The click handler for the menu item."; Mantine and MUI also use the click handler. Radix and Ark use `onSelect`, React Aria `onAction` ("Handler that is called when the item is selected."). The Item is a native button, so Enter and Space reach `onClick` too.
- **`variant: "default" | "danger"`**: shadcn "Use `variant="destructive"` for irreversible actions." with `variant?: "default" | "destructive"`; Mantine `<Menu.Item color="red">Delete</Menu.Item>`. The Dictionary word is `danger` (Button's danger Variant, token `dropdown-menu-item-danger-*`), so shadcn's prop with this system's word.
- **`disabled`**: Radix, Base UI ("Whether the component should ignore user interaction."), Ark and Mantine all name it `disabled`. React Aria `isDisabled`.
- **`checked` / `defaultChecked` / `onCheckedChange(checked, details)`**: Base UI CheckboxItem "`onCheckedChange` `((checked: boolean, eventDetails) => void)`"; Radix `checked` "`boolean | 'indeterminate'`", `onCheckedChange` "`(checked: boolean) => void`".
- **`RadioGroup` `value` / `defaultValue` / `onValueChange(value, details)`, RadioItem `value`**: Base UI RadioGroup "`onValueChange` `((value: any, eventDetails) => void)`"; Radix RadioGroup `value`, `onValueChange` "`(value: string) => void`", RadioItem "`value*`" (required).
- **`asChild`** on Trigger: Radix Trigger `asChild` "`boolean`", default `false`.
- Left out (YAGNI): submenus (`Sub`, `SubTrigger`, `SubContent`; Base UI `SubmenuRoot`), `Arrow`, `Portal` / `container`, `modal` (Radix and Base UI default `true`), `loop` / `loopFocus` as props (always on), `textValue` / `label` typeahead overrides (Radix, Base UI, React Aria), `indeterminate` CheckboxItems (Radix), `inset` (shadcn), `sideOffset` / `alignOffset` / collision props (Radix), `LinkItem` (Base UI), `onCloseAutoFocus` / `onEscapeKeyDown` / `onPointerDownOutside` (Radix), `forceMount`, hover-opened menus (Base UI `openOnHover`), scrolling menus (Base UI `Viewport`; menus stay short: brand book "Menus group related actions").

## States

| State               | How it shows                                                                                              | Exposed as                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| closed              | Trigger only                                                                                              | `aria-expanded="false"` on the Trigger                 |
| open                | Content shown next to the Trigger                                                                         | `:popover-open` on the Content, `aria-expanded="true"` |
| opened by a pointer | The entry scale runs (Motion)                                                                             | `data-pointer` on the Content                          |
| item highlighted    | Fill `dropdown-menu-item-background-color-hovered` (plus the focus ring from the keyboard), no transition | `:focus-visible` or `:hover` on the Item (zip rules)   |
| item disabled       | Whole row at `opacity-disabled`, as the zip draws it; no hover fill                                       | `aria-disabled="true"`                                 |
| item danger         | Text and icon in `dropdown-menu-item-danger-{text,icon}-color`                                            | `data-variant="danger"`                                |
| checked             | Check (CheckboxItem) or diamond (RadioItem) in the indicator box                                          | `aria-checked="true"`                                  |

## Behaviour

- **One element, native popover.** The Content is a `popover="auto"` element next to the Trigger, so it inherits `dir`, `lang` and `data-theme` from its DOM parent (spike #4: "a popover inside a `dir="rtl"` element matches `:dir(rtl)` … while it is in the top layer") and its Feedback events bubble through the app's tree. `auto` gives light dismiss and Escape (MDN popover: "Showing an auto popover will generally close other auto popovers that are already displayed, unless they are nested."); a menu opened from inside a Popover keeps that Popover open.
- **Opening.** Click, Enter or Space on the Trigger run its `toggle-popover` command (HTML: the command event is fired "using CommandEvent, with its command attribute initialized to command, its source attribute initialized to element, and its cancelable attribute initialized to true"). The Content listens for `command`, calls `onOpenChange(next, { reason: "trigger-press", event, cancel })` and `cancel()` calls `event.preventDefault()` ("If continue is false, then return."). Down / Up Arrow on the Trigger call `onOpenChange(true, …)` then `showPopover({ source: trigger })` from a `keydown` handler (with `preventDefault()` so the page does not scroll). Either way the Trigger is the popover's source: HTML show popover "Set element's popover trigger to source. Set element's implicit anchor element to source.", which anchors the Content and puts it next in the Tab order. A controlled `open` set by the parent is applied without calling `onOpenChange` back.
- **Initial focus.** In the `toggle` event (newState `"open"`) the Content focuses its first Item, or the last one after Up Arrow (APG: "When a menu opens, or when a menubar receives focus, keyboard focus is placed on the first item."). Pointer opens do the same: APG makes no exception for them, so the first Item shows the highlight (judgement call).
- **Closing and reasons.** Each close is reported once, before or as it happens:
  - `"escape-key"` and `"outside-press"`: native (close watcher, light dismiss). The Content notes the last Escape `keydown` inside it and the last `pointerdown` outside it and the Trigger, and reports the close from `beforetoggle` (newState `"closed"`). `cancel()` does nothing: MDN beforetoggle "This event is cancelable when an element is toggled to open ("show") but not when the element is closing."
  - `"trigger-press"`: a Trigger press while open, through the cancelable `command` event (above).
  - `"item-press"`: activating an Item (or Enter on a CheckboxItem / RadioItem) with `closeOnClick`. Reported before the Item calls `hidePopover()`; `cancel()` keeps the menu open.
  - `"focus-out"`: Tab or Shift+Tab (or any focus move) to an element outside the Content. The Content listens for `focusout` with a `relatedTarget` outside it, reports the close, and calls `hidePopover()` in the next task, once focus has landed: HTML fires `blur` before it will "Designate entry as the focused area of the document", and hide popover restores focus only "If focusPreviousElement is true and document's focused area of the document's DOM anchor is a shadow-including inclusive descendant of element", so hiding later lets Tab's destination keep focus (inference from the focus update steps; build ticket tests three engines). `cancel()` keeps the menu open.
  - `"none"`: anything else the browser does (another auto popover or a modal dialog opening, MDN: "popover="auto" popovers are also dismissed by successful HTMLDialogElement.showModal() and Element.requestFullscreen() calls").
- **Item activation.** An Item is a `<button>`, so Enter, Space and pointer clicks all arrive as `click`. On an enabled Item the handler, in order: (1) if `closeOnClick`, reports `"item-press"` and, unless cancelled, calls `hidePopover()` and puts focus on the Trigger; (2) calls the consumer's `onClick`; (3) dispatches `ab-press`. The menu closes before the action runs so that an action opening a Dialog records the Trigger as the element to return to: HTML show a modal dialog "Set this's previously focused element to the focused element." runs before it hides open popovers (judgement call on the order).
- **CheckboxItem / RadioItem.** A click or Space toggles (`onCheckedChange(!checked)`; RadioGroup `onValueChange(value)`, reason `"item-press"`, `cancel()` keeps the old value) and the menu stays open unless `closeOnClick`. Enter toggles and closes the menu whatever `closeOnClick` says, because APG Enter "activates the item and closes the menu" (a `keydown` Enter marks the next `click`; judgement call). Choosing the RadioItem that is already checked changes nothing and calls nothing.
- **Disabled Items** (`aria-disabled`): the `click` handler calls `preventDefault()` and returns, so nothing closes, runs or dispatches; arrow keys still reach them (APG: "Disabled menu items are focusable but cannot be activated."), typeahead skips them (Mantine: "Disabled items are skipped.").
- **Highlight follows the pointer.** `pointermove` (mouse or pen) over an enabled Item focuses it with `{ preventScroll: true }`; leaving the Items or moving over a disabled Item focuses the Content, so no Item is highlighted (Base UI `highlightItemOnHover` default `true`: "Whether moving the pointer over items should highlight them."). The highlight is `:focus-visible` (keyboard) or `:hover` (pointer) styling with no transition, as the zip's menu CSS draws it (source: "Highlight follows the pointer instantly — no transition on hover inside menus.").
- **Typeahead.** A printable key (no Ctrl, Meta or Alt) adds to a buffer that clears 500 ms after the last key (Mantine: "Multiple characters typed in quick succession (within 500ms) match items whose labels start with the full typed string."; judgement call on the value). Focus moves to the next enabled Item, after the focused one and wrapping, whose text (without its `kbd`) starts with the buffer, ignoring case; repeating one character cycles through matches (Mantine: "Pressing the same character again cycles through items that start with it."). No match: focus stays.
- **Positioning** (spike #4 recipe): `margin: var(--ab-dropdown-menu-offset)` on every side (the zip's rule, which also keeps the menu that far from the viewport edges and nudges it `offset` inward from the Trigger's edge); `position-anchor: auto; inset: auto;` then `inset-block-start: anchor(self-end)` for `side="bottom"` (`inset-block-end: anchor(self-start)` and `margin-block-end` for `"top"`), `inset-inline-start: anchor(self-start)` for `align="start"` (`inset-inline-end: anchor(self-end)` for `"end"`), `position-try-fallbacks: flip-block` (the try tactic swaps the insets and the margins), and `min-inline-size: max(var(--ab-dropdown-menu-min-width), anchor-size(self-inline))`. Spike #4: `anchor()` on logical insets with `self-*` sides "places the popover correctly in all three engines, in LTR and in an RTL island, and `flip-block` still flips it". No `position-visibility` (Safari only). No `z-index`: the top layer is above every stacking context.
- **Focus return.** Escape returns focus natively (close watcher "closeAction being to hide a popover given element, true, true, false, and null", and hide popover then "run[s] the focusing steps for previouslyFocusedElement"). Two cases need help, so on every close except `"outside-press"` and `"focus-out"` the Content moves focus to the Trigger when focus was inside it: (1) WebKit, which does not focus a clicked button (spike #4 gap 7: "Escape leaves focus on a hidden element inside the popover"); (2) a menu opened inside another open popover, because show popover restores focus "only for the first popover in a stack" (HTML note). For `"item-press"` this runs synchronously right after `hidePopover()`, before `onClick`; for native closes in `toggle` (newState `"closed"`). After a light dismiss or a focus-out, focus stays where the user put it.
- **Disabled Trigger.** Pass `disabled` to the Button / IconButton child: its click handler calls `preventDefault()`, and HTML runs a button's activation behaviour (the command) only when the click was not cancelled (inference from the DOM dispatch algorithm; build ticket tests it). The Trigger's Arrow-key handler checks `aria-disabled` too.
- Client components (`'use client'`): Root (state, context), Trigger, Content, Item, CheckboxItem, RadioGroup, RadioItem (handlers), Group and Label (they share a generated id through context). Separator is a Server Component.

## Motion

From the source: "Scales from .97 at its trigger corner + fades, 200ms in / 150ms out (ease-out). Highlight follows the pointer instantly — no transition on hover inside menus."

- **Enter:** `opacity` 0 → 1 over `dropdown-menu-enter-duration` (`motion-duration-popover`, 200 ms) with `dropdown-menu-easing` (`motion-easing-enter`), from `@starting-style` on `:popover-open`. Opened by a pointer (`data-pointer`, set from the Trigger's `pointerdown` and cleared on `keydown`, the Accordion rule), it also scales from `dropdown-menu-enter-scale` (`motion-scale-enter`, 0.97) with `transform-origin` at the Trigger corner: block start and the `align` side (`top left` for bottom / start in LTR, mirrored with `:dir(rtl)`). Brand book: "Popovers and tooltips grow from their trigger".
- **Keyboard opens fade only**, without the scale (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions."; the fade is not movement, as under reduced motion).
- **Flip.** When `flip-block` applies, the origin stays on the preferred side: `@position-try` cannot change `transform-origin`. At a 3 % scale the difference is not visible (judgement call).
- **Exit:** `opacity` over `dropdown-menu-exit-duration` (`motion-duration-exit`, 150 ms) with `display` and `overlay` `allow-discrete`, no scale. Exits are faster than entrances.
- **Highlight:** no transition.
- **Reduced motion:** `motion-scale-enter` resolves to 1 under `prefers-reduced-motion: reduce` (token media override), so only the fade stays.
- **Instant exit:** spike #4: "Firefox and WebKit compute `display: none` at once". The menu vanishes in the frame the user pressed Escape, clicked outside or chose an Item; the action has run and focus is back on the Trigger, so an instant close reads as correct.

## Keyboard

APG patterns: **Menu Button** (https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) for the Trigger and **Menu and Menubar** (https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) for the open menu. Home and End are quoted from the APG Actions Menu Button example (https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-actions/): the pattern offers them "If arrow key wrapping is not supported", and this menu wraps and keeps them, as the example does.

On the Trigger:

| Key        | Action (APG)                                                                    |
| ---------- | ------------------------------------------------------------------------------- |
| Enter      | "opens the menu and places focus on the first menu item."                       |
| Space      | "Opens the menu and places focus on the first menu item."                       |
| Down Arrow | "(Optional) Down Arrow: opens the menu and moves focus to the first menu item." |
| Up Arrow   | "(Optional) Up Arrow: opens the menu and moves focus to the last menu item."    |

In the menu:

| Key                  | Action (APG)                                                                                                                                                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Down Arrow           | "When focus is in a menu, moves focus to the next item, optionally wrapping from the last to the first." Wraps (Base UI `loopFocus` default `true`).                                                                                                                                            |
| Up Arrow             | "When focus is in a menu, moves focus to the previous item, optionally wrapping from the first to the last." Wraps.                                                                                                                                                                             |
| Home                 | "Moves focus to the first menu item."                                                                                                                                                                                                                                                           |
| End                  | "Moves focus to the last menu item."                                                                                                                                                                                                                                                            |
| Printable characters | "Move focus to the next item in the current menu whose label begins with that printable character." (Behaviour: typeahead)                                                                                                                                                                      |
| Enter                | "Otherwise, activates the item and closes the menu."                                                                                                                                                                                                                                            |
| Space                | Item: "When focus is on a menuitem that does not have a submenu, activates the menuitem and closes the menu." CheckboxItem: "changes the state without closing the menu." RadioItem: "checks the focused menuitemradio and unchecks any other checked menuitemradio element in the same group." |
| Escape               | "Close the menu that contains focus and return focus to the element or context, e.g., menu button or parent menuitem, from which the menu was opened."                                                                                                                                          |
| Tab / Shift + Tab    | "When focus is on a menuitem in a menu or menubar, move focus out of the menu or menubar, and close all menus and submenus." Focus goes to the element after the Trigger (Tab) or to the Trigger (Shift + Tab).                                                                                 |

Arrow keys and Home / End call `preventDefault()` so the page does not scroll. Only Escape is native (close watcher); it closes only this menu when another Floating layer is open below it (source: "Esc closes this menu only").

**RTL:** nothing to swap. Without submenus a menu has no Left / Right behaviour: APG "if the menubar were not present, e.g., the menus were opened from a menubutton, Right Arrow would not do anything when focus is on an item that does not have a submenu."

## Accessibility

- **Roles.** Trigger: button with `aria-haspopup="menu"` and `aria-expanded` (APG: "The element with role button has aria-haspopup set to either menu or true." and "When the menu is displayed, the element with role button has aria-expanded set to true."). HTML-AAM already maps `aria-expanded` for a toggle-popover button ("If the associated element is displayed as a popover: aria-expanded=true"); the explicit attribute keeps every engine and the `asChild` case consistent (inference). No `aria-controls` (APG: "Optionally").
- **Menu name.** The Content has `aria-labelledby` → Trigger (APG: "aria-labelledby set to a value that refers to the menuitem or button that controls its display."), so an IconButton Trigger needs its `aria-label`.
- **Items.** ARIA in HTML allows `button` to take "menuitem, menuitemcheckbox, menuitemradio"; `tabindex="-1"` follows APG ("Each item in the menu has tabindex set to -1"). Checked state is `aria-checked` ("When a menuitemcheckbox or menuitemradio is checked, aria-checked is set to true."), disabled is `aria-disabled` ("When a menu item is disabled, aria-disabled is set to true.").
- **Groups and Separators.** WAI-ARIA allows a menu's children to be "group with accessibility child menuitem", "group with accessibility child menuitemradio", "group with accessibility child menuitemcheckbox", "menuitem", "menuitemcheckbox", "menuitemradio" and "separator". A Label outside a Group would be a child the menu role does not allow, so Label belongs inside a Group or RadioGroup and names it (Base UI GroupLabel: "automatically associated with its parent group"). APG groups with separators ("Items in a menu may be divided into groups by placing an element with a role of separator between groups."); Separators here are `role="separator"` with the default horizontal orientation, not focusable (APG: "A separator in a menu is not focusable or interactive.").
- **Shortcuts.** The Kbd child is `aria-hidden` and the Item carries `aria-keyshortcuts` (Kbd spec), so the Item's name stays its label ("Duplicate", not "Duplicate Command D"). The consumer writes both; the component cannot set `aria-hidden` on a child.
- **Contrast.** Item text `color-text-default`, danger text `color-text-danger`, icons `color-icon-subtle` / `color-icon-danger` / `color-icon-accent`, shortcut and Label text `color-text-subtlest`: every one is in the contrast matrix on `surface-floating` and on the highlight fill `background-selected` (`background-neutral-subtle-hovered` equals the dark Material). The Material is `color-material-thick`, a 90 % fill of the floating surface (archived brand book), so text over it stays close to the matrix value (inference). Disabled text is exempt (WCAG 2.2 1.4.3: text "part of an inactive user interface component … have no contrast requirement").
- **Targets.** Items are `size-control-sm` tall (28 on fine pointers, larger on coarse ones), above 24 px.
- **More contrast:** `color-text-subtlest` steps up to `color-text-subtle` and `color-border-subtle` to `color-border-default` under `(prefers-contrast: more)` (token media overrides), so shortcuts, Labels and Separators gain contrast with no component rule; one component rule steps the item icons from `color-icon-subtle` to `color-icon-default`.
- **Forced colors:** the Material and the shadow disappear, so the Content gets a 1 px `CanvasText` border; the highlighted Item sets `Highlight` / `HighlightText` explicitly (the fill would otherwise vanish); disabled Items use `GrayText`; icons, the check and the diamond use `currentColor`; Separators are borders and take the system colour.
- **Reduced transparency:** `color-material-thick` turns solid under `(prefers-reduced-transparency: reduce)` (token media override; brand book: "Under reduced transparency every material turns solid."), so item text never sits on blur.

## RTL

Logical properties only: icon and indicator at the inline start, Kbd at the inline end, `align` in logical terms, insets through `anchor(self-start)` / `anchor(self-end)` so the menu mirrors inside an RTL island too (spike #4). `transform-origin` is physical, so it is mirrored with `:dir(rtl)`, never `[dir]`. Directional icons mirror through the Icon component; `check` is not mirrored (Icon spec). No arrow-key behaviour to swap.

## Component tokens

Existing (ported from the source): `dropdown-menu-min-width`, `dropdown-menu-padding`, `dropdown-menu-border-radius`, `dropdown-menu-background-color`, `dropdown-menu-blur`, `dropdown-menu-saturate`, `dropdown-menu-shadow`, `dropdown-menu-offset`, `dropdown-menu-item-height`, `dropdown-menu-item-padding-inline`, `dropdown-menu-item-gap`, `dropdown-menu-item-border-radius`, `dropdown-menu-item-font`, `dropdown-menu-item-text-color`, `dropdown-menu-item-icon-color`, `dropdown-menu-item-background-color-hovered`, `dropdown-menu-item-icon-color-selected`, `dropdown-menu-item-danger-text-color`, `dropdown-menu-item-danger-icon-color`, `dropdown-menu-item-shortcut-text-color`, `dropdown-menu-group-label-font`, `dropdown-menu-group-label-text-color`, `dropdown-menu-separator-border-color`, `dropdown-menu-enter-scale`, `dropdown-menu-enter-duration`, `dropdown-menu-exit-duration`, `dropdown-menu-easing`.

Proposed new:

| Token | References | `$type` | Why |
| ----- | ---------- | ------- | --- |

The diamond size (`size-indicator`), the Label's block padding (`space-inset-xs`) and the Separator width (`border-width-default`) use semantic tokens directly; no app is expected to change them. The check and the diamond reuse `dropdown-menu-item-icon-color-selected`.

## Built-in labels

None. Item text is the consumer's, and the menu is named by its Trigger.

## Feedback events

| Event        | When                                                             | `reason` |
| ------------ | ---------------------------------------------------------------- | -------- |
| `ab-press`   | After an enabled Item's `onClick` runs (pointer, Enter or Space) | `"user"` |
| `ab-toggle`  | After a CheckboxItem or RadioItem change commits (not cancelled) | `"user"` |
| `ab-dismiss` | When the user closes the menu with Escape or an outside press    | `"user"` |

Detail: `{ component: "DropdownMenu", reason }`. `ab-press` and `ab-toggle` are dispatched from the Item, `ab-dismiss` from the Content; all bubble through the app tree (rendered in place). Nothing for an Item press that closes the menu (the `ab-press` is the feedback), a focus-out, a Trigger press, a controlled `open` change or a disabled Item. A Button or IconButton Trigger dispatches its own `ab-press`. `src/events/events.ts` widens `PressEvent`'s component union with `"DropdownMenu"`, and the `ab-toggle` and `ab-dismiss` unions (Checkbox and Alert add them) with `"DropdownMenu"`.

## Sources

- Source guide: artifact `project/components/Menu/README.md` ("List of actions or options revealed from a trigger; for choosing a form value use Select/Combobox instead."; "Surface: thick material + blur 20 + saturate 1.8, radius 12, 4px padding → items 28 tall with radius 8 (concentric 12 − 4). Shortcut hints right-aligned in subtlest text."; "Scales from .97 at its trigger corner + fades, 200ms in / 150ms out (ease-out). Highlight follows the pointer instantly — no transition on hover inside menus."; "Enter/Space/↓ on trigger opens at first item, ↑ at last · ↑↓ Home End move · type to jump · Enter activate · Esc closes this menu only · Tab closes and moves on."; "`role="menu"` with `menuitem`/`menuitemcheckbox`/`menuitemradio`; trigger has `aria-haspopup` and synced `aria-expanded`; focus returns to the trigger on close. Destructive items sit last, after a separator."). Brand book: Motion, Interaction principles ("Menus group related actions; destructive actions sit last, behind a separator."; "Esc closes only the topmost popover or dialog, then focus returns to its invoker."), Personality (the bob), Materials; archived brand book: concentric radius ("Menu 12 → 4px → item 8"), elevation and material tables.
- Spike #4: `docs/research/floating-platform.md` (positioning recipe, exit in Chromium only, `dir` in the top layer, WebKit focus gap 7).
- HTML Living Standard, popover (show and hide popover, close watcher, light dismiss, focus restore "only for the first popover in a stack"): https://html.spec.whatwg.org/multipage/popover.html · button commands (CommandEvent): https://html.spec.whatwg.org/multipage/form-elements.html · focus update steps and focus navigation scope: https://html.spec.whatwg.org/multipage/interaction.html · `dialog` show-modal steps: https://html.spec.whatwg.org/multipage/interactive-elements.html
- HTML-AAM (`command` in the toggle popover state): https://w3c.github.io/html-aam/ · ARIA in HTML (`button` allowed roles): https://www.w3.org/TR/html-aria/ · WAI-ARIA (menu allowed child roles), Editor's Draft 21 October 2026: https://w3c.github.io/aria/ · WCAG 2.2 1.4.3: https://www.w3.org/TR/WCAG22/
- MDN popover attribute: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover · Using the Popover API: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using · beforetoggle: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event
- Baseline (webstatus.dev, and web-features 3.44.0 `by_compat_key` for anchor positioning, 2026-10-24): `popover` newly available (low 2025-01-27); `invoker-commands` newly (2025-12-12); `showPopover({ source })` newly (2025-10-14); `toggleevent-source` newly (2026-05-11); `starting-style` and `transition-behavior` newly (2024-08-06); `overlay` limited (Chrome only; exit animation is a progressive enhancement); anchor keys `css.properties.inset-block-start.anchor`, `css.types.anchor-size`, `css.properties.min-inline-size.anchor-size`, `css.properties.position-try-fallbacks.flip-block` low 2026-01-13; `position-anchor: auto` low 2026-09-14; `dir-pseudo` widely; `pointer-events-api` widely (low 2020-07-28).
- WAI-ARIA APG Menu Button: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/ · Actions Menu Button example: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-actions/ · Menu and Menubar: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
- Radix Dropdown Menu: https://www.radix-ui.com/primitives/docs/components/dropdown-menu · shadcn/ui Dropdown Menu: https://ui.shadcn.com/docs/components/dropdown-menu (and the registry source https://ui.shadcn.com/r/styles/base-nova/dropdown-menu.json) · Base UI Menu: https://base-ui.com/react/components/menu · Ark Menu: https://ark-ui.com/react/docs/components/menu · React Aria Menu: https://react-aria.adobe.com/Menu · Mantine Menu: https://mantine.dev/core/menu/ · MUI Menu: https://mui.com/material-ui/react-menu/
