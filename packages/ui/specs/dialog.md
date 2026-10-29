# Dialog

A modal Overlay for a short task that interrupts the page: rename a project, invite a person, pick an export format. The rest of the page is inert until it closes. For a destructive or irreversible confirmation that needs an explicit answer, use AlertDialog; when the user needs the page for context (record details, editing, filters), use Sheet; for non-modal content anchored to a control, use Popover. Reversible actions don't need a Dialog at all: run them and offer Undo in a Toast (brand book "Prefer undo to confirm").

```tsx
import { Button } from "@platform/ui/button";
import { Dialog } from "@platform/ui/dialog";
import { TextField } from "@platform/ui/text-field";

<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Rename…</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Rename project?</Dialog.Title>
    <Dialog.Description>Links to the old name keep working.</Dialog.Description>
    <form id="rename" onSubmit={rename}>
      <TextField label="Name" name="name" defaultValue={project.name} required />
    </form>
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button>Cancel</Button>
      </Dialog.Close>
      <Button variant="primary" type="submit" form="rename">
        Rename
      </Button>
    </Dialog.Footer>
    <Dialog.Close />
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
  <Dialog.Content initialFocus={emailRef}>
    <Dialog.Title>Invite people?</Dialog.Title>
    <TextField ref={emailRef} label="Email" type="email" />
    <Dialog.Close />
  </Dialog.Content>
</Dialog.Root>
```

Status: draft for brand-owner review (phase 4). Source guide: `components/Dialog/README.md` in the artifact.

## Anatomy

Root (no element) → Trigger → Content (`<dialog>` + `::backdrop`) → Title + Description → consumer content → Footer · Close.

- **Root.** Holds the open state and the generated ids. Renders no element, so the Trigger and the Content are siblings in the DOM where the consumer puts them: the Content is rendered in place, not in a portal (phase-4 contract 1), and inherits `dir`, `lang` and `data-theme` from its parent (spike #4 §4).
- **Trigger.** A `<button type="button" commandfor={contentId} command="show-modal">`, or the consumer's Button / IconButton through `asChild`.
- **Content.** A native `<dialog>`, opened with `showModal()` (by the Trigger's command or by the component). Surface `dialog-background-color` (`color-surface-overlay`, solid: no Material), radius `dialog-border-radius` (16), padding `dialog-padding` (24), `dialog-shadow` (modal elevation), `inline-size: min(dialog-width, 100vw - 2 × space-inset-lg)` (420, at least 16 from each edge) and `max-block-size: calc(100dvh - 2 × space-stack-xl)`, as the artifact's `.ab-dialog`; the UA `overflow: auto` (HTML rendering: "dialog:modal { position: fixed; overflow: auto; … }") makes it scroll as a whole when taller. Its children stack with `dialog-gap` (16) between them; the UA `border` is removed.
- **Backdrop.** The dialog's `::backdrop`: `dialog-backdrop-color` (`color-backdrop`, 64 % night) with `backdrop-filter: blur(dialog-backdrop-blur)` (12 px). Source: "Backdrop 64% night + 12px blur." Not a Part.
- **Title.** An `<h2>` in `dialog-title-font` (`type-heading-sm`, the source's "serif 21") and `dialog-title-text-color`. Title and Description reserve `space-inline-xl` at their inline end for the icon-only Close (the artifact's `.ab-dialog-header`), so a long title wraps before the button.
- **Description.** A `<p>` in `dialog-description-font` / `dialog-description-text-color`, `dialog-title-gap` below the Title.
- **Footer.** A `<div>`, a wrapping flex row of buttons with `dialog-footer-gap`, aligned to the inline end, so the last button (the primary) is rightmost in LTR (source "footer (primary rightmost)").
- **Close.** Without children: an icon-only button drawn with IconButton's `sm` visuals and the `x` icon, `position: absolute` at the top inline-end corner, `dialog-close-offset` (12) from both edges. It carries IconButton's own CSS Module class with `data-size="sm"`, so its visuals are IconButton's without composing it (one event per press). With `asChild`: the consumer's button (a Cancel Button in the Footer). Both close through `command="request-close"`.

No Header, Body, Backdrop or Portal Part (see API).

## API

`Dialog.Root`

| Prop           | Type                                                               | Default | Notes                                                                                                                               |
| -------------- | ------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                                                          |         | Controlled. Applied in a layout effect with `showModal()` / `close()`.                                                              |
| `defaultOpen`  | `boolean`                                                          | `false` | Uncontrolled.                                                                                                                       |
| `onOpenChange` | `(open: boolean, details: Dialog.Root.ChangeEventDetails) => void` |         | `details`: `reason` (`"trigger-press"` \| `"outside-press"` \| `"escape-key"` \| `"close-press"` \| `"none"`), `event`, `cancel()`. |
| `children`     | `ReactNode`                                                        |         | The Trigger and the Content.                                                                                                        |

`Dialog.Trigger`

| Prop      | Type                                                     | Default | Notes                                                                                                                                          |
| --------- | -------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `asChild` | `boolean`                                                | `false` | Renders the single child (Radix Slot) with `commandfor`, `command` and the handlers merged in. The child must render a `<button>` (Behaviour). |
| …native   | `ComponentProps<"button">` minus `command`, `commandfor` |         | `ref`, `className` and native attributes.                                                                                                      |

`Dialog.Content`

| Prop           | Type                                          | Default | Notes                                                                                                                                                         |
| -------------- | --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialFocus` | `RefObject<HTMLElement \| null>`              |         | The element the native dialog focusing steps focus on open, instead of the first tabbable element (Behaviour).                                                |
| …native        | `ComponentProps<"dialog">` minus `open`, `id` |         | `ref`, `className`, `aria-label` when there is no Title, and native attributes. Root owns `open` and the generated `id` the Trigger's `commandfor` points at. |

`Dialog.Title`: `ComponentProps<"h2">` plus `asChild` (another heading level). `Dialog.Description`: `ComponentProps<"p">`. `Dialog.Footer`: `ComponentProps<"div">`.

`Dialog.Close`

| Prop         | Type                                  | Default | Notes                                                                                          |
| ------------ | ------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `asChild`    | `boolean`                             | `false` | Renders the single child (a Button) with `commandfor` and `command="request-close"` merged in. |
| `children`   | `ReactNode`                           |         | Only with `asChild`. Without children, Close renders the icon-only `x` button.                 |
| `aria-label` | `string` (required without `asChild`) |         | Accessible name of the icon-only button, such as "Close".                                      |
| …native      | `ComponentProps<"button">`            |         | `ref`, `className`, `onClick` and native attributes.                                           |

Names, checked against the reference libraries:

- **Component and Parts `Root`, `Trigger`, `Content`, `Title`, `Description`, `Close`**: Radix "Contains all the parts of a dialog.", "The button that opens the dialog.", "Contains content to be rendered in the open dialog.", "An accessible title to be announced when the dialog is opened.", "An optional accessible description to be announced when the dialog is opened.", "The button that closes the dialog." (https://www.radix-ui.com/primitives/docs/components/dialog); Base UI `Dialog.Root` "Groups all parts of the dialog.", `Popup` "A container for the dialog contents.", `Title` "A heading that labels the dialog. Renders an `<h2>` element.", `Description` "A paragraph with additional information about the dialog.", `Close` "A button that closes the dialog." (https://base-ui.com/react/components/dialog.md); Ark `Content` and `CloseTrigger` (https://ark-ui.com/react/docs/components/dialog); shadcn `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose` (https://ui.shadcn.com/docs/components/dialog). Content is the majority over Base UI's Popup; Close follows Radix, Base UI and shadcn over Ark/Chakra `CloseTrigger` and Mantine `CloseButton`. Title is an `<h2>` and Description a `<p>`, as Base UI renders them.
- **Part `Footer`**: shadcn's composition "DialogContent ├── DialogHeader │ ├── DialogTitle │ └── DialogDescription └── DialogFooter"; Chakra composes `<Drawer.Footer>` (https://chakra-ui.com/docs/components/drawer); MUI `DialogActions` (https://mui.com/material-ui/react-dialog/). It carries the source's "footer (primary rightmost)" layout.
- **No Header Part** (judgement call): shadcn `DialogHeader` and Mantine `Modal.Header` only group Title and Description; here they stack directly in the Content with `dialog-title-gap`, which is one wrapper less. **No Body Part**: the Content itself scrolls (UA `overflow: auto`); Sheet has a Body because its Footer must stay put.
- **No Backdrop / Overlay Part, no Portal.** Radix `Overlay` "A layer that covers the inert portion of the view when the dialog is open."; Base UI `Backdrop` "An overlay displayed beneath the popup." The native `::backdrop` is that layer, and the Content renders in place (contract 1).
- **`open` / `defaultOpen` / `onOpenChange(open, details)`**: Base UI "`onOpenChange` `((open: boolean, eventDetails: Dialog.Root.ChangeEventDetails) => void)`" "Event handler called when the dialog is opened or closed.", `defaultOpen` default `false`; Radix Root `defaultOpen`, `open`, `onOpenChange`. `details.cancel()`: Base UI "Cancels Base UI from handling the event."
- **`reason` values**: Base UI "`type DialogRootChangeEventReason = | 'trigger-press' | 'outside-press' | 'escape-key' | 'close-press' | 'focus-out' | 'imperative-action' | 'none';`". The subset a modal `<dialog>` can produce: no `"focus-out"` (focus cannot leave a modal) and no `"imperative-action"` (there is no imperative API; a close the component did not start is `"none"`).
- **No `modal` prop.** Radix "Supports modal and non-modal modes." (`modal` default `true`); Base UI `modal` "`true`: user interaction is limited to just the dialog: focus is trapped, document page scroll is locked, and pointer interactions on outside elements are disabled." Always modal here (`showModal()`); a non-modal layer is a Popover.
- **`asChild`** on Trigger, Close and Title: Radix lists "`asChild` `boolean` `false`" on Trigger, Close and Title.
- **`initialFocus`**: Base UI Popup "`initialFocus` … Determines the element to focus when the dialog is opened. By default, focus moves to the first tabbable element inside the popup" with "`RefObject`: Move focus to the ref element." Only the `RefObject` form is taken. It is needed because React's `autoFocus` does not reach the native focusing steps on client renders (Behaviour).
- **`aria-label`**: the icon-only Close requires its name by type; with `asChild` the child's own text names it (Base UI precedent: the library ships no strings).
- Left out (YAGNI): Radix Content `onOpenAutoFocus`, `onCloseAutoFocus`, `onEscapeKeyDown`, `onPointerDownOutside`, `onInteractOutside` (the reasons plus `cancel()` cover them); Base UI `finalFocus`, `disablePointerDismissal`, `Viewport`; shadcn `showCloseButton` (Close is a Part the consumer includes or not) and its "Sticky Footer"; MUI `fullScreen`, `maxWidth` and sizes; Ark `trapFocus`, `preventScroll`, `restoreFocus` (native); `forceMount` / `keepMounted` (the `<dialog>` is always in the DOM).

## States

| State               | How it shows                                                                    | Exposed as                                                        |
| ------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| closed              | Not rendered (UA `dialog:not([open]) { display: none; }`)                       | No `open` attribute                                               |
| open                | Centred surface over the dimmed, blurred backdrop; page inert and not scrolling | `[open]`, `:modal`; `:root:has(dialog:modal)` for the scroll lock |
| entering            | Fades in and scales from `dialog-enter-scale`                                   | `@starting-style`                                                 |
| opened by a pointer | The entry includes the scale                                                    | `data-pointer` on the Content                                     |
| exiting             | Fades out (Chromium only, see Motion)                                           | Transition on `display` / `overlay`                               |
| Close (icon) states | IconButton's hovered, pressed, focus-visible                                    | `:hover`, `:active`, `:focus-visible`                             |

## Behaviour

- **One state path.** The Root holds `open` (controlled or uncontrolled). Every open and close goes through a native `<dialog>` event, and `onOpenChange` is called from there; opens and closes the component performs itself for a controlled `open` (a layout effect calling `showModal()` / `close()`) set an internal flag and call nothing.
- **Opening.** The Trigger's `command="show-modal"` opens the dialog natively (HTML: "If command is the Show Modal state and element …" shows it as modal), so it also works before hydration (inference). The Content listens for `beforetoggle`, which HTML fires "with the cancelable attribute initialized to true, the oldState attribute initialized to "closed", and the newState attribute initialized to "open"". It calls `onOpenChange(true, { reason, event, cancel })` with `reason: "trigger-press"` when `event.source` is the Trigger (`ToggleEvent.source`, MDN: "An Element object instance, or null if the popover was not activated by a control element.") and `"none"` otherwise. `cancel()` calls `event.preventDefault()`, and the dialog stays closed. Controlled: the handler always prevents the native open and the parent's `open` opens it through `showModal()`.
- **Closing: Escape, Close and outside press all request a close.** Close uses `command="request-close"`, the outside press calls `requestClose()`, and Escape is the browser's close request. All three fire the dialog's `cancel` event first (MDN `requestClose()`: "it fires a cancel event before firing the close event. Authors can call Event.preventDefault() in the handler for the cancel event to prevent the dialog from closing."). The `cancel` handler calls `onOpenChange(false, details)` with `"close-press"` (Close's `click` handler marks it before the command runs: the command is the button's activation behaviour, which runs after the click listeners), `"outside-press"` (marked by the backdrop handler), or else `"escape-key"`. `details.event` is that `click`, or the Escape `keydown` seen on the Content (else the `cancel` event itself, for a close request with no key, such as an assistive-technology dismiss gesture). `cancel()` calls `preventDefault()` on the `cancel` event. Controlled: the handler always prevents the native close where it can, and the parent's `open={false}` closes it with `close()`.
- **When `cancel()` cannot stop a close.** `requestClose()` and the `request-close` command always fire a cancelable `cancel` (HTML: "Let canPreventClose be true if requireHistoryActionActivation is false"). Escape does not always: a user close request runs with history-action activation required, and HTML notes "requesting to close a close watcher twice without any intervening user activation will result in canPreventClose being false the second time"; the UA may also "Optionally, skip to the step labeled alternative processing" when it "detects user frustration at repeated close request interception". When `event.cancelable` is false the dialog closes, and `onOpenChange(false)` has already told the app; a controlled parent must accept it.
- **Closes the component did not start** (`<form method="dialog">` submitted inside the Content, a consumer button with `command="close"`): the `close` event arrives with no `cancel` before it, and `onOpenChange(false, { reason: "none" })` reports it; `cancel()` does nothing there.
- **Outside press.** `closedby="any"` is limited (webstatus.dev `dialog-closedby`: Chrome 134, Firefox 141, no Safari), so the Content scripts it. A press on `::backdrop` targets the dialog itself (HTML: "a pointer event that hits the ::backdrop pseudo element of a dialog will result in event having a target of the dialog element itself"). The Content records `pointerdown` whose target is the dialog and whose point is outside its border box (`getBoundingClientRect()`), and on the following `click` with the same condition calls `requestClose()` with reason `"outside-press"`. Requiring both ends mirrors HTML's own light dismiss, which closes only when the `pointerup` target matches the `pointerdown` one ("Let sameTarget be true if ancestor is document's dialog pointerdown target."), so a text selection dragged out of the dialog does not close it.
- **Focus on open.** Native dialog focusing steps: the element with an `autofocus` content attribute, else the first tabbable descendant (HTML focus delegate: "If focusTarget is a dialog element and descendant is sequentially focusable, then set focusableArea to descendant."). MDN: "When using HTMLDialogElement.showModal() to open a <dialog>, focus is set on the first nested focusable element." So DOM order decides: put the icon-only Close last (as in the sample) so focus lands on the first field or button. React does not write the `autofocus` attribute on client renders (React DOM source: "case 'autoFocus': { // We polyfill it separately on the client during commit."), it calls `focus()` at mount, while the dialog is still closed; so `autoFocus` inside a Dialog works only in server-rendered HTML. `initialFocus` is the reliable way: in the opening `beforetoggle`, before the focusing steps run, the Content sets the `autofocus` attribute on `initialFocus.current` (removed again on close), and the native steps focus it. For long or structured content, APG advises "add tabindex="-1" to a static element at the top of the dialog, such as the dialog title or first paragraph, and initially focus that element": point `initialFocus` at a Title with `tabIndex={-1}` (the autofocus delegate accepts any focusable area). The `<dialog>` itself never gets `tabindex` (HTML: "The tabindex attribute must not be specified on dialog elements.").
- **Focus containment.** `showModal()` makes everything outside the dialog inert (MDN: "Elements inside the same document as the dialog, except the dialog and its descendants, become inert (as if the inert attribute is specified)."), so Tab cannot reach the page. No scripted focus trap is added (judgement call: platform first). At the ends of the sequence an engine may pass focus through its own UI before returning to the first element, where APG describes a wrap; the build ticket records each engine (inference).
- **Focus return.** Native: HTML's close steps "run the focusing steps for element" (the previously focused element) when "wasModal is true". **WebKit handler** (spike #4 gap 7): Safari does not focus a button on click, so after a mouse-opened Dialog the previously focused element is `<body>`. On `close`, if `document.activeElement` is `<body>` or still inside the closed dialog (both observed in WebKit with real clicks), the Content focuses the opening Trigger, taken from `ToggleEvent.source`. A script open (controlled `open` from another button) has no source, so WebKit keeps the platform's result there. It never moves focus the user or the app put elsewhere.
- **Scroll lock.** CSS only, in the Content's CSS Module: `:root:has(dialog:modal) { overflow: hidden; }` (`:has` widely available, `:modal` widely available). The base stylesheet's `scrollbar-gutter: stable` keeps the layout still (MDN: "When using classic scrollbars, the gutter will be present if overflow is auto, scroll, or hidden even if the box is not overflowing."), the source's "Page scroll locks with a stable gutter (no layout shift)". No `overscroll-behavior` (limited for non-overflowing containers).
- **Escape closes only the topmost layer.** A DropdownMenu or Select picker open inside the Dialog closes first, then the Dialog on the next Escape: each is a close watcher and the newest handles the request (HTML process close watchers walks "the last item in window's close watcher manager's groups"). Nested Dialogs rendered inside a Content stack the same way, and focus returns to the opener inside the outer Dialog.
- **Other Overlays.** Opening a modal closes open `auto` popovers that are not its ancestors (HTML show modal: "Run hide popovers until given document, hideUntil"; MDN: "popover="auto" popovers are also dismissed by successful HTMLDialogElement.showModal() and Element.requestFullscreen() calls"). A Dialog opened from a DropdownMenu Item must be rendered outside the menu's Content and opened through `open`: the menu hides when the Item is pressed, and a top-layer element inside a hidden (`display: none`) ancestor is not rendered (inference; the build ticket tests it). Focus then returns natively to the element focused before `showModal()`, the menu's Trigger, because hiding the menu already put focus back there (inference).
- **Trigger with `asChild`.** `commandfor` and `command` are `<button>` attributes, so the child must render a `<button>` (Button and IconButton do; a Link does not). A Button with `aria-disabled` blocks its click, and a cancelled click never runs the command (DOM dispatch runs activation behaviour only "If event's canceled flag is unset").
- **Copy** (source): "Title names the outcome as a question; buttons repeat the verb ("Delete", not "OK")."
- **Title is required** unless the Content has `aria-label` (documented; no development warning, because the package has no agreed development flag: Q30-2 precedent).
- Client components (`'use client'`): Root (state, context), Trigger and Close (handlers, context ids), Content (event listeners, effects), Title and Description (they read their ids from context and register, so the Content sets `aria-labelledby` / `aria-describedby` only when they exist). Footer is a Server Component (a plain `<div>`, no context).

## Motion

From the source: "Scales from .95 + fades, 250ms in / 150ms out; backdrop fades in step. Reduced motion: fade only."

- **Enter:** `@starting-style { opacity: 0; scale: var(--ab-dialog-enter-scale) }` (0.95, `motion-scale-enter-modal`) to `opacity: 1; scale: 1` over `dialog-enter-duration` (`motion-duration-modal`, 250 ms) with `dialog-easing` (`motion-easing-enter`, ease-out). `transform-origin` stays centred (brand book "Modals stay centred.").
- **Exit:** `transition: opacity var(--ab-dialog-exit-duration), display var(--ab-dialog-exit-duration) allow-discrete, overlay var(--ab-dialog-exit-duration) allow-discrete` (150 ms, `motion-duration-exit`): exits are faster than entrances. Opacity only, no scale on the way out.
- **Backdrop:** `::backdrop` fades its `opacity` in step, with the same durations, `@starting-style` and `allow-discrete` pair. The blur is constant: only opacity animates (brand book "animate `transform`, `opacity` and `filter` only"; animating the blur radius would be motion blur, removed under reduced motion anyway). Custom properties resolve on `::backdrop` because it inherits from its dialog (BCD `css.selectors.backdrop.inherit_from_originating_element`: Chrome 122, Firefox 120, Safari 17.4).
- **Keyboard and script opens: fade only.** The scale applies only while the Content has `data-pointer`, set in the opening `beforetoggle` when `ToggleEvent.source` (the Trigger) does not match `:focus-visible`: a pointer press leaves it without a focus ring (Safari does not focus it at all), a key press keeps one; script opens have no source (brand book "No motion on keyboard-initiated or high-frequency (100+ per day) actions."; the Accordion and Checkbox precedent). The fade stays, as under reduced motion (judgement call: a modal that appears with no transition at all would flash the whole viewport).
- **Reduced motion:** `dialog-enter-scale` resolves to 1 through the `motion-scale-enter-modal` media override, so only the fades remain (source "Reduced motion: fade only.").
- **Instant exit:** spike #4 found exit transitions run only in Chromium ("Firefox and WebKit compute `display: none` at once"; `overlay` is limited, Chrome only). There the dialog and backdrop disappear in one frame and focus is already back on the Trigger, which reads as correct: the page under it was never moved, so nothing jumps.

## Keyboard

APG pattern: **Dialog (Modal)** (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). The native modal `<dialog>` provides it; the component adds no key handler on the Content. APG: "In the following description, the term tabbable element refers to any element with a tabindex value of zero or greater."

| Key                     | Action                                                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enter / Space (Trigger) | APG Button: "Activates the button." and "If activating the button opens a dialog, the focus moves inside the dialog." APG Dialog: "When a dialog opens, focus moves to an element inside the dialog." |
| Tab                     | "Moves focus to the next tabbable element inside the dialog." / "If focus is on the last tabbable element inside the dialog, moves focus to the first tabbable element inside the dialog."            |
| Shift + Tab             | "Moves focus to the previous tabbable element inside the dialog." / "If focus is on the first tabbable element inside the dialog, moves focus to the last tabbable element inside the dialog."        |
| Escape                  | "Closes the dialog."                                                                                                                                                                                  |
| Enter / Space (Close)   | APG Button: "Activates the button." Closes the dialog (`"close-press"`).                                                                                                                              |

Focus returns to the Trigger on close (APG: "When a dialog closes, focus returns to the element that invoked the dialog unless either: … The invoking element no longer exists."). Radix: "`Esc` | Closes the dialog and moves focus to `Dialog.Trigger`."

**RTL:** no arrow-key behaviour, so nothing to swap.

## Accessibility

- **Role and modality.** `<dialog>` has the `dialog` role (HTML-AAM 3.5.33 "dialog … dialog role"), and HTML-AAM maps the modal state from `showModal()`: "If the open attribute is set via the showModal() method then aria-modal="true" and aria-hidden="false"." No `role` or `aria-modal` is added. APG's condition for `aria-modal` holds natively: the page is inert and the backdrop obscures it ("mark a dialog modal only when both: Application code prevents all users from interacting in any way with content outside of it. Visual styling obscures the content outside of it.").
- **Name and description.** `aria-labelledby` → Title (APG: "A value set for the aria-labelledby property that refers to a visible dialog title."), `aria-describedby` → Description when present. APG advises omitting `aria-describedby` "if the dialog content includes semantic structures, such as lists, tables, or multiple paragraphs"; so Description is optional and holds one short sentence.
- **A visible close.** APG: "It is strongly recommended that the tab sequence of all dialogs include a visible element with role button that closes the dialog, such as a close icon or cancel button." Every Dialog has the icon-only Close, a Cancel in the Footer, or both (documented rule).
- **The Trigger** keeps its own name and gets no `aria-expanded` or `aria-haspopup`: HTML-AAM says the `show-modal` command "provide[s] no additional accessibility mappings to the button element", and while the dialog is open the Trigger is inert, so an expanded state would never be heard (inference).
- **Contrast.** Title `color-text-default`, Description `color-text-subtle`, Close icon `color-icon-subtle` on `color-surface-overlay`: all in the contrast matrix. The backdrop is not a text surface.
- **Targets:** Close follows IconButton `sm` (28 px, larger on coarse pointers); Footer buttons follow Button.
- **More contrast:** the Description takes `dialog-title-text-color` (`color-text-default`) and the Content draws a 1 px `color-border-default` border, so its edge no longer relies on the shadow (`@media (prefers-contrast: more)`).
- **Forced colors:** shadows are removed, so the Content draws a 1 px `CanvasText` border in `@media (forced-colors: active)`; the Close icon is `currentColor`. The backdrop's dim may be replaced by the system colours (inference); the border keeps the dialog's edge visible and the page stays inert either way.
- **Reduced transparency:** the surface is already solid (no Material). Under `(prefers-reduced-transparency: reduce)` the backdrop drops its `backdrop-filter` blur and keeps the 64 % dim, which is what obscures the inert page (judgement call; the media query is limited on webstatus.dev, so elsewhere the blur stays, as by default).

## RTL

Logical properties only: the Close at the top inline-end corner, the Footer aligned to the inline end (the primary is leftmost in RTL), Title padding at the inline end. The `<dialog>` is in the top layer but keeps its DOM parent's direction: spike #4 observed this for popovers ("native top-layer elements keep their DOM parent's direction"); the same for `<dialog>` is an inference the build ticket tests in an RTL island. The `x` icon is symmetric and does not mirror.

## Component tokens

Existing (ported from the source): `dialog-width`, `dialog-padding`, `dialog-gap`, `dialog-border-radius`, `dialog-background-color`, `dialog-shadow`, `dialog-title-font`, `dialog-title-text-color`, `dialog-description-font`, `dialog-description-text-color`, `dialog-footer-gap`, `dialog-backdrop-color`, `dialog-backdrop-blur`, `dialog-enter-scale`, `dialog-enter-duration`, `dialog-exit-duration`, `dialog-easing`.

Proposed new:

| Token                 | References       | `$type`   | Why                                                                                    |
| --------------------- | ---------------- | --------- | -------------------------------------------------------------------------------------- |
| `dialog-close-offset` | `space-inset-md` | dimension | Close inset from the top and inline-end edges (12), the artifact's `.ab-dialog-close`. |
| `dialog-title-gap`    | `space-stack-xs` | dimension | Space between Title and Description (4), the artifact's `.ab-dialog-header` gap        |

The Close uses the existing `icon-button-*` tokens; the more-contrast and forced-colors borders use `border-width-default` and `color-border-default` directly. The backdrop keeps `z-index` out of it: the top layer orders layers by opening order, not `z-index`.

## Author-written text

None. The icon-only `Dialog.Close` requires its `aria-label` by type; the Title, Description and button texts are the author's.

## Feedback events

| Event        | When                                                                                    | `reason` |
| ------------ | --------------------------------------------------------------------------------------- | -------- |
| `ab-dismiss` | After a close the user caused commits: Escape, an outside press, or the icon-only Close | `"user"` |

Detail: `{ component: "Dialog", reason }`, dispatched in the `cancel` handler once `onOpenChange` returned without `cancel()` (still inside the user's gesture, so a sound may play), from the icon-only Close for `"close-press"` and from the Content for Escape and outside press; it bubbles through the app tree because the Content is rendered in place. Not dispatched when the close is cancelled, for `"none"`, or when the app closes it through `open`. A Close with `asChild` dispatches nothing of its own: the child Button already dispatches `ab-press` for the same click, and IconButton's rule is one event per gesture (judgement call; the icon-only Close draws IconButton's visuals itself instead of composing IconButton for the same reason, the Pagination precedent). `src/events/events.ts`: add `"ab-dismiss": DismissFeedbackEvent` (if Alert has not yet) and widen its component union with `"Dialog"`.

## Sources

- Source guide: artifact `project/components/Dialog/README.md` ("Modal for short, interruptive tasks and destructive confirmations; if the user needs the page for context, use Sheet."; "Surface (radius 16, 24 padding, modal elevation) → title (serif 21) + description → body → footer (primary rightmost) · close button top-right. Backdrop 64% night + 12px blur."; "Scales from .95 + fades, 250ms in / 150ms out; backdrop fades in step. Reduced motion: fade only."; "Title names the outcome as a question; buttons repeat the verb ("Delete", not "OK"). Esc, close button and backdrop click all cancel. Page scroll locks with a stable gutter (no layout shift)."; "Native modal `<dialog>`: focus moves in and is trapped, page is inert, focus returns to the invoker. `aria-labelledby`/`aria-describedby` wired."). Brand book: Motion, Shape and depth (concentric radius), Interaction principles ("Prefer undo to confirm", "One layer closes at a time").
- HTML Living Standard, the dialog element (show modal, close steps, request close, `beforetoggle`, focusing steps, `closedby`, dialog light dismiss, commands): https://html.spec.whatwg.org/multipage/interactive-elements.html · close requests and close watchers, focus delegate: https://html.spec.whatwg.org/multipage/interaction.html · UA styles: https://html.spec.whatwg.org/multipage/rendering.html
- HTML-AAM (`dialog`, `open`, `command`): https://w3c.github.io/html-aam/ · DOM dispatch: https://dom.spec.whatwg.org/
- MDN `<dialog>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog · `showModal()`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal · `requestClose()`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/requestClose · `ToggleEvent.source`: https://developer.mozilla.org/en-US/docs/Web/API/ToggleEvent/source · Using the Popover API: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using · `scrollbar-gutter`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter
- React DOM source (`autoFocus` handling): https://raw.githubusercontent.com/facebook/react/v19.2.0/packages/react-dom-bindings/src/client/ReactDOMComponent.js
- Baseline (webstatus.dev, 2026-10-24): `dialog` widely (low 2022-03-14); `backdrop` widely (low 2022-03-14); `inert` widely; `modal` widely (low 2022-09-02); `has` widely (low 2023-12-19); `requestclose` newly (low 2025-05-27); `invoker-commands` newly (low 2025-12-12; BCD `request-close`: Chrome 139, Firefox 144, Safari 26.2); dialog `beforetoggle` / `toggle` newly (low 2025-09-15); `toggleevent-source` newly (low 2026-05-11); `starting-style` and `transition-behavior` newly (low 2024-08-06); `backdrop-filter` newly (low 2024-09-16); `scrollbar-gutter` newly (low 2024-12-11); `dialog-closedby` limited (not used); `overlay` limited (exit enhancement, absence reads as an instant close); `prefers-reduced-transparency` limited (enhancement); `prefers-contrast` and `forced-colors` widely. BCD 8.1.7: `::backdrop` inherits from its originating element (Chrome 122, Firefox 120, Safari 17.4).
- Spike #4: `docs/research/floating-platform.md` (exit motion per engine, `dir` in the top layer, WebKit focus gap 7).
- WAI-ARIA APG Dialog (Modal): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ · Button: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- Radix Dialog: https://www.radix-ui.com/primitives/docs/components/dialog · Base UI Dialog: https://base-ui.com/react/components/dialog.md · Ark Dialog: https://ark-ui.com/react/docs/components/dialog · shadcn Dialog: https://ui.shadcn.com/docs/components/dialog · React Aria Modal: https://react-aria.adobe.com/Modal · Chakra Drawer: https://chakra-ui.com/docs/components/drawer · MUI Dialog: https://mui.com/material-ui/react-dialog/ · Mantine Modal: https://mantine.dev/core/modal/
