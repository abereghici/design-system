# AlertDialog

A modal Floating layer that interrupts with an irreversible or destructive decision and waits for an explicit answer: "Delete project?", "Discard unsaved changes?". It has exactly two ways forward, Cancel and the Action, and never closes on an outside press. Use it only when the action cannot be undone; a reversible action runs at once and offers Undo in a Toast (brand book: "Reversible actions run immediately and offer Undo in a toast. Dialogs are reserved for irreversible ones."). For a task with fields, use Dialog; for a message that needs no answer, use Alert or a Toast.

```tsx
import { AlertDialog } from "@platform/ui/alert-dialog";
import { Button } from "@platform/ui/button";

<AlertDialog.Root>
  <AlertDialog.Trigger asChild>
    <Button variant="danger">Delete project</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Title>Delete project?</AlertDialog.Title>
    <AlertDialog.Description>This removes 12 files. You can't undo this.</AlertDialog.Description>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action variant="danger" onClick={deleteProject}>
        Delete
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root open={confirming} onOpenChange={(next) => setConfirming(next)}>
  <AlertDialog.Content>
    <AlertDialog.Title>Discard changes?</AlertDialog.Title>
    <AlertDialog.Description>Your edits to "Q3 report" are lost.</AlertDialog.Description>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Keep editing</AlertDialog.Cancel>
      <AlertDialog.Action variant="danger" onClick={discard}>
        Discard
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
```

Status: draft for brand-owner review (phase 4). No source guide: drafted from the Dialog guide (`components/Dialog/README.md`, whose "destructive confirmations" use case this component takes), the brand book and the reference libraries.

Shared behaviour is specified once in `dialog.md` (native modal `<dialog>`, state path, focus return and the WebKit handler, scroll lock, Escape and close watchers, motion, rendering in place). This spec states what AlertDialog does differently and everything it adds.

## Anatomy

Root (no element) → Trigger → Content (`<dialog role="alertdialog">` + `::backdrop`) → Title + Description → Footer (Cancel · Action).

- **Root, Trigger, Content, Title.** As Dialog. The Content is a `<dialog>` with `role="alertdialog"`, opened with `showModal()`, drawn with the `dialog-*` tokens (radius 16, padding 24, modal elevation, `dialog-width`, backdrop 64 % night + 12 px blur).
- **Description.** As Dialog's, but required: it is the alert message the dialog is described by (Accessibility).
- **Footer.** As Dialog's: a wrapping row aligned to the inline end with `dialog-footer-gap`; Cancel first, Action last (primary rightmost in LTR).
- **Cancel.** A `<button type="button" commandfor={contentId} command="request-close">` drawn with Button's `secondary` visuals at `md` size. It carries the `autofocus` content attribute, so it takes focus on open.
- **Action.** A `<button type="button" commandfor={contentId} command="request-close">` drawn with Button's visuals in its `variant` (`primary` by default, `danger` for destructive actions).

No Close (`x`) Part and no outside-press dismissal: the user answers with Cancel, the Action or Escape.

## API

`AlertDialog.Root`: as `Dialog.Root` (`open`, `defaultOpen`, `onOpenChange(open, details)`), with `details.reason`: `"trigger-press"` \| `"escape-key"` \| `"close-press"` \| `"none"`. `AlertDialog.Trigger`: as `Dialog.Trigger`. `AlertDialog.Title`: as `Dialog.Title`. `AlertDialog.Footer`: as `Dialog.Footer`.

`AlertDialog.Content`: `ComponentProps<"dialog">` minus `open` and `role` (`ref`, `className`, `id`, `aria-label` when there is no Title). No `initialFocus`: focus always starts on Cancel.

`AlertDialog.Description`: `ComponentProps<"p">`. Required (one per Content).

`AlertDialog.Cancel`

| Prop       | Type                                                     | Default | Notes                                                |
| ---------- | -------------------------------------------------------- | ------- | ---------------------------------------------------- |
| `children` | `ReactNode`                                              |         | The label ("Cancel", "Keep editing").                |
| …native    | `ComponentProps<"button">` minus `command`, `commandfor` |         | `ref`, `className`, `onClick` and native attributes. |

`AlertDialog.Action`

| Prop       | Type                                                     | Default     | Notes                                                                                             |
| ---------- | -------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `variant`  | `"primary" \| "danger"`                                  | `"primary"` | Exposed as `data-variant`. `danger` for destructive actions (Delete, Discard, Revoke).            |
| `children` | `ReactNode`                                              |             | The label: the verb of the Title ("Delete", not "OK").                                            |
| `onClick`  | native                                                   |             | Runs the action. The dialog then closes unless `onOpenChange`'s `cancel()` is called (Behaviour). |
| …native    | `ComponentProps<"button">` minus `command`, `commandfor` |             | `ref`, `className` and native attributes.                                                         |

Names, checked against the reference libraries:

- **A separate component named `AlertDialog`**: Radix "A modal dialog that interrupts the user with important content and expects a response." (https://www.radix-ui.com/primitives/docs/components/alert-dialog); Base UI "A dialog that requires a user response to proceed." (https://base-ui.com/react/components/alert-dialog.md); shadcn `AlertDialog` (https://ui.shadcn.com/docs/components/alert-dialog). Ark, Chakra, MUI and React Aria use a `role` prop on Dialog instead (Ark "For critical confirmations or destructive actions, use `role="alertdialog"`."; React Aria "`role` `"alertdialog" | "dialog"` … The accessibility role for the dialog."; MUI "alertdialog can be used if the content of the dialog requires immediate attention."). A separate component is the Radix/Base UI/shadcn choice and lets the types require Cancel and Description and drop Close and outside press, which a `role` prop cannot (judgement call; the tally is three to four).
- **Parts `Cancel` and `Action`**: Radix Cancel "A button that closes the dialog. This button should be distinguished visually from `AlertDialog.Action` buttons." and Action "A button that closes the dialog. These buttons should be distinguished visually from the `AlertDialog.Cancel` button."; shadcn `AlertDialogCancel`, `AlertDialogAction` ("Use the `AlertDialogAction` component to add a destructive action button to the alert dialog."). Base UI has only `Close`.
- **`Footer`**: shadcn's AlertDialog composition has `AlertDialogFooter` (around Cancel and Action), as its Dialog has `DialogFooter`.
- **`variant` on Action**: Button's prop and values (Button spec: "`"primary" | "secondary" | "tertiary" | "danger"`"), narrowed to the two an answer can take; shadcn renders its destructive Action through a Button `variant`.
- **Description required**: Radix "An accessible description to be announced when the dialog is opened. Alternatively, you can provide `aria-describedby` to `AlertDialog.Content` and exclude this component." (optional there, with an alternative). Required here because APG requires the description (Accessibility).
- **`reason` values**: Base UI "`type AlertDialogRootChangeEventReason = | 'trigger-press' | 'outside-press' | 'escape-key' | 'close-press' | 'focus-out' | 'imperative-action' | 'none';`". Without `"outside-press"` (never closes on one) and `"focus-out"` / `"imperative-action"` (as Dialog). Cancel and Action both report `"close-press"`, the Base UI word for a button inside the dialog that closes it; `details.event.currentTarget` tells them apart (judgement call: one reason per gesture type, as Base UI, instead of new `"cancel-press"` / `"action-press"` words no library uses).
- Left out (YAGNI): an icon-only Close (Base UI `Close`; APG asks for "a visible element with role button that closes the dialog, such as a close icon or cancel button", and Cancel is that); shadcn `AlertDialogMedia`, `AlertDialogHeader` and Content `size`; Radix `onEscapeKeyDown`, `onOpenAutoFocus`, `onCloseAutoFocus`; `loading` and `disabled` on Action (an async action keeps the dialog open with `cancel()` and closes it through `open`; Button's `loading` can be added when a product needs it); `asChild` on Cancel and Action.

## States

| State                              | How it shows                                                   | Exposed as                        |
| ---------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| closed / open / entering / exiting | As Dialog                                                      | As Dialog                         |
| Cancel focused on open             | Focus ring on Cancel                                           | `:focus-visible` (keyboard opens) |
| Action variant                     | Button `primary` or `danger` fill                              | `data-variant` on the Action      |
| Cancel / Action states             | Button's hovered, pressed, focus-visible                       | Button's                          |
| outside press                      | Nothing happens: the dialog stays, the backdrop does not react | none                              |

## Behaviour

- **Same platform core as Dialog** (`dialog.md` Behaviour): `command="show-modal"` on the Trigger, `beforetoggle` for opens with `cancel()`, Escape through the dialog's `cancel` event, controlled `open` applied in a layout effect, the WebKit focus handler on close, the CSS scroll lock, close watchers for "Escape closes only the topmost layer", rendered in place (and outside a menu's Content when opened from a menu Item).
- **No outside press.** The Content has no backdrop handler, and `closedby` is left at its default, whose modal state is "Close Request" (HTML: "If dialog's is modal is true, then return Close Request."), so a press on `::backdrop` does nothing. Radix AlertDialog Content has no `onPointerDownOutside` / `onInteractOutside` (it lists only `onOpenAutoFocus`, `onCloseAutoFocus`, `onEscapeKeyDown`); Ark: "**Requires explicit dismissal**: Cannot be closed by clicking outside, only via button clicks or Escape key".
- **Escape cancels.** Escape is a close request, as in Dialog, with reason `"escape-key"` (APG example: "Activating the "no" button or pressing escape closes the dialog."). It counts as the Cancel answer.
- **Cancel.** `command="request-close"` fires the cancelable `cancel` event; the handler calls `onOpenChange(false, { reason: "close-press", event, cancel })`. `cancel()` keeps the dialog open.
- **Action.** The consumer's `onClick` runs first; then the button's activation behaviour runs `command="request-close"`, and the `cancel` handler calls `onOpenChange(false, { reason: "close-press", event, cancel })` with the Action's click as `event`. Calling `cancel()` there keeps the dialog open, for an action that must finish first (an async delete): the app later closes it through `open`. A click whose default is prevented in `onClick` runs no command (DOM: activation behaviour runs only "If event's canceled flag is unset"), so it also stays open.
- **Initial focus on Cancel.** APG: "If a dialog contains the final step in a process that is not easily reversible, such as deleting data or completing a financial transaction, it may be advisable to set focus on the least destructive action, especially if undoing the action is difficult or impossible. The Alert Dialog Pattern is often employed in such circumstances."; APG Alert Dialog example: "Focus is automatically set to the first focusable element inside the dialog, which is the "No" button. This is the least destructive action, so focusing "No" helps prevent users from accidentally confirming the destructive "Discard" action, which cannot be undone."; Ark: "**Automatic focus**: The close/cancel button receives focus when opened, prioritizing the safest action". Cancel sets the `autofocus` content attribute on itself through a ref callback composed with the consumer's `ref`, because React's `autoFocus` prop does not write the attribute on client renders (React DOM: "We polyfill it separately on the client during commit."). The dialog focusing steps then pick it as the autofocus delegate (HTML: "If descendant does not have an autofocus content attribute, then continue."), wherever Cancel sits in the Footer.
- **Copy** (Dialog source): the Title names the outcome as a question and the Action repeats its verb ("Delete project?" → "Delete"); Cancel says what staying means when "Cancel" is ambiguous ("Keep editing").
- **Title and Description are required** (documented; no development warning, Q30-2 precedent).
- Client components (`'use client'`): every Part; the module is one client file, so its Footer is a client component too (one file instead of a server/client pair).

## Motion

As Dialog (`dialog-enter-scale` 0.95 + fade over 250 ms in, 150 ms fade out, backdrop fading in step, scale only for pointer opens).

- **Reduced motion:** `dialog-enter-scale` resolves to 1, so the dialog and backdrop only fade.
- **Instant exit:** outside Chromium the dialog disappears in one frame; focus is back on the Trigger and the result of the answer (the deleted row gone, the form still there) is already visible, so it reads as correct.
- An outside press gets no motion response (no shake or pulse): the brand book spends motion "only where they mean something", and the dialog simply stays (judgement call).

## Keyboard

APG pattern: **Alert and Message Dialogs** (https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): "See the keyboard interaction section for the modal dialog pattern." Rows quoted from the Dialog (Modal) pattern (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and the Alert Dialog example (https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/examples/alertdialog/):

| Key                            | Action                                                                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enter / Space (Trigger)        | APG Button: "Activates the button." Opens the dialog; focus moves to Cancel.                                                                                                                   |
| Tab                            | "Moves focus to the next tabbable element inside the dialog." / "If focus is on the last tabbable element inside the dialog, moves focus to the first tabbable element inside the dialog."     |
| Shift + Tab                    | "Moves focus to the previous tabbable element inside the dialog." / "If focus is on the first tabbable element inside the dialog, moves focus to the last tabbable element inside the dialog." |
| Escape                         | "Closes the dialog." (reason `"escape-key"`)                                                                                                                                                   |
| Enter / Space (Cancel, Action) | APG Button: "Activates the button." Cancel closes; Action runs `onClick`, then closes unless cancelled.                                                                                        |

Native focus containment and return as Dialog. An Action focused by Tab and confirmed with Enter is the deliberate path; focus never starts on it.

**RTL:** no arrow-key behaviour, so nothing to swap.

## Accessibility

- **Role.** `role="alertdialog"` on the `<dialog>`. ARIA in HTML allows it: `dialog`: "role=dialog", "Role: alertdialog. (dialog is also allowed, but NOT RECOMMENDED.)" (https://www.w3.org/TR/html-aria/). APG: "The alertdialog role enables assistive technologies and browsers to distinguish alert dialogs from other dialogs so they have the option of giving alert dialogs special treatment, such as playing a system alert sound."
- **Modality.** APG: "The dialog container element has aria-modal set to true." HTML-AAM maps it from `showModal()` ("If the open attribute is set via the showModal() method then aria-modal="true""); that the mapping still applies with the explicit `alertdialog` role is an inference the screen-reader pass checks. The component adds no `aria-modal`.
- **Name and description.** `aria-labelledby` → Title ("A value for aria-labelledby that refers to the element containing the title of the dialog if the dialog has a visible label."). `aria-describedby` → Description, always: APG "The element with role alertdialog has a value set for aria-describedby that refers to the element containing the alert message." APG example: "The dialog's prompt ("Are you sure...?") is referenced via aria-describedby to ensure that the user is immediately aware of the prompt."
- **Not an Alert.** No live region is involved: the message is announced as the dialog's description when focus moves in (APG Alert: "it is crucial they do not affect keyboard focus"; APG Alert Dialog: an alert dialog "interrupts the user's workflow to communicate an important message and acquire a response").
- **Contrast, targets, more contrast, forced colors:** as Dialog; Cancel and Action follow Button (forced colors: 1 px `ButtonText` border on every variant, Button spec).
- **More contrast:** as Dialog (Description in `dialog-title-text-color`, 1 px `color-border-default` border on the Content).
- **Forced colors:** as Dialog (1 px `CanvasText` border on the Content); the `danger` Action keeps its label, so the meaning never depends on its fill.
- **Reduced transparency:** as Dialog (solid surface; the backdrop drops its blur and keeps the dim).

## RTL

As Dialog: logical properties only; the Footer aligns to the inline end, so in RTL the Action is leftmost and Cancel to its right. Nothing mirrors.

## Component tokens

Reuses Dialog's tokens; no `alert-dialog` component word (judgement call: the surface, type, backdrop and motion are identical, and a second set would only alias them). A brand change to AlertDialog alone would then need the new word.

Existing: `dialog-width`, `dialog-padding`, `dialog-gap`, `dialog-border-radius`, `dialog-background-color`, `dialog-shadow`, `dialog-title-font`, `dialog-title-text-color`, `dialog-description-font`, `dialog-description-text-color`, `dialog-footer-gap`, `dialog-backdrop-color`, `dialog-backdrop-blur`, `dialog-enter-scale`, `dialog-enter-duration`, `dialog-exit-duration`, `dialog-easing`; plus `dialog-title-gap` proposed in `dialog.md`. Cancel and Action use the existing `button-*` tokens (`secondary`, `primary`, `danger`, `md`).

Proposed new: none.

## Built-in labels

None. Cancel and Action labels are the consumer's text (they name the answer, so no default can be right).

## Feedback events

| Event        | When                                                                      | `reason` |
| ------------ | ------------------------------------------------------------------------- | -------- |
| `ab-confirm` | After the Action's `onClick` runs (whether or not the close is cancelled) | `"user"` |
| `ab-dismiss` | After a Cancel press or Escape closes the dialog                          | `"user"` |

Detail: `{ component: "AlertDialog", reason }`, `ab-confirm` dispatched from the Action, `ab-dismiss` from Cancel or (Escape) from the Content; both bubble through the app tree. One event per gesture: Cancel and Action draw Button's visuals themselves instead of composing Button, so no `ab-press` fires alongside (judgement call, Pagination precedent). `ab-confirm` marks the user's decision, so it fires even when `cancel()` keeps the dialog open for an async action. Not dispatched when the app closes the dialog through `open`, or for `"none"`. `src/events/events.ts`: add `"ab-confirm": ConfirmEvent` with `FeedbackEventDetail<"AlertDialog">`, and widen `DismissEvent`'s union with `"AlertDialog"`.

## Sources

- Dialog spec (shared behaviour): `packages/ui/specs/dialog.md`. Source Dialog guide: artifact `project/components/Dialog/README.md` ("Modal for short, interruptive tasks and destructive confirmations"; "Title names the outcome as a question; buttons repeat the verb ("Delete", not "OK")."). Brand book, Interaction principles ("Prefer undo to confirm").
- WAI-ARIA APG Alert and Message Dialogs: https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/ · Alert Dialog example: https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/examples/alertdialog/ · Dialog (Modal): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ · Alert: https://www.w3.org/WAI/ARIA/apg/patterns/alert/ · Button: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- ARIA in HTML (`dialog` allowed roles): https://www.w3.org/TR/html-aria/ · HTML-AAM (`open` mapping): https://w3c.github.io/html-aam/
- HTML Living Standard, dialog element (computed closed-by state, request close, commands): https://html.spec.whatwg.org/multipage/interactive-elements.html · focus delegate and autofocus delegate: https://html.spec.whatwg.org/multipage/interaction.html · DOM dispatch: https://dom.spec.whatwg.org/
- React DOM source (`autoFocus`): https://raw.githubusercontent.com/facebook/react/v19.2.0/packages/react-dom-bindings/src/client/ReactDOMComponent.js
- Baseline: as Dialog (webstatus.dev, 2026-10-24); `autofocus` widely available (low 2015-07-29).
- Radix AlertDialog: https://www.radix-ui.com/primitives/docs/components/alert-dialog · Base UI AlertDialog: https://base-ui.com/react/components/alert-dialog.md · shadcn AlertDialog: https://ui.shadcn.com/docs/components/alert-dialog · Ark Dialog (`role="alertdialog"`): https://ark-ui.com/react/docs/components/dialog · React Aria Modal / Dialog `role`: https://react-aria.adobe.com/Modal · MUI Dialog API: https://mui.com/material-ui/api/dialog/
