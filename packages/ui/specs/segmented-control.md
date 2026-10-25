# SegmentedControl

Switches between 2–5 views or modes of the same content in place (List / Board, Day / Week / Month). For peer sections with their own content, use Tabs; for a single choice in a form, use RadioGroup; for one on/off setting, use Switch or a toggle IconButton.

```tsx
import { SegmentedControl } from "@platform/ui/segmented-control";
import { MenuIcon } from "@platform/ui/icons/menu";
import { LayersIcon } from "@platform/ui/icons/layers";

<SegmentedControl.Root aria-label="View" defaultValue="list">
  <SegmentedControl.Item value="list">List</SegmentedControl.Item>
  <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
  <SegmentedControl.Item value="calendar">Calendar</SegmentedControl.Item>
</SegmentedControl.Root>

<SegmentedControl.Root aria-label="Layout" value={layout} onValueChange={setLayout}>
  <SegmentedControl.Item value="list" aria-label="List"><MenuIcon /></SegmentedControl.Item>
  <SegmentedControl.Item value="stack" aria-label="Stack"><LayersIcon /></SegmentedControl.Item>
</SegmentedControl.Root>
```

Status: draft for brand-owner review (phase 3). Source guide: `components/SegmentedControl/README.md` in the artifact.

## Anatomy

Track (Root) → Items (label → radio → content) → one indicator.

- **Root (track).** A `<fieldset role="radiogroup">` (borderless), `segmented-control-height` tall (32, 44 on coarse pointers), fill `segmented-control-background-color` (`color-surface-nested`), radius `segmented-control-border-radius` (10), padding `segmented-control-padding` (2). Items sit in an inline row.
- **Item.** A native `<label>` around a native `<input type="radio">` and the content (text, or an Icon). The radio is transparent and covers the whole label (`position: absolute; inset: 0; opacity: 0`, as the source CSS). An Icon child is sized by `--ab-icon-size: size-icon-sm` set on the label. Padding `segmented-control-item-padding-inline`, radius `segmented-control-item-border-radius` (8, concentric: 10 − 2), text in `segmented-control-item-font` and `segmented-control-item-text-color`. The whole label is the hit target. `position: relative`, so it paints above the indicator.
- **Indicator.** The Root's `::before`: one floating box behind the checked Item, fill `segmented-control-indicator-background-color` (`color-surface-floating`), shadow `segmented-control-indicator-shadow` (raised), radius `segmented-control-item-border-radius`. A 1 px inset `color-border-selected` ring carries the state: the raised fill alone measures 1.20:1 (light) and 1.08:1 (dark) against the track, under WCAG 1.4.11's 3:1; the ring measures 11.16:1 and 13.23:1 (user decision 2026-10-25). Placed with CSS anchor positioning (source: "No JS measurement"). Decorative. No Indicator Part.

## API

`SegmentedControl.Root`

| Prop                             | Type                                                                    | Default | Notes                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `value`                          | `string`                                                                |         | Controlled.                                                                                        |
| `defaultValue`                   | `string`                                                                |         | Uncontrolled. One of `value` / `defaultValue` is required (a union type): a view is always chosen. |
| `onValueChange`                  | `(value: string, details: SegmentedControl.ChangeEventDetails) => void` |         | Before the change commits. `details`: `reason` (`"none"`), `event`, `cancel()`.                    |
| `aria-label` / `aria-labelledby` | `string`                                                                |         | One of them required in the type: the group has no visible label.                                  |
| …native                          | `ComponentProps<"div">`                                                 |         | `ref`, `className` and native attributes.                                                          |

`SegmentedControl.Item`

| Prop       | Type                                                      | Default | Notes                                                                                                |
| ---------- | --------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `value`    | `string`                                                  |         | Required.                                                                                            |
| `children` | `ReactNode`                                               |         | Text, or an Icon. An icon-only Item needs `aria-label` (it goes on the radio).                       |
| …native    | `ComponentProps<"input">` minus `type`, `name`, `checked` |         | `ref`, `id`, `aria-label` on the input; `className`, `style` on the item label (as RadioGroup.Item). |

Names, checked against the reference libraries:

- **`SegmentedControl`**: Mantine "A linear set of two or more segments" (https://mantine.dev/core/segmented-control/); React Spectrum S2 "A SegmentedControl is a mutually exclusive group of buttons used for view switching." (https://react-spectrum.adobe.com/SegmentedControl); the source's own name. Ark calls it `SegmentGroup`, "Organizes and navigates between sections in a view." (https://ark-ui.com/react/docs/components/segment-group). Radix and Base UI have no segmented control; their nearest is ToggleGroup (below).
- **A radio group, not a toggle group.** Radix ToggleGroup is "A set of two-state buttons that can be toggled on or off." (https://www.radix-ui.com/primitives/docs/components/toolbar) and supports "single and multiple pressed buttons" (https://www.radix-ui.com/primitives/docs/components/toggle-group); Base UI ToggleGroup "Provides a shared state to a series of toggle buttons." (https://base-ui.com/react/components/toggle-group). Those are `aria-pressed` buttons that can all be off. A view switcher always has exactly one choice, which is a radio group (APG: "a set of checkable buttons, known as radio buttons, where no more than one of the buttons can be checked at a time"), and native radios give the keyboard for free. The source: "Native radio group: ←/→ move and select, Tab enters at the checked item."; Mantine: "SegmentedControl uses radio inputs under the hood"; Ark's anatomy has `SegmentGroup.ItemHiddenInput` and documents "the checked radio".
- **`Root` / `Item`**: Ark `SegmentGroup.Root`, `SegmentGroup.Item` (plus `Indicator`, `ItemText`, `ItemControl`, `ItemHiddenInput`); S2 `SegmentedControl` / `SegmentedControlItem`. Mantine takes a `data` array instead of children. Radix Part names (naming rule); one Item carries what Ark splits into four Parts.
- **`value` / `defaultValue` / `onValueChange(value, details)`**: Ark `onValueChange` "Function called once a radio is checked"; Mantine `value` / `onChange`; S2 `selectedKey` / `defaultSelectedKey`. Same names and `details` as RadioGroup (spec #1 state-prop contract).
- **Named by `aria-label` / `aria-labelledby`.** APG Radio Group: "The radiogroup element has a visible label referenced by aria-labelledby or has a label specified with aria-label." The source's `label="View"` becomes `aria-label`. Icon-only Items: S2 "When a visible label is omitted, provide an `aria-label`."; source: "Icon-only segments need `label`." (`aria-label`, as IconButton).
- **Root renders `<fieldset role="radiogroup">`, as RadioGroup.** A SegmentedControl has no visible label, so there is no legend; the fieldset is used because the Root handles keys (the RTL fallback) and a `div` with key handlers must itself be focusable (`jsx-a11y/interactive-supports-focus`), which a radio group must not be (judgement call; the source CSS also resets fieldset `border` and `margin`).
- **`name` generated, not a prop.** Every radio needs a shared `name` to form one native group (MDN: "A radio group is defined by giving each of radio buttons in the group the same name."), so the Root generates one with `useId()`. Mantine has `name` "to include segmented control value in FormData object on form submission"; a view switcher is not a form field, so the prop is left out. Inside a `<form>` the checked radio is still submitted under the generated name (HTML form submission; harmless, noted for the build).
- **Left out (YAGNI):** `disabled` on Root and Item (Ark, S2 `isDisabled`, Mantine), `orientation` (Ark, Mantine; native arrows work in both axes anyway), `name` / `required` / form use (Mantine), full-width / equal-width items (Mantine `fullWidth`, S2 `isJustified`), sizes, Mantine `transitionDuration`.

## States

| State         | How it shows                                                                        | Exposed as                                              |
| ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------- |
| rest          | Text in `segmented-control-item-text-color` (subtle) on the track                   | —                                                       |
| hovered       | Text in `segmented-control-item-text-color-hovered`; fine pointers only             | `:hover` under `@media (hover: hover)`                  |
| checked       | The indicator behind the Item; text in `segmented-control-item-text-color-selected` | `:checked` on the radio (`:has(:checked)` on the label) |
| focus-visible | 2 px ring in `color-border-focused` around the Item, inset by the track padding     | `:has(:focus-visible)` on the label                     |

## Behaviour

- **Native group.** Every radio shares the generated `name` and joins an enclosing Field through `useFieldControl` (Field contract), so the browser provides the single tab stop, arrow keys and checking (Keyboard). As RadioGroup.
- **Change and cancel** run in the radio's `click` handler, which also fires for arrow-key selection, exactly as RadioGroup (inference there, tested by the RadioGroup build in three engines). `details.cancel()` → `preventDefault()`, which restores the previously checked radio.
- **Indicator, without measuring.** The checked Item (`label:has(:checked)`) gets `anchor-name: --ab-segmented-control-checked`; the Root sets `anchor-scope: --ab-segmented-control-checked` and `position: relative`; its `::before` is `position: absolute` with `position-anchor: --ab-segmented-control-checked` and `inset-block` / `inset-inline` set to `anchor(self-start) anchor(self-end)`, so it covers the checked label exactly (the source CSS uses the physical `inset: anchor(top) anchor(right) anchor(bottom) anchor(left)`). Source: "The indicator is anchored to the checked item (`anchor-name` via `:has(:checked)`) and its inset transitions on `motion-easing-spring` (400ms). No JS measurement." `anchor-scope` keeps two SegmentedControls on one page apart: without it a non-ancestor lookup returns "the last element el in tree order" (CSS Anchor Positioning 1). `position-anchor` is always explicit (floating-platform research). A pseudo-element as the positioned box, and a `position: relative` label as its anchor, are inferences the build verifies in three engines.
- **Pointer vs keyboard.** The Root sets `data-pointer` on `pointerdown` and removes it on `keydown` (the Checkbox rule).
- **Inside a Toolbar** the Toolbar moves focus over every radio with the arrow keys and Space checks (APG radio group in a toolbar; Toolbar spec). The SegmentedControl adds nothing for it.
- Client component (`'use client'`) for Root (context, generated name, `data-pointer`) and Item (click handler).

## Motion

- **The indicator glides on a spring** (source; brand book springs: "segmented and tab indicators"): under `[data-pointer]`, the `::before` transitions `inset-inline-start` and `inset-inline-end` over `segmented-control-duration` (`motion-duration-spring`, 400 ms) with `segmented-control-easing` (`motion-easing-spring`). The spec says transitions of a property using `anchor()` follow "the anchor-name property being changed on anchors". webstatus.dev `anchor-positioning-animations` is limited (Chrome 125, Safari 26; no Firefox): in Firefox the indicator jumps, which reads as correct (progressive enhancement).
- Text colour: `motion-duration-hover-in` / `-hover-out` with `motion-easing-color`, as Button.
- Arrow-key changes move the indicator instantly (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions."), the same `data-pointer` rule as Checkbox and RadioGroup.
- **Reduced motion:** no inset transition under `(prefers-reduced-motion: reduce)`; the indicator jumps and the text colour still fades (brand book: reduced motion "removes movement, scaling, blur and stagger. Opacity and color fades remain.").
- **Instant exit:** there is one indicator, so nothing exits: when it jumps, the old Item is simply no longer covered, which reads as correct.

## Keyboard

APG pattern: **Radio Group**, not in a toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/radio/). Native radios provide it; inside a Toolbar, APG's "Radio Group Contained in a Toolbar" interaction applies (Toolbar spec).

| Key                      | Action                                                                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab          | "Move focus into and out of the radio group." "If a radio button is checked, focus is set on the checked button." (Always the case here: one Item is always checked.)                               |
| Space                    | "checks the focused radio button if it is not already checked."                                                                                                                                     |
| Right Arrow / Down Arrow | "move focus to the next radio button in the group, uncheck the previously focused button, and check the newly focused button. If focus is on the last button, focus moves to the first button."     |
| Left Arrow / Up Arrow    | "move focus to the previous radio button in the group, uncheck the previously focused button, and check the newly focused button. If focus is on the first button, focus moves to the last button." |

**RTL:** as RadioGroup: spec #1 user story 54 asks Left/Right to follow the visual direction; whether each engine swaps them for native radios in RTL is undocumented. The RadioGroup build tests it; where an engine does not swap, the same `keydown` fallback (swap Left and Right when the Root matches `:dir(rtl)`) is shared by SegmentedControl. That fallback must not run inside a `[role="toolbar"]`, where the Toolbar owns the arrow keys (inference; the build tests both).

## Accessibility

- Role `radiogroup` on the Root, named by `aria-label` / `aria-labelledby` (required). Each Item is a native radio, named by its text or its `aria-label`, with native checkedness (ARIA in HTML: "Authors MUST NOT use the aria-checked attribute on input type=radio elements").
- Icons inside Items are decorative (`aria-hidden`, Icon's default); the radio carries the name.
- **Contrast.** The checked Item's text (`color-text-default`) on the indicator (`color-surface-floating`) and the rest text (`color-text-subtle`) on the track (`color-surface-nested`) are text roles on surfaces, already in the contrast matrix. The indicator itself (`surface-floating` on `surface-nested`, plus the raised shadow) is not a checked pair: whether the checked state meets WCAG 1.4.11 from the fill, shadow and text-colour step is an open value for the brand owner (as IconButton's selected state in Q15-1).
- **More contrast:** no change needed; the text roles are AA already.
- **Forced colors:** the indicator's fill would be forced to the background, so under `@media (forced-colors: active)` it uses `background-color: Highlight`, and the checked Item's text `HighlightText` (system colours are not forced: CSS Color Adjust 1 forces a colour only "if its computed value is a color other than a system color", https://www.w3.org/TR/css-color-adjust-1/). The track gets a 1 px `CanvasText` border so its edge shows. The focus ring is an `outline`.
- **Reduced transparency:** not affected (no Material; the indicator is a solid surface).

## RTL

Logical properties only: Items run from the inline start, and the indicator's inline insets use `self-start` / `self-end` anchor sides (verified in RTL islands in all three engines by the floating-platform research). Icons inside Items are not mirrored by SegmentedControl (Icon handles directional glyphs). Arrow keys: see Keyboard.

## Component tokens

Existing (ported from the source): `segmented-control-height`, `segmented-control-padding`, `segmented-control-border-radius`, `segmented-control-background-color`, `segmented-control-item-padding-inline`, `segmented-control-item-border-radius`, `segmented-control-item-font`, `segmented-control-item-text-color`, `segmented-control-item-text-color-hovered`, `segmented-control-item-text-color-selected`, `segmented-control-indicator-background-color`, `segmented-control-indicator-shadow`, `segmented-control-duration`, `segmented-control-easing`.

No new tokens. The indicator reuses `segmented-control-item-border-radius`; an icon-only Item sizes its icon with `size-icon-sm`; the focus ring uses `focus-ring-width`, `focus-ring-offset` and `color-border-focused`.

## Author-written text

None. The group name and every Item label come from the consumer.

## Feedback events

| Event       | When                                               | `reason` |
| ----------- | -------------------------------------------------- | -------- |
| `ab-toggle` | After a user change commits (pointer or arrow key) | `"user"` |

Detail: `{ component: "SegmentedControl", reason }`, dispatched from the newly checked radio. One event per change; not when cancelled or when a controlled `value` changes from the parent. Arrow-key changes dispatch it too (RadioGroup precedent). `events.ts` widens the `ab-toggle` component union with `"SegmentedControl"`.

## Sources

- Source guide: artifact `project/components/SegmentedControl/README.md` ("Switch between 2–5 views or modes of the same content in place (List / Board, Day / Week / Month)."; "Track (surface-nested, radius 10, 2px padding) → items → one floating indicator (radius 8 — concentric: 10 − 2) with raised elevation."; "The indicator is anchored to the checked item (`anchor-name` via `:has(:checked)`) and its inset transitions on `motion-easing-spring` (400ms). No JS measurement."; "Native radio group: ←/→ move and select, Tab enters at the checked item. Icon-only segments need `label`.").
- Brand book, Motion (springs; "No motion on keyboard-initiated or high-frequency (100+ per day) actions."; reduced motion). RadioGroup spec (`radio-group.md`): change/cancel in `click`, RTL fallback.
- WAI-ARIA APG Radio Group: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- ARIA in HTML: https://www.w3.org/TR/html-aria/ · MDN `<input type="radio">`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio
- CSS Anchor Positioning 1: https://drafts.csswg.org/css-anchor-position-1/ · MDN `anchor-scope`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/anchor-scope · CSS Color Adjustment 1: https://www.w3.org/TR/css-color-adjust-1/
- Baseline (webstatus.dev and `web-features` 3.44.0, 2026-10-24): `input-radio` widely; `has` widely (low 2023-12-19); `css.properties.anchor-name`, `css.types.anchor`, `css.properties.anchor-scope` low 2026-01-13; `css.properties.position-anchor` low 2026-09-14; `anchor-positioning-animations` limited (Chrome 125, Safari 26), progressive enhancement only. Floating platform research: `docs/research/floating-platform.md`.
- Mantine SegmentedControl: https://mantine.dev/core/segmented-control/ · React Spectrum S2 SegmentedControl: https://react-spectrum.adobe.com/SegmentedControl · Ark SegmentGroup: https://ark-ui.com/react/docs/components/segment-group · Radix ToggleGroup: https://www.radix-ui.com/primitives/docs/components/toggle-group · Base UI ToggleGroup: https://base-ui.com/react/components/toggle-group
