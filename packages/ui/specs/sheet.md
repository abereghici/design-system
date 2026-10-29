# Sheet

A modal side panel for a secondary task that keeps the page's context in view: record details, editing one item of a list, filters. It slides in from the inline-end (or inline-start) edge and floats a little inset from it. For a short interruptive task, use Dialog; for an irreversible confirmation, AlertDialog; for content anchored to a control, Popover. A Sheet is a Dialog in another position: it has no swipe gestures or snap points.

```tsx
import { Button } from "@platform/ui/button";
import { Sheet } from "@platform/ui/sheet";

<Sheet.Root>
  <Sheet.Trigger asChild>
    <Button>Open details</Button>
  </Sheet.Trigger>
  <Sheet.Content>
    <Sheet.Title>Invoice 0142</Sheet.Title>
    <Sheet.Description>Issued 3 October to Moss & Co.</Sheet.Description>
    <Sheet.Body>
      <InvoiceLines invoice={invoice} />
    </Sheet.Body>
    <Sheet.Footer>
      <Sheet.Close asChild>
        <Button variant="primary">Done</Button>
      </Sheet.Close>
    </Sheet.Footer>
    <Sheet.Close />
  </Sheet.Content>
</Sheet.Root>

<Sheet.Root open={filtersOpen} onOpenChange={(next) => setFiltersOpen(next)}>
  <Sheet.Content side="start" initialFocus={statusRef}>
    <Sheet.Title>Filters</Sheet.Title>
    <Sheet.Body tabIndex={-1}>
      <FilterFields statusRef={statusRef} />
    </Sheet.Body>
    <Sheet.Close />
  </Sheet.Content>
</Sheet.Root>
```

Status: draft for brand-owner review (phase 4). Source guide: `components/Sheet/README.md` in the artifact.

Shared behaviour is specified once in `dialog.md` (native modal `<dialog>`, state path and reasons, `cancel()`, outside press, focus on open with `initialFocus`, focus return and the WebKit handler, CSS scroll lock, close watchers, rendering in place). The source says the same: "Same focus and dismissal rules as Dialog". This spec states what Sheet does differently and everything it adds.

## Anatomy

Root (no element) → Trigger → Content (`<dialog>` + `::backdrop`) → Title + Description → Body → Footer · Close.

- **Root, Trigger.** As Dialog.
- **Content.** A native `<dialog>`, opened with `showModal()`, placed at one inline edge instead of centred: `margin: 0`, `inset-block: sheet-offset`, `inset-inline-end: sheet-offset` (`side="end"`) or `inset-inline-start: sheet-offset` (`side="start"`), the other inline inset `auto`. `block-size: auto` and `max-block-size: none` replace the UA's `fit-content` / `max-height`, so it runs the full height minus the two offsets. `inline-size: sheet-width` (420), capped at `100vw - 2 × sheet-offset` (`min()`, as the artifact's `.ab-sheet`). Surface `sheet-background-color` (`color-surface-overlay`, solid), radius `sheet-border-radius` (16) on every corner (it floats, source "Floats 8px inset from the right edge with 16px corners"), `sheet-shadow` (modal elevation), padding `sheet-padding` (24). A flex column: Title and Description at the top, the Body taking the remaining height, the Footer at the bottom, `sheet-gap` (16) between them. The UA `border` is removed.
- **Backdrop.** The dialog's `::backdrop` in `sheet-backdrop-color` (`color-backdrop`) with `backdrop-filter: blur(sheet-backdrop-blur)`: the artifact's `overlays.css` draws Dialog, Sheet and CommandPalette backdrops with one rule that includes the blur (exact-fidelity rule).
- **Title.** An `<h2>` in `sheet-title-font` (`type-heading-sm`) and `sheet-title-text-color`, with room reserved at its inline end for the icon-only Close, as Dialog.
- **Description.** A `<p>` in `sheet-description-font` / `sheet-description-text-color`, `sheet-title-gap` (4) below the Title. Title and Description reserve `space-inline-xl` at their inline end for the Close, as Dialog.
- **Body.** A `<div>` that scrolls (`overflow-y: auto`, `flex: 1`, `min-block-size: 0`) with `tabIndex={0}` by default, so keyboard users can scroll it in every engine (the ScrollArea precedent). It pulls itself out to the panel edges (`margin-inline: calc(-1 * sheet-padding)`, `padding-inline: sheet-padding`), so its scrollbar sits at the panel edge and the focus ring is not clipped.
- **Footer.** A `<div>`, a wrapping flex row aligned to the inline end with `sheet-footer-gap`; it stays at the bottom while the Body scrolls.
- **Close.** As Dialog's: icon-only `x` with IconButton's `sm` visuals at the top inline-end corner, `sheet-close-offset` (12) from both edges; or the consumer's Button through `asChild`.

## API

`Sheet.Root`, `Sheet.Trigger`, `Sheet.Title`, `Sheet.Description`, `Sheet.Footer`, `Sheet.Close`: as the Dialog Parts of the same name (`dialog.md` API), including the `reason` set `"trigger-press"` \| `"outside-press"` \| `"escape-key"` \| `"close-press"` \| `"none"` and the icon-only Close's required `aria-label`.

`Sheet.Content`

| Prop           | Type                                    | Default | Notes                                                                                                                  |
| -------------- | --------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `side`         | `"start" \| "end"`                      | `"end"` | The inline edge it attaches to. Logical: `"end"` is the right edge in LTR and the left in RTL. Exposed as `data-side`. |
| `initialFocus` | `RefObject<HTMLElement \| null>`        |         | As Dialog.                                                                                                             |
| …native        | `ComponentProps<"dialog">` minus `open` |         | As Dialog.                                                                                                             |

`Sheet.Body`: `ComponentProps<"div">`. `tabIndex` defaults to `0`; pass `-1` when the Body's content has its own focusable elements and should take initial focus (Behaviour).

Names, checked against the reference libraries:

- **Component name `Sheet`, kept although Drawer is the majority** (judgement call): shadcn Sheet "Extends the Dialog component to display content that complements the main content of the screen." (https://ui.shadcn.com/docs/components/sheet); React Aria "A Sheet is a swipeable overlay that slides in from the edge of the viewport." (https://react-aria.adobe.com/Sheet). Drawer: Base UI "A panel that slides in from the edge of the screen." with "Drawer extends Dialog: It adds gesture support, snap points, and indent effects. If you don't need these, use Dialog instead." (https://base-ui.com/react/components/drawer.md), Ark "A panel that slides in from the edge of the screen, typically used for navigation or forms." (https://ark-ui.com/react/docs/components/drawer), Chakra, MUI and Mantine Drawer, and shadcn's separate swipeable Drawer. Most libraries keep Drawer for the swipeable panel; this one has no gestures and is the Dialog in an edge position (Base UI: "A panel that slides in from the edge of the screen and doesn't need gesture support is a positioned Dialog."), the meaning shadcn gives Sheet. Spec #1 and the source guide name it Sheet.
- **Parts**: as Dialog (Radix/Base UI/shadcn `Root`, `Trigger`, `Content`, `Title`, `Description`, `Close`); shadcn's Sheet composition "SheetContent ├── SheetHeader │ ├── SheetTitle │ └── SheetDescription └── SheetFooter".
- **Part `Body`**: Chakra composes `<Drawer.Body>` between Header and Footer (https://chakra-ui.com/docs/components/drawer); Mantine "`Drawer.Body` – a place for main content, `aria-describedby` of `Drawer.Content` is pointing to this element" (https://mantine.dev/core/drawer/); MUI `DialogContent`. Needed here so the Footer stays visible while the content scrolls (source "Body scrolls"). Unlike Mantine, the description is the Description Part, not the Body.
- **`side` with `"start" | "end"`**: shadcn "Use the `side` prop on `SheetContent` to set the edge of the screen where the sheet appears. Values are `top`, `right`, `bottom`, or `left`."; Chakra `placement` "`'start' | 'end' | 'top' | 'bottom'`" (default `end`); React Aria `position` "`start` and `end` are mirrored in right-to-left locales."; Mantine `position`, MUI `anchor` "`'bottom' | 'left' | 'right' | 'top'`". The prop name is shadcn's (the library that calls the component Sheet); the values are the logical pair of Chakra and React Aria, so RTL needs no consumer code (shadcn's own RTL example is `side={dir === "rtl" ? "left" : "right"}`). The default `"end"` is Chakra's and the source's ("inset from the right edge").
- Left out (YAGNI): `top` / `bottom` sides (shadcn, Chakra, React Aria; the source has only the side panel); swipe gestures, `swipeDirection`, snap points and indent effects (Base UI and shadcn Drawer, React Aria Sheet); Chakra `size`, Mantine `size` / `offset` props (the `sheet-width` and `sheet-offset` tokens are the override surface); Body edge fades (below); everything Dialog leaves out.

## States

| State               | How it shows                                                          | Exposed as                          |
| ------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| closed              | Not rendered                                                          | No `open` attribute                 |
| open                | Panel at its edge over the dim backdrop; page inert and not scrolling | `[open]`, `:modal`, `data-side`     |
| entering            | Slides in from beyond its edge                                        | `@starting-style`                   |
| opened by a pointer | The entry includes the slide                                          | `data-pointer` on the Content       |
| exiting             | Slides out (Chromium only)                                            | Transition on `display` / `overlay` |
| Body overflowing    | Native scrollbar in the Body; Footer stays                            | none                                |
| Close (icon) states | IconButton's                                                          | IconButton's                        |

## Behaviour

- **As Dialog** for opening (`command="show-modal"`, `beforetoggle`), the three close paths (Escape, Close, outside press through `requestClose()` and the `cancel` event), `cancel()` and its Escape limit, controlled `open`, closes it did not start (`"none"`), focus containment, focus return with the WebKit handler, the scroll lock (`:root:has(dialog:modal) { overflow: hidden; }` with the stable gutter), close watchers, and rendering in place. Source: "Same focus and dismissal rules as Dialog".
- **Outside press** is any press on the backdrop, which here is most of the viewport, including the `sheet-offset` strip at the panel's own edge (the press lands outside the dialog's border box, so the Dialog handler applies unchanged).
- **Initial focus.** The dialog focusing steps take the first sequentially focusable descendant (HTML: "If focusTarget is a dialog element and descendant is sequentially focusable, then set focusableArea to descendant."). With the default `tabIndex={0}` that is the Body when nothing focusable precedes it, which suits reading content (APG: for long content "add tabindex="-1" to a static element at the top of the dialog, such as the dialog title or first paragraph, and initially focus that element"). For a form in the Body, pass `tabIndex={-1}` to the Body: it is no longer sequentially focusable, so the first field takes focus; or point `initialFocus` at the field.
- **Body is not a ScrollArea component** but follows its rules (keyboard reachable with `tabIndex={0}`, no role, native scrollbars): WebKit bug 277290 "AX: Scrolling containers inoperable with keyboard" (ScrollArea spec) is why the default tab stop exists.
- **Body edge fades left out.** The source has "Body scrolls with edge fades", which the brand book builds with scroll-driven animation ("`animation-timeline: scroll(self)`"); `scroll-driven-animations` is limited (webstatus.dev: no Firefox), and the ScrollArea spec left them out for the same reason. The Footer's position at the bottom and the native scrollbar show that there is more (judgement call, ScrollArea precedent).
- **Side.** `side` sets `data-side`, which picks the inset and the slide direction in CSS; nothing else changes.
- Client components (`'use client'`): the shared Dialog Parts (`src/dialog/dialog-modal.tsx` and the `dialog-<part>.tsx` files). `sheet.tsx` itself is a Server module: Root and Content bind Sheet's styles and `side` onto them, and Body and Footer are plain `<div>`s.

## Motion

From the source: "slides in on the iOS drawer curve (300ms), out faster (250ms)" and "reduced motion swaps the slide for a fade".

- **Enter:** `@starting-style { translate: calc(100% + var(--ab-sheet-offset)) 0 }` for `data-side="end"` in LTR (the panel starts just beyond the viewport edge) to `translate: 0`, over `sheet-enter-duration` (`motion-duration-drawer`, 300 ms) with `sheet-easing` (`motion-easing-drawer`, the "iOS drawer curve", ease-out). `data-side="start"` uses the negative distance. The backdrop fades its `opacity` in step.
- **Exit:** the slide back out over `sheet-exit-duration` (`motion-duration-expand`, 250 ms), same easing, with `display` and `overlay` `allow-discrete`; the backdrop fades out with it. Exits are faster than entrances.
- **No fade on the panel** in the default motion: the source describes a slide only, and the panel is opaque the whole way (inference from the source's wording).
- **Keyboard and script opens: fade instead of slide.** The slide applies only while the Content has `data-pointer` (as Dialog; brand book "No motion on keyboard-initiated or high-frequency (100+ per day) actions."); otherwise the panel fades in over the same duration (judgement call, the same treatment as reduced motion).
- **Reduced motion:** the slide rules sit inside `@media (prefers-reduced-motion: no-preference)`; under `reduce` the panel and backdrop fade (`opacity`) over `sheet-enter-duration` / `sheet-exit-duration` instead (source "reduced motion swaps the slide for a fade"; brand book "Opacity and color fades remain."). There is no distance token to neutralise, because the distance is the panel's own size.
- **Instant exit:** outside Chromium the panel and backdrop disappear in one frame (spike #4: "Firefox and WebKit compute `display: none` at once"). The page under it never moved, and focus is already back on the Trigger, so it reads as correct.

## Keyboard

APG pattern: **Dialog (Modal)** (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), as Dialog. The native modal `<dialog>` provides it.

| Key                                                   | Action                                                                                                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enter / Space (Trigger)                               | APG Button: "Activates the button." APG Dialog: "When a dialog opens, focus moves to an element inside the dialog."                                                                            |
| Tab                                                   | "Moves focus to the next tabbable element inside the dialog." / "If focus is on the last tabbable element inside the dialog, moves focus to the first tabbable element inside the dialog."     |
| Shift + Tab                                           | "Moves focus to the previous tabbable element inside the dialog." / "If focus is on the first tabbable element inside the dialog, moves focus to the last tabbable element inside the dialog." |
| Escape                                                | "Closes the dialog."                                                                                                                                                                           |
| Arrow keys, Page Up / Down, Home / End (Body focused) | Scroll the Body (native scrolling of a focused scroller; ScrollArea spec).                                                                                                                     |

**RTL:** no arrow-key behaviour of the Sheet's own, so nothing to swap; the Body scrolls natively.

## Accessibility

- **Role, modality, name, description, visible close:** as Dialog (`dialog` role, `aria-modal` mapped from `showModal()` by HTML-AAM, `aria-labelledby` → Title, `aria-describedby` → Description when present, the icon-only Close or a Footer Close in every Sheet).
- **Body** has no role and no name (ScrollArea precedent); the Sheet's name already says what it holds.
- **Contrast:** Title `color-text-default`, Description `color-text-subtle`, Close icon `color-icon-subtle` on `color-surface-overlay`, all in the contrast matrix.
- **Targets:** as Dialog.
- **More contrast:** the Description takes `sheet-title-text-color`, and the Content draws a 1 px `color-border-default` border (`@media (prefers-contrast: more)`).
- **Forced colors:** the shadow disappears, so the Content draws a 1 px `CanvasText` border; the Close icon is `currentColor`.
- **Reduced transparency:** the surface is solid; the backdrop drops its blur and keeps the dim, as in Dialog.

## RTL

Logical properties only: `inset-inline-end` / `inset-inline-start` place the panel, the Close sits at the inline end, the Footer aligns to the inline end. `translate` is physical, so the slide distance flips with `:dir(rtl)` (`.content[data-side="end"]:dir(rtl)` starts at `calc(-100% - var(--ab-sheet-offset))`), never `[dir]`. The `<dialog>` keeps its DOM parent's direction in the top layer (spike #4 observed it for popovers; for `<dialog>` it is an inference the build ticket tests in an RTL island). The `x` icon does not mirror.

## Component tokens

Existing (ported from the source): `sheet-width`, `sheet-offset`, `sheet-padding`, `sheet-gap`, `sheet-border-radius`, `sheet-background-color`, `sheet-shadow`, `sheet-title-font`, `sheet-backdrop-color`, `sheet-enter-duration`, `sheet-exit-duration`, `sheet-easing`.

Proposed new (mirroring Dialog's set):

| Token                          | References           | `$type`    | Why                                                                |
| ------------------------------ | -------------------- | ---------- | ------------------------------------------------------------------ |
| `sheet-title-text-color`       | `color-text-default` | color      | Title colour, as `dialog-title-text-color`                         |
| `sheet-description-font`       | `type-body-sm`       | typography | Description type, as `dialog-description-font`                     |
| `sheet-description-text-color` | `color-text-subtle`  | color      | Description colour, as `dialog-description-text-color`             |
| `sheet-title-gap`              | `space-stack-xs`     | dimension  | Title to Description (4), as `dialog-title-gap`                    |
| `sheet-footer-gap`             | `space-inline-sm`    | dimension  | Between Footer buttons (8), as `dialog-footer-gap`                 |
| `sheet-close-offset`           | `space-inset-md`     | dimension  | Close inset (12), as `dialog-close-offset`                         |
| `sheet-backdrop-blur`          | `material-blur-thin` | dimension  | Backdrop blur, as `dialog-backdrop-blur` (artifact `overlays.css`) |

The Close uses the `icon-button-*` tokens; the more-contrast and forced-colors borders use `border-width-default` and `color-border-default` directly. Body padding reuses `sheet-padding`.

## Author-written text

None. The icon-only `Sheet.Close` requires its `aria-label` by type, as Dialog's.

## Feedback events

| Event        | When                                                                                    | `reason` |
| ------------ | --------------------------------------------------------------------------------------- | -------- |
| `ab-dismiss` | After a close the user caused commits: Escape, an outside press, or the icon-only Close | `"user"` |

Detail: `{ component: "Sheet", reason }`, dispatched as Dialog's (from the icon-only Close, or from the Content for Escape and outside press). A Close with `asChild` dispatches nothing of its own (the child Button's `ab-press` is the gesture's one event; judgement call, as Dialog). `src/events/events.ts`: widen `DismissEvent`'s union with `"Sheet"`.

## Sources

- Source guide: artifact `project/components/Sheet/README.md` ("Side panel for secondary tasks that keep page context visible (record details, editing, filters)."; "Floats 8px inset from the right edge with 16px corners; slides in on the iOS drawer curve (300ms), out faster (250ms). Body scrolls with edge fades. Same focus and dismissal rules as Dialog; reduced motion swaps the slide for a fade."). Brand book: Motion, Shape and depth (concentric radius); archived brand book "Platform techniques" (scroll-driven edge fades) and the motion table (`motion-easing-drawer` "For sheets and drawers", `motion-duration-drawer` 300 ms).
- Dialog spec (shared behaviour): `packages/ui/specs/dialog.md` · ScrollArea spec (Body focusability): `packages/ui/specs/scroll-area.md`
- HTML Living Standard, dialog element and UA styles: https://html.spec.whatwg.org/multipage/interactive-elements.html, https://html.spec.whatwg.org/multipage/rendering.html · focus delegate: https://html.spec.whatwg.org/multipage/interaction.html
- WAI-ARIA APG Dialog (Modal): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ · Button: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- Baseline (webstatus.dev, 2026-10-24): as Dialog; `translate` widely available (low 2023-03-14); `dir-pseudo` widely available (low 2023-12-07); `scroll-driven-animations` limited (not used).
- Spike #4: `docs/research/floating-platform.md`.
- shadcn Sheet: https://ui.shadcn.com/docs/components/sheet · React Aria Sheet: https://react-aria.adobe.com/Sheet · Base UI Drawer: https://base-ui.com/react/components/drawer.md and Dialog: https://base-ui.com/react/components/dialog.md · Ark Drawer: https://ark-ui.com/react/docs/components/drawer · Chakra Drawer: https://chakra-ui.com/docs/components/drawer · Mantine Drawer: https://mantine.dev/core/drawer/ · MUI Drawer: https://mui.com/material-ui/api/drawer/
