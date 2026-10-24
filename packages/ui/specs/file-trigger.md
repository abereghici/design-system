# FileTrigger

Opens the system file picker from any button, and keeps the chosen files in a native file input so they submit with the form. Use it for "Upload", "Attach" and "Choose image". To also accept files dragged onto an area, put it inside a DropZone.

```tsx
import { FileTrigger } from "@platform/ui/file-trigger";
import { Button } from "@platform/ui/button";
import { Field } from "@platform/ui/field";

<FileTrigger accept="image/png,image/jpeg" onSelect={(files) => preview(files[0])}>
  <Button>Choose image</Button>
</FileTrigger>

<Field.Root name="attachments">
  <Field.Label>Attachments</Field.Label>
  <FileTrigger multiple required>
    <Button><PlusIcon data-icon="inline-start" /> Add files</Button>
  </FileTrigger>
  <Field.Description>PDF or images, up to 10 MB each.</Field.Description>
  <Field.Error />
</Field.Root>
```

Status: draft for brand-owner review (phase 2). No source guide: drafted from the platform and the reference libraries.

## Anatomy

Trigger (the consumer's single child) → hidden file input.

- **Trigger.** The one child element, usually a Button or IconButton, rendered as is (Slot): FileTrigger adds an `onClick`, `disabled`, and inside a Field an `id`, `aria-labelledby`, `aria-describedby` and `aria-invalid`. It keeps its own look; in a Field's grid it keeps its content width (`justify-self: start`, FileTrigger's only CSS).
- **Hidden input.** A native `<input type="file">` after the trigger, visually hidden (VisuallyHidden), `tabIndex={-1}` and `aria-hidden`. It holds `name`, `accept`, `multiple`, `required` and the selected `FileList`, and it is the Field's control (`useFieldControl`). It is not `hidden`: a blocked submit focuses the first invalid control, and a `hidden` input cannot take focus (Chromium then refuses the submit with "An invalid form control … is not focusable"). When it receives focus it moves focus on to the trigger. Inside a DropZone, FileTrigger renders no input and uses the zone's.

FileTrigger draws nothing. The list of chosen files is the app's to render (from `onSelect`), because products differ (thumbnails, progress, remove buttons).

## API

| Prop                       | Type                                                              | Default | Notes                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `children`                 | `ReactElement`                                                    |         | Exactly one element; it becomes the trigger.                                                                                  |
| `accept`                   | `string`                                                          |         | Native: "a comma-separated list of unique file type specifiers".                                                              |
| `multiple`                 | `boolean`                                                         | `false` | Native.                                                                                                                       |
| `directory`                | `boolean`                                                         | `false` | Native `webkitdirectory`: pick a folder; all files inside are selected.                                                       |
| `onSelect`                 | `(files: File[], details: FileTriggerSelectEventDetails) => void` |         | After the user picks files. `details`: `reason` (`"none"`), `event` (the native `change`), `cancel()` (clears the selection). |
| `name`, `required`, `form` | native                                                            |         | On the hidden input, so the files submit with the form and `valueMissing` applies.                                            |
| `disabled`                 | `boolean`                                                         | `false` | Passed to the trigger (`aria-disabled`); the picker does not open.                                                            |

Names, checked against the reference libraries:

- **`FileTrigger`**: React Aria "A FileTrigger allows a user to access the file system with any pressable React Aria or React Spectrum component" (https://react-aria.adobe.com/FileTrigger). Mantine `FileButton` (https://mantine.dev/core/file-button/), Ark and Chakra `FileUpload.Trigger` (a Part of a larger upload). The ticket and spec #1 name it FileTrigger.
- **`accept`, `multiple`, `directory`**: the native attribute names, as Mantine (`accept: string`, `multiple`) and Ark (`accept`, `directory`). React Aria says `acceptedFileTypes: readonly string[]`, `allowsMultiple`, `acceptDirectory`; we keep the platform's names, which consumers already know from HTML (judgement call).
- **No `capture` / `defaultCamera`.** React Aria `defaultCamera`, Ark and Mantine `capture`. HTML media capture is limited (webstatus.dev `html-media-capture`: Chrome Android, Firefox Android and Safari iOS only), below the floor.
- **`onSelect`**: React Aria "`onSelect: (files: FileList | null) => void` — Handler when a user selects a file." An array of `File` plus spec #1's `details`; Mantine's `onChange` is the same moment.

## States

FileTrigger has no states of its own; the trigger shows its own (Button's). With files chosen, the hidden input matches `:valid` / `:user-invalid` as usual; the Field shows the error (Field contract).

## Behaviour

- **Opening the picker.** The trigger's click calls `input.click()` on the hidden input, inside the user's gesture. `showPicker()` is not used: webstatus.dev `show-picker-input` is limited (no Safari iOS). MDN: "`showPicker()` … NotAllowedError: Thrown if not explicitly triggered by a user action".
- **Selection.** Each trigger click listens once for the input's `change` (or stops at its `cancel`), so inside a DropZone a drop never calls a FileTrigger's `onSelect`. On that `change`, FileTrigger calls `onSelect([...input.files], details)`. `cancel()` sets `input.value = ""`. Choosing the same files again, or closing the picker, fires the native `cancel` event instead, which a consumer can listen to on the trigger's form or document if needed (no prop). MDN: "fires on an input element when the user cancels the file picker dialog via the Esc key or the cancel button and when the user re-selects the same files that were previously selected of `type="file"`."
- **Form submission is native.** Because the input keeps `name` and the `FileList`, `FormData` includes the files, and a React action or `multipart/form-data` post receives them with no extra code.
- **Validation:** `required` gives `valueMissing`; `accept` is a picker hint, not a constraint, so a type check belongs in `onSelect` or Field's `validate`. Form's focus-first-invalid focuses the input, which hands focus to the trigger, and the trigger carries `aria-invalid` and the error's `aria-describedby`.
- **Disabled:** the trigger gets `disabled` (Button renders `aria-disabled`) and the click returns before `input.click()`, also when the trigger's own handler called `preventDefault()`. A click on the Field label is cancelled on the input.
- Client component (`'use client'`).

## Motion

None of its own; the trigger's press feedback applies.

- **Reduced motion:** as the trigger.
- **Instant exit:** nothing exits; the system picker is the OS's.

## Keyboard

No pattern of its own: the trigger is a Button (APG **Button**, https://www.w3.org/WAI/ARIA/apg/patterns/button/). Space or Enter on it opens the picker; the picker's keyboard is the operating system's. The hidden input is not in the tab order.

## Accessibility

- The trigger's name says what will be chosen ("Choose image", "Add files"). Inside a Field, Field.Label's `for` points at the file input (the Field's control, so validation, server errors and reset work unchanged), and a click on the label opens the picker through the input's own activation. The trigger names itself with `aria-labelledby="<label id> <trigger id>"`, so it is announced as "Attachments Add files" (React Aria's pattern for a Select trigger: label plus own content). A child with its own `id` breaks that reference; don't set one.
- The selection is announced by the app: render the chosen file names near the trigger. Announce changes with a polite live region in the app's file list if the list updates without focus moving (documented on the docs page).
- **More contrast, forced colors, reduced transparency:** as the trigger.

## RTL

Nothing to mirror.

## Component tokens

None. FileTrigger draws nothing.

## Built-in labels

None. The trigger's text is the consumer's.

## Feedback events

None of its own. The trigger (a Button) dispatches `ab-press`.

## Sources

- MDN `<input type="file">`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file · `HTMLInputElement.showPicker()`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker · `cancel` event: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/cancel_event · `webkitdirectory`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
- Baseline (webstatus.dev and web-features 3.44.0, 2026-10-24): `input-file` and `input-file-multiple` widely available; `input-file-webkitdirectory` newly available (low 2025-08-19); `api.HTMLInputElement.cancel_event` widely available (low 2023-05-05); `show-picker-input` limited (not used); `html-media-capture` limited (not used).
- WAI-ARIA APG Button: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- React Aria FileTrigger: https://react-aria.adobe.com/FileTrigger · Mantine FileButton: https://mantine.dev/core/file-button/ · Ark FileUpload: https://ark-ui.com/react/docs/components/file-upload · Chakra FileUpload: https://chakra-ui.com/docs/components/file-upload
