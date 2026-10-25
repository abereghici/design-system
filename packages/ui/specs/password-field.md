# PasswordField

A TextField for secrets, with a toggle that shows the password as plain text so users can check what they typed. Use it for sign-in, sign-up and password-change forms.

```tsx
import { PasswordField } from "@platform/ui/password-field";

<PasswordField label="Password" name="password" autoComplete="current-password" required />
<PasswordField
  label="New password"
  name="new-password"
  autoComplete="new-password"
  minLength={12}
  description="At least 12 characters."
/>
```

Status: draft for brand-owner review (phase 2). No source guide: drafted from TextField, the platform and the reference libraries.

## Anatomy

Label → container (input, reveal toggle) → description or error.

- Everything TextField has (Field Parts, container, input), with `type="password"` while hidden and `type="text"` while shown.
- **Reveal toggle.** An IconButton (`sm`) in TextField's end element, used as a toggle (`pressed`). Icon (decorative): `eye` while shown, `eye-off` while hidden, drawn for the set on 2026-10-25 and pending the brand owner's review of the drawing. The icon shows the current state, as in Radix (`<PasswordToggleField.Icon visible={<EyeOpenIcon />} hidden={<EyeClosedIcon />} />`) and Ark (Indicator `fallback`: "The fallback content to display when the password is not visible."). The label never changes ("Show password"); the pressed state carries shown/hidden.

## API

| Prop                                        | Type                                                                          | Default                     | Notes                                                                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `visible`                                   | `boolean`                                                                     |                             | Controlled: whether the value is shown as text.                                                                                              |
| `defaultVisible`                            | `boolean`                                                                     | `false`                     | Uncontrolled counterpart.                                                                                                                    |
| `onVisibleChange`                           | `(visible: boolean, details: PasswordFieldVisibleChangeEventDetails) => void` |                             | Called before the change commits. `details`: `reason` (`"toggle-press"` or `"form-submit"`), `event`, `cancel()`.                            |
| `toggleLabel` | `string` (required) |  | The show-password toggle's accessible name ("Show password"); it shows only an icon. |
| `autoComplete`                              | `"current-password" \| "new-password" \| "one-time-code" \| "off"`            | `"current-password"`        | Narrowed from the native type to the values that fit a password field.                                                                       |
| TextField props except `type`, `endElement` |                                                                               |                             | `label`, `description`, `errorMessage`, `invalid`, `validate`, `size`, `startElement`, `disabled`, `onValueChange`, native input attributes. |

Names, checked against the reference libraries:

- **`PasswordField`**: the ticket's name, matching TextField and NumberField. Libraries: Mantine `PasswordInput` (https://mantine.dev/core/password-input/), Chakra `PasswordInput` (https://chakra-ui.com/docs/components/password-input), Ark `PasswordInput` (https://ark-ui.com/react/docs/components/password-input), Radix `PasswordToggleField` ("A password input field with an integrated button to toggle the value's visibility.", https://www.radix-ui.com/primitives/docs/components/password-toggle-field). Base UI, React Aria and MUI have none. Three libraries say `PasswordInput`, but our text-entry family is `…Field` (TextField, NumberField), so the suffix follows the family (judgement call).
- **`visible` / `defaultVisible`**: Mantine "`visible: boolean` — If set, the input value is visible", "`defaultVisible`"; Chakra, Ark and Radix use the same two names. All four agree.
- **`onVisibleChange`**: Chakra "`onVisibleChange: (visible: boolean) => void` — Callback invoked when the visibility state changes."; Mantine, Ark and Radix use `onVisibilityChange`. Spec #1's naming is `on{Prop}Change` for a `{prop}` pair (`open`/`onOpenChange`, `checked`/`onCheckedChange`), so the prop `visible` gives `onVisibleChange` (Chakra), not three-to-one `onVisibilityChange` (judgement call).
- **`toggleLabel`** (required): Ark `translations: Partial<{ visibilityTrigger: ((visible: boolean) => string) | undefined }>`; spec #1's typed `labels` prop. One constant string, because the label must not change with the state (APG, see Accessibility).
- **`autoComplete` default `"current-password"`**: Ark "`autoComplete: 'current-password' | 'new-password' = "current-password"`"; Radix Input "`autoComplete` default `"current-password"`".

## States

TextField's states, plus the toggle's:

| State  | How it shows                                              | Exposed as                                             |
| ------ | --------------------------------------------------------- | ------------------------------------------------------ |
| hidden | Dots; toggle at rest                                      | input `type="password"`, toggle `aria-pressed="false"` |
| shown  | Plain text; toggle selected (IconButton's selected state) | input `type="text"`, toggle `aria-pressed="true"`      |

## Behaviour

- **Toggle.** Clicking the toggle calls `onVisibleChange(!visible, details)`. Unless cancelled, it switches the input's `type` and keeps the caret and selection where they were. web.dev: "You should add a Show password toggle to enable users to check the text they've entered. Usability suffers when users can't see the text they've entered. Currently there's no built-in way to do this, though there are plans for implementation. You'll need to use JavaScript instead." (https://web.dev/articles/sign-in-form-best-practices).
- **Focus.** A pointer press on the toggle returns focus to the input; a keyboard press keeps focus on the toggle. Radix: "Returns focus to the input when toggling with a pointer · Maintains button focus when toggling with keyboard or virtual navigation".
- **Hidden again on submit.** On the owning form's `submit` event the field switches back to hidden (`reason: "form-submit"`), so a browser never stores the value as plain text form history. Radix: "Resets visibility to hidden after form submission to prevent accidental storage".
- The toggle is `type="button"` (web.dev: "If you want to add another button in a form (for Show password, for example) add type="button". Otherwise clicking or tapping on the button will submit the form.") and `aria-controls` the input (web.dev Learn Forms: "Connect the <button> with the <input type="password"> using the aria-controls attribute.").
- **`autoComplete`**: MDN, `current-password` "Allow the browser or password manager to enter the current password for the site", `new-password` "Allow the browser or password manager to automatically enter a new password for the site; this is used on "change your password" and "new user" forms".
- No strength meter is built in; compose a Meter below the field (Meter spec) when a product needs one.
- Disabled: TextField's (`aria-disabled` plus `readOnly`); the toggle is disabled too.
- Client component (`'use client'`).

## Motion

TextField's border colour transitions, plus IconButton's press and selected colour. Switching between dots and text is instant.

- **Reduced motion:** the toggle's press keeps only its colour (IconButton).
- **Instant exit:** nothing exits; the type switch is a single-frame swap, which reads as correct.

## Keyboard

APG patterns: none for the input (native text editing); **Button**, toggle button, for the reveal toggle (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key                       | Action                                               |
| ------------------------- | ---------------------------------------------------- |
| Tab / Shift+Tab           | Input, then the toggle.                              |
| Space / Enter (on toggle) | "Activates the button." Shows or hides the password. |
| Enter (in the input)      | Implicit submission (native).                        |

## Accessibility

- The toggle's name is constant ("Show password") and its state is `aria-pressed`. APG: "it is critical the label on a toggle does not change when its state changes. … the label remains "Mute" so a screen reader would say something like "Mute toggle button pressed"." Because the pressed state is announced on the button itself, no extra live region is needed (web.dev's Learn Forms suggests one for a toggle whose name changes; judgement call).
- The input's role switches between none (password) and `textbox` when shown; its name and description stay.
- **More contrast, forced colors, reduced transparency:** TextField's plus IconButton's (the shown state uses `Highlight` in forced colors).

## RTL

As TextField; the toggle sits at the inline end. Password text direction: `dir="auto"` applies only while shown (dots have no direction).

## Component tokens

None new. TextField's `input-*` set and IconButton's `icon-button-*` set.

## Author-written text

None. The toggle's name is the author's `toggleLabel`, required by type.

## Feedback events

The reveal toggle is an IconButton, so it dispatches IconButton's `ab-toggle` (`{ component: "IconButton", reason: "user" }`) after a committed change. The automatic hide on submit dispatches nothing (the system caused it, and the submit Button already fired `ab-press`).

## Sources

- TextField spec, Field spec and IconButton spec: `packages/ui/specs/text-field.md`, `field.md`, `icon-button.md`.
- MDN `<input type="password">`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password
- web.dev, Sign-in form best practices: https://web.dev/articles/sign-in-form-best-practices · Learn Forms, JavaScript: https://web.dev/learn/forms/javascript
- Baseline (webstatus.dev, 2026-10-24): `input-password` widely available.
- WAI-ARIA APG Button (toggle): https://www.w3.org/WAI/ARIA/apg/patterns/button/
- Mantine PasswordInput: https://mantine.dev/core/password-input/ · Chakra PasswordInput: https://chakra-ui.com/docs/components/password-input · Ark PasswordInput: https://ark-ui.com/react/docs/components/password-input · Radix PasswordToggleField: https://www.radix-ui.com/primitives/docs/components/password-toggle-field
