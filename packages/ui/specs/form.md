# Form

A native `<form>` that keeps the browser's constraint validation but shows errors inline, through each Field, instead of the browser's bubbles. It moves focus to the first invalid control on a failed submit and routes server errors to their fields. Submission is the platform's: `action`, `method`, `FormData`, React 19 actions and Server Functions all work unchanged.

```tsx
import { Button } from "@platform/ui/button";
import { Form } from "@platform/ui/form";
import { TextField } from "@platform/ui/text-field";

<Form action={signUp} errors={state.errors}>
  <TextField label="Email" name="email" type="email" required autoComplete="email" />
  <TextField label="Name" name="name" required autoComplete="name" />
  <Button type="submit" variant="primary">
    Create account
  </Button>
</Form>;
```

Status: draft for brand-owner review (phase 2). No source guide: drafted from the brand book ("Validate after intent", "Native controls wherever the platform has them"), the platform and the reference libraries.

## Anatomy

A single `<form>` element. No Parts: fields, fieldsets and buttons are ordinary children. Spacing between fields is the app's layout (Form adds none), so a Form can hold a one-line search as well as a settings page.

## API

| Prop     | Type                                  | Default | Notes                                                                                                                                                         |
| -------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `errors` | `Record<string, string \| undefined>` |         | Errors returned after submission (a server, a form action), keyed by the field `name`. Each one reaches the Field with that `name` (Field contract, step 5).  |
| …native  | `ComponentProps<"form">`              |         | `ref`, `className`, `action` (URL or function), `method`, `onSubmit`, `onReset`, `onInvalid`, `noValidate` and every native attribute pass through unchanged. |

Names, checked against the reference libraries:

- **`Form`**: Base UI "A native form element with consolidated error handling. Renders a `<form>` element." (https://base-ui.com/react/components/form); React Aria "A form is a group of inputs that allows users to submit data to a server, with support for providing field validation errors." (https://react-aria.adobe.com/Form); Radix `Form.Root` (https://www.radix-ui.com/primitives/docs/components/form). Single-part, as in Base UI and React Aria: Field holds the per-field Parts.
- **`errors`**: Base UI `errors` "Validation errors returned externally, typically after submission by a server or a form action. This should be an object where keys correspond to the `name` attribute on `<Field.Root>`". React Aria calls it `validationErrors` ("typically returned by a server. This should be set to an object mapping from input names to errors."). We take Base UI's shorter name; one string per field, as in Field's `validate`.
- **No `onClearErrors`.** Base UI has none ("Once a field's value changes, any corresponding error in `errors` will be cleared from the field state."); Radix has `onClearServerErrors`. Clearing on change needs no callback; the app replaces `errors` on the next submission.
- **No `validationBehavior`.** React Aria's `"native"` default "use[s] native HTML form validation to prevent form submission"; that is the only behaviour here. To submit without validation, pass the native `noValidate` (or `formNoValidate` on a button). MDN: "This Boolean attribute indicates that the form shouldn't be validated when submitted."
- **No `onFormSubmit`.** Base UI's handler calls `preventDefault()` and passes collected values; the native `onSubmit` with `new FormData(event.currentTarget)` does the same with platform types. MDN, `FormData`: "It uses the same format a form would use if the encoding type were set to "multipart/form-data"."

## States

| State      | How it shows                             | Exposed as                                                      |
| ---------- | ---------------------------------------- | --------------------------------------------------------------- |
| rest       | Nothing of its own                       | —                                                               |
| invalid    | Each invalid Field shows its error       | Field's `data-invalid` / `aria-invalid`; `:invalid` on the form |
| submitting | The app's (for example Button `loading`) | —                                                               |

Form has no pending state of its own: React's `useFormStatus` already gives the submit button `pending` (inference: a pending prop would duplicate it).

## Behaviour

- **Inline errors instead of bubbles.** Form adds a capture-phase `invalid` listener (the event does not bubble; see the Field contract) and calls `preventDefault()`. HTML, interactive validation: "Let notCanceled be the result of firing an event named invalid at field, with the cancelable attribute initialized to true." and only the elements that were not cancelled are reported by the browser, so the bubbles stay hidden while submission is still blocked. Each Field shows its own error (Field contract, step 2: a submit attempt sets every control's user validity to true).
- **Focus moves to the first invalid control** in tree order after a blocked submit, because the browser no longer does it for cancelled events. React Aria: "By default, after a user submits a form with validation errors, the first invalid field will be focused."; Radix: "Focus is moved to the first invalid control". A consumer's `onInvalid` runs first; calling `event.preventDefault()` there does not stop the focus move (React Aria uses it for that; we keep focus management unconditional because it is what makes the inline errors discoverable, judgement call).
- **`requestSubmit()` validates; `submit()` does not.** MDN: "`requestSubmit()`, on the other hand, acts as if a submit button were clicked. The form's content is validated, and the form is submitted only if validation succeeds." Apps that submit from script use `requestSubmit()`.
- **Server errors:** when `errors` changes, each named Field shows its message. If the first errored field is not the focused element, Form focuses it, as for a client-side failure.
- **Reset** (`<button type="reset">`, `form.reset()`) clears every Field's error (user validity goes back to false).
- **Implicit submission** stays native: Enter in a text field submits when the form has a submit button. HTML: "on some platforms hitting the "enter" key while a text control is focused implicitly submits the form".
- Client component (`'use client'`): it attaches listeners and passes `errors` to Fields through context. A Server Component can render it and pass a Server Function as `action`.

## Motion

None.

- **Reduced motion:** nothing to remove.
- **Instant exit:** nothing exits.

## Keyboard

No pattern: Form is not a widget. Tab order is the document order of its controls. Enter in a single-line text control submits (implicit submission). After a blocked submit, focus lands on the first invalid control.

## Accessibility

- A `<form>` with an accessible name (`aria-label` or `aria-labelledby`) is exposed as a `form` landmark; without one it is not. Name it when a page has several forms (inference from HTML-AAM's form mapping; documented on the docs page).
- Errors are linked and announced by Field. Focusing the first invalid control reads its label, invalid state and error.
- **More contrast, forced colors, reduced transparency:** not affected (no visuals of its own).

## RTL

Nothing to mirror.

## Component tokens

None. Form draws nothing.

## Built-in labels

None.

## Feedback events

None. The submit Button already dispatches `ab-press`.

## Sources

- Brand book: "Interaction principles" (Validate after intent; Stay where users already are).
- HTML Living Standard, constraint validation and implicit submission: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
- MDN: `<form>` (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form), `requestSubmit()` (https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit), `FormData` (https://developer.mozilla.org/en-US/docs/Web/API/FormData), `invalid` event (https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/invalid_event).
- web.dev Learn Forms, validation: https://web.dev/learn/forms/validation
- Baseline (webstatus.dev / web-features 3.44.0, 2026-10-24): `form` widely available; `api.HTMLFormElement.requestSubmit` widely available (low 2022-09-12); `constraint-validation` widely available.
- Base UI Form: https://base-ui.com/react/components/form and handbook https://base-ui.com/react/handbook/forms
- React Aria Form: https://react-aria.adobe.com/Form and https://react-aria.adobe.com/forms
- Radix Form: https://www.radix-ui.com/primitives/docs/components/form
