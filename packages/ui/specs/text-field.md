# TextField

Single-line text entry with a visible label, an optional description and an inline error: names, emails, URLs, search terms. Use TextArea for more than one line, PasswordField for secrets, NumberField for numbers and Select to choose from a short known list.

```tsx
import { TextField } from "@platform/ui/text-field";
import { Kbd } from "@platform/ui/kbd";
import { SearchIcon } from "@platform/ui/icons/search";

<TextField
  label="Email"
  name="email"
  type="email"
  required
  autoComplete="email"
  description="We reply within a day."
  errorMessage="Enter a valid email address."
/>
<TextField
  aria-label="Search"
  type="search"
  placeholder="Search"
  startElement={<SearchIcon />}
  endElement={<Kbd keys="/" aria-hidden />}
  aria-keyshortcuts="/"
/>
```

Status: draft for brand-owner review (phase 2). Source guide: `components/TextField/README.md` in the artifact.

## Anatomy

Label → container (start element, input, end element) → description or error.

- **Label, description, error.** The Field Parts, built in (Field spec): `<label for>` in 13/500, description and error in 14 below the container.
- **Container.** A `<div>` drawn as the field: height `input-height` (32; `lg` 40), radius 8, `input-border-color` hairline, `input-shadow` (raised elevation), `input-background-color`. It holds the start element, the input and the end element in a row, with `input-padding-inline` at both ends.
- **Input.** A native `<input>` with no border or background of its own, filling the container. `dir="auto"` by default.
- **Start / end elements.** Optional decorative or interactive content: a leading icon (`input-icon-size` 16, `input-icon-color`), a trailing Kbd hint, an IconButton (PasswordField's reveal, a clear button). Icons are decorative; interactive elements are the consumer's and keep their own names.

## API

| Prop                     | Type                                                             | Default                       | Notes                                                                                                                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                  | `ReactNode`                                                      |                               | Visible label. Without it, `aria-label` or `aria-labelledby` is required (the props type is a union that demands one).                                                                                                                       |
| `description`            | `ReactNode`                                                      |                               | Helper text, replaced by the error while invalid.                                                                                                                                                                                            |
| `errorMessage`           | `ReactNode \| ((validity: ValidityState) => ReactNode)`          | browser's `validationMessage` | Shown only while invalid (Field contract). A function picks a message per failure.                                                                                                                                                           |
| `invalid`                | `boolean`                                                        |                               | Forces the invalid state (Field's `invalid`).                                                                                                                                                                                                |
| `validate`               | Field's `validate`                                               |                               | Custom rule through `setCustomValidity()`.                                                                                                                                                                                                   |
| `size`                   | `"md" \| "lg"`                                                   | `"md"`                        | Exposed as `data-size`. Heights 32 / 40, growing to 44 / 48 on coarse pointers through `size-control-*`. Replaces the native `size` attribute (character width), which is omitted from the props.                                            |
| `startElement`           | `ReactNode`                                                      |                               | Content at the inline start of the container.                                                                                                                                                                                                |
| `endElement`             | `ReactNode`                                                      |                               | Content at the inline end of the container.                                                                                                                                                                                                  |
| `value` / `defaultValue` | `string`                                                         |                               | Native, controlled / uncontrolled.                                                                                                                                                                                                           |
| `onValueChange`          | `(value: string, details: TextField.ChangeEventDetails) => void` |                               | Called on every `input` event. `details`: `reason` (`"none"`), `event`, `cancel()`; `cancel()` restores the previous value (spec #1).                                                                                                        |
| `disabled`               | `boolean`                                                        | `false`                       | `aria-disabled="true"` plus `readOnly`: focusable, selectable, not editable (spec #1).                                                                                                                                                       |
| `className`, `style`     |                                                                  |                               | Go on the root wrapper, so layout styles size the whole field.                                                                                                                                                                               |
| …native                  | `Omit<ComponentProps<"input">, "size">`                          |                               | `ref`, `id`, `name`, `type` (`text`, `email`, `url`, `tel`, `search`), `required`, `pattern`, `minLength`, `maxLength`, `autoComplete`, `inputMode`, `enterKeyHint`, `placeholder`, `dirname` and every other attribute go on the `<input>`. |

Names, checked against the reference libraries:

- **`TextField`**: React Aria "A text field allows a user to enter a plain text value with a keyboard." (https://react-aria.adobe.com/TextField); MUI `TextField` (https://mui.com/material-ui/api/text-field/); Radix Themes `TextField.Root` "Captures user input with an optional slot for buttons and icons." (https://www.radix-ui.com/themes/docs/components/text-field); React Spectrum `TextField`. Mantine says `TextInput`, Base UI `Input`, Chakra `Input`. Three of the libraries with a labelled text component call it TextField, and it is the source's name.
- **One component with field props, not compound.** MUI (`label`, `helperText`), Mantine (`label`, `description`, `error`) and React Spectrum (`label`, `description`, `errorMessage`) put the field anatomy in props; React Aria composes `<TextField><Label/><Input/>…`. Field is our compound form; TextField is the short form most fields need (judgement call, so the two styles are distinct components rather than mixed in one).
- **`description`**: Mantine "Contents of `Input.Description` component."; React Spectrum `description` "A description for the field. Provides a hint such as specific requirements for what to choose." MUI calls it `helperText`. Matches `Field.Description`.
- **`errorMessage`**: React Spectrum `errorMessage: ((v: ValidationResult) => ReactNode) | ReactNode` "An error message for the field." (https://react-spectrum.adobe.com/TextField). Mantine's `error` shows whenever set, and MUI's `error` is a boolean, so neither keeps the after-interaction timing; Spectrum's does. Our function form receives the native `ValidityState`.
- **`invalid`**: Base UI Field `invalid`, Ark Field `invalid`; React Aria `isInvalid` "Whether the value is invalid."
- **`startElement` / `endElement`**: Chakra "Use the `startElement` and `endElement` on the `InputGroup` component to add an element to the start and end of the input." (https://chakra-ui.com/docs/components/input). Mantine's `leftSection` / `rightSection` and Radix Themes' `side: "left" | "right"` are physical; spec #1 uses logical properties only, so the logical names win.
- **`onValueChange`**: Base UI Input `onValueChange: (value: string, eventDetails: Input.ChangeEventDetails) => void` (https://base-ui.com/react/components/input); spec #1's canonical name.
- **No source `icon` / `shortcut` props.** The source had `icon="search" shortcut="/"`; they become `startElement` and an `aria-hidden` Kbd plus `aria-keyshortcuts`, the Button spec's contract.

## States

| State     | How it shows                                                                                            | Exposed as                                    |
| --------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| rest      | Hairline `input-border-color`, raised elevation                                                         | `data-size`                                   |
| hovered   | Border `input-border-color-hovered`; fine pointers only (`@media (hover: hover)`)                       | `:hover`                                      |
| focused   | Border `input-border-color-focused` and a 2 px focus ring with no offset, on the container              | `:focus-within` / input `:focus-visible`      |
| invalid   | Border `input-border-color-invalid`; error text replaces the description                                | `aria-invalid="true"`, Field's `data-invalid` |
| disabled  | `input-background-color-disabled`, `input-text-color-disabled`, `input-border-color-disabled`; no hover | `aria-disabled="true"` or `:disabled`         |
| read-only | Rest look, no hover border                                                                              | `:read-only` (native `readOnly`)              |

The focus ring is drawn on the container with `:has(input:focus-visible)` so the start and end elements sit inside it (source: "focused (2px moss ring, no offset)"). Browsers' `:focus-visible` heuristics also match a text input focused by the mouse, so the ring shows on every focus, which is what the source asks for (inference; the build ticket asserts it in three engines).

## Behaviour

- Follows the Field contract: errors only after interaction (`:user-invalid`), replacing the description, linked through `aria-describedby`, cleared as soon as the value is valid.
- Labels sit above, always visible. "placeholders are examples, never labels" (source guide). Placeholder text uses `input-placeholder-color`.
- `dir="auto"` by default (spec #1 story 55). MDN: "The `auto` value should be used for data with an unknown directionality, like data coming from user input or external data." Pass `dirname` to submit the detected direction (MDN: "describes the directionality of the element's text content during form submission").
- Disabled: `aria-disabled="true"` and `readOnly`, so the value can be read and copied but not changed, and no `input` event fires. A read-only control is barred from constraint validation, so a disabled field never blocks submission; its value is still submitted (Field contract, step 7).
- `autoComplete`, `inputMode` and `enterKeyHint` are the consumer's to set; the docs page lists the common tokens (MDN: autocomplete "lets web developers specify what if any permission the user agent has to provide automated assistance in filling out form field values").
- Clicking anywhere on the container focuses the input (a pointer-down handler on the container, skipped when the target is an interactive end element).
- Client component (`'use client'`): Field state and `onValueChange`.

## Motion

- Hover and focus: border colour over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color`. The focus ring appears at once (focus feedback is never delayed).
- No press scale: a text field is not pressed.
- **Reduced motion:** nothing moves; colour fades stay.
- **Instant exit:** losing focus or hover reverses the colour from its current value; with no transition the border simply switches, which reads as correct.

## Keyboard

No APG pattern: a native single-line text input. APG, Spinbutton note on text editing: "The most robust approach for providing text editing functions is to rely on browsers, which supply them for HTML inputs with type text". TextField adds no key handling.

| Key             | Action                                               |
| --------------- | ---------------------------------------------------- |
| Tab / Shift+Tab | Moves focus to / from the input, also when disabled. |
| Enter           | Implicit submission of the owning form (native).     |
| Text keys       | Native editing, selection and IME.                   |

Interactive end elements (an IconButton) follow the input in the tab order.

## Accessibility

- Role `textbox` (or `searchbox` for `type="search"`) from the native input; name from the label; description or error through `aria-describedby` (Field contract).
- An unlabelled search field needs `aria-label`; the type requires a label of some kind.
- A Kbd hint is `aria-hidden` and the input carries `aria-keyshortcuts`, as in the Button spec.
- Targets: the container is the hit area; heights come from `size-control-md|lg`, 44 / 48 on coarse pointers.
- **More contrast:** the border is already `color-border-default` (3:1). Placeholder uses `color-text-subtlest`, which steps up to `color-text-subtle` under `(prefers-contrast: more)` (token media override).
- **Forced colors:** the background and shadow disappear, so the container draws a 1 px `CanvasText` border (the token border is forced to a system colour anyway); invalid adds a second cue in text (the error). The focus ring is an `outline` and takes the system colour. Disabled uses `GrayText`.
- **Reduced transparency:** not affected.

## RTL

Logical properties only. `startElement` sits at the inline start in both directions. The input's own text direction follows `dir="auto"`, independent of the page. Directional icons are mirrored by Icon. No arrow-key handling (the caret is the browser's).

## Component tokens

Existing (ported from the source, shared with TextArea, PasswordField, NumberField and Select): `input-height`, `input-lg-height`, `input-padding-inline`, `input-padding-block`, `input-gap`, `input-border-radius`, `input-border-width`, `input-font`, `input-label-font`, `input-helper-font`, `input-shadow`, `input-background-color`, `input-text-color`, `input-label-text-color`, `input-placeholder-color`, `input-helper-text-color`, `input-error-text-color`, `input-icon-color`, `input-border-color`, `input-border-color-hovered`, `input-border-color-focused`, `input-border-color-invalid`, `input-background-color-disabled`, `input-text-color-disabled`, `input-border-color-disabled`.

Proposed new:

| Token             | References     | `$type`   | Why                                                      |
| ----------------- | -------------- | --------- | -------------------------------------------------------- |
| `input-icon-size` | `size-icon-sm` | dimension | Size of a start or end icon (16), as `button-icon-size`. |

The focus ring uses `focus-ring-width` and `color-border-focused` directly (R6), with `outline-offset: 0` (the source's "no offset").

## Author-written text

None. Error messages default to the browser's localised `validationMessage`.

## Feedback events

None. Typing is high-frequency (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions"; the same restraint applies to sound).

## Sources

- Source guide: artifact `project/components/TextField/README.md` ("Label (13/500) → input (32, radius 8, hairline + raised elevation) → helper or error (14). Leading icon and trailing Kbd are optional."; "rest · hovered · focused (2px moss ring, no offset) · invalid (clay border + error text) · disabled.").
- Field spec (the Field contract): `packages/ui/specs/field.md`.
- MDN: `dir` (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir), `dirname` (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/dirname), `autocomplete` (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete), `enterkeyhint`, `inputmode`.
- Baseline (webstatus.dev, 2026-10-24): `dir` widely available, `dirname` widely available (low 2023-08-01), `enterkeyhint` widely available (low 2021-11-02), `inputmode` widely available, `has` widely available (low 2023-12-19).
- WAI-ARIA APG Spinbutton (text-editing note): https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
- React Aria TextField: https://react-aria.adobe.com/TextField · React Spectrum TextField: https://react-spectrum.adobe.com/TextField · MUI TextField: https://mui.com/material-ui/api/text-field/ · Mantine TextInput: https://mantine.dev/core/text-input/ · Radix Themes TextField: https://www.radix-ui.com/themes/docs/components/text-field · Base UI Input: https://base-ui.com/react/components/input · Chakra Input: https://chakra-ui.com/docs/components/input
