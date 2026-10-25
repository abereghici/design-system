# ContextMenu

The same menu as DropdownMenu, opened at the pointer by a right click or a long press on an area: a file card, a table row, a canvas. It is a shortcut, never the only way to an action: every Item must also be reachable from a visible control, usually a DropdownMenu on the same thing. For a menu opened from a button, use DropdownMenu.

```tsx
import { ContextMenu } from "@platform/ui/context-menu";
import { Kbd } from "@platform/ui/kbd";
import { CopyIcon } from "@platform/ui/icons/copy";
import { TrashIcon } from "@platform/ui/icons/trash";

<ContextMenu.Root>
  <ContextMenu.Trigger>
    <FileCard file={file} />
  </ContextMenu.Trigger>
  <ContextMenu.Content aria-label="File actions">
    <ContextMenu.Item onClick={duplicate} aria-keyshortcuts="Meta+D Control+D">
      <CopyIcon />
      Duplicate
      <Kbd keys="mod+d" aria-hidden />
    </ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item variant="danger" onClick={remove}>
      <TrashIcon />
      Delete
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>

<ContextMenu.Root>
  <ContextMenu.Trigger asChild disabled={editing}>
    <tr>…</tr>
  </ContextMenu.Trigger>
  <ContextMenu.Content aria-label="Row actions">…</ContextMenu.Content>
</ContextMenu.Root>
```

Status: draft for brand-owner review (phase 4). Source guide: `components/Menu/README.md` in the artifact (one guide for DropdownMenu and ContextMenu).

## Anatomy

Root (no DOM) → Trigger (area) → pointer anchor (hidden 0 × 0 `<span>`) → Content (`[popover]` menu) → Items, CheckboxItems, RadioGroups, Groups, Labels, Separators.

- **Root.** Holds the open state. Renders no element.
- **Trigger.** A `<div>` wrapping the target, with no role and no styles; with `asChild`, the child element is the area. Not focusable itself.
- **Pointer anchor.** A `<span aria-hidden="true">` the Content renders just before itself: `position: fixed`, 0 × 0, `pointer-events: none`. On open it is moved to the pointer and passed as the popover's `source`, which makes it the implicit anchor.
- **Content.** A `<div popover="auto" role="menu" tabindex="-1">` rendered next to the Trigger, drawn exactly as DropdownMenu's Content with the `context-menu-*` tokens (Material `context-menu-background-color` with `context-menu-blur` / `context-menu-saturate`, `context-menu-shadow`, radius `context-menu-border-radius` 12, padding `context-menu-padding` 4, at least `context-menu-min-width` 224 wide), `context-menu-offset` (4) below the pointer. Not stretched to the Trigger: the area can be any size.
- **Items, CheckboxItems, RadioItems, RadioGroups, Groups, Labels, Separators.** As in `dropdown-menu.md` (Anatomy), with `context-menu-item-*`, `context-menu-group-label-*` and `context-menu-separator-border-color` in place of the `dropdown-menu-` tokens.

## API

`ContextMenu.Root`

| Prop           | Type                                                                    | Default | Notes                                                                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                                                               |         | Controlled. Meant for reading the state and closing the menu; an open set by the parent anchors at the Trigger's block-start, inline-start corner (Behaviour).                                                            |
| `defaultOpen`  | `boolean`                                                               | `false` | Uncontrolled. Same anchor as a parent-made open.                                                                                                                                                                          |
| `onOpenChange` | `(open: boolean, details: ContextMenu.Root.ChangeEventDetails) => void` |         | `details`: `reason` (`"trigger-press"` \| `"outside-press"` \| `"escape-key"` \| `"item-press"` \| `"focus-out"` \| `"none"`), `event`, `cancel()`. `"trigger-press"` is the right click, long press or context-menu key. |
| `children`     | `ReactNode`                                                             |         | Trigger and Content.                                                                                                                                                                                                      |

`ContextMenu.Trigger`

| Prop       | Type                    | Default | Notes                                                                                         |
| ---------- | ----------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `disabled` | `boolean`               | `false` | The menu does not open and the browser's own context menu comes back (no `preventDefault()`). |
| `asChild`  | `boolean`               | `false` | Makes the single child (a `<tr>`, `<li>`, a card) the area (Radix Slot).                      |
| …native    | `ComponentProps<"div">` |         | `ref`, `className`, `onContextMenu`, native attributes.                                       |

`ContextMenu.Content`

| Prop                              | Type                    | Default | Notes                                                                                                                          |
| --------------------------------- | ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `aria-label` \| `aria-labelledby` | `string`                |         | Required (one of the two, in the types): there is no button to name the menu (Accessibility).                                  |
| …native                           | `ComponentProps<"div">` |         | `ref`, `className`, native attributes. The Content owns `id`, `popover`, `role`, `tabindex`. No `side` or `align` (Behaviour). |

`ContextMenu.Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `Label`, `Separator`: the same props as the DropdownMenu Parts of the same name (`dropdown-menu.md`, API): `variant: "default" | "danger"`, `closeOnClick` (Item `true`, CheckboxItem and RadioItem `false`), `disabled`, `onClick`, `checked` / `defaultChecked` / `onCheckedChange(checked, details)`, `value` / `defaultValue` / `onValueChange(value, details)`, reason `"item-press"`.

Names, checked against the reference libraries:

- **Component `ContextMenu`**: Radix "Displays a menu located at the pointer, triggered by a right click or a long press." (https://www.radix-ui.com/primitives/docs/components/context-menu); shadcn "Displays a menu of actions triggered by a right click." (https://ui.shadcn.com/docs/components/context-menu); Base UI "A menu that appears at the pointer on right click or long press." (https://base-ui.com/react/components/context-menu). Ark, React Aria and Mantine make it a mode of their single Menu (Ark `Menu.ContextTrigger`, React Aria `trigger="contextMenu"`, Mantine `Menu.ContextMenu`). Spec #1 keeps it a separate component, as Radix, shadcn and Base UI do.
- **`Trigger` is an area**: Radix "The area that opens the context menu. Wrap it around the target you want the context menu to open from when right-clicking (or using the relevant keyboard shortcuts)."; Base UI "An area that opens the menu on right click or long press. Renders a `<div>` element."; shadcn `ContextMenuTrigger`. Ark names it `ContextTrigger`.
- **`disabled` on Trigger**: Radix Trigger `disabled` "When `true`, the context menu won't open when right-clicking. Note that this will also restore the native context menu."; Mantine "Set `disabled` to restore the browser's default context menu". Base UI puts `disabled` on Root ("Whether the component should ignore user interaction."). The Trigger is where the native menu is suppressed, so the prop sits there (Radix).
- **`data-popup-open`** on Trigger: Base UI ContextMenu Trigger "`data-popup-open` … Present when the corresponding context menu is open."; Radix uses `[data-state]` "`"open" | "closed"`". Base UI's presence attribute is kept (judgement call: one attribute, no string state).
- **`asChild`** on Trigger: Radix ContextMenu Trigger `asChild` "`boolean`", default `false`.
- **`open` / `defaultOpen` / `onOpenChange(open, details)`**: Base UI ContextMenu Root `defaultOpen` "`false` … Whether the menu is initially open.", `open`, "`onOpenChange` `((open: boolean, eventDetails: ContextMenu.Root.ChangeEventDetails) => void)`". Radix has `open` and `onOpenChange` but no `defaultOpen`, and warns: "This is intended for reading the open state and closing the menu programmatically—we discourage opening the menu programmatically, since opening it depends on user interaction to position the menu." `defaultOpen` is kept for parity with DropdownMenu and Base UI, with a defined anchor (judgement call).
- **`reason` values**: Base UI's ContextMenu uses the same 13-value union as Menu ("`'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'focus-out' | 'list-navigation' | 'escape-key' | 'item-press' | 'close-press' | 'sibling-open' | 'cancel-open' | 'imperative-action' | 'none'`"); this menu produces the same subset as DropdownMenu.
- **No `side` / `align`**: Radix ContextMenu Content has `alignOffset` but no `side`, `sideOffset` or `align`; Base UI Positioner "Positions the context menu popup against the pointer or a custom anchor." with align `'start'` and side `'bottom'`. The menu always opens below and after the pointer and flips at the edges, like an operating-system context menu.
- **Long press**: Ark "Context menus are also opened during a long-press of roughly `700ms` when the pointer is pen or touch."; Radix "Triggers with a long press on touch devices"; React Aria "Use `trigger="contextMenu"` to open the menu when right clicking with a mouse, long pressing on touch, or via OS and screen reader specific keyboard shortcuts. The menu is positioned at the point the user clicked."; Mantine "On touch devices (most notably iOS Safari, which does not fire the `contextmenu` event), the dropdown is opened with a long-press instead." with `longPressDelay` "`500`ms by default". 700 ms follows Ark (judgement call), as a constant, not a prop.
- **Item Parts**: as DropdownMenu (`dropdown-menu.md`, names bullets); Radix and shadcn ContextMenu repeat the DropdownMenu Parts one for one, and Base UI's ContextMenu reuses its Menu Parts.
- Left out (YAGNI): `longPressDelay` (Mantine), `alignOffset` (Radix), `modal` (Radix), submenus, `Arrow`, `Portal`, and everything left out of DropdownMenu.

## States

| State               | How it shows                                             | Exposed as                                                                                                 |
| ------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| closed              | The area as the consumer drew it                         | no `data-popup-open` on the Trigger                                                                        |
| open                | Content at the pointer (or at the focused element)       | `:popover-open` on the Content, `data-popup-open` on the Trigger, so an app can mark the row it belongs to |
| opened by a pointer | The entry scale runs (Motion)                            | `data-pointer` on the Content                                                                              |
| disabled            | Nothing changes; the browser's own menu opens            | the `disabled` prop only                                                                                   |
| item states         | As DropdownMenu (highlighted, disabled, danger, checked) | As DropdownMenu                                                                                            |

## Behaviour

- **Opening with a mouse.** The Trigger listens for `contextmenu` (MDN: it "fires when the user attempts to open a context menu. This event is typically triggered by clicking the right mouse button, or by pressing the context menu key."), calls `preventDefault()` so the browser's own menu stays closed, reports `onOpenChange(true, { reason: "trigger-press", event, cancel })`, moves the pointer anchor to `clientX` / `clientY` and calls `showPopover({ source: anchor })`. HTML show popover: "Set element's popover trigger to source. Set element's implicit anchor element to source.", so the same anchor recipe and flip as DropdownMenu apply (verified by the build in Chromium, Firefox and WebKit, in an RTL island: the menu's inline-start edge sits on the pointer and its top `context-menu-offset` below it). `cancel()` skips the open and the browser's menu still does not show.
- **Placing the anchor.** Client coordinates are relative to the viewport, but a `position: fixed` element is relative to a transformed ancestor when there is one. The anchor is set to `left: 0; top: 0`, measured with `getBoundingClientRect()`, then moved by `clientX − rect.left`, `clientY − rect.top` (physical properties: pointer coordinates are physical in either direction; inference).
- **Wait for the release.** Pointer Events: "in some user agents contextmenu will often follow a pointerup, while in others it'll often precede a pointerup". When `contextmenu` arrives with a button still down (`event.buttons !== 0`), the Content opens in a task after that press's `pointerup`, because HTML light dismiss on `pointerup` hides open auto popovers when the press started outside them ("Let sameTarget be true if ancestor is document's popover pointerdown target."), which a menu shown mid-press would be (verified by the build: a right press in all three engines leaves the menu open).
- **Right-click again repositions** (Mantine: "Right-clicking again repositions the dropdown to the new coordinates."): the press outside the open menu light-dismisses it (`"outside-press"`), then the new `contextmenu` opens it at the new point (`"trigger-press"`).
- **Long press** (touch and pen). iOS Safari never fires `contextmenu` (BCD: not supported on Safari iOS, WebKit bug 213953). A `pointerdown` with `pointerType` `"touch"` or `"pen"` starts a 700 ms timer, cancelled by `pointerup`, by `pointercancel` (Pointer Events: fired when "The pointer is subsequently used by the user agent to manipulate the page viewport (e.g. panning or zooming)") or by a move of more than 10 px (judgement call). When it fires, the press becomes a long press: the menu opens at the press point after the `pointerup` (the release rule above), the next `click` from that press is cancelled in the capture phase so the target under the finger is not activated, and a `contextmenu` the same press produces (Android) only gets `preventDefault()` (inference; build ticket tests on iOS and Android). Whether iOS also starts a text selection or link callout under the finger is for the build ticket to check on a device.
- **Keyboard** (context-menu key, Shift + F10: APG "by invoking a command, such as Shift + F10 in Windows, that opens a context specific menu"). Pointer Events: for events "generated by a non-pointing device (such as voice recognition software or a keyboard interaction), pointerId MUST be -1 and pointerType MUST be an empty string." Such a `contextmenu` (an empty `pointerType`, or a `button` other than 2 where the event is a plain MouseEvent; not exercised by the build, because Playwright cannot press the context-menu key: Q42-1) opens with `showPopover({ source: event.target })`, so the menu sits below the focused element, not at stale coordinates. It never waits for a release.
- **A parent-made open** (`defaultOpen`, or `open` turning `true` without a gesture) places the anchor at the Trigger's block-start, inline-start corner (judgement call; Radix discourages it).
- **Initial focus** is the first Item (APG: "When a menu opens, or when a menubar receives focus, keyboard focus is placed on the first item."), for every way of opening.
- **Closing, reasons, Item activation, CheckboxItem / RadioItem, disabled Items, highlight, typeahead:** as DropdownMenu (`dropdown-menu.md`, Behaviour), with two differences: there is no Trigger press that closes (a right click on the area while open is an outside press), and the outside `pointerdown` that marks `"outside-press"` includes the Trigger area.
- **Positioning** (spike #4 recipe against the pointer anchor): `margin: 0; position-anchor: auto; inset: auto; inset-block-start: anchor(self-end); inset-inline-start: anchor(self-start); margin-block-start: var(--ab-context-menu-offset); min-inline-size: var(--ab-context-menu-min-width); position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;`. A context menu near the inline-end edge must open towards the inline start, so `flip-inline` is added to DropdownMenu's `flip-block` (web-features `css.properties.position-try-fallbacks.flip-inline` Baseline low 2026-01-13). The anchor is fixed, so the menu stays at its screen point if the page scrolls, as an operating-system context menu does.
- **Focus return.** Escape returns focus natively to the element focused before the menu opened (HTML hide popover: "run the focusing steps for previouslyFocusedElement"); APG: "return focus to the element or context … from which the menu was opened". The WebKit and nested-popover handler of DropdownMenu applies, with the element that had focus before the opening press (recorded on `pointerdown`, because WebKit moves focus to `<body>` on a right press; on the context-menu key, at open) in place of the Trigger; when that was `<body>`, focus is left to the browser.
- **An enhancement only** (Base UI: "Don't make a context menu the only way to perform actions. Users may not discover or be able to open a context menu, especially on touch devices or with assistive technology. Always provide visible controls for the actions that are available in the context menu."). The docs page shows ContextMenu next to a DropdownMenu with the same Items.
- Client components (`'use client'`): Root, Trigger, Content, Item, CheckboxItem, RadioGroup, RadioItem, Group, Label. Separator is a Server Component.

## Motion

As DropdownMenu (source: "Scales from .97 at its trigger corner + fades, 200ms in / 150ms out (ease-out)."), with the corner at the pointer:

- **Enter:** `opacity` 0 → 1 over `context-menu-enter-duration` (200 ms) with `context-menu-easing`, from `@starting-style`. Opened by a pointer (right click, long press: `data-pointer`), it also scales from `context-menu-enter-scale` (0.97) with `transform-origin: top left` (the pointer corner), `top right` under `:dir(rtl)`.
- **Keyboard opens fade only** (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions.").
- **Flip.** When a fallback flips the menu, the origin stays at the preferred corner (`@position-try` cannot change `transform-origin`); at a 3 % scale this is not visible (judgement call).
- **Exit:** `opacity` over `context-menu-exit-duration` (150 ms) with `display` and `overlay` `allow-discrete`.
- **Reduced motion:** `motion-scale-enter` resolves to 1 (token media override); the fade stays.
- **Instant exit:** spike #4: exits are instant in Firefox and WebKit. The menu disappears in the frame of the Escape, outside press or Item press; the action has run and focus is back where it was, so it reads as correct.

## Keyboard

APG pattern: **Menu and Menubar** (https://www.w3.org/WAI/ARIA/apg/patterns/menubar/). There is no menu button, so the Menu Button keys do not apply; the menu opens from the context-menu key or Shift + F10 on the focused element inside the Trigger area (the operating system's key, delivered as `contextmenu`).

In the menu the keys are DropdownMenu's (`dropdown-menu.md`, Keyboard: Down / Up Arrow with wrapping, Home, End, printable characters, Enter, Space, Tab / Shift + Tab), with one difference:

| Key    | Action (APG)                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Escape | "Close the menu that contains focus and return focus to the element or context, e.g., menu button or parent menuitem, from which the menu was opened." |

Escape is native (close watcher) and closes only this menu. The APG note on context actions also applies to Enter: "If a menu is opened or a menubar receives focus as a result of a context action, Escape or Enter may return focus to the invoking context." Item activation therefore returns focus to the element focused at open time.

**RTL:** nothing to swap. APG: "if the menubar were not present, e.g., the menus were opened from a menubutton, Right Arrow would not do anything when focus is on an item that does not have a submenu."; a context menu has no submenus here either.

## Accessibility

- **Roles, Items, Groups, Separators, shortcuts:** as DropdownMenu (`dropdown-menu.md`, Accessibility).
- **Menu name.** APG: "An element with role menu either has: aria-labelledby set to a value that refers to the menuitem or button that controls its display. A label provided by aria-label." A ContextMenu has no button, and the Trigger area's text can be a whole card, so the Content requires `aria-label` or `aria-labelledby` in its types (judgement call; the Navbar and Sidebar precedent).
- **The Trigger has no role** and adds nothing to the accessibility tree; its content keeps its own semantics. No `aria-haspopup` on it (it is not a button).
- **Discoverability.** Screen-reader and keyboard users reach the menu only through the context-menu key or Shift + F10 (React Aria: "via OS and screen reader specific keyboard shortcuts"), touch users through a long press that nothing on screen advertises. Hence the enhancement rule (Behaviour): the same actions live in a visible control.
- **Contrast and targets:** as DropdownMenu, with the `context-menu-*` tokens (same semantic roles).
- **More contrast:** as DropdownMenu: subtlest text and subtle borders step up through the token media overrides; one component rule steps the item icons to `color-icon-default`.
- **Forced colors:** as DropdownMenu: a 1 px `CanvasText` border on the Content, `Highlight` / `HighlightText` on the highlighted Item, `GrayText` for disabled Items.
- **Reduced transparency:** `color-material-thick` turns solid (token media override).

## RTL

The menu opens towards the inline end of the pointer (`anchor(self-start)` on `inset-inline-start`), so after the pointer in LTR and before it in RTL, and flips inline at the edge in both. The pointer anchor itself uses physical `left` / `top`, because client coordinates are physical. `transform-origin` is mirrored with `:dir(rtl)`. Inside the menu, as DropdownMenu.

## Component tokens

Existing (ported from the source): `context-menu-min-width`, `context-menu-padding`, `context-menu-border-radius`, `context-menu-background-color`, `context-menu-blur`, `context-menu-saturate`, `context-menu-shadow`, `context-menu-offset`, `context-menu-item-height`, `context-menu-item-padding-inline`, `context-menu-item-gap`, `context-menu-item-border-radius`, `context-menu-item-font`, `context-menu-item-text-color`, `context-menu-item-icon-color`, `context-menu-item-background-color-hovered`, `context-menu-item-icon-color-selected`, `context-menu-item-danger-text-color`, `context-menu-item-danger-icon-color`, `context-menu-item-shortcut-text-color`, `context-menu-group-label-font`, `context-menu-group-label-text-color`, `context-menu-separator-border-color`, `context-menu-enter-scale`, `context-menu-enter-duration`, `context-menu-exit-duration`, `context-menu-easing`.

Proposed new (the DropdownMenu pair, so the two menus stay overridable one by one):

| Token | References | `$type` | Why |
| ----- | ---------- | ------- | --- |

As in DropdownMenu, the diamond size, the Label's block padding and the Separator width use semantic tokens directly. The pointer anchor needs no token.

## Author-written text

None. The menu's name is the consumer's `aria-label` (required).

## Feedback events

| Event        | When                                                             | `reason` |
| ------------ | ---------------------------------------------------------------- | -------- |
| `ab-press`   | After an enabled Item's `onClick` runs (pointer, Enter or Space) | `"user"` |
| `ab-toggle`  | After a CheckboxItem or RadioItem change commits (not cancelled) | `"user"` |
| `ab-dismiss` | When the user closes the menu with Escape or an outside press    | `"user"` |

Detail: `{ component: "ContextMenu", reason }`, from the Item (`ab-press`, `ab-toggle`) or the Content (`ab-dismiss`), bubbling through the app tree. A right click that repositions an open menu dispatches `ab-dismiss` for the close it is made of (judgement call: one rule for every outside press). Nothing for an Item press that closes the menu, a focus-out, a controlled `open` change or a disabled Item. `src/events/events.ts` widens `PressEvent`'s component union and the `ab-toggle` and `ab-dismiss` unions with `"ContextMenu"`.

## Sources

- Source guide: artifact `project/components/Menu/README.md` (shared with DropdownMenu; quotes in `dropdown-menu.md`). Brand book: Motion ("Popovers and tooltips grow from their trigger"; "No motion on keyboard-initiated or high-frequency (100+ per day) actions."), Interaction principles ("Esc closes only the topmost popover or dialog, then focus returns to its invoker.").
- `dropdown-menu.md` (shared Item Parts, keyboard, accessibility, focus handler).
- Spike #4: `docs/research/floating-platform.md`.
- HTML Living Standard, popover (show popover with `source`, hide popover, light dismiss): https://html.spec.whatwg.org/multipage/popover.html
- Pointer Events (click, auxclick and contextmenu from non-pointing devices; ordering of contextmenu and pointerup; pointercancel): https://w3c.github.io/pointerevents/
- MDN `contextmenu` event: https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event · BCD `api.Element.contextmenu_event` (Safari iOS not supported, https://webkit.org/b/213953)
- Baseline (webstatus.dev, and web-features 3.44.0 `by_compat_key`, 2026-10-24): `popover` newly available (low 2025-01-27); `showPopover({ source })` newly (2025-10-14); `toggleevent-source` newly (2026-05-11); `starting-style`, `transition-behavior` newly (2024-08-06); `overlay` limited; `css.properties.position-try-fallbacks.flip-block` and `.flip-inline`, `css.properties.inset-block-start.anchor` low 2026-01-13; `position-anchor: auto` low 2026-09-14; `pointer-events-api` widely (2020-07-28); the `contextmenu` event sub-key is not Baseline (Safari iOS), hence the long press.
- WAI-ARIA APG Menu and Menubar: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
- Radix Context Menu: https://www.radix-ui.com/primitives/docs/components/context-menu · shadcn/ui Context Menu: https://ui.shadcn.com/docs/components/context-menu · Base UI Context Menu: https://base-ui.com/react/components/context-menu · Ark Menu (context trigger): https://ark-ui.com/react/docs/components/menu · React Aria Menu (`trigger="contextMenu"`): https://react-aria.adobe.com/Menu · Mantine Menu (`Menu.ContextMenu`): https://mantine.dev/core/menu/ · MUI Menu (context menu demo): https://mui.com/material-ui/react-menu/
