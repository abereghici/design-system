# Field

Gives one form control a visible label, an optional description and an error message, and wires them together: ids, `for`, `aria-describedby`, `aria-invalid` and when the error shows. Use Field to compose your own control or to add a description and error to Checkbox, Switch, RadioGroup, Slider or FileTrigger. TextField, TextArea, PasswordField, NumberField and Select already contain a Field, so you don't wrap them in one.

```tsx
import { Field } from "@platform/ui/field";
import { Checkbox } from "@platform/ui/checkbox";

<Field.Root name="terms">
  <Checkbox required>I accept the terms of service</Checkbox>
  <Field.Description>You can read them at any time from Settings.</Field.Description>
  <Field.Error />
</Field.Root>

<Field.Root name="handle" validate={(value) => (value.startsWith("@") ? null : "Start with @")}>
  <Field.Label>Handle</Field.Label>
  <Field.Control required pattern="@[a-z0-9_]+" />
  <Field.Description>Letters, digits and underscores.</Field.Description>
  <Field.Error>
    {(validity) => (validity.patternMismatch ? "Use only letters, digits and underscores." : null)}
  </Field.Error>
</Field.Root>
```

Status: draft for brand-owner review (phase 2). Source guide: the label, helper and error rules of `components/TextField/README.md` in the artifact ("Errors appear only after interaction (`:user-invalid`), never on first render; they replace the helper rather than stacking."). This spec holds the validation contract the other phase-2 specs refer to as "the Field contract".

## Anatomy

Root → Label → control → Description → Error.

- **Root.** A `<div>` that stacks its children with `input-gap` (4). It provides the ids and the field state to its children through context. It renders no role: the control carries the semantics.
- **Label.** A native `<label for>` pointing at the control's id, in `input-label-font` (13/500). MDN: "we recommend using explicit association with the `for` attribute … In fact, you can simultaneously nest _and_ provide `id`/`for` for maximum compatibility." Required controls show a decorative `*` after the text (`aria-hidden`; the `required` attribute is what is announced).
- **Control.** `Field.Control` renders a native `<input>` drawn as the source's `.ab-input`. Any other control placed inside Root (Checkbox, Switch, RadioGroup, Slider, FileTrigger, and the built-in Fields of TextField, TextArea, PasswordField, NumberField and Select) uses the `useFieldControl` hook instead (see **Control contract**), so it gets the id, `name`, `disabled` and the describedby list from Root.
- **Description.** A `<p>` in `input-helper-font`, `input-helper-text-color`. Hidden while the error shows (see Behaviour).
- **Error.** A `<div>` in `input-helper-font`, `input-error-text-color`. Empty until the field is invalid after interaction. With no children it shows the browser's `validationMessage`.

## API

`Field.Root`

| Prop       | Type                                                                 | Default | Notes                                                                                                                                             |
| ---------- | -------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                                             |         | Passed to the control's `name`. Also the key Form uses to find this field's server error.                                                         |
| `disabled` | `boolean`                                                            | `false` | Passed to the control, which renders `aria-disabled="true"` (spec #1). Exposed as `data-disabled`.                                                |
| `invalid`  | `boolean`                                                            |         | Forces the invalid state (an external validation library). When set, it wins over the native validity.                                            |
| `validate` | `(value: string, formData: FormData) => string \| null \| undefined` |         | Custom rule, run on every change. A string becomes the control's `setCustomValidity()` message; `null` / `undefined` clears it. Synchronous only. |
| …native    | `ComponentProps<"div">`                                              |         | `ref`, `className` and native attributes pass through.                                                                                            |

`Field.Label`: `ComponentProps<"label">`. `Field.Control`: `ComponentProps<"input">` plus `onValueChange: (value: string, details: Field.ChangeEventDetails) => void`. `Field.Description`: `ComponentProps<"p">`.

`Field.Error`

| Prop       | Type                                                    | Default | Notes                                                                                                                                                           |
| ---------- | ------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children` | `ReactNode \| ((validity: ValidityState) => ReactNode)` |         | The message, or a function that picks one per failure from the native `ValidityState`. Omitted: the control's `validationMessage`, which the browser localises. |
| …native    | `ComponentProps<"div">`                                 |         |                                                                                                                                                                 |

One Error per Field. A per-failure message is the function form (as TextField's `errorMessage`), so there is no `match` prop and no ordering rule between several Errors (judgement call: one mechanism for both forms, fewer Parts to keep in sync).

**Control contract** (`useFieldControl`, exported from `@platform/ui/field`). A control calls `useFieldControl<Element, Props>(props)` and spreads the result on its native `<input>`, `<select>` or `<textarea>`. Inside a Root it gets `id` (so `Field.Label` points at it), `name` (Root's wins), `aria-describedby` (Description or Error, never both), `aria-invalid`, `aria-disabled` (from its own or Root's `disabled`; native `disabled` is never set), a `ref` that registers the element with Root (the consumer's `ref` is kept), and `onFocus`/`onChange` that call `onValueChange(value, { reason: "none", event, cancel })` and restore the previous value on `cancel()` or while disabled. Root does the rest: validity, `validate`, server errors, reset. How the control blocks input while disabled (`readOnly`, key handling) is the control's own. Outside a Root the hook only passes the props through.

Names, checked against the reference libraries:

- **`Field` with `Root`, `Label`, `Control`, `Description`, `Error`**: Base UI "Groups all parts of the field. Renders a `<div>` element.", "The form control to label and validate. Renders an `<input>`.", "A paragraph with additional information about the field. Renders a `<p>`.", "An error message displayed if the field control fails validation." (https://base-ui.com/react/components/field). Ark and Chakra use `Field.Root` / `Field.Label` / `Field.HelperText` / `Field.ErrorText` (https://ark-ui.com/react/docs/components/field, https://chakra-ui.com/docs/components/field); shadcn `Field`, `FieldLabel`, `FieldDescription`, `FieldError` (https://ui.shadcn.com/docs/components/field); Radix Form `Form.Field`, `Form.Label`, `Form.Control`, `Form.Message` (https://www.radix-ui.com/primitives/docs/components/form). `Description` is Base UI's and shadcn's word and Radix's Part word for the same job (Dialog's "Description"); `Error` is Base UI's.
- **No `match`**: Base UI Error "`match` … Determines whether to show the error message according to the field's ValidityState." and Radix Form.Message match on `ValidityState` with one Part per failure. React Spectrum's `errorMessage: ((v: ValidationResult) => ReactNode) | ReactNode` picks the message in one function; we take that form for Error and every built-in Field.
- **`validate`**: Base UI Root "Return a string or an array of strings with the error message(s) if the value is invalid. Returning nothing, `null`, an empty string, or an empty array means the value is valid." We take one string (one message per field) and drop async validation (Base UI: "Asynchronous functions are supported, but they do not prevent form submission").
- **`invalid`, `disabled`, `name` on Root**: Base UI Root `name` "Takes precedence over the `name` prop on the `<Field.Control>` component.", `invalid` "Useful when the field state is controlled by an external library."; Ark Root `disabled`, `invalid`.
- **Default message from the browser**: React Aria "By default, the `FieldError` component displays the error message provided by the browser, which is localized in the user's preferred language." (https://react-aria.adobe.com/forms).
- **No `validationMode`.** Base UI offers `onSubmit | onBlur | onChange`. We have one timing, the platform's `:user-invalid`, because the brand rule is "Validate after intent" and spec #1 story 52 asks for errors "only after I interact".

## States

| State    | How it shows                                                                                    | Exposed as                                                     |
| -------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| rest     | Label, control, description                                                                     | —                                                              |
| invalid  | Error text replaces the description; the control shows its invalid border (each control's spec) | `data-invalid` on Root, `aria-invalid="true"` on the control   |
| disabled | The control's disabled look; label and description keep their colours (source `forms.css`)      | `data-disabled` on Root, `aria-disabled="true"` on the control |
| required | `*` after the label text                                                                        | native `required` on the control                               |

## Behaviour

**The Field contract** (every phase-2 control follows it):

1. **Validation is the platform's.** Rules are native constraint attributes (`required`, `pattern`, `min`, `max`, `step`, `minLength`, `maxLength`, `type`) plus `validate`, which writes through `setCustomValidity()`. MDN, `ValidityState`: "A value of `true` indicates that the corresponding validation constraint has failed, except for the `valid` property". web.dev: "Use the setCustomValidity() method of the Constraint Validation API." (https://web.dev/learn/forms/validation).
2. **Timing is `:user-invalid`'s.** The field becomes invalid exactly when its control matches `:user-invalid`. HTML: ":user-invalid … must match input, textarea, and select elements whose user validity is true, are candidates for constraint validation but do not satisfy their constraints." User validity turns true when the user commits a change ("any time the user commits the change, the user agent must queue an element task … to set its user validity to true and fire an event named change"), when focus leaves an edited control, and on a submit attempt ("For each element field in the list of submittable elements whose form owner is form, set field's user validity to true."). A reset sets it back to false. web.dev: "A form control that is required and empty will match :invalid even if a user has not started interacting with the page. However, that same form control won't match :user-invalid until the user has changed the input and left it in an invalid state." (https://web.dev/articles/user-valid-and-user-invalid-pseudo-classes).
3. **Script only mirrors that state into ARIA.** Root listens on its control for `change`, `focusout`, `input` and `invalid` (the last with a capture listener, because the spec fires it with only `cancelable` set, so it does not bubble — inference from the spec text) and, in each handler, reads `control.matches(":user-invalid")`. The result sets `data-invalid` on Root, `aria-invalid` on the control and the Error text. MDN, `aria-invalid`: "If you are creating your own form validation scripts, make sure to include `aria-invalid` on invalid form controls". HTML-AAM already exposes a native required control as invalid only after interaction ("The user agent SHOULD expose the invalid state only after 1) a user has purposefully interacted with a required element, or attempted to submit a form", https://w3c.github.io/html-aam/), so the mirror agrees with what the engine exposes. Once invalid, the state re-checks on every `input`, so the error clears as soon as the value becomes valid.
4. **The error replaces the description.** While invalid, Description is `hidden` and the control's `aria-describedby` lists only the Error; otherwise only the Description. Brand book: "Errors show only after interaction. They replace the helper text, never stack on it."
5. **Server errors.** Form passes `errors[name]` to the matching Root. The message is set with `setCustomValidity()`, the field shows invalid at once (a server error is already "after interaction"), and the custom validity is cleared on the next change of the value (Base UI Form: "Once a field's value changes, any corresponding error in `errors` will be cleared from the field state."; React Aria: "cleared after the user modifies each field's value").
6. **Reset** clears user validity (HTML: "The reset algorithm for input elements is to set its user validity, dirty value flag, and dirty checkedness flag back to false"), so Root listens for the form's `reset` event and clears its invalid state.
7. **Disabled** follows spec #1: `aria-disabled="true"`, focusable, input blocked by the control (each control's spec says how). A disabled control is still submitted with the form; to exclude a group of controls from the submission, use a Fieldset with `disabled`, which is native (Fieldset spec).

- Root, Label, Control, Description and Error are one client module (`'use client'`): Root holds state and listeners. Label, Description and Error read the context.
- Labels sit above the control and are always visible; a placeholder is an example, never the label (source guide).

## Motion

None. The error swaps with the description in one frame: an animated height change would move the controls below while the user is reading (inference from the brand's "Purposeful motion"). Colour changes on the control follow the control's spec.

- **Reduced motion:** nothing to remove.
- **Instant exit:** the error leaves in one frame when the value becomes valid, and the description returns in the same frame, so the layout never shows a half state.

## Keyboard

No pattern of its own; Field adds no focusable element. APG, Names and Descriptions: "An accessible description is also an author-provided string that is rendered by assistive technologies. Authors supply a description when there is a need to associate additional information with an element, such as instructions or format requirements for an input field." (https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/). Tab reaches the control; Label click focuses or activates it (native `<label>`).

## Accessibility

- **Name:** from `<label for>`. **Description:** `aria-describedby` → Description or Error (one at a time). web.dev: "use the aria-describedby attribute on the form control, and an id on the error message with the same value, to connect both." (https://web.dev/learn/forms/accessibility).
- **Announcement (spec #1 story 41).** The Error element is always rendered (empty when valid) with `aria-live="assertive"`, so its text is announced when it appears after a blur or a change. web.dev: "use aria-live="assertive" for the error message ... aria-live will usually only announce the first error in the case of multiple errors." MDN's live-region guide asks for the region to exist before its content changes, which is why the element is never unmounted. On a failed submit, Form also focuses the first invalid control, whose description is then the error. The source asked for `role="alert"`; an always-present assertive region is the same politeness without re-inserting a role (judgement call).
- **`aria-errormessage` is not used.** MDN: "The `aria-errormessage` attribute should only be used when the value of an object is not valid". `aria-describedby` works everywhere and the description slot is already free while the error shows, so one attribute covers both (judgement call).
- **Required:** native `required`; the `*` is `aria-hidden`.
- **More contrast:** Description uses `input-helper-text-color` (`color-text-subtle`), which already passes 4.5:1; nothing changes.
- **Forced colors:** text only; system colours apply. The error is never shown by colour alone: it is text, and the control's border also changes.
- **Reduced transparency:** not affected.

## RTL

Logical properties only. Label, Description and Error align to the inline start in both directions. Text inside is the app's; `dir="auto"` belongs on the control (TextField spec), not on Field.

## Component tokens

All exist (the source's `input-*` set, shared by every field): `input-gap`, `input-label-font`, `input-label-text-color`, `input-helper-font`, `input-helper-text-color`, `input-error-text-color`.

No new tokens. Field reuses the `input` component word instead of adding `field`, because the source designed label, helper and error once for all its form controls (judgement call).

## Built-in labels

None. The default error text is the browser's `validationMessage`, already in the user's language.

## Feedback events

None. Validation is not a feedback moment the brand marks with sound (brand book: "Soft synthesised clicks mark toggles, toasts and running a command.").

## Sources

- Source guide: artifact `project/components/TextField/README.md`; brand book "Interaction principles" ("Validate after intent").
- HTML Living Standard: `:user-invalid` (https://html.spec.whatwg.org/multipage/semantics-other.html), user validity and the `invalid` event (https://html.spec.whatwg.org/multipage/form-control-infrastructure.html), input commit and reset (https://html.spec.whatwg.org/multipage/input.html).
- MDN: `:user-invalid` (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:user-invalid), `ValidityState` (https://developer.mozilla.org/en-US/docs/Web/API/ValidityState), `<label>` (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label), `aria-invalid`, `aria-describedby`, `aria-errormessage` (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/).
- web.dev: https://web.dev/learn/forms/validation, https://web.dev/learn/forms/accessibility, https://web.dev/articles/user-valid-and-user-invalid-pseudo-classes
- HTML-AAM: https://w3c.github.io/html-aam/
- Baseline (webstatus.dev, 2026-10-24): `user-pseudos` widely available (low 2023-11-02); `constraint-validation` widely available.
- WAI-ARIA APG, Providing Accessible Names and Descriptions: https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
- Base UI Field: https://base-ui.com/react/components/field · Radix Form: https://www.radix-ui.com/primitives/docs/components/form · Ark Field: https://ark-ui.com/react/docs/components/field · Chakra Field: https://chakra-ui.com/docs/components/field · shadcn Field: https://ui.shadcn.com/docs/components/field · React Aria forms: https://react-aria.adobe.com/forms
