# Switch

An on/off setting that takes effect immediately, like a light switch: "Sound", "Show line numbers". Never inside a form that needs Save; there, use Checkbox.

```tsx
import { Switch } from "@platform/ui/switch";

<Switch defaultChecked onCheckedChange={(on) => setSound(on)}>Sound</Switch>
<Switch checked={compact} onCheckedChange={setCompact}>Compact rows</Switch>
```

Status: draft for brand-owner review (phase 2). Source guide: `components/Switch/README.md` in the artifact.

## Anatomy

Root (label) → track (native input) → thumb → label text.

- **Root.** A native `<label>` around everything, so the whole row toggles. Gap `switch-gap` (8); text in `switch-label-font`.
- **Track.** A native `<input type="checkbox" role="switch">` with `appearance: none`, drawn as the track: `switch-track-width` × `switch-track-height` (32 × 20), radius `switch-border-radius` (full), fill `switch-track-background-color`, `switch-track-padding` (2) inside.
- **Thumb.** The track's `::before` (as the source CSS), `switch-thumb-size` (16), fill `switch-thumb-background-color`, `switch-thumb-shadow` (raised elevation). It sits at the inline start when off and the inline end when on.

## API

| Prop              | Type                                                            | Default         | Notes                                                                                                        |
| ----------------- | --------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| `children`        | `ReactNode`                                                     |                 | The label: names the setting, never the state. Without children, `aria-label`/`aria-labelledby` is required. |
| `checked`         | `boolean`                                                       |                 | Controlled.                                                                                                  |
| `defaultChecked`  | `boolean`                                                       | `false`         | Uncontrolled.                                                                                                |
| `onCheckedChange` | `(checked: boolean, details: SwitchChangeEventDetails) => void` |                 | Before the change commits. `details`: `reason` (`"none"`), `event`, `cancel()`.                              |
| `name`, `value`   | `string`                                                        | `value`: `"on"` | Native; a Switch can still be submitted when a form needs it.                                                |
| `disabled`        | `boolean`                                                       | `false`         | `aria-disabled="true"`, focusable, change blocked.                                                           |
| …native           | `ComponentProps<"input">` minus `type` and `role`               |                 | `ref`, `id`, `onChange`, `aria-*` on the input; `className`, `style` on the root label.                      |

There is no `size`: the source has one size, and coarse pointers get their target from the whole label row.

Names, checked against the reference libraries:

- **`Switch`**: Radix `Switch.Root` / `Switch.Thumb` (https://www.radix-ui.com/primitives/docs/components/switch), Base UI `Switch.Root` / `Switch.Thumb` (https://base-ui.com/react/components/switch), React Aria `SwitchField` / `SwitchButton` (https://react-aria.adobe.com/Switch), Ark `Switch.Root`, Mantine "`Switch` is a regular `input[type="checkbox"]`." (https://mantine.dev/core/switch/), MUI `Switch` (https://mui.com/material-ui/api/switch/). Every library says Switch. One component, as Mantine and MUI, because the native input is the control and the thumb has no behaviour (as Checkbox).
- **`checked` / `defaultChecked` / `onCheckedChange(checked, details)`**: Base UI "`onCheckedChange` `((checked: boolean, eventDetails: Switch.Root.ChangeEventDetails) => void)` — Event handler called when the switch is activated or deactivated."; Radix `onCheckedChange`. React Aria uses `isSelected` / `onChange`.
- **No `switch` attribute.** HTML's `<input type="checkbox" switch>` would give the role natively, but MDN: "This attribute is still experimental and has limited browser support. The attribute is ignored on unsupported browsers." webstatus.dev `switch-control`: limited (Safari 17.4 only), below the floor. `role="switch"` on the native checkbox is allowed (ARIA in HTML, `input type=checkbox`: "Roles: menuitemcheckbox , option or switch").

## States

| State         | How it shows                                                                                                                                               | Exposed as                            |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| off           | Track `switch-track-background-color` (`color-border-default`), thumb at the inline start                                                                  | `:checked` not matching               |
| hovered       | Track `switch-track-background-color-hovered`; fine pointers only                                                                                          | `:hover`                              |
| held          | Thumb stretches from 16 to `switch-thumb-width-pressed` (20) toward the travel direction                                                                   | `:active`                             |
| on            | Track `switch-track-background-color-checked` (accent), thumb at the inline end                                                                            | `:checked`                            |
| focus-visible | 2 px ring, 3 px offset around the track                                                                                                                    | `:focus-visible`                      |
| disabled      | track `color-background-disabled`, thumb `color-icon-disabled` without shadow, label `color-text-disabled` (Disabled look, GLOSSARY); no hover, no stretch | `aria-disabled="true"` or `:disabled` |

On/off is position plus fill, never colour alone (brand book "Not color alone").

## Behaviour

- Same change, cancel and disabled handling as Checkbox (the `click` handler, `details.cancel()` → `preventDefault()`), because the control is the same native checkbox.
- The setting applies when it changes; no Save. If applying can fail, the app reverts `checked` and explains in a Toast.
- The label describes the setting, not the state (source: "Label text describes the setting, not the state.").
- Client component (`'use client'`).

## Motion

- **Thumb travel:** `translate` over `motion-duration-spring` (400 ms) with `switch-easing` (`motion-easing-spring`), a direct-manipulation spring (brand book: "Springs. Only where the user directly causes the movement: switch thumbs…"). The source guide and the source CSS both say 400 ms, so the thumb follows them; `switch-duration` (180 ms) times the track colour. The held stretch grows over `motion-duration-swap` with `motion-easing-enter` (source CSS).
- **Held stretch:** while `:active`, the thumb's `inline-size` grows to `switch-thumb-width-pressed`, anchored on the side it will leave from, so it "stretches 4px while held — direct manipulation feel" (source).
- Track fill: colour over the same duration, `motion-easing-color`.
- **Reduced motion:** no travel animation and no stretch: the thumb jumps to its side and the track colour fades (brand book: reduced motion "removes movement, scaling, blur and stagger. Opacity and color fades remain.").
- **Instant exit:** turning off is the same transition reversed and interruptible mid-way (CSS transitions reverse from their current value); with no transition, the thumb is already at the correct side when `:checked` changes.
- No motion beyond the colour change when toggled with Space (keyboard-initiated); the thumb still moves to its side, instantly (judgement call; same `data-pointer` rule as Checkbox).

## Keyboard

APG pattern: **Switch** (https://www.w3.org/WAI/ARIA/apg/patterns/switch/).

| Key             | Action                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Space           | "When focus is on the switch, changes the state of the switch."                                                                              |
| Enter           | Not bound. APG marks it "(Optional)"; on a native checkbox Enter submits the form, and a Switch is not in a submitted form (judgement call). |
| Tab / Shift+Tab | Moves focus to / from the switch, also when disabled.                                                                                        |

## Accessibility

- Role `switch` on the native checkbox; on/off from the native checkedness. APG: "If the switch element is an HTML input[type="checkbox"], it uses the HTML checked attribute instead of the aria-checked property." MDN: "the `switch` role represents the states "on" and "off.""
- No mixed state. MDN: "The `switch` role does not support the value `mixed` for the `aria-checked` attribute". Switch has no `indeterminate` prop.
- APG: "Important: it is critical the label on a switch does not change when its state changes."
- **Groups:** Fieldset. APG: "The set is contained in an HTML fieldset and the label for the set is contained in an HTML legend element."
- **Contrast.** Off: the track (`color-border-default`) is 3:1 on the surfaces (matrix), and the thumb (`surface-floating`) against it is 3.67:1 light / 3.29:1 dark (measured; inference until the pair is in the matrix). On: `background-accent-bold` against surfaces and `surface-floating` against `background-accent-bold` are added to the matrix at 3:1 (measured 13.40:1 light, 14.25:1 dark).
- **More contrast:** no change needed.
- **Forced colors:** track `ButtonBorder` outline, thumb `ButtonText`; on fills the track with `Highlight` and the thumb `HighlightText`. Disabled: `GrayText`.
- **Reduced transparency:** not affected.

## RTL

Off sits at the inline start (right in RTL) and on at the inline end. The translation uses a logical offset (`translate` computed from `:dir(rtl)` with a sign flip, since `translate` is physical). No arrow keys.

## Component tokens

Existing (ported from the source): `switch-track-width`, `switch-track-height`, `switch-thumb-size`, `switch-track-padding`, `switch-border-radius`, `switch-gap`, `switch-label-font`, `switch-track-background-color`, `switch-track-background-color-hovered`, `switch-track-background-color-checked`, `switch-thumb-background-color`, `switch-thumb-shadow`, `switch-duration`, `switch-easing`.

Proposed new:

| Token                        | References     | `$type`   | Why                                                      |
| ---------------------------- | -------------- | --------- | -------------------------------------------------------- |
| `switch-thumb-width-pressed` | `size-icon-md` | dimension | The held stretch: 16 → 20 (the source's "stretches 4px") |

Contrast matrix additions: `surface-floating` on `background-accent-bold`, and `background-accent-bold` on the four surfaces (shared with Checkbox and Slider).

## Author-written text

None.

## Feedback events

| Event       | When                                                      | `reason` |
| ----------- | --------------------------------------------------------- | -------- |
| `ab-toggle` | After a user change commits (not cancelled, not disabled) | `"user"` |

Detail: `{ component: "Switch", reason }`. Brand book: "Soft synthesised clicks mark toggles". A controlled change made by the parent dispatches nothing.

## Sources

- Source guide: artifact `project/components/Switch/README.md` ("On/off setting that takes effect immediately, like a light switch; never inside a form that needs Save."; "Thumb travels on `motion-easing-spring` (400ms) and stretches 4px while held — direct manipulation feel."; "Native checkbox with `role="switch"` (announced as on/off).").
- MDN `role="switch"`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role · `<input type="checkbox">` (`switch` attribute): https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox
- ARIA in HTML: https://www.w3.org/TR/html-aria/
- Baseline (webstatus.dev, 2026-10-24): `input-checkbox` widely available; `switch-control` limited (not used); `appearance` widely available.
- WAI-ARIA APG Switch: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
- Radix Switch: https://www.radix-ui.com/primitives/docs/components/switch · Base UI Switch: https://base-ui.com/react/components/switch · React Aria Switch: https://react-aria.adobe.com/Switch · Ark Switch: https://ark-ui.com/react/docs/components/switch · Mantine Switch: https://mantine.dev/core/switch/ · MUI Switch: https://mui.com/material-ui/api/switch/
