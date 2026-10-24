# Tooltip

A short label for an icon-only control, with its keyboard shortcut ("Copy link ⌘ C"), shown on hover and on keyboard focus. Never put essential or interactive content in a Tooltip: touch users never see it. For interactive or longer content anchored to a trigger, use Popover; for text that must always be read, put it on the page.

```tsx
import { Tooltip } from "@platform/ui/tooltip";
import { IconButton } from "@platform/ui/icon-button";
import { Button } from "@platform/ui/button";
import { Kbd } from "@platform/ui/kbd";
import { CopyIcon } from "@platform/ui/icons/copy";

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <IconButton aria-label="Copy link" aria-keyshortcuts="Meta+C Control+C">
      <CopyIcon />
    </IconButton>
  </Tooltip.Trigger>
  <Tooltip.Content>
    Copy link <Kbd keys="mod+c" aria-hidden />
  </Tooltip.Content>
</Tooltip.Root>

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Button disabled>Publish</Button>
  </Tooltip.Trigger>
  <Tooltip.Content side="bottom">Add a title before publishing</Tooltip.Content>
</Tooltip.Root>
```

Status: draft for brand-owner review (phase 4). Source guide: `components/Tooltip/README.md` in the artifact.

## Anatomy

Root (no DOM) → Trigger (the control) + Content (Floating layer: text, then an optional Kbd).

- **Root.** Holds the open state and the generated Content `id`. Renders no element.
- **Trigger.** The control the Tooltip describes. By default a `<button type="button">`; with `asChild` the consumer's Button, IconButton or Link (Radix Slot). It receives `aria-describedby` and the event handlers.
- **Content.** A `<div role="tooltip" popover="manual" id>` rendered next to the Trigger in the DOM, shown in the top layer. An inline-flex row: text in `tooltip-font` / `tooltip-text-color` on `tooltip-background-color` (the inverse fill), `tooltip-padding-block` / `tooltip-padding-inline`, radius `tooltip-border-radius` (5), at most `tooltip-max-width` (224) wide, then wrapping. An optional Kbd sits at the inline end, `tooltip-gap` after the text, in its own keycap colours. `tooltip-offset` (8) from the Trigger. No elevation and no Material: the archived brand book lists `elevation-overlay` for "Menus, listboxes, popovers, select picker" and no tooltip, and the inverse fill already separates it from the page (judgement call).
- **Bridge.** An invisible `::before` on the Content that extends `tooltip-offset` beyond both of its block edges, so the pointer can cross the gap from the Trigger to the Content without leaving both (see Behaviour). Both edges, because the side may flip.

## API

`Tooltip.Root`

| Prop           | Type                                                                | Default | Notes                                                                                                                                |
| -------------- | ------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `open`         | `boolean`                                                           |         | Controlled.                                                                                                                          |
| `defaultOpen`  | `boolean`                                                           | `false` | Uncontrolled.                                                                                                                        |
| `onOpenChange` | `(open: boolean, details: Tooltip.Root.ChangeEventDetails) => void` |         | `details`: `reason`, `event`, `cancel()`. Reasons below. Every change can be cancelled: the Tooltip runs every show and hide itself. |
| `disabled`     | `boolean`                                                           | `false` | No Tooltip: no listeners, no `aria-describedby`. Closes an open one with `reason: "none"`.                                           |
| `children`     | `ReactNode`                                                         |         | One Trigger and one Content.                                                                                                         |

`reason`: `"trigger-hover"` (pointer entered, or left both Trigger and Content), `"trigger-focus"` (keyboard focus arrived or left), `"trigger-press"` (the press that hides it), `"escape-key"`, `"none"` (another Tooltip opened, `disabled` turned on, or a controlled change).

`Tooltip.Trigger`: `asChild?: boolean` plus `ComponentProps<"button">` (`ref`, `className`, native attributes). The consumer's `aria-describedby`, if any, is kept and the Content `id` is appended (inference: a space-separated IDREF list, as ARIA allows).

`Tooltip.Content`

| Prop    | Type                           | Default    | Notes                                                                     |
| ------- | ------------------------------ | ---------- | ------------------------------------------------------------------------- |
| `side`  | `"top" \| "bottom"`            | `"top"`    | Preferred side. Flips to the other side when there is no room.            |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment against the Trigger; `start` / `end` are logical.               |
| …native | `ComponentProps<"div">`        |            | `ref`, `className`, native attributes. `id`, `role`, `popover` are owned. |

Names, checked against the reference libraries:

- **Component and Parts `Tooltip.Root`, `Trigger`, `Content`**: Radix "Contains all the parts of a tooltip.", "The button that toggles the tooltip. By default, the Tooltip.Content will position itself against the trigger.", "The component that pops out when the tooltip is open." (https://www.radix-ui.com/primitives/docs/components/tooltip); Base UI Tooltip.Root > Trigger, Portal > Positioner > Popup (https://base-ui.com/react/components/tooltip); Ark Tooltip.Root > Trigger, Positioner > Content (https://ark-ui.com/llms-react.txt); shadcn "Tooltip ├── TooltipTrigger └── TooltipContent" (https://ui.shadcn.com/docs/components/tooltip). Every library says Tooltip. The source's single-element API (`<Tooltip content="Copy link" shortcut="mod+c">`) becomes these Parts (spec #1 naming rule), and its `shortcut` prop becomes a Kbd child.
- **`open` / `defaultOpen` / `onOpenChange(open, details)`**: Base UI "`onOpenChange` `((open: boolean, eventDetails: Tooltip.Root.ChangeEventDetails) => void)`" and `defaultOpen` "`false`"; Radix "`onOpenChange` `(open: boolean) => void`".
- **`reason` values**: Base UI "`type TooltipRootChangeEventReason = | 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'disabled' | 'imperative-action' | 'none';`". Only the words this Tooltip can produce are kept. No `"outside-press"` (a press elsewhere is a pointer leaving, `"trigger-hover"`), and `"disabled"` / `"imperative-action"` fold into `"none"` (judgement call: the smallest union).
- **`disabled`**: Base UI "`disabled` … `false` … Whether the tooltip is disabled."; Ark `disabled`; React Aria `isDisabled`.
- **`side` / `align`**: Radix Content "`side` `"top" | "right" | "bottom" | "left"`" default "top", "`align` `"start" | "center" | "end"`" default "center", "The preferred alignment against the trigger. May change when collisions occur."; Base UI Positioner side default `'top'`, align default `'center'`; shadcn TooltipContent `side "top"`, `align "center"`. React Aria (`placement 'top'`), MUI and Ark use one `placement` word; Radix, Base UI and shadcn split side and align, which the logical `start` / `end` need. Only `"top" | "bottom"` sides (judgement call: the source shows tooltips above and below controls; a horizontal side needs `flip-inline` and RTL checks nobody has asked for).
- **`asChild` on Trigger**: Radix Slot, shared contract. IconButton's spec already plans "it will wrap IconButton through `Tooltip.Trigger asChild`".
- Left out (YAGNI): Provider and its `delayDuration` / `skipDelayDuration` (Radix, "Provider to control display delay globally.") and Base UI's Provider `timeout`, per-trigger `delay` / `closeDelay` (Base UI, React Aria, Ark): the delay is the `tooltip-delay` token and the warm window a constant (Behaviour). Also `Arrow` and `Portal` (Radix, Base UI), `sideOffset` (the `tooltip-offset` token), `left` / `right` sides, `disableHoverableContent` (Radix: "Disabling this has accessibility consequences."), `closeOnClick` and `closeOnEscape` (Base UI, Ark: always on here), `trigger="focus"` and `shouldCloseOnPress` (React Aria), MUI's `describeChild` and `enterTouchDelay` (touch never opens it), Base UI `handle`, `actionsRef`, `onOpenChangeComplete`.

## States

| State   | How it shows                                                                    | Exposed as                                                        |
| ------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| closed  | Nothing drawn                                                                   | Content not `:popover-open`                                       |
| waiting | In the top layer but invisible and not hit-testable, until `tooltip-delay` ends | `:popover-open` with `data-pointer`, before its transition starts |
| open    | Shown at its side of the Trigger                                                | `:popover-open`                                                   |
| instant | Shown (or hidden) with no delay and no transition                               | `data-instant` on Content                                         |
| side    | Which side it prefers                                                           | `data-side="top" \| "bottom"`, `data-align` on Content            |

## Behaviour

- **Rendered in place.** The Content is a `popover="manual"` element next to the Trigger, so it inherits `dir`, `lang` and theme from its DOM parent (spike #4: "a popover inside a `dir="rtl"` element matches `:dir(rtl)` and computes `direction: rtl` while it is in the top layer"). Manual, not `auto` or `hint`. HTML: auto "Closes other popovers when opened; has light dismiss and responds to close requests", manual "Does not close other popovers; does not light dismiss or respond to close requests", and the show-popover steps close other popovers only "If originalType is Auto or Hint", so a Tooltip over an open DropdownMenu leaves the menu open. `popover="hint"` would be the native fit, but webstatus.dev `popover-hint` is limited (Chrome 151, Firefox 153, no Safari). Because manual popovers ignore close requests, the Tooltip scripts its own hide and Escape.
- **Opening.** The Content opens with `showPopover({ source: trigger })`, which sets the implicit anchor (HTML: "Set element's implicit anchor element to source.") and the Trigger as its popover trigger.
  - On `pointerenter` of the Trigger with `pointerType` `"mouse"` or `"pen"`, reason `"trigger-hover"`. Never on touch: Base UI "tooltips are disabled on touch devices", React Aria "Tooltips are not shown on touch screen interactions", and the source "Touch never opens it — the label must stand alone." The Content gets `data-pointer`.
  - On `focus` of the Trigger only when it matches `:focus-visible`, reason `"trigger-focus"` (source: "shown on `:focus-visible`"). A click that focuses a button does not show it.
  - **The delay is CSS.** A pointer open shows the popover at once, but the Content transitions `opacity` and `visibility` with `transition-delay: var(--ab-tooltip-delay)` (500 ms, source "First show waits `--ab-tooltip-delay` (500ms)"), so it is invisible and not hit-testable until the delay ends. A pointer that leaves within the delay hides a Tooltip that was never seen. Keyboard opens have no delay: Radix "Tab | Opens/closes the tooltip without delay.", React Aria "instantly on focus". `onOpenChange(true)` is called when the popover opens, so a controlled parent hears `open` before the delay ends (judgement call: the delay is presentation, not state).
  - **Warm state.** When another Tooltip was visibly shown and closed less than 400 ms ago, the new Content gets `data-instant` and appears with no delay and no transition (source: "moving to a neighbour within 400ms shows instantly with no animation (warm state)"). Base UI's Provider: "Another tooltip will open instantly if the previous tooltip is closed within this timeout." (`timeout` 400); React Aria: "Once a tooltip is displayed, other tooltips display immediately. If the user waits for the "cooldown period" before hovering another element, the warmup timer restarts." One module-level timestamp, written on close only if that Tooltip was actually visible: the Content records that on `transitionstart` (MDN: "fired when a CSS transition has actually started, i.e., after any transition-delay has ended") or at once for keyboard and instant opens. Without that guard, sweeping the pointer across a toolbar would skip the delay. 400 ms is a script constant, not a token (judgement call: it is a timing rule, not a look an app overrides).
  - Opening a Tooltip hides any other open Tooltip with reason `"none"` and `data-instant` on the leaving one, so two never show together.
- **Closing** with `hidePopover()`:
  - The pointer leaves both Trigger and Content (`pointerleave` on each, checked against `relatedTarget`), reason `"trigger-hover"`. The Content is hoverable: APG "it remains open as long as the cursor is over the trigger or the tooltip"; WCAG 2.2 SC 1.4.13 "Hoverable: If pointer hover can trigger the additional content, then the pointer can be moved over the additional content without the additional content disappearing". The Bridge covers the offset gap.
  - The Trigger loses focus (`blur`) after a focus open, reason `"trigger-focus"`. APG: "If the tooltip is invoked when the trigger element receives focus, then it is dismissed when it no longer has focus (onBlur)."
  - A press on the Trigger: `pointerdown`, or Enter / Space `keydown`, reason `"trigger-press"` (source "Hides on leave, blur, press and Esc."; Radix "Closes when the trigger is activated or when pressing escape."). It stays closed until the pointer leaves the Trigger or focus moves, so the hover that is still there does not reopen it (inference).
  - Escape: a `keydown` listener on `document` (capture) while open, reason `"escape-key"`. It calls `preventDefault()` on the keydown, which stops the close request (HTML close request steps: "If event is not null, and its canceled flag is set, then return."), so Escape over an open DropdownMenu or Dialog closes the Tooltip first and the layer under it on the next press (brand book: "Esc closes only the topmost popover or dialog"). WCAG 1.4.13 "Dismissible: A mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus".
- **One state path.** Every change goes through `onOpenChange(next, { reason, event, cancel })` before the Tooltip calls `showPopover` / `hidePopover`; `cancel()` skips the call. Controlled `open` is applied in a layout effect with `showPopover({ source })` / `hidePopover()`, with no delay (no `data-pointer`).
- **Never essential, never interactive.** The Content has no focusable children (APG: "Tooltip widgets do not receive focus. A hover that contains focusable elements can be made using a non-modal dialog."; Mantine: "Interactive content should be put in a Popover instead"). It never moves focus: HTML's popover focusing steps only focus an `autofocus` element, and the Content holds none.
- **Disabled controls keep their Tooltip.** A Trigger with `aria-disabled="true"` stays focusable and hoverable, so the Tooltip can say why the control is unavailable (spec #1 user story 51). A natively `disabled` button inside a disabled Fieldset fires no pointer or focus events in some engines (inference), so it shows no Tooltip.
- Client components (`'use client'`): Root (state, context), Trigger (handlers), Content (popover calls, listeners).

## Motion

From the source: "First show waits `--ab-tooltip-delay` (500ms); moving to a neighbour within 400ms shows instantly with no animation (warm state)."

- **Enter (pointer opens):** after the delay, the Content fades from opacity 0 and scales from `tooltip-enter-scale` (`motion-scale-enter`, 0.97) to 1 over `tooltip-duration` (`motion-duration-tooltip`, 125 ms) with `tooltip-easing` (`motion-easing-enter`, ease-out), with `@starting-style`. `transform-origin` is the edge facing the Trigger (brand book: "Popovers and tooltips grow from their trigger, never from nothing."); it follows `side`, not the flipped side, which a 0.97 scale cannot show (inference).
- **Keyboard and warm opens:** no delay and no transition (`data-instant`, or no `data-pointer`). Brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions."; Base UI's Popup `data-instant` `'delay' | 'dismiss' | 'focus'` "Present if animations should be instant."
- **Exit:** `transition: opacity var(--ab-tooltip-exit-duration), display … allow-discrete, overlay … allow-discrete`, ease-out, no scale. **Flag for review:** the only semantic exit duration is `motion-duration-exit` (150 ms), longer than the 125 ms entry, against the brand book's "Exits are faster than entrances." No shorter primitive is invented here; the brand owner can point `tooltip-exit-duration` at a shorter semantic token if one is added.
- **Reduced motion:** `motion-scale-enter` resolves to `scale-100` under `(prefers-reduced-motion: reduce)` (token media override), so the Content only fades; the delay and the fade stay (brand book: "Opacity and color fades remain.").
- **Instant exit:** spike #4 found exits animate only in Chromium; Firefox and WebKit "compute `display: none` at once". A Tooltip that vanishes the moment the pointer leaves, the control is pressed or Escape is pressed reads as correct: it is a passive label, nothing waits for it, and focus never was inside it.

## Keyboard

APG pattern: **Tooltip** (https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). APG marks it "work in progress; it does not yet have task force consensus." The Trigger keeps its own pattern (APG **Button**, https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key                              | APG                                                                                                                                                   | Here                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Tab (focus arrives)              | Tooltip: "A tooltip is a popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it." | Opens at once when the Trigger matches `:focus-visible`.                                                       |
| Tab / Shift + Tab (focus leaves) | Tooltip note: "If the tooltip is invoked when the trigger element receives focus, then it is dismissed when it no longer has focus (onBlur)."         | Closes.                                                                                                        |
| Escape                           | Tooltip: "Escape: Dismisses the Tooltip."                                                                                                             | Closes; the keydown is cancelled so no layer below closes.                                                     |
| Enter / Space                    | Button: "Enter: Activates the button." / "Space: Activates the button."                                                                               | The Trigger acts as usual and the Tooltip hides (Radix "Enter \| If open, closes the tooltip without delay."). |

Focus never moves: APG "Focus stays on the triggering element while the tooltip is displayed."

**RTL:** no arrow-key behaviour, so nothing to swap.

## Accessibility

- **Roles.** Content `role="tooltip"`; the Trigger references it with `aria-describedby`. APG: "The element that serves as the tooltip container has role tooltip." and "The element that triggers the tooltip references the tooltip element with aria-describedby."; Mantine: "The tooltip body has `role="tooltip"` attribute" / "The target element has `aria-describedby` attribute". The source: "`role="tooltip"`, linked by `aria-describedby`".
- **The description is there while closed.** AccName 1.2 "Hidden Not Referenced": a hidden node is skipped unless it is part of "an aria-labelledby or aria-describedby traversal, where the node directly referenced by that relation was hidden", so screen readers get the description whether or not the Tooltip shows. The same rule says user agents "MUST include all nodes in the subtree" of a hidden referenced node, so a closed Tooltip's `aria-hidden` Kbd may be read into the description while an open one's is not (inference; the build ticket's screen-reader pass checks it, and if so the Content describes the Trigger through a wrapper around its text only).
- **Name and description.** The Trigger keeps its own name (IconButton's `aria-label`); the Tooltip is its description. For an icon-only control that repeats the name ("Copy link, button, Copy link"), which is a judgement call: Base UI asks that "The tooltip's trigger must have an `aria-label` attribute that closely matches the tooltip's content", while MUI "By default, the tooltip only labels its child element." We describe, because a name from a hidden popover would make the control's name depend on another component.
- **Shortcut.** The Kbd inside the Content is `aria-hidden`; the Trigger carries `aria-keyshortcuts` (Kbd contract: "The control carries the shortcut in `aria-keyshortcuts` instead, so its name stays its label").
- **Contrast.** `tooltip-text-color` (`color-text-inverse`) on `tooltip-background-color` (`color-background-neutral-bold`) is a contrast-matrix pair: 13.98 light, 15.93 dark (token description; source "Inverse colours (≥ 12:1)").
- **Targets:** unchanged; the Tooltip adds nothing to press.
- **Stacking:** the top layer ignores `z-index`; the most recently shown layer is on top, so a Tooltip opened over a menu or Dialog draws above it (inference from top-layer ordering).
- **More contrast:** nothing changes; the pair is already above 12:1. The Kbd steps its hairline up on its own (Kbd spec).
- **Forced colors:** the fill is dropped, so the Content draws a 1 px `CanvasText` border (`border-width-default`) in `@media (forced-colors: active)`; its text becomes `CanvasText`.
- **Reduced transparency:** not affected (solid inverse fill, no Material).

## RTL

Logical properties only: `inset-inline-start` / `inset-inline-end` for `align`, padding and gap logical. The Content inherits `dir` from the Trigger's parent in the top layer, and the spike #4 recipe places it correctly in an RTL island. The Kbd keeps its own `dir="ltr"` (Kbd spec).

Positioning, from spike #4 (Q4-2): `margin: 0; position-anchor: auto; inset: auto;` then `side="top"`: `inset-block-end: anchor(self-start); margin-block-end: var(--ab-tooltip-offset)`, `side="bottom"`: `inset-block-start: anchor(self-end); margin-block-start: var(--ab-tooltip-offset)`; `align="start"`: `inset-inline-start: anchor(self-start)`, `align="end"`: `inset-inline-end: anchor(self-end)`, `align="center"`: `justify-self: anchor-center`; and `position-try-fallbacks: flip-block`. Spike #4: "`anchor()` on logical insets … places the popover correctly in all three engines, in LTR and in an RTL island, and `flip-block` still flips it." `anchor-center` was not covered by the spike; the build ticket tests it in an RTL island and at the viewport edge (inference). Never `position-visibility` (spike #4 gap 6).

## Component tokens

Existing (ported from the source): `tooltip-max-width`, `tooltip-padding-block`, `tooltip-padding-inline`, `tooltip-border-radius`, `tooltip-background-color`, `tooltip-text-color`, `tooltip-font`, `tooltip-gap`, `tooltip-offset`, `tooltip-duration`, `tooltip-delay`.

Proposed new:

| Token                   | References             | `$type`     | Why                                                                 |
| ----------------------- | ---------------------- | ----------- | ------------------------------------------------------------------- |
| `tooltip-enter-scale`   | `motion-scale-enter`   | number      | Entry scale (0.97); resolves to 1 under reduced motion              |
| `tooltip-exit-duration` | `motion-duration-exit` | duration    | Exit fade (150 ms); flagged in Motion, longer than the 125 ms entry |
| `tooltip-easing`        | `motion-easing-enter`  | cubicBezier | Ease-out for entry and exit                                         |

No Kbd override token: the Kbd keeps its own colours inside the Tooltip. The forced-colors border uses `border-width-default` directly.

## Built-in labels

None. The Content's text is the consumer's.

## Feedback events

None. A Tooltip is passive: it shows because the pointer or focus arrived, not because the user did something an app should answer with sound.

## Sources

- Source guide: artifact `project/components/Tooltip/README.md` ("Short label for icon-only controls and their shortcut; never put essential or interactive content in a tooltip."; "First show waits `--ab-tooltip-delay` (500ms); moving to a neighbour within 400ms shows instantly with no animation (warm state). Hides on leave, blur, press and Esc. Touch never opens it — the label must stand alone."; "`role="tooltip"`, linked by `aria-describedby`; shown on `:focus-visible`. Inverse colours (≥ 12:1)."). Brand book, Motion ("Exits are faster than entrances.", "Popovers and tooltips grow from their trigger, never from nothing.", "No motion on keyboard-initiated or high-frequency (100+ per day) actions.", "Reduced motion removes movement, scaling, blur and stagger. Opacity and color fades remain."), Interaction principles ("Teach shortcuts in place", "One layer closes at a time"). Archived brand book, Elevation table.
- WAI-ARIA APG Tooltip: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/ · Button: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- WCAG 2.2 SC 1.4.13 Content on Hover or Focus: https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus
- AccName 1.2 (Hidden Not Referenced): https://www.w3.org/TR/accname-1.2/
- HTML Living Standard, the popover attribute (states table, show popover, popover focusing steps): https://html.spec.whatwg.org/multipage/popover.html · close requests: https://html.spec.whatwg.org/multipage/interaction.html
- MDN `transitionstart`: https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event
- Spike #4: `docs/research/floating-platform.md` (§4 `dir`, §5 exit, gaps 2, 5, 6, 8; Q4-2).
- Baseline (webstatus.dev and web-features 3.44.0, 2026-10-24): `popover` newly available (low 2025-01-27); `showPopover({ source })` newly (low 2025-10-14); `popover-hint` limited (not used); `starting-style` and `transition-behavior` newly (low 2024-08-06); `overlay` limited (exit enhancement only, absence reads as an instant exit); anchor positioning keys low 2026-01-13, `position-anchor: auto` low 2026-09-14, `justify-self: anchor-center` low 2026-01-13 (Q4-1); `focus-visible` widely (low 2022-03-14); `pointer-events-api` (`pointerType`) widely (low 2020-07-28).
- Radix Tooltip: https://www.radix-ui.com/primitives/docs/components/tooltip · Base UI Tooltip: https://base-ui.com/react/components/tooltip (reason type from https://base-ui.com/react/components/tooltip.md) · React Aria Tooltip: https://react-aria.adobe.com/Tooltip · Ark Tooltip: https://ark-ui.com/llms-react.txt · MUI Tooltip: https://mui.com/material-ui/api/tooltip/, https://mui.com/material-ui/react-tooltip/ · Mantine Tooltip: https://mantine.dev/core/tooltip/ · shadcn Tooltip: https://ui.shadcn.com/docs/components/tooltip
