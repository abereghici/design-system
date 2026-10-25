# Select

Choose one value from a short, known list (up to about 15 options): a region, a role, a sort order. When the list is long or needs search, use Combobox (phase 5); for 2–6 options that should stay visible, use RadioGroup.

```tsx
import { Select } from "@platform/ui/select";

<Select.Root label="Region" name="region" placeholder="Choose a region" required>
  <Select.Item value="eu">Europe</Select.Item>
  <Select.Item value="na">North America</Select.Item>
  <Select.Group label="Asia Pacific">
    <Select.Item value="jp">Japan</Select.Item>
    <Select.Item value="sg">Singapore</Select.Item>
  </Select.Group>
</Select.Root>

<Select.Root label="Sort by" value={sort} onValueChange={setSort} size="lg">
  <Select.Item value="recent">Most recent</Select.Item>
  <Select.Item value="name">Name</Select.Item>
</Select.Root>
```

Status: draft for brand-owner review (phase 2). Source guide: `components/Select/README.md` in the artifact.

## Anatomy

Label → trigger (native `<select>`, selected value, chevron) → picker (options, groups) → description or error.

- **Label, description, error.** The Field Parts, built in (Field spec).
- **Trigger.** The native `<select>` itself, drawn with TextField's container chrome (`input-*`: height 32 / 40, radius 8, hairline, raised elevation) and a decorative `chevron-down` icon at the inline end (`select-icon-color`).
- **Picker.** Where the engine supports customizable select, `::picker(select)` is drawn as a Floating layer: Material `select-picker-background-color` (`color-material-thick`) with `select-picker-blur` / `-saturate`, `select-picker-shadow` (overlay elevation), radius `select-picker-border-radius` (12), padding `select-picker-padding`, `select-picker-offset` from the trigger, at most `select-picker-max-height` (320) tall, then scrolling. Elsewhere the picker is the operating system's.
- **Option.** A native `<option>`, height `select-option-height` (28), `select-option-padding-inline`, radius `select-option-border-radius`, `select-option-font`; hover fill `select-option-background-color-hovered`; the chosen option shows a check (`::checkmark`, the source's 16 px tick mask) at the inline end in `select-option-icon-color-selected` (the source's "moss checkmark").
- **Group.** A native `<optgroup label>`; its label in the overline type, as DropdownMenu's group label.

## API

`Select.Root`

| Prop                                                                  | Type                                                          | Default | Notes                                                                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `label`, `description`, `errorMessage`, `invalid`, `validate`, `size` | as TextField                                                  |         | `size`: `"md"` \| `"lg"`.                                                                                                              |
| `value`                                                               | `string`                                                      |         | Controlled.                                                                                                                            |
| `defaultValue`                                                        | `string`                                                      |         | Uncontrolled. Without it and without `placeholder`, the first option is selected (native).                                             |
| `onValueChange`                                                       | `(value: string, details: Select.ChangeEventDetails) => void` |         | On the native `change` event. `details`: `reason` (`"none"`), `event`, `cancel()` (restores the previous value).                       |
| `placeholder`                                                         | `string`                                                      |         | Rendered as a first `<option value="" disabled hidden>`, selected until the user chooses. With `required`, empty fails `valueMissing`. |
| `disabled`                                                            | `boolean`                                                     | `false` | `aria-disabled="true"`, focusable, the picker does not open and the value does not change (see Behaviour).                             |
| `className`, `style`                                                  |                                                               |         | On the root wrapper.                                                                                                                   |
| …native                                                               | `Omit<ComponentProps<"select">, "multiple" \| "size">`        |         | `ref`, `id`, `name`, `required`, `autoComplete`, `form`, `onChange` go on the `<select>`.                                              |

`Select.Item`: `{ value: string; disabled?: boolean; children: ReactNode }` plus `ComponentProps<"option">`. `Select.Group`: `{ label: string; disabled?: boolean; children }` plus `ComponentProps<"optgroup">`.

Names, checked against the reference libraries:

- **`Select` with `Root`, `Item`, `Group`**: Radix `Select.Root`, `Select.Item`, `Select.Group` (https://www.radix-ui.com/primitives/docs/components/select); Base UI `Select.Root`, `Select.Item`, `Select.Group` (https://base-ui.com/react/components/select); Ark `Select.Root`, `Select.Item`, `Select.ItemGroup`; React Aria `Select`; Mantine and MUI `Select`. Every library says Select. Our Select is native at its core; libraries that wrap the native element call it `NativeSelect` (shadcn "A styled native HTML select element with consistent design system integration.", Mantine, MUI, Chakra), but there is no second, scripted Select here to tell apart, and spec #1 names it Select (judgement call).
- **Fewer Parts.** Radix's `Trigger`, `Value`, `Icon`, `Portal`, `Content`, `Viewport`, `ItemText`, `ItemIndicator` and `Separator` map to the native `<select>` and its base-select button, `::picker-icon`, `::picker(select)` and `::checkmark`, which the component draws itself. Only the Parts a consumer composes remain.
- **`value` / `defaultValue` / `onValueChange(value, details)`**: Base UI "`onValueChange: ((value: Value[] | Value | null, eventDetails: Select.Root.ChangeEventDetails) => void)`"; Radix `onValueChange: (value: string) => void`.
- **`placeholder` on Root**: Radix `Select.Value` "`placeholder: ReactNode`", Base UI Value `placeholder`, React Aria `placeholder` (default "'Select an item' (localized)"). A string, because it becomes an `<option>`'s text.
- **`Group` with a `label` prop**: the native `<optgroup label>`; Radix composes a `Select.Label` inside `Select.Group`. Deferred: `Select.Separator` (an `<hr>` inside `<select>`), because its Baseline status was not verified.
- **No `open` / `onOpenChange`.** Radix, Base UI and Ark expose them; the native picker's open state is the engine's. `:open` (newly available) styles it; nothing in phase 2 needs to control it.
- **No `multiple`.** Base UI and Ark support it; a native `multiple` select is a list box, not a picker. Multi-choice goes to Checkbox groups or Combobox.

## States

| State                   | How it shows                                                                                     | Exposed as                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| rest                    | Trigger as TextField at rest; the selected text, or the placeholder in `input-placeholder-color` | `data-size`, `:has(option[value=""]:checked)` for the placeholder |
| hovered                 | Border `input-border-color-hovered`; fine pointers only                                          | `:hover`                                                          |
| open                    | Chevron rotates 180° (`motion-duration-swap`, `motion-easing-enter`); picker shown               | `:open`                                                           |
| focus-visible           | Focus ring with no offset, as TextField                                                          | `:focus-visible`                                                  |
| invalid                 | Border `input-border-color-invalid`                                                              | `aria-invalid="true"` (Field contract)                            |
| disabled                | TextField's disabled colours                                                                     | `aria-disabled="true"` or `:disabled`                             |
| option hovered / active | Fill `select-option-background-color-hovered`                                                    | `option:hover`, `option:focus-visible`                            |
| option chosen           | `::checkmark` in `select-option-icon-color-selected`                                             | `option:checked`                                                  |

## Behaviour

- **Native first, customizable where supported.** Select renders a real `<select>`, so the keyboard, typeahead, screen-reader semantics, form submission, autofill and mobile pickers are the platform's. Where `appearance: base-select` is supported, the component opts in (`@supports (appearance: base-select)`) and draws the brand picker described in Anatomy. MDN: "they provide a progressive enhancement on top of existing functionality, falling back to "classic" selects in non-supporting browsers." The source decided the same ("Browsers without support get the styled native select — same semantics"; archived brand book: "Enhancement only: customizable `<select>` (`appearance: base-select`)").
- **Why not a scripted select.** Customizable select is below the floor (webstatus.dev `customizable-select`: limited; Chrome 135 and Safari 27, no Firefox), so it cannot be the only path; and a scripted APG select-only combobox would rebuild in script what the classic `<select>` already does at the floor (ADR-0001, brand principle 8 "Platform before script"). Spec #1 lists Select among the `popover` + anchor-positioning components; with base-select the picker is exactly that: MDN "The picker is a popover." and "the `<select>` element and its drop-down picker have an implicit anchor reference". This is a judgement call against spec #1's wording, logged for review.
- **What each engine shows.** Customizable engines: the brand trigger (the select's own base-select button, which shows the chosen option; no author `<button><selectedcontent>`, because classic engines keep that `<button>` in the DOM and axe reports it as an unnamed button, `button-name`, verified in Firefox 157) and picker. The chevron is the component's icon in every engine; `::picker-icon` is hidden. Classic engines (Firefox today): the brand trigger (`appearance: none` on the select, the chevron icon beside it) and the OS picker. MDN: "The `<button><selectedcontent></selectedcontent></button>` structure will be ignored completely, and the non-text `<option>` contents will be stripped out to just leave the text node contents, but the result will still function." So Item children are text, optionally with a decorative leading Icon that only customizable engines render.
- **Picker placement** (customizable engines): below the trigger, start-aligned, flipping above near the viewport edge, with the Floating-layer recipe from spike #4 (`position-anchor: auto`, `anchor()` on logical insets with `self-*` sides, `position-try-fallbacks: flip-block`, `margin: 0`). At least as wide as the trigger.
- **Disabled** (`aria-disabled`): a native select cannot be made read-only, so the component blocks opening on `pointerdown` and `keydown` (`preventDefault()` for Space, Enter, Alt+Down, arrows and printable keys) and restores the previous value in `change` if one slips through (inference: some engines change the value with arrow keys on a closed select). Inside a disabled Fieldset the select is natively disabled.
- **Disabled options** use native `disabled` on the `<option>` (they cannot be chosen and are skipped by the engine). This is a second native-disabled exception next to Fieldset: an `<option>` is never focusable on its own, so `aria-disabled` would add nothing (judgement call).
- Follows the Field contract. HTML: choosing an option sets the select's user validity ("Set element's user validity to true."), so a required Select shows its error after the first choice or a submit.
- Client component (`'use client'`) for Root (Field state, handlers). Item and Group render plain elements and are Server Components.

## Motion

Customizable engines only (the OS picker has its own):

- **Enter:** the picker fades and scales from `select-picker-enter-scale` (0.97) to 1 over `select-picker-enter-duration` (`motion-duration-popover`, 200 ms), `select-picker-easing`, from the trigger side (`transform-origin` at the anchor), with `@starting-style`. Brand book: "Popovers and tooltips grow from their trigger".
- **Exit:** opacity over `select-picker-exit-duration` (`motion-duration-exit`, 150 ms) with `display` and `overlay` `allow-discrete`. Spike #4: exit animations run only in Chromium; Firefox and WebKit remove the popover at once.
- **Reduced motion:** no scale (`motion-scale-enter` resolves to 1 under the media override); the opacity fade stays.
- **Instant exit:** where the exit is instant, the picker disappears in the frame the value is chosen and the trigger already shows the new value, so it reads as correct.

## Keyboard

APG pattern: **Combobox**, select-only (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), with its **Listbox** popup (https://www.w3.org/WAI/ARIA/apg/patterns/listbox/). APG: "If a combobox does not support text input, it is referred to as select-only, meaning the only way users can set its value is by selecting a value in the popup. For example, in some browsers, an HTML select element with size="1" is presented to assistive technologies as a combobox."

The keyboard is the engine's. MDN: "The keyboard mechanisms described below are not standardized and depend on the browser and operating system." The APG select-only example's map, which the engines approximate:

| Key (closed)         | APG select-only example                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| Down Arrow           | "Opens the listbox if it is not already displayed without moving focus or changing selection." |
| Alt + Down Arrow     | "Opens the listbox without moving focus or changing selection."                                |
| Enter / Space        | "Opens the listbox without moving focus or changing selection."                                |
| Printable characters | "moves visual focus to the first option that matches the typed character."                     |

| Key (open)      | APG select-only example                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Enter / Space   | "Sets the value to the content of the focused option in the listbox. / Closes the listbox."                           |
| Escape          | "Closes the listbox. / Sets visual focus on the combobox."                                                            |
| Down / Up Arrow | "Moves visual focus to the next [previous] option."                                                                   |
| Home / End      | "Moves visual focus to the first [last] option."                                                                      |
| Tab             | APG: "Note: the native <select> element closes the listbox but does not move focus on tab." Native behaviour is kept. |

The component adds no key handling except to block a disabled Select. Story tests assert only what is consistent across engines (focus, name, value after a pointer choice). Verified 2026-10-24 (Chromium 156, Firefox 157, WebKit 27.2, macOS): typing on a closed select does not change its value, and story `userEvent` dispatches untrusted events with no user activation, so no picker opens from it (`showPicker()` throws `NotAllowedError`). Proofs that open the picker use Playwright's trusted input (`trusted()`) and run only where `appearance: base-select` draws an in-page picker; the OS picker of other engines stays in the manual pass. The docs page records each engine's map.

## Accessibility

- Role from the engine: `combobox` for a single-line select in the engines APG describes ("in some browsers, an HTML select element with size="1" is presented to assistive technologies as a combobox"; the screen-reader pass records each engine). Name from the label, value from the selected option's text, options as `option` in a `listbox`. APG: "Comboboxes and listboxes can be marked as required with aria-required="true", and they have an accessible name that is distinct from their value." Native `required` gives that.
- The check and chevron are decorative. MDN: "The `::checkmark` and `::picker-icon` pseudo-elements are not included in the accessibility tree".
- Focus returns to the select when the picker closes (native).
- **More contrast:** trigger as TextField. The picker uses Material; see reduced transparency.
- **Forced colors:** trigger as TextField; the picker gets a 1 px `CanvasText` outline because the shadow disappears, and the check is painted `CanvasText` with `forced-color-adjust: none` (source adaptive.css).
- **Reduced transparency:** `color-material-thick` turns solid under `(prefers-reduced-transparency: reduce)` (token media override), so option text never sits on blur.

## RTL

Logical properties only: the chevron at the inline end, the check at the inline end of each option. The picker inherits `dir` from the select in the top layer (spike #4: "a popover inside a `dir="rtl"` element matches `:dir(rtl)` … while it is in the top layer"), and the `self-*` anchor recipe places it correctly in RTL islands, including Firefox once it supports base-select.

## Component tokens

Existing (ported from the source): `select-option-height`, `select-option-background-color-hovered`, `select-option-icon-color-selected`, `select-picker-max-height`, and the trigger's `input-*` set.

Proposed new (mirroring the ported `dropdown-menu-*` Floating-layer tokens):

| Token                            | References                  | `$type`     | Why                                              |
| -------------------------------- | --------------------------- | ----------- | ------------------------------------------------ |
| `select-icon-color`              | `color-icon-subtle`         | color       | The trigger's chevron                            |
| `select-picker-padding`          | `space-inset-xs`            | dimension   | Picker inner padding (4)                         |
| `select-picker-border-radius`    | `radius-lg`                 | dimension   | 12, as DropdownMenu                              |
| `select-picker-background-color` | `color-material-thick`      | color       | "material popover" (source)                      |
| `select-picker-blur`             | `material-blur-regular`     | dimension   | Material blur                                    |
| `select-picker-saturate`         | `material-saturate-regular` | number      | Material saturation                              |
| `select-picker-shadow`           | `elevation-overlay`         | shadow      | Brand book: "select picker" is overlay elevation |
| `select-picker-offset`           | `space-inline-xs`           | dimension   | Gap between trigger and picker (4)               |
| `select-picker-enter-scale`      | `motion-scale-enter`        | number      | Entry scale (0.97)                               |
| `select-picker-enter-duration`   | `motion-duration-popover`   | duration    | 200 ms                                           |
| `select-picker-exit-duration`    | `motion-duration-exit`      | duration    | 150 ms                                           |
| `select-picker-easing`           | `motion-easing-enter`       | cubicBezier | Ease-out                                         |
| `select-option-padding-inline`   | `space-inset-sm`            | dimension   | 8                                                |
| `select-option-gap`              | `space-inline-sm`           | dimension   | Between check, icon and text                     |
| `select-option-border-radius`    | `radius-sm`                 | dimension   | 8                                                |
| `select-option-font`             | `type-label-sm`             | typography  | Option text                                      |
| `select-option-text-color`       | `color-text-default`        | color       | Option text                                      |

The group label uses `dropdown-menu-group-label-*`'s semantic values directly (`type-overline-sm`, `color-text-subtlest`).

## Author-written text

None. `placeholder` is the consumer's text.

## Feedback events

None. Choosing an option is a selection, not a toggle or a command (brand book sound rule); a product that wants a sound can listen to `change`.

## Sources

- Source guide: artifact `project/components/Select/README.md` ("Choose one value from a short, known list (≤ 15); use Combobox when the list is long or searchable."; "Customizable `<select>` (`appearance: base-select`): the picker is a material popover anchored to the field, animates in with @starting-style, shows a moss checkmark on the chosen option. Browsers without support get the styled native select — same semantics."; "Native select: full keyboard and screen-reader support, typeahead included."). Archived brand book, "Distribution".
- MDN, Customizable select elements: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select · `<select>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select
- HTML Living Standard, the select element: https://html.spec.whatwg.org/multipage/form-elements.html
- Baseline (webstatus.dev and web-features 3.44.0, 2026-10-24): `customizable-select` limited (Chrome 135, Safari 27); `appearance: base-select`, `::picker(select)`, `<selectedcontent>`, `::checkmark`, `::picker-icon` limited; `open-pseudo` (`:open`) newly available (low 2026-05-11); `starting-style` newly available (low 2024-08-06); `show-picker-select` limited (not used).
- Spike #4: `docs/research/floating-platform.md`.
- WAI-ARIA APG Combobox, select-only example and Listbox: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/, https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/, https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
- Radix Select: https://www.radix-ui.com/primitives/docs/components/select · Base UI Select: https://base-ui.com/react/components/select · React Aria Select: https://react-aria.adobe.com/Select · Ark Select: https://ark-ui.com/react/docs/components/select · shadcn Native Select: https://ui.shadcn.com/docs/components/native-select · Mantine Select / NativeSelect: https://mantine.dev/core/select/ · MUI Select / NativeSelect: https://mui.com/material-ui/api/select/ · Chakra NativeSelect: https://chakra-ui.com/docs/components/native-select
