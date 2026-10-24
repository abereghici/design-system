# Popover

A non-modal panel of interactive content anchored to a trigger: filters, a short form, details with links. The page stays usable behind it. For a list of actions, use DropdownMenu; for a one-line hint, use Tooltip; for a task that must block the page, use Dialog.

```tsx
import { Popover } from "@platform/ui/popover";
import { Button } from "@platform/ui/button";
import { Checkbox } from "@platform/ui/checkbox";
import { ChevronDownIcon } from "@platform/ui/icons/chevron-down";

<Popover.Root>
  <Popover.Trigger asChild>
    <Button variant="secondary">
      Filters <ChevronDownIcon data-icon="inline-end" />
    </Button>
  </Popover.Trigger>
  <Popover.Content>
    <Popover.Title>Filters</Popover.Title>
    <Popover.Description>Show only the rows that match.</Popover.Description>
    <Checkbox name="mine">Assigned to me</Checkbox>
    <Popover.Close />
  </Popover.Content>
</Popover.Root>

<Popover.Root open={open} onOpenChange={setOpen}>
  <Popover.Trigger>Share</Popover.Trigger>
  <Popover.Content aria-label="Share" side="top" align="end">
    <ShareForm />
  </Popover.Content>
</Popover.Root>
```

Status: draft for brand-owner review (phase 4). Source guide: `components/Popover/README.md` in the artifact.

## Anatomy

Root (no DOM) → Trigger + Content (Floating layer: Title, Description, the consumer's content, Close).

- **Root.** Holds the open state and the generated ids. Renders no element.
- **Trigger.** A `<button type="button" commandfor={contentId} command="toggle-popover" aria-expanded aria-haspopup="dialog">`; with `asChild`, the consumer's Button or IconButton (Radix Slot). IconButton draws its selected fill while `aria-expanded="true"` (IconButton spec).
- **Content.** A `<dialog popover="auto" id>` (implicit role `dialog`, never `showModal()`) rendered next to the Trigger in the DOM, shown in the top layer. Material: `popover-background-color` (`color-material-thick`) with `backdrop-filter: blur(var(--ab-popover-blur)) saturate(var(--ab-popover-saturate))`, `popover-shadow` (overlay elevation), radius `popover-border-radius` (12), padding `popover-padding` (12), at most `popover-max-width` (320) wide. Text in `popover-font` / `popover-text-color`. Children stack in a column with `popover-gap` between them. `popover-offset` (8) from the Trigger. Source: "Same material, elevation and motion as Menu."
- **Title.** An `<h2>` in `popover-title-font` / `popover-title-text-color`; `asChild` renders another heading level. Labels the Content.
- **Description.** A `<p>` in `popover-font` / `popover-description-text-color`.
- **Close.** A `<button type="button" commandfor={contentId} command="hide-popover">`. Without children it is an icon-only button drawn with IconButton's `sm` visuals and the `x` icon (not the IconButton component, so one click dispatches one feedback event; Dialog spec), named by `labels.close`, placed absolutely in the top inline-end corner, `popover-close-offset` (4) from both edges: 12 − 4 = 8, IconButton's radius, so the corners are concentric (brand book: "inner radius = outer radius − the padding between them"). The first row of the Content keeps `padding-inline-end` clear of it. With `asChild` it is the consumer's button (e.g. a "Done" Button) in the flow.

## API

`Popover.Root`

| Prop           | Type                                                                | Default | Notes                                                                                |
| -------------- | ------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `open`         | `boolean`                                                           |         | Controlled.                                                                          |
| `defaultOpen`  | `boolean`                                                           | `false` | Uncontrolled.                                                                        |
| `onOpenChange` | `(open: boolean, details: Popover.Root.ChangeEventDetails) => void` |         | `details`: `reason`, `event`, `cancel()`. Which reasons can be cancelled: Behaviour. |
| `children`     | `ReactNode`                                                         |         | One Trigger and one Content.                                                         |

`reason`: `"trigger-press"`, `"outside-press"` (light dismiss), `"escape-key"`, `"close-press"`, `"focus-out"`, `"none"` (a script open, a controlled change, or the browser closing it for another top-layer element).

`Popover.Trigger`: `asChild?: boolean` plus `ComponentProps<"button">`. `commandfor`, `command`, `aria-expanded` and `aria-haspopup` are owned.

`Popover.Content`

| Prop           | Type                             | Default    | Notes                                                                                                |
| -------------- | -------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `side`         | `"top" \| "bottom"`              | `"bottom"` | Preferred side. Flips to the other side when there is no room.                                       |
| `align`        | `"start" \| "center" \| "end"`   | `"start"`  | Alignment against the Trigger; `start` / `end` are logical.                                          |
| `initialFocus` | `RefObject<HTMLElement \| null>` |            | The element focused on open (Behaviour, Focus). Without it, the first focusable element.             |
| …native        | `ComponentProps<"div">`          |            | `ref`, `className`, `aria-label` (needed when there is no Title). `id`, `role`, `popover` are owned. |

`Popover.Title`: `asChild?: boolean` plus `ComponentProps<"h2">`. `Popover.Description`: `ComponentProps<"p">`. `Popover.Close`: `asChild?: boolean`, `labels?: { close?: string }` (accessible name of the icon Close; falls back to the root UI provider's locale, then English; on Close as in Alert and Dialog) plus `ComponentProps<"button">`; without `asChild` it renders the icon Close.

Names, checked against the reference libraries:

- **Component and Parts `Popover.Root`, `Trigger`, `Content`, `Close`**: Radix "Contains all the parts of a popover.", "The button that toggles the popover. By default, the Popover.Content will position itself against the trigger.", "The component that pops out when the popover is open.", Close "The button that closes an open popover." (https://www.radix-ui.com/primitives/docs/components/popover); Base UI Trigger "A button that opens the popover.", Close "A button that closes the popover. Renders a `<button>` element." (https://base-ui.com/react/components/popover); Ark Root > Trigger, Positioner > Content > Title, Description, CloseTrigger (https://ark-ui.com/llms-react.txt); shadcn "Popover ├── PopoverTrigger └── PopoverContent" (https://ui.shadcn.com/docs/components/popover). Every library says Popover. Close follows Radix and Base UI over Ark's `CloseTrigger`. The source's single-element API (`<Popover trigger={…} label="Filters">`) becomes these Parts; its `label` becomes a Title or `aria-label` on Content.
- **`Title`, `Description`**: Base UI Title "A heading that labels the popover. Renders an `<h2>` element.", Description "A paragraph with additional information about the popover. Renders a `<p>` element."; shadcn exports `PopoverTitle`, `PopoverDescription`; Ark `Title`, `Description`. Radix has neither.
- **`open` / `defaultOpen` / `onOpenChange(open, details)`**: Base UI "`onOpenChange` `((open: boolean, eventDetails: Popover.Root.ChangeEventDetails) => void)`"; Radix "`onOpenChange` `(open: boolean) => void`".
- **`reason` values**: Base UI "`type PopoverRootChangeEventReason = | 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'close-press' | 'focus-out' | 'imperative-action' | 'none';`". Kept: the six this Popover can produce. No hover or focus opens (Left out), and `"imperative-action"` folds into `"none"` (judgement call).
- **`side` / `align`**: Radix Content `side` default "bottom", `align` default "center"; Base UI Positioner side `'bottom'`, align `'center'`; shadcn PopoverContent `align "center"`, `side "bottom"`. The `align` default here is `"start"` (judgement call against Radix, Base UI and shadcn: a panel of controls under a toolbar button reads from its leading edge, as the Floating-layer recipe and DropdownMenu do). React Aria (`placement 'bottom'`), MUI and Ark use one `placement` word. Only `"top" | "bottom"` sides (as Tooltip).
- **`aria-haspopup="dialog"` on Trigger and `role="dialog"` on Content**: Mantine "Target element has `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls="dropdown-id"` attributes" and "Dropdown element has `role="dialog"` and `aria-labelledby="target-id"` attributes"; Radix "Adheres to the Dialog WAI-ARIA design pattern."; the source "`role="dialog"`". Without a Title, the Content is named by the consumer's `aria-label` rather than Mantine's label-by-trigger (judgement call: the Trigger's text, e.g. "Filters ▾", is not always a good dialog name).
- **`labels`**: the typed `labels` prop plus the root UI provider's locale (spec #1). On Close, the Part that uses it (Alert and Dialog precedent).
- **`asChild`**: on Trigger, Title and Close (Radix Slot, shared contract).
- Left out (YAGNI): `modal` (Radix "The modality of the popover. When set to `true`, interaction with outside elements will be disabled…", Base UI `modal`, Ark): use Dialog. `Anchor` (Radix, Ark), `Arrow`, `Portal`, `Backdrop`, `Viewport` (Base UI), `sideOffset` (the `popover-offset` token), `left` / `right` sides, Base UI `openOnHover`, focus props (Radix `onOpenAutoFocus` / `onCloseAutoFocus`, Base UI `finalFocus` (only `initialFocus`'s `RefObject` form is taken, as in Dialog: Base UI "`RefObject`: Move focus to the ref element."), Mantine `trapFocus` / `returnFocus`, Ark `autoFocus`), shadcn `PopoverHeader`, Mantine's `aria-controls` (the `commandfor` relationship is already in the DOM; APG Dialog does not ask for it).

## States

| State               | How it shows                                         | Exposed as                                             |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| closed              | Nothing drawn; Trigger at rest                       | Content not `:popover-open`; `aria-expanded="false"`   |
| open                | Content at its side of the Trigger; Trigger selected | `:popover-open`; `aria-expanded="true"` on Trigger     |
| pointer-opened      | Entry animates (Motion)                              | `data-pointer` on Content                              |
| side                | Which side it prefers                                | `data-side="top" \| "bottom"`, `data-align` on Content |
| Close focus-visible | IconButton's ring                                    | `:focus-visible`                                       |

## Behaviour

- **Rendered in place, native auto popover.** The Content is a `popover="auto"` element next to the Trigger, so it inherits `dir`, `lang` and theme (spike #4 §4). HTML: auto "Closes other popovers when opened; has light dismiss and responds to close requests." The Popover gets light dismiss, Escape through a close watcher and the top layer from the platform (source: "Native `popover="auto"` (light dismiss, Esc, top layer)"). Spike #4 confirmed in all three engines that "Escape closes a `popover` (auto) popover, a click outside closes it, and a click inside does not." A popover rendered inside an open Popover, DropdownMenu or Tooltip stays nested: light dismiss looks for "the nearest inclusive open popover" by walking "currentNode's parent in the flat tree", so a press inside the inner layer is inside the outer one too. MDN: "popover="auto" popovers are also dismissed by successful HTMLDialogElement.showModal() … calls", so opening a Dialog closes it (reason `"none"`).
- **Opening.** A press on the Trigger runs its `toggle-popover` command (spike #4 §1: works in all three engines). The command passes the Trigger as source: HTML show popover "Set element's popover trigger to source. Set element's implicit anchor element to source." That gives the anchor (no `anchor-name`, spike #4 gap 4) and puts the Content next in the Tab order. The open is observed in `beforetoggle`, which is cancelable when opening (MDN: "This event is cancelable when an element is toggled to open ("show") but not when the element is closing."); `onOpenChange(true, { reason: "trigger-press", event, cancel })` runs there and `cancel()` calls `preventDefault()`. `ToggleEvent.source` (MDN: "or null if the popover was not activated by a control element") tells a Trigger open from a script open (`"none"`). The Content gets `data-pointer` when the press was a pointer press (the Trigger's last `pointerdown`).
- **Closing.**
  - Trigger press on an open Popover, `"trigger-press"`; Close, `"close-press"`. Both are the component's own closes, so they run `onOpenChange(false, …)` in the button's `click` handler, before the command: `cancel()` calls `preventDefault()` on the click, and the DOM runs a button's activation behaviour (the command) only "If event ’s canceled flag is unset" (Accordion precedent).
  - Escape (`"escape-key"`) and a press outside (`"outside-press"`) are the browser's. They reach `onOpenChange` from the closing `beforetoggle`, which is not cancelable, so `cancel()` does nothing for them: say so in the docs. The closing event does not say which gesture it was; the Content tells them apart by the last trusted `keydown` (Escape) or `pointerdown` outside it on `document` in the same task (inference; the build ticket tests both in three engines).
  - **Focus out** (`"focus-out"`, judgement call; Base UI's reason word): a `focusout` from the Content or the Trigger whose `relatedTarget` is outside both closes it with `hidePopover()` after `onOpenChange`, which `cancel()` can stop. The hide runs in the next task, not inside `focusout`: HTML fires blur before it designates the new focused area, and hide popover restores focus while focus is still inside, so an early hide would pull Tab's destination back to the Trigger (DropdownMenu spec, inference to test in three engines). Tab past the last element of the Content therefore closes it and focus moves on. A `null` `relatedTarget` (window switch, a press on nothing focusable) does not close it; the light dismiss covers presses (inference).
- **Focus (build finding).** Because the Content is a `<dialog>`, HTML's popover focusing steps run the dialog focusing steps, so opening moves focus to the first focusable element inside (or the `initialFocus` element) in all three engines, as APG Dialog asks. The source's "focus stays where the user puts it" is therefore not kept (Q41-1). The original draft: Focus stays where the user puts it (source: "focus stays where the user puts it"): opening leaves it on the Trigger. HTML's popover focusing steps focus a descendant only if it has the `autofocus` attribute ("let control be the autofocus delegate for subject", which skips descendants without "an autofocus content attribute"; MDN autofocus: "if it is nested inside a <dialog> or popover element, when the <dialog> or popover is shown."). React does not write the `autofocus` attribute on client renders (React DOM source: "case 'autoFocus': { // We polyfill it separately on the client during commit."); it calls `focus()` at mount, while the Content is hidden. So a field that should take focus is passed as `initialFocus` (a ref, as in Dialog): in the opening `beforetoggle` the Content sets the `autofocus` attribute on it (removed on close), and the native popover focusing steps focus it. Tab from the Trigger moves into the Content: HTML focus navigation scope "If element is in the popover showing state and has a popover trigger set, then return element's popover trigger."; MDN `showPopover` source: "The browser places the popover in a logical position in the keyboard focus navigation order when shown."
- **Focus return.** Native for Escape, Close and Trigger closes: hide popover "If focusPreviousElement is true and document's focused area of the document's DOM anchor is a shadow-including inclusive descendant of element, then run the focusing steps for previouslyFocusedElement". **WebKit handler** (spike #4 gap 7, Q4-3): Safari does not focus a button on click, so after a mouse open the previously focused element is not the Trigger, and spike #4 saw focus "stays on the hidden element". On `toggle` to closed, if `document.activeElement` is inside the Content and the reason is not `"outside-press"` or `"focus-out"`, the Popover focuses the Trigger (`preventScroll`). It never moves focus the user moved elsewhere.
- **One state path.** The Root holds `open`. Controlled `open` is applied in a layout effect with `showPopover({ source: trigger })` / `hidePopover()`, reason `"none"`, no callback. After a native toggle the `toggle` handler compares the popover with the committed state and re-applies the state if a controlled parent did not accept the change (judgement call: the prop wins).
- **Non-modal.** The page stays interactive and is not `inert`; no scroll lock, no focus trap.
- Client components (`'use client'`): Root (state, context), Trigger (`click`, `pointerdown`), Content (`beforetoggle`, `toggle`, `focusout`, document listeners), Title (reads the generated `id`; the Content points `aria-labelledby` at it unless it has an `aria-label`), Close (`click`, context for `labels`). Description is a Server Component (a plain `<p>`, no context).

## Motion

From the source: "Same material, elevation and motion as Menu." Menu: "Scales from .97 at its trigger corner + fades, 200ms in / 150ms out (ease-out)."

- **Enter (pointer opens):** fade from opacity 0 and scale from `popover-enter-scale` (`motion-scale-enter`, 0.97) to 1 over `popover-enter-duration` (`motion-duration-popover`, 200 ms), `popover-easing` (`motion-easing-enter`), with `@starting-style` (spike #4 §5: entry animates in all three engines). `transform-origin` at the Trigger's corner: block edge from `side`, inline edge from `align` (brand book: "Popovers and tooltips grow from their trigger, never from nothing."); after a flip the origin keeps the preferred side (inference: not visible at 0.97).
- **Keyboard opens:** no transition (no `data-pointer`; brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions.", the Accordion and Checkbox precedent).
- **Exit:** `transition: opacity var(--ab-popover-exit-duration), display … allow-discrete, overlay … allow-discrete` (`motion-duration-exit`, 150 ms), ease-out: faster than the entry (brand book: "Exits are faster than entrances.").
- **Reduced motion:** `motion-scale-enter` resolves to `scale-100` (token media override), so the Popover only fades.
- **Instant exit:** spike #4 found exits animate only in Chromium; Firefox and WebKit "compute `display: none` at once". The Popover closes on a deliberate gesture (Escape, a press outside, Close, Tab away), and focus is already back on the Trigger or where the user moved it, so a panel that disappears in that frame reads as correct.

## Keyboard

APG has no non-modal dialog pattern. The Content follows **Dialog (Modal)** for its role and Escape (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) without its focus containment, as APG allows for non-modal dialogs: "unlike most non-modal dialogs, modal dialogs do not provide means for moving keyboard focus outside the dialog window without closing the dialog." The Trigger is an APG **Button** (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key                     | APG                                                                               | Here                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Enter / Space (Trigger) | Button: "Enter: Activates the button." / "Space: Activates the button."           | Opens or closes the Popover (Radix "`Space` / `Enter` \| Opens/closes the popover."). Focus moves into it.                                                   |
| Tab                     | Dialog (Modal): "Moves focus to the next tabbable element inside the dialog."     | From the Trigger, into the Content. From the last tabbable element, out to the element after the Trigger, which closes the Popover (`"focus-out"`); no wrap. |
| Shift + Tab             | Dialog (Modal): "Moves focus to the previous tabbable element inside the dialog." | From the first element back to the Trigger; the Popover stays open.                                                                                          |
| Escape                  | Dialog (Modal): "Escape: Closes the dialog."                                      | Closes this Popover only (native close watcher) and returns focus to the Trigger when it was inside.                                                         |

No departure from APG on focus: the native dialog focusing steps move focus inside on open (Behaviour, Focus). Escape returning focus matches MDN: "when closing the popover via the keyboard (usually via the Esc key), focus is shifted back to the invoker."

**RTL:** no arrow-key behaviour, so nothing to swap.

## Accessibility

- **Roles.** Content `role="dialog"`, not `aria-modal` (APG: "mark a dialog modal only when both: Application code prevents all users from interacting in any way with content outside of it. Visual styling obscures the content outside of it."). Named by the Title (`aria-labelledby`) or the consumer's `aria-label`: APG "The dialog has either: A value set for the aria-labelledby property that refers to a visible dialog title. A label specified by aria-label." No `aria-describedby` on the Content: APG advises against it for structured content (judgement call).
- **Trigger.** `aria-expanded` from the open state and `aria-haspopup="dialog"`. HTML-AAM already maps a toggle-popover button: "If the associated element is displayed as a popover: aria-expanded=true If the associated element is hidden: aria-expanded=false"; the explicit attribute keeps every engine consistent (inference).
- **Close.** A native `<button>` with an accessible name from `labels.close` ("Close"). APG: "It is strongly recommended that the tab sequence of all dialogs include a visible element with role button that closes the dialog".
- **Contrast.** Text in `color-text-default`, Title the same, Description `color-text-subtle`, on Material that resolves over `surface-floating`-like fills; the text roles are in the contrast matrix on `surface-floating`. Materials are never for long text (brand book), which is why the Popover holds short content (inference: contrast on the translucent fill depends on what is behind it; the solid fallback below covers users who need it).
- **Targets:** the Trigger and Close follow Button / IconButton sizes.
- **More contrast:** Description text uses `popover-text-color` (`color-text-default`) under `(prefers-contrast: more)`; the elevation ring is the hairline and is unchanged.
- **Forced colors:** the shadow and the Material disappear, so the Content draws a 1 px `CanvasText` border (`border-width-default`) in `@media (forced-colors: active)`, as Select's picker. Close follows IconButton.
- **Reduced transparency:** `color-material-thick` turns solid under `(prefers-reduced-transparency: reduce)` (token media override: "Solid floating surface under reduced transparency"), and the Content sets `backdrop-filter: none` in the same query (judgement call: nothing shows through a solid fill, so the blur only costs).

## RTL

Logical properties only. The Content inherits `dir` in the top layer (spike #4 §4). Positioning, from spike #4 (Q4-2): `margin: 0; position-anchor: auto; inset: auto;`, `side="bottom"`: `inset-block-start: anchor(self-end); margin-block-start: var(--ab-popover-offset)`, `side="top"`: `inset-block-end: anchor(self-start); margin-block-end: var(--ab-popover-offset)`; `align="start"`: `inset-inline-start: anchor(self-start)`, `align="end"`: `inset-inline-end: anchor(self-end)`, `align="center"`: `justify-self: anchor-center`, which keeps the layer inside the viewport as the zip's does (a physical `left: anchor(center)` let it clip at the edge). The build found Firefox misplaces `anchor-center` in an RTL island (the same family as spike #4's `position-area` RTL-island bug), logged in Q41-1; offsets are `margin: <offset>` on every side, as the zip; `position-try-fallbacks: flip-block`. The icon Close sits at the inline end and mirrors with the Content. `XIcon` is symmetric and not mirrored. Never `position-visibility`.

## Component tokens

Existing (ported from the source): `popover-max-width`, `popover-padding`, `popover-border-radius`, `popover-background-color`, `popover-blur`, `popover-saturate`, `popover-shadow`, `popover-text-color`, `popover-font`, `popover-offset`.

Proposed new (mirroring `dropdown-menu-enter-scale`, `-enter-duration`, `-exit-duration`, `-easing`):

| Token                            | References                | `$type`     | Why                                                            |
| -------------------------------- | ------------------------- | ----------- | -------------------------------------------------------------- |
| `popover-enter-scale`            | `motion-scale-enter`      | number      | Entry scale (0.97); 1 under reduced motion                     |
| `popover-enter-duration`         | `motion-duration-popover` | duration    | 200 ms, as Menu                                                |
| `popover-exit-duration`          | `motion-duration-exit`    | duration    | 150 ms, faster than the entry                                  |
| `popover-easing`                 | `motion-easing-enter`     | cubicBezier | Ease-out                                                       |
| `popover-gap`                    | `space-stack-sm`          | dimension   | 8 between Title, Description and content                       |
| `popover-title-font`             | `type-label-md`           | typography  | Title type                                                     |
| `popover-title-text-color`       | `color-text-default`      | color       | Title colour                                                   |
| `popover-description-text-color` | `color-text-subtle`       | color       | Description colour                                             |
| `popover-close-offset`           | `space-inset-xs`          | dimension   | 4 from the corner: concentric with the 12 radius and Close's 8 |

Close uses the existing `icon-button-*` tokens; the forced-colors border uses `border-width-default` directly.

## Built-in labels

| Key     | Default | Where                            |
| ------- | ------- | -------------------------------- |
| `close` | "Close" | The icon Close's accessible name |

Per instance through `labels` on Close, app-wide through the root UI provider's locale object: the Popover adds `close` to the locale type and to every shipped locale (`@platform/ui/locales/en-US`). A Close with children uses its children as its name.

## Feedback events

| Event        | When                                                                                   | `reason` |
| ------------ | -------------------------------------------------------------------------------------- | -------- |
| `ab-dismiss` | After a close with reason `"escape-key"`, `"outside-press"` or `"close-press"` commits | `"user"` |

Detail: `{ component: "Popover", reason }`, dispatched from the icon-only Close for `"close-press"` (a Close with `asChild` dispatches nothing of its own: its Button already dispatches `ab-press` for the click) and from the Content for Escape and outside presses, bubbling. Widens the `"ab-dismiss"` entry in `src/events/events.ts` (`DismissEvent` to `FeedbackEventDetail<"Alert" | "Popover">`). Not dispatched for `"trigger-press"`, `"focus-out"` (moving focus on is not a dismiss gesture), `"none"`, a cancelled close, or when the app closes it through `open`.

## Sources

- Source guide: artifact `project/components/Popover/README.md` ("Non-modal panel for interactive content anchored to a trigger; for actions use Menu, for one-line hints use Tooltip, for blocking tasks use Dialog."; "Native `popover="auto"` (light dismiss, Esc, top layer) + anchor positioning with automatic flipping. Same material, elevation and motion as Menu. `role="dialog"`; focus stays where the user puts it."), `components/Menu/README.md` (Anatomy, Motion). Brand book, Motion, Shape and depth ("Concentric radius", Materials), Interaction principles ("One layer closes at a time"). Archived brand book: `elevation-overlay` "Menus, listboxes, popovers, select picker".
- WAI-ARIA APG Dialog (Modal): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ · Button: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- HTML Living Standard, the popover attribute (states, show and hide popover, popover focusing steps, light dismiss): https://html.spec.whatwg.org/multipage/popover.html · focus navigation scope, autofocus delegate: https://html.spec.whatwg.org/multipage/interaction.html · button commands: https://html.spec.whatwg.org/multipage/form-elements.html
- HTML-AAM (`command` in the toggle popover state): https://w3c.github.io/html-aam/
- MDN `popover`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover · Using the Popover API: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using · `beforetoggle`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event · `ToggleEvent.source`: https://developer.mozilla.org/en-US/docs/Web/API/ToggleEvent/source · `autofocus`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/autofocus
- Spike #4: `docs/research/floating-platform.md` (§1–5, gaps 4–8; Q4-1, Q4-2, Q4-3).
- Baseline (webstatus.dev and web-features 3.44.0, 2026-10-24): `popover` newly available (low 2025-01-27); `invoker-commands` newly (low 2025-12-12); `showPopover({ source })` newly (low 2025-10-14); `toggleevent-source` newly (low 2026-05-11); `starting-style` and `transition-behavior` newly (low 2024-08-06); `overlay` limited (exit enhancement only, absence reads as an instant exit); anchor positioning keys low 2026-01-13, `position-anchor: auto` low 2026-09-14, `justify-self: anchor-center` low 2026-01-13 (Q4-1); `autofocus` widely (low 2015-07-29).
- Radix Popover: https://www.radix-ui.com/primitives/docs/components/popover · Base UI Popover: https://base-ui.com/react/components/popover (reason type from https://base-ui.com/react/components/popover.md) · React Aria Popover: https://react-aria.adobe.com/Popover · Ark Popover: https://ark-ui.com/llms-react.txt · Mantine Popover: https://mantine.dev/core/popover/ · shadcn Popover: https://ui.shadcn.com/docs/components/popover
