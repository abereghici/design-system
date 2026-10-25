# Button

Triggers an action. Use one primary per view, secondary for the rest, tertiary in toolbars and dense rows, and danger only to confirm a destructive action. To navigate, use a Link.

```tsx
import { Button } from "@platform/ui/button";
import { Kbd } from "@platform/ui/kbd";
import { PlusIcon } from "@platform/ui/icons/plus";

<Button variant="primary" aria-keyshortcuts="Meta+Enter Control+Enter">
  Publish <Kbd keys="mod+enter" aria-hidden />
</Button>
<Button variant="secondary"><PlusIcon /> New</Button>
<Button variant="tertiary" size="sm">Sort</Button>
<Button variant="danger" loading>Deleting</Button>
```

Status: draft for brand-owner review (phase 1). Source guide: `components/Button/README.md` in the artifact.

## Anatomy

Container → leading icon (optional) → label → trailing icon (optional) → Kbd hint (optional).

- **Container.** A native `<button>`. Radius 8 (lg: 10). Primary and danger are filled. Secondary is the floating surface with a subtle hairline and raised elevation. Tertiary has no fill at rest.
- **Icons** are children, not props. Button spaces them with its `gap`, so an icon needs no marker and keeps its side in either direction. Icons are decorative (`aria-hidden`); the label names the button.
- **Kbd hint** is an optional child Kbd, passed `aria-hidden`. The consumer sets `aria-keyshortcuts` on the button, because the Kbd text would otherwise join the accessible name (see Accessibility).
- **Spinner** is centred over the content while `loading`, rendered `<Spinner aria-hidden />` (decorative; Spinner spec), as the artifact's `.ab-button[aria-busy]`. The label and icons are hidden but stay in the accessible name and the layout, so the width never changes (brand book: "Busy buttons keep their width").

## API

| Prop       | Type                                                 | Default       | Notes                                                                                                              |
| ---------- | ---------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `variant`  | `"primary" \| "secondary" \| "tertiary" \| "danger"` | `"secondary"` | Exposed as `data-variant`.                                                                                         |
| `size`     | `"sm" \| "md" \| "lg"`                               | `"md"`        | Exposed as `data-size`. Heights 28 / 32 / 40, growing to 40 / 44 / 48 on coarse pointers through `size-control-*`. |
| `loading`  | `boolean`                                            | `false`       | Busy state: `aria-busy="true"`, `data-loading`, activation blocked, focus kept.                                    |
| `disabled` | `boolean`                                            | `false`       | `aria-disabled="true"`; never native `disabled` (spec #1).                                                         |
| `asChild`  | `boolean`                                            | `false`       | Renders the single child element with the Button's props and styles (Radix Slot).                                  |
| `type`     | native                                               | `"button"`    | Defaults to `"button"`, not the HTML default `"submit"`.                                                           |
| …native    | `ComponentProps<"button">`                           |               | `ref`, `className`, `onClick` and every native attribute pass through unchanged.                                   |

Names, checked against the reference libraries:

- **`variant`**: shadcn "`"default" | "outline" | "ghost" | "destructive" | "secondary" | "link"`" (https://ui.shadcn.com/docs/components/button); MUI "`'contained' | 'outlined' | 'text'`" (https://mui.com/material-ui/api/button/); Mantine "To add new `Button` variants, use the data-variant attribute" (https://mantine.dev/core/button/). Every library calls it `variant`. The values are the source's own (`primary · secondary · tertiary · danger`, from the Dictionary's Variant group), because the Dictionary closes the set.
- **`size`**: Mantine "`Button` supports `xs` – `xl`" (https://mantine.dev/core/button/); shadcn "`"default" | "xs" | "sm" | "lg"`…". The values follow the Dictionary's size words.
- **`loading`**: MUI "If `true`, the loading indicator is visible and the button is disabled." (https://mui.com/material-ui/api/button/); Mantine "When the `loading` prop is set, the `Button` will be disabled" (https://mantine.dev/core/button/). React Aria names it `isPending`: "This disables press and hover events while retaining focusability, and announces the pending state to screen readers." (https://react-aria.adobe.com/Button). We take MUI and Mantine's name and React Aria's behaviour (focus kept).
- **`disabled` stays focusable**: Base UI has the opt-in "`focusableWhenDisabled` … Whether the button should be focusable when disabled." (https://base-ui.com/react/components/button). Spec #1 makes focusable-when-disabled the only behaviour, so no extra prop.
- **Icons as children**: MUI's `startIcon`/`endIcon` and Mantine's `leftSection`/`rightSection` are props; children keep the API smaller and server-safe (an icon is a Server Component).
- **No `shortcut` prop.** The source Button had `shortcut="mod+enter"`. No reference library documents a shortcut prop on Button, so the hint is composed with Kbd (judgement call, see the phase review entry).

## States

| State         | How it shows                                                           | Exposed as                         |
| ------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| rest          | Variant fill / hairline                                                | `data-variant`, `data-size`        |
| hovered       | Fill steps to `-hovered`; fine pointers only (`@media (hover: hover)`) | `:hover`                           |
| pressed       | Scale 0.97 and the `-pressed` fill, 100 ms                             | `:active`                          |
| focus-visible | 2 px focus ring, 3 px offset, `color-border-focused`                   | `:focus-visible`                   |
| disabled      | Disabled fill, text and border; no hover or press                      | `aria-disabled="true"`             |
| loading       | Spinner centred, content hidden, width kept; no hover or press         | `aria-busy="true"`, `data-loading` |

## Behaviour

- Press feedback is instant and runs for every pointer; hover is never required to understand the control.
- Disabled and loading block activation in the click handler (`preventDefault()` and return, without calling `onClick` or dispatching events), and the element stays focusable and announced.
- Label verbs, sentence case: "Save changes", not "OK".
- Inside a disabled `<fieldset>`, native disabling applies (spec #1).

## Motion

- Press: `scale` to `--ab-button-scale-pressed` over `motion-duration-press` (100 ms), `motion-easing-enter`.
- Hover: background over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color`.
- No motion when activated from the keyboard beyond the colour change (the brand book's "No motion on keyboard-initiated … actions"): `:active` from Space still scales; that is acceptable because it is press feedback, not an animation of the result.
- **Reduced motion:** `motion-scale-pressed` resolves to `scale-100` under `(prefers-reduced-motion: reduce)` (token media override), so the press keeps only its colour change. Colour fades stay.
- **Instant exit:** Button has no exit. Hover-out is a colour transition; when it is cut short (pointer leaves mid-transition) it reverses from its current value, which reads as correct.

## Keyboard

APG pattern: **Button** (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key             | Action                                                           |
| --------------- | ---------------------------------------------------------------- |
| Space           | "Activates the button."                                          |
| Enter           | "Activates the button."                                          |
| Tab / Shift+Tab | Moves focus to / from the button, also when disabled or loading. |

APG on focus after activation: "If activating the button does not dismiss the current context, then focus typically remains on the button". Button never moves focus itself. Native `<button>` provides Space and Enter, so no key handler is added.

## Accessibility

- Role `button` from the native element. APG: "By default, the accessible name is computed from any text content inside the button element." A button with only an icon is an IconButton.
- APG: "When the action associated with a button is unavailable, the button has aria-disabled set to true." Pair a disabled button with an explanation (`aria-describedby`).
- Kbd hint: without `aria-hidden` its text would join the accessible name ("Publish ⌘ ↵"). The consumer passes `aria-hidden` to the Kbd and sets `aria-keyshortcuts` on the button with the shortcuts the app actually binds (`"Meta+Enter Control+Enter"` when `mod` is handled on every platform; see the Kbd spec), so the name stays "Publish" and the shortcut is still exposed.
- Toggle buttons are not a Button variant: a pressed state belongs to IconButton (`pressed`) and, later, Toggle/SegmentedControl.
- Targets: heights come from `size-control-*`, which reach 40/44/48 under `(pointer: coarse)`; sm (28) meets the 24 px minimum on fine pointers.
- **More contrast:** secondary's hairline uses `color-border-subtle`, which steps up to `color-border-default` under `(prefers-contrast: more)` (token media override).
- **Forced colors:** fills disappear, so every variant draws a 1 px `ButtonText` border in `@media (forced-colors: active)` (secondary already has one), and the focus ring uses `outline` so the system colour applies. Disabled uses `GrayText`.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only (`padding-inline`, `margin-inline-start`). Directional icons (arrows) are mirrored by the Icon component with `:dir(rtl)`, not by Button. No arrow-key behaviour.

## Component tokens

All exist (ported from the source, `packages/tokens/src/tokens/component.tokens.json`): `button-{sm,md,lg}-height`, `button-{sm,md,lg}-padding-inline`, `button-gap`, `button-border-radius`, `button-lg-border-radius`, `button-border-width`, `button-font`, `button-lg-font`, `button-icon-size`, `button-scale-pressed`, `button-shadow`, `button-{primary,secondary,tertiary,danger}-*` colours (background rest/hovered/pressed, text, icon, secondary border rest/hovered, tertiary text hovered), and `button-{background-color,text-color,border-color}-disabled`.

No new tokens. The focus ring uses semantic `focus-ring-width`, `focus-ring-offset` and `color-border-focused` directly (R6: focus is a pattern, not a component).

## Author-written text

None. Every string in a Button comes from its children.

## Feedback events

| Event      | When                                                   | `reason` |
| ---------- | ------------------------------------------------------ | -------- |
| `ab-press` | After `onClick` runs on an enabled, not loading button | `"user"` |

Detail: `{ component: "Button", reason }`. Not dispatched when disabled or loading. Already built in #7 (`src/events/events.ts`).

## Sources

- Source guide: artifact `project/components/Button/README.md` ("rest · hovered (fine pointers only, 120ms in / 250ms out) · pressed (scale .97, 100ms) · focus-visible (2px moss ring, 3px offset) · disabled · busy."; "Busy keeps the button's width so the layout never jumps; clicks are ignored while `aria-busy`.").
- WAI-ARIA APG Button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- shadcn/ui Button: https://ui.shadcn.com/docs/components/button
- MUI Button API: https://mui.com/material-ui/api/button/
- Mantine Button: https://mantine.dev/core/button/
- React Aria Button: https://react-aria.adobe.com/Button
- Base UI Button: https://base-ui.com/react/components/button
