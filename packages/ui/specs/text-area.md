# TextArea

Multi-line text entry that grows with its content, from 3 to 12 lines, then scrolls: messages, descriptions, notes. Same label, description and error as TextField.

```tsx
import { TextArea } from "@platform/ui/text-area";

<TextArea label="Message" name="message" description="Markdown supported." required />
<TextArea label="Notes" name="notes" minRows={2} maxRows={6} maxLength={500} />
```

Status: draft for brand-owner review (phase 2). Source guide: `components/Textarea/README.md` in the artifact. Renamed Textarea → TextArea (spec #1).

## Anatomy

Label → container (textarea) → description or error.

- **Label, description, error.** The Field Parts, built in (Field spec).
- **Container.** Drawn exactly as TextField's (radius 8, hairline, raised elevation), with `input-padding-block` above and below the text. No start or end elements: a multi-line field has no single line to align them to (judgement call).
- **Textarea.** A native `<textarea>` with `field-sizing: content`, `dir="auto"` and `resize: vertical`.

## API

| Prop                                                                                       | Type                                                 | Default | Notes                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`, `description`, `errorMessage`, `invalid`, `validate`, `disabled`, `onValueChange` | as TextField                                         |         | Same meaning and types (with `HTMLTextAreaElement`).                                                                                                                                                                |
| `minRows`                                                                                  | `number`                                             | `3`     | Height floor in lines. Set inline as the `min-block-size`.                                                                                                                                                              |
| `maxRows`                                                                                  | `number`                                             | `12`    | Height ceiling in lines; beyond it the textarea scrolls. Set inline as the `max-block-size`.                                                                                                                            |
| `value` / `defaultValue`                                                                   | `string`                                             |         | Native.                                                                                                                                                                                                             |
| `className`, `style`                                                                       |                                                      |         | On the root wrapper.                                                                                                                                                                                                |
| …native                                                                                    | `Omit<ComponentProps<"textarea">, "rows" \| "cols">` |         | `ref`, `name`, `required`, `minLength`, `maxLength`, `placeholder`, `autoComplete`, `spellCheck`, `dirname`, `wrap`… go on the `<textarea>`. `rows`/`cols` are omitted because they have no effect (see Behaviour). |

Names, checked against the reference libraries:

- **`TextArea`**: React Aria `TextArea` "Use `<TextArea>` instead of `<Input>` to enable multi-line input." (https://react-aria.adobe.com/TextField); Radix Themes `TextArea` "Captures multi-line user input." (https://www.radix-ui.com/themes/docs/components/text-area). Mantine and Chakra say `Textarea`; spec #1 fixes `TextArea`.
- **`minRows` / `maxRows`**: Mantine "`minRows: number` — Minimum rows of autosize textarea", "`maxRows: number` — Maximum rows for autosize textarea to grow" (https://mantine.dev/core/textarea/); MUI TextareaAutosize "`maxRows` … Maximum number of rows to display.", "`minRows` … Minimum number of rows to display." (https://mui.com/material-ui/api/textarea-autosize/). Both libraries agree; the defaults are the source's "3–12 lines".
- **No `autosize` / `autoresize` flag.** Mantine (`autosize`), Chakra and Ark (`autoresize`) make growth opt-in. The source grows always, and with `field-sizing` it costs no script, so it is the only behaviour; `minRows === maxRows` gives a fixed height.

## States

As TextField: rest, hovered, focused (border plus 2 px ring with no offset), invalid, disabled, read-only. Exposed the same way.

## Behaviour

- **Growth is CSS.** `field-sizing: content` with `min-block-size: calc(minRows * 1lh + 2 * var(--ab-input-padding-block) + 2 * var(--ab-input-border-width))` and `max-block-size: calc(maxRows * 1lh + 2 * var(--ab-input-padding-block) + 2 * var(--ab-input-border-width))` (the source's formula, line height `type-body-xs-line-height`). MDN: "`field-sizing: content` overrides the default preferred sizing of form elements. This setting provides a way to configure text inputs to shrinkwrap their content and grow as more text is entered. They stop expanding when they reach maximum size limits (defined by the size of their containing element or set via CSS), at which point scrolling is required to view all the content." and "`rows`/`cols` have no effect on `<textarea>` elements with `field-sizing: content` set." So the row limits are CSS lengths in `lh`, not attributes.
- **Manual resize** stays available vertically (source: "manual vertical resize stays available"), with `resize: vertical`. The logical `resize: block` was not used because its Baseline status was not verified.
- Follows the Field contract (errors after interaction, replacing the description).
- `dir="auto"` by default. MDN: "For textarea and pre, the rendering direction is determined separately for each paragraph of text."
- Disabled: `aria-disabled="true"` plus `readOnly`, as TextField.
- Enter inserts a line break; it never submits (native).
- Client component (`'use client'`), as TextField.

## Motion

As TextField: border colour transitions only. The height change while typing is not animated: it follows the text one line at a time, and animating it would make the caret lag behind the box (inference).

- **Reduced motion:** nothing moves.
- **Instant exit:** colour reversals only, as TextField.

## Keyboard

No APG pattern: a native `<textarea>`. Text editing, selection and IME are native.

| Key             | Action                                                      |
| --------------- | ----------------------------------------------------------- |
| Tab / Shift+Tab | Moves focus to / from the textarea (Tab is never captured). |
| Enter           | New line (native).                                          |

## Accessibility

- Role `textbox` (multi-line) from the native element; name, description and error as TextField.
- Content beyond `maxRows` scrolls inside the textarea, so 200% text and 320 px reflow keep everything reachable.
- **More contrast, forced colors, reduced transparency:** as TextField.

## RTL

Logical properties only. Text direction per paragraph from `dir="auto"`. The resize handle is drawn by the browser.

## Component tokens

None new. The `input-*` set, as TextField: container chrome, `input-padding-block`, `input-font`, label, helper, error, placeholder, border states and disabled colours.

## Built-in labels

None.

## Feedback events

None.

## Sources

- Source guide: artifact `project/components/Textarea/README.md` ("Multi-line text entry that grows with content (3–12 lines), then scrolls."; "Uses `field-sizing: content`; manual vertical resize stays available. Same states and accessibility as TextField.").
- TextField spec and Field spec: `packages/ui/specs/text-field.md`, `packages/ui/specs/field.md`.
- MDN `field-sizing`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing · MDN `dir`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir
- Baseline (webstatus.dev, 2026-10-24): `field-sizing` newly available (low 2026-06-16; Chrome 123, Firefox 152, Safari 26.2); `lh` widely available (low 2023-11-21).
- React Aria TextField/TextArea: https://react-aria.adobe.com/TextField · Radix Themes TextArea: https://www.radix-ui.com/themes/docs/components/text-area · Mantine Textarea: https://mantine.dev/core/textarea/ · MUI TextareaAutosize: https://mui.com/material-ui/api/textarea-autosize/ · Chakra Textarea: https://chakra-ui.com/docs/components/textarea
