# DropZone

An area that accepts files dragged from the desktop, with a FileTrigger inside as the keyboard and touch alternative. Use it where uploading is the main task of a view (an import screen, an attachment panel); for a small "Attach" action use FileTrigger alone.

```tsx
import { Button } from "@platform/ui/button";
import { DropZone } from "@platform/ui/drop-zone";
import { FileTrigger } from "@platform/ui/file-trigger";

<DropZone name="files" accept=".csv,text/csv" multiple onDrop={(files) => queue(files)}>
  <span>Drop CSV files here, or</span>
  <FileTrigger onSelect={(files) => queue(files)}>
    <Button>Choose files</Button>
  </FileTrigger>
</DropZone>;
```

Status: draft for brand-owner review (phase 2). No source guide: drafted from the platform and the reference libraries.

## Anatomy

Root → content (text, FileTrigger) → hidden file input → selection (file names, Clear).

- **Root.** A `<div>` with `drop-zone-padding` (24), `drop-zone-gap` (8) between its children (centred column), radius `drop-zone-border-radius` (12), a dashed `drop-zone-border-width` border in `drop-zone-border-color`, fill `drop-zone-background-color` (`surface-raised`), text in `drop-zone-font` / `drop-zone-text-color`. In flow: no elevation (brand principle 5).
- **Content.** The consumer's: a sentence (a `<span>` or text, which inherits the zone's font and colour; a `<p>` brings its UA margins) and a FileTrigger. The FileTrigger inside uses the DropZone's hidden input instead of its own, so drops and picks land in one `FileList`.
- **Hidden input.** FileTrigger's visually hidden native `<input type="file">` (see FileTrigger, Anatomy) carrying `name`, `accept`, `multiple`, `required`; it is the Field's control, and on focus it hands focus to the FileTrigger inside.
- **Selection.** FileTrigger's (see FileTrigger, Anatomy), last in the centred column: the dropped or picked file names and Clear.

## API

| Prop                       | Type                                                          | Default | Notes                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onDrop`                   | `(files: File[], details: DropZone.DropEventDetails) => void` |         | After a drop of accepted files. `details`: `reason` (`"none"`), `event` (the `DragEvent`), `rejected: File[]`, `cancel()` (keeps the previous files). |
| `accept`                   | `string`                                                      |         | Same syntax as the native `accept`. Dropped files that don't match are not added and are passed as `details.rejected`.                                |
| `multiple`                 | `boolean`                                                     | `false` | Without it, only the first accepted file is kept.                                                                                                     |
| `name`, `required`, `form` | native                                                        |         | On the hidden input; the files submit with the form.                                                                                                  |
| `disabled`                 | `boolean`                                                     | `false` | Drops are refused (the cursor shows no drop) and the inner FileTrigger is disabled.                                                                   |
| `clearLabel`               | `string`                                                      |         | Shows the Clear button with this name, as FileTrigger's.                                                                                              |
| …native                    | `ComponentProps<"div">`                                       |         | `ref`, `className`, `aria-*`.                                                                                                                         |

Names, checked against the reference libraries:

- **`DropZone`**: React Aria "A drop zone is an area into which one or multiple objects can be dragged and dropped." (https://react-aria.adobe.com/DropZone); Mantine `Dropzone` (https://mantine.dev/x/dropzone/); Ark and Chakra `FileUpload.Dropzone`. The ticket and spec #1 name it DropZone (React Aria's casing).
- **FileTrigger as a child**: React Aria "To allow the selection of files from the user's device, pass `FileTrigger` as a child of `DropZone`."; Ark "Use `disableClick` on `Dropzone` when delegating clicks to a nested `Trigger`."
- **`onDrop`**: React Aria "`onDrop: (e: DropEvent) => void` — Handler that is called when a valid drag is dropped on the drop target."; Mantine `onDrop: (files: FileWithPath[]) => void`. Mantine's `onReject` becomes `details.rejected` (one callback per drop).
- **`accept`, `multiple`**: Mantine `accept`, `multiple`; Ark `accept`. Native syntax, as FileTrigger.
- **`data-drop-target`**: React Aria's state name ("`isDropTarget` (`[data-drop-target]`)").
- **Not built:** React Aria's `getDropOperation`, `onDropEnter/Exit/Move/Activate`; Ark's `maxFiles`, `maxFileSize`, `validate`; Mantine's full-screen zone; paste (React Aria: "Copy and paste is also supported as a keyboard accessible alternative"). Size and count limits belong in `onDrop`; the rest is deferred.

## States

| State       | How it shows                                                                                                                             | Exposed as                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| rest        | Dashed `drop-zone-border-color`, `drop-zone-background-color`                                                                            | —                                                     |
| drop target | Border `drop-zone-border-color-hovered` (accent), fill `drop-zone-background-color-hovered` (accent subtle) while files are dragged over | `data-drop-target`                                    |
| with files  | The file names and Clear at the bottom of the column                                                                                     | —                                                     |
| rejected    | Border `drop-zone-border-color-invalid` while the dragged items can't be accepted (type known during the drag and not matching `accept`) | `data-drop-target="rejected"`                         |
| invalid     | Border `drop-zone-border-color-invalid`; the error below (Field contract)                                                                | `aria-invalid` on the trigger, Field's `data-invalid` |
| disabled    | No drop target state; the instruction text stays readable (Disabled look) and the FileTrigger shows Button's disabled look               | `data-disabled`                                       |

The drop target state is shown by the border colour and the fill together, and the text does not change, so the zone does not resize under the cursor.

## Behaviour

- **Drag events.** The Root handles `dragenter`, `dragover`, `dragleave` and `drop`. MDN: "In order for the `drop` event to fire, the element must also cancel the dragover event." and "dragstart and dragend events are not fired when dragging a file into the browser from the OS. To detect when OS files are dragged into the browser, use dragenter and dragleave." A counter of enter/leave pairs keeps `data-drop-target` stable while the pointer crosses child elements (inference: `dragleave` fires on every child boundary).
- **Accepting.** During `dragenter`, `event.dataTransfer.items` gives each item's MIME type but not its name; if none can match `accept`, the zone shows rejected and `dragover` sets `dropEffect = "none"`. An extension token (`.csv`) can't be judged before the drop, so it never rejects during the drag; only MIME tokens (`text/csv`, `image/*`) do. On `drop`, files are read from `dataTransfer.files` (MDN: "this property can only be used to read files in the handlers for the dragstart and drop events"), filtered by `accept`, and trimmed to one without `multiple`.
- **Native form value.** Accepted files are written to the hidden input with a `DataTransfer`: `const dt = new DataTransfer(); files.forEach((f) => dt.items.add(f)); input.files = dt.files;`. HTML, `files`: "Can be set to a FileList object to change the selected files of the form control. For instance, as the result of a drag-and-drop operation." Then `input` and `change` fire on the input, so Field validation and `FormData` see the files.
- **Drops outside the zone.** MDN: "For file dropping, the browser may process them by default (such as opening or downloading the file) even when the file is not dropped into a valid drop target. To prevent this behavior, we also need to listen for the `drop` event on `window` and cancel it." While a DropZone is mounted it cancels `dragover` and `drop` on `window` for file drags only (Ark's default: "`preventDocumentDrop = true`"), so a missed drop never navigates away.
- **Keyboard and touch alternative** is the FileTrigger inside. WCAG 2.2 SC 2.5.7 Dragging Movements requires a single-pointer alternative to dragging; MDN's guide: "For users who can't or don't want to use drag and drop, we also provide the alternative functionality of file selection via an `<input>` element." The FileTrigger is required by this documentation, not checked at run time: a development-only warning needs a build flag that Vite and Next expose differently (`import.meta.env.DEV` / `process.env.NODE_ENV`), so it is left out (Q30-2).
- **Disabled:** drag handlers set `dropEffect = "none"` and return; the inner FileTrigger is disabled through context.
- Client component (`'use client'`).

## Motion

- Entering and leaving the drop target state: border and fill colour over `motion-duration-hover-in` / `motion-duration-hover-out`, `motion-easing-color`. No scale or movement: the zone is the target under the cursor and must stay still (brand book "Keep the reference point still").
- **Reduced motion:** colour fades only, as always.
- **Instant exit:** with no transition the state colours switch in the frame the drag leaves or drops, which reads as correct.

## Keyboard

No APG pattern for drop targets. The Root is not focusable; the FileTrigger's Button is the keyboard route (APG **Button**: Space and Enter activate it and open the picker). Tab order: the content in document order.

React Aria implements keyboard drag and drop for in-page items, but its own docs say: "Keyboard and screen reader drag and drop is implemented from scratch, and therefore can only be supported within the browser window. Alternative interactions for operations involving external applications, such as file uploading or copy and paste, should be implemented in addition to drag and drop." Desktop files can only arrive by pointer, so the picker is the alternative.

## Accessibility

- The Root has no role: it is a visual target for pointer drags. Its text says what to drop and what is accepted ("Drop CSV files here, or …"); that text and the trigger are what assistive technology users meet. Give the Root an accessible name only if it becomes a landmark-sized region (`role="region"` + `aria-labelledby`, the consumer's choice).
- After a drop, the app lists the files; announce the change with a polite live region in that list (documented on the docs page), because focus does not move.
- **Contrast.** Rest border `color-border-default` on `surface-raised` (matrix, 3:1); drop-target border `color-border-accent` and text `color-text-subtle` on `background-accent-subtle` (both in the matrix).
- **More contrast:** no change needed.
- **Forced colors:** the dashed border becomes `CanvasText`, and the drop-target state switches it to a solid `Highlight` border (a colour and style change), since the fill disappears.
- **Reduced transparency:** not affected.

## RTL

Logical properties only; the content is centred. Nothing mirrors.

## Component tokens

New component word `drop-zone` (Dictionary change).

| Token                                | References                       | `$type`    | Why                             |
| ------------------------------------ | -------------------------------- | ---------- | ------------------------------- |
| `drop-zone-padding`                  | `space-inset-xl`                 | dimension  | 24                              |
| `drop-zone-gap`                      | `space-stack-sm`                 | dimension  | 8 between text and trigger      |
| `drop-zone-border-radius`            | `radius-lg`                      | dimension  | 12, as Card                     |
| `drop-zone-border-width`             | `border-width-default`           | dimension  | 1, dashed                       |
| `drop-zone-font`                     | `type-body-sm`                   | typography | Instruction text                |
| `drop-zone-text-color`               | `color-text-subtle`              | color      |                                 |
| `drop-zone-background-color`         | `color-surface-raised`           | color      | One step from the page          |
| `drop-zone-border-color`             | `color-border-default`           | color      | 3:1, the zone's only edge       |
| `drop-zone-background-color-hovered` | `color-background-accent-subtle` | color      | Drop target fill                |
| `drop-zone-border-color-hovered`     | `color-border-accent`            | color      | Drop target edge                |
| `drop-zone-border-color-invalid`     | `color-border-danger`            | color      | Rejected drag and invalid field |

The drop-target state reuses the Dictionary's `hovered` state word: a drag over the zone is the drop equivalent of hover, and the Dictionary has no drag word (judgement call; a new state word would be a Dictionary change for the brand owner).

## Author-written text

None. As FileTrigger: the Clear button appears only with `clearLabel`; the zone's text is the author's children.

## Feedback events

None in phase 2. A drop is a user action the app confirms itself (a Toast, a list update); a dedicated event can be added if a product wants a sound for it.

## Sources

- MDN, File drag and drop: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop · `DataTransfer.files`: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/files · `<input type="file">`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
- HTML Living Standard, `input.files`: https://html.spec.whatwg.org/multipage/input.html
- WCAG 2.2 SC 2.5.7 Dragging Movements: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- Baseline (webstatus.dev and web-features 3.44.0, 2026-10-24): `draganddrop` widely available; `api.DataTransfer.DataTransfer` widely available (low 2021-04-26); `input-file` widely available; `file` (File API) widely available.
- React Aria DropZone: https://react-aria.adobe.com/DropZone and drag and drop https://react-aria.adobe.com/dnd · Mantine Dropzone: https://mantine.dev/x/dropzone/ · Ark FileUpload: https://ark-ui.com/react/docs/components/file-upload · Chakra FileUpload: https://chakra-ui.com/docs/components/file-upload
