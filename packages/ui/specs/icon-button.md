# IconButton

Triggers an action with an icon instead of a text label, in toolbars, list rows and panel headers. Use a Button with a visible label whenever space allows. To navigate, use a Link; an icon-only link is IconButton with `asChild` around an `<a href>` or a router link (see API). As a toggle (`pressed`), it marks one on/off setting such as Pin or Bold.

```tsx
import { IconButton } from "@platform/ui/icon-button";
import { MoreIcon } from "@platform/ui/icons/more";
import { PinIcon } from "@platform/ui/icons/pin";

<IconButton aria-label="More actions"><MoreIcon /></IconButton>
<IconButton aria-label="Pin" defaultPressed={false} onPressedChange={(pinned) => save(pinned)}>
  <PinIcon />
</IconButton>
<IconButton aria-label="Settings" size="sm" loading><SettingsIcon /></IconButton>
```

Status: draft for brand-owner review (phase 1). Source guide: `components/IconButton/README.md` in the artifact.

## Anatomy

Container → icon (or Spinner while `loading`).

- **Container.** A native `<button>`, square: width and height both `icon-button-{size}-size`. Radius `icon-button-border-radius` (8). Transparent at rest, no border, no elevation.
- **Icon** is the only child. It is decorative (`aria-hidden`, from the Icon component); the accessible name comes from `aria-label` or `aria-labelledby` on the button. Icon size is `icon-button-icon-size` (16), and `icon-button-lg-icon-size` (20) at `lg`, with the matching Icon stroke (`icon-sm-stroke-width` / `icon-md-stroke-width`, per the Icon spec).
- **Spinner** replaces the icon while `loading`, decorative, at the same size, so the square never changes.

## API

| Prop                             | Type                                                                | Default    | Notes                                                                                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `aria-label` / `aria-labelledby` | `string`                                                            | required   | One of the two is required by the type (`{ "aria-label": string } \| { "aria-labelledby": string }`).                                                                                                                                |
| `size`                           | `"sm" \| "md" \| "lg"`                                              | `"md"`     | Exposed as `data-size`. 28 / 32 / 40, growing to 40 / 44 / 48 on coarse pointers through `size-control-*`.                                                                                                                           |
| `pressed`                        | `boolean`                                                           |            | Controlled toggle state. Setting `pressed` or `defaultPressed` makes the button a toggle: it renders `aria-pressed`.                                                                                                                 |
| `defaultPressed`                 | `boolean`                                                           |            | Uncontrolled counterpart of `pressed`.                                                                                                                                                                                               |
| `onPressedChange`                | `(pressed: boolean, details: IconButtonChangeEventDetails) => void` |            | Called before the state commits. `details` holds `reason` (`"none"`), `event` and `cancel()` (spec #1, following Base UI).                                                                                                           |
| `loading`                        | `boolean`                                                           | `false`    | Same as Button: `aria-busy="true"`, `data-loading`, activation blocked, focus kept.                                                                                                                                                  |
| `disabled`                       | `boolean`                                                           | `false`    | `aria-disabled="true"`; never native `disabled` (spec #1).                                                                                                                                                                           |
| `asChild`                        | `boolean`                                                           | `false`    | Renders the single child element with IconButton's props and styles (Radix Slot), e.g. a router link for an icon-only link. A link child takes no `pressed`, `loading` or `disabled` (a link has no such states; see the Link spec). |
| `type`                           | native                                                              | `"button"` | As Button.                                                                                                                                                                                                                           |
| …native                          | `ComponentProps<"button">`                                          |            | `ref`, `className`, `onClick` and every native attribute pass through unchanged.                                                                                                                                                     |

Names, checked against the reference libraries:

- **`IconButton`**: Radix Themes "Button designed specifically for usage with a single icon." (https://www.radix-ui.com/themes/docs/components/icon-button); MUI `IconButton`, `children` "The icon to display." (https://mui.com/material-ui/api/icon-button/); Chakra `IconButton` "Used to render an icon within a button" (https://chakra-ui.com/docs/components/icon-button). Mantine calls it `ActionIcon`, "Icon button" (https://mantine.dev/core/action-icon/); shadcn uses Button with `size` "`"icon" | "icon-xs" | "icon-sm" | "icon-lg"`" (https://ui.shadcn.com/docs/components/button). Base UI lists no icon button (its component list has Button and Toggle only, https://base-ui.com/react/overview/quick-start). Three of the libraries use `IconButton`, and it is the source's name.
- **`aria-label`, not a `label` prop.** The source had "`label` is required and becomes `aria-label`." No reference library documents a `label` prop; they all use the ARIA attribute: Radix Themes "It's strongly recommended to include an aria-label or aria-labelledby prop on Icon Button components"; Chakra (v2) "you must pass the `aria-label` prop, so screen readers can give meaning to the button." (https://v2.chakra-ui.com/docs/components/icon-button); Mantine "To make ActionIcon accessible for screen readers, you need to either set aria-label or use the VisuallyHidden component". We keep the source's rule (required) and the libraries' name, enforced by the type.
- **`pressed` / `defaultPressed` / `onPressedChange`**: Radix Toggle lists "`defaultPressed`", "`pressed`", "`onPressedChange`" (https://www.radix-ui.com/primitives/docs/components/toggle); Base UI Toggle: `pressed` "Whether the toggle button is currently pressed. This is the controlled counterpart of `defaultPressed`." and `onPressedChange` "`(pressed: boolean, eventDetails: Toggle.ChangeEventDetails) => void`" (https://base-ui.com/react/components/toggle). React Aria uses `isSelected` / `defaultSelected` / `onChange` (https://react-aria.adobe.com/ToggleButton). Radix and Base UI agree, the source already says `pressed`, and it matches `aria-pressed`. `details.reason` is `"none"` as in Base UI: "`type ToggleChangeEventReason = 'none'`" (a press is the only cause).
- **A toggle is IconButton with `pressed`, not a separate Toggle component** (source decision: "selected (`pressed` or `aria-expanded`)"). Radix, Base UI and React Aria ship a separate Toggle/ToggleButton; a text-label Toggle is left to SegmentedControl and a later Toggle, as the Button spec says.
- **`size`**: Radix Themes `size` "`"1" | "2" | "3" | "4"`"; MUI `size` "`'small' | 'medium' | 'large'`"; Chakra `size` "`'2xs'` through `'2xl'`". Every library calls it `size`; values follow the Dictionary and Button.
- **`loading`**: Radix Themes `loading` "`boolean`" default "`false`"; MUI "If true , the loading indicator is visible and the button is disabled."; Mantine "When the `loading` prop is set, `ActionIcon` will be disabled". Not in the source guide; added for parity with Button (judgement call).
- **`asChild`**: Radix Themes `asChild` "`boolean`"; Chakra "Use the provided child element as the default rendered element, combining their props and behavior."
- **No `variant`.** The source has one treatment (transparent, neutral-subtle on hover) and only its tokens. MUI's `color`, Radix's and Chakra's `variant` can be added later with Button's values if a filled icon action appears.

## States

| State            | How it shows                                                                                                                                             | Exposed as                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| rest             | Transparent, icon `icon-button-icon-color`                                                                                                               | `data-size`                                     |
| hovered          | Fill `icon-button-background-color-hovered`, icon `icon-button-icon-color-hovered`; fine pointers only (`@media (hover: hover)`)                         | `:hover`                                        |
| pressed (active) | Scale 0.97 and fill `icon-button-background-color-pressed`, 100 ms                                                                                       | `:active`                                       |
| selected         | Fill `icon-button-background-color-selected`, icon `icon-button-icon-color-selected`. Applies when toggled on or when it controls an open Floating layer | `aria-pressed="true"` or `aria-expanded="true"` |
| focus-visible    | 2 px focus ring, 3 px offset, `color-border-focused`                                                                                                     | `:focus-visible`                                |
| disabled         | `opacity-disabled` (40%, the source's value); no hover or press                                                                                          | `aria-disabled="true"`                          |
| loading          | Spinner in place of the icon; no hover or press                                                                                                          | `aria-busy="true"`, `data-loading`              |

## Behaviour

- Same activation rules as Button: press feedback is instant, disabled and loading block activation in the click handler (`preventDefault()` and return, without calling `onClick`, `onPressedChange` or dispatching events), focus stays.
- Toggle: a click calls `onClick`, then `onPressedChange(!pressed, details)`. If the consumer calls `details.cancel()`, the state does not change and no feedback event fires. Otherwise the uncontrolled state flips (controlled: the parent decides) and `ab-toggle` fires.
- The label never changes with the state. APG: "it is critical the label on a toggle does not change when its state changes." (https://www.w3.org/WAI/ARIA/apg/patterns/button/). "Pin" stays "Pin"; the pressed state carries on/off.
- Pair every IconButton with a Tooltip showing the same text plus its shortcut (source guide: "Add a Tooltip with the same text plus its shortcut."). Tooltip is phase 4; it will wrap IconButton through `Tooltip.Trigger asChild`. Until then the visible hint is missing, and the accessible name is complete.
- Client component (`'use client'`): it has a click handler, and toggle state.

## Motion

- Press: `scale` to `--ab-icon-button-scale-pressed` over `motion-duration-press` (100 ms), `motion-easing-enter`, as Button.
- Hover and selected: background and icon colour over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color`.
- Toggling on or off is a colour change only. No spring: the user does not move anything directly (brand book: springs only for "switch thumbs, segmented and tab indicators, the radio diamond, toast entrance").
- **Reduced motion:** `motion-scale-pressed` resolves to `scale-100` under `(prefers-reduced-motion: reduce)` (token media override), so the press keeps only its colour change. Colour fades stay.
- **Instant exit:** IconButton has no exit. Hover-out and toggling off are colour transitions that reverse from their current value when interrupted; with no transition at all, the fill simply switches, and the `aria-pressed` state is already correct, so it reads as correct.

## Keyboard

APG pattern: **Button**, including its toggle button (https://www.w3.org/WAI/ARIA/apg/patterns/button/): "A two-state button that can be either off (not pressed) or on (pressed)."

| Key             | Action                                                           |
| --------------- | ---------------------------------------------------------------- |
| Space           | "Activates the button." For a toggle, flips `aria-pressed`.      |
| Enter           | "Activates the button." For a toggle, flips `aria-pressed`.      |
| Tab / Shift+Tab | Moves focus to / from the button, also when disabled or loading. |

Native `<button>` provides Space and Enter; no key handler is added. In a Toolbar (phase 3) arrow keys move between IconButtons; that belongs to Toolbar, not IconButton.

## Accessibility

- Role `button` from the native element. APG: the accessible name "can also be provided with aria-labelledby or aria-label." The type requires one.
- Toggle: APG "If the button is a toggle button, it has an aria-pressed state. When the button is toggled on, the value of this state is true, and when toggled off, the state is false." IconButton renders `aria-pressed` only when `pressed` or `defaultPressed` is set, so a plain IconButton is not announced as a toggle.
- `aria-expanded` is passed through by the Floating-layer triggers that wrap IconButton (DropdownMenu, Popover); IconButton only styles it as selected.
- Disabled: pair with an explanation (`aria-describedby`), as Button.
- Targets: `size-control-*` heights reach 40/44/48 under `(pointer: coarse)`; sm (28) meets the 24 px minimum on fine pointers (brand book: "icon-only controls keep at least the minimum target size").
- **Selected vs rest contrast (review item).** The selected state changes the fill (`color-background-selected`) and the icon colour (`color-icon-subtle` → `color-icon-selected`). Whether that difference alone is enough to identify the state (WCAG 1.4.11) is for the brand-owner review; under more contrast a border is added (next bullet).
- **More contrast:** under `(prefers-contrast: more)` the selected state draws a 1 px inset `icon-button-border-color-selected` ring, so on/off no longer relies on a fill step.
- **Forced colors:** the fills disappear. CSS Color Adjust 1: "if its computed value is a color other than a system color, its used value is instead forced to a system color", and for background-color "its alpha channel is taken from the original background-color value so that transparent backgrounds remain transparent" (https://www.w3.org/TR/css-color-adjust-1/). The icon follows `currentColor`, so it takes the forced text colour. Because system colours are not forced, the selected state sets `background-color: Highlight` and icon `HighlightText` in `@media (forced-colors: active)`, so on/off stays visible. Disabled uses `GrayText`. The focus ring is an `outline`, so the system colour applies.
- **Reduced transparency:** not affected (no Material).

## RTL

Symmetric, so nothing mirrors. Directional icons (back, forward) are mirrored by the Icon component with `:dir(rtl)`, not by IconButton. No arrow-key behaviour.

## Component tokens

Existing (ported from the source): `icon-button-{sm,md,lg}-size`, `icon-button-icon-size`, `icon-button-lg-icon-size`, `icon-button-border-radius`, `icon-button-icon-color`, `icon-button-icon-color-hovered`, `icon-button-background-color-hovered`, `icon-button-background-color-pressed`, `icon-button-icon-color-selected`, `icon-button-background-color-selected`.

Proposed new:

| Token                               | References                         | `$type` | Why                                                                                                              |
| ----------------------------------- | ---------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `icon-button-scale-pressed`         | `{semantic.motion-scale-pressed}`  | number  | The source's "pressed (scale .97)"; mirrors `button-scale-pressed` so an app can tune press depth per component. |
| `icon-button-border-color-selected` | `{semantic.color-border-selected}` | color   | The selected ring under more contrast (above).                                                                   |

Consumed as semantic tokens directly: `opacity-disabled` (no `opacity` property in the Dictionary, and the value is the system's single disabled opacity), `focus-ring-width`, `focus-ring-offset`, `color-border-focused` (R6), and the `motion-*` tokens. No new Dictionary words.

## Built-in labels

None. The name comes from `aria-label` / `aria-labelledby`.

## Feedback events

| Event       | When                                                                   | `reason` |
| ----------- | ---------------------------------------------------------------------- | -------- |
| `ab-press`  | After `onClick` runs on an enabled, not loading, non-toggle IconButton | `"user"` |
| `ab-toggle` | After a toggle IconButton's state change commits (not cancelled)       | `"user"` |

Detail: `{ component: "IconButton", reason }`. One event per gesture: a toggle fires `ab-toggle` instead of `ab-press`, so an app never plays two sounds for one click. A listener that needs the new state reads `aria-pressed` from `event.target`. A controlled `pressed` changed by the parent fires nothing (the design system did not cause it). Neither fires when disabled or loading. `events.ts` widens `PressEvent` to `"Button" | "IconButton"` and adds `ab-toggle` (`ToggleFeedbackEvent`, so it does not shadow the DOM's `ToggleEvent`) to `GlobalEventHandlersEventMap`.

## Sources

- Source guide: artifact `project/components/IconButton/README.md` ("rest (transparent) · hovered (neutral-subtle fill) · pressed (scale .97) · selected (`pressed` or `aria-expanded`) · disabled (40% opacity)."; "`label` is required and becomes `aria-label`. Add a Tooltip with the same text plus its shortcut.").
- WAI-ARIA APG Button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- Radix Themes Icon Button: https://www.radix-ui.com/themes/docs/components/icon-button
- Radix Primitives Toggle: https://www.radix-ui.com/primitives/docs/components/toggle
- Base UI Toggle: https://base-ui.com/react/components/toggle
- React Aria ToggleButton: https://react-aria.adobe.com/ToggleButton
- MUI IconButton API: https://mui.com/material-ui/api/icon-button/
- Chakra IconButton: https://chakra-ui.com/docs/components/icon-button and https://v2.chakra-ui.com/docs/components/icon-button
- Mantine ActionIcon: https://mantine.dev/core/action-icon/
- shadcn/ui Button: https://ui.shadcn.com/docs/components/button
- CSS Color Adjustment 1: https://www.w3.org/TR/css-color-adjust-1/
