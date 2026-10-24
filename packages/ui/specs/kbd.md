# Kbd

Shows a keyboard shortcut hint in menus, tooltips, buttons, the Command footer and prose. It shows the key, and never replaces a visible label. Not a control and not a way to bind the shortcut: the app handles the key and sets `aria-keyshortcuts` on the control.

```tsx
import { Kbd } from "@platform/ui/kbd";

<p>Press <Kbd keys="mod+k" /> to search.</p>     {/* ⌘ K on Apple, Ctrl K elsewhere */}
<Kbd keys="shift+enter" />
<Kbd>Esc</Kbd>                                   {/* one key, as every library writes it */}

<Button aria-keyshortcuts="Meta+Enter Control+Enter">
  Publish <Kbd keys="mod+enter" aria-hidden />   {/* inside a control: hidden, see Accessibility */}
</Button>

<Kbd keys="mod+k" platform="apple" />            {/* platform known on the server: no client JS */}
```

Status: draft for brand-owner review (phase 1). Source guide: `components/Kbd/README.md` in the artifact.

## Anatomy

Group (outer `<kbd>`) → Key (one inner `<kbd>` per key) → glyph or text, plus a visually hidden spoken name for glyph keys.

- **Group.** An outer `<kbd>` laid out inline-flex with `kbd-gap` between keys and `dir="ltr"` (see RTL). No border or fill of its own. MDN: "To describe an input comprised of multiple keystrokes, you can nest multiple `<kbd>` elements, with an outer `<kbd>` element representing the overall input and each individual keystroke or component of the input enclosed within its own `<kbd>`." (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd).
- **Key.** Inner `<kbd>`: height and min-width `kbd-height` / `kbd-min-width` (20), `kbd-padding-inline`, `kbd-border-radius`, `kbd-font` (`type-kbd-sm`, 11 px, 500, tabular), `kbd-background-color` (nested surface), `kbd-text-color`, a `kbd-border-color` hairline, and a 2 px block-end border "to read as a physical key" (source).
- **No "+" between keys.** The gap separates them (source anatomy: one `<kbd>` per key). With `children`, the Group holds one Key.

## API

| Prop       | Type                    | Default  | Notes                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keys`     | `string`                |          | `+`-separated, case-insensitive key names: `"mod+k"`, `"shift+enter"`. Named keys: `mod`, `ctrl`, `shift`, `alt`, `enter`, `backspace`, `esc`, `tab`, `space`, `up`, `down`, `left`, `right`, `plus`. Anything else renders as written, a single letter upper-cased. Typed as a union of the named keys plus `string & Record<never, never>` (lint bans `{}`), so editors complete them. |
| `children` | `ReactNode`             |          | Used when `keys` is absent: one Key with this content, as in every reference library.                                                                                                                                                                                                                                                                                                    |
| `platform` | `"apple" \| "other"`    | detected | Resolves the platform keys (`mod`, `ctrl`, `shift`, `alt`). Pass it when the server knows the platform; omit it to detect on the client (see Behaviour).                                                                                                                                                                                                                                 |
| `labels`   | `Partial<KbdLabels>`    | English  | Spoken names of glyph keys (see Built-in labels).                                                                                                                                                                                                                                                                                                                                        |
| …native    | `ComponentProps<"kbd">` |          | `ref`, `className`, `aria-hidden` and every native attribute go on the Group.                                                                                                                                                                                                                                                                                                            |

Glyphs (source: "`mod` resolves per platform (⌘ / Ctrl). Glyphs: ⇧ ⌥ ↵ ⌫ ↑ ↓."):

| Key                              | `apple`           | `other` |
| -------------------------------- | ----------------- | ------- |
| `mod`                            | ⌘                 | Ctrl    |
| `ctrl`                           | ⌃                 | Ctrl    |
| `shift`                          | ⇧                 | Shift   |
| `alt`                            | ⌥                 | Alt     |
| `enter` · `backspace`            | ↵ · ⌫             | ↵ · ⌫   |
| `up` · `down` · `left` · `right` | ↑ · ↓ · ← · →     | same    |
| `esc` · `tab` · `space`          | Esc · Tab · Space | same    |

The `other` column for `shift` and `alt` writes the word, as Windows and Linux keyboards and menus do (design decision; the source lists the glyphs without saying per platform).

Names, checked against the reference libraries:

- **`Kbd`**: Chakra "Used to show key combinations for an action" (https://chakra-ui.com/docs/components/kbd); Mantine "Display keyboard key" (https://mantine.dev/core/kbd/); shadcn "Used to display textual user input from keyboard." (https://ui.shadcn.com/docs/components/kbd); Radix Themes "Represents keyboard input or a hotkey." (https://www.radix-ui.com/themes/docs/components/kbd). Every library calls it `Kbd`.
- **`children`**: every library writes one key per element, e.g. Mantine `<Kbd>⌘</Kbd> + <Kbd>Shift</Kbd> + <Kbd>M</Kbd>`, Chakra `<Kbd>F12</Kbd>`, shadcn `<Kbd>Ctrl</Kbd>`.
- **`keys`**: no reference library documents it; it is the source's prop (`<Kbd keys="mod+k" />`) and the Button spec's usage. It is needed because spec #1 requires "Kbd renders ⌘ on Apple platforms, Ctrl elsewhere": with children the consumer would have to detect the platform. shadcn composes keys with a separate `KbdGroup` ("Use the `KbdGroup` component to group keyboard keys together."); `keys` covers that, so there is no group component. The source's array form (`keys={['shift', 'enter']}`) is dropped: one form is enough.
- **`mod`**: Mantine's hotkeys use the same word: "`mod+S` – detects `⌘+S` on macOS and `Ctrl+S` on Windows" (https://mantine.dev/hooks/use-hotkeys/).
- **`platform`**: no reference library documents it (none resolves platform keys). It exists so a Server Component can render the right glyph with no client JavaScript and no hydration flash. Flagged for review.
- **No `size` or `variant`.** Chakra has `variant` "`'raised' | 'outline' | 'subtle' | 'plain'`" and `size` "`'sm' | 'md' | 'lg'`"; Mantine "xs", "sm", "md", "lg", and "xl". The source has one size and one look (`type-kbd-sm`), so none are added.

## States

| State             | How it shows                              | Exposed as           |
| ----------------- | ----------------------------------------- | -------------------- |
| rest              | Keycaps as in Anatomy                     |                      |
| platform resolved | Glyphs for the platform                   | the keycap text      |
| hidden            | Visible, not announced (inside a control) | `aria-hidden="true"` |

No interactive states. No `data-platform` is rendered: the Group is server-rendered and the platform is resolved per key (built in #17).

## Behaviour

- **Server Component.** Kbd itself has no `'use client'`. Keys that don't depend on the platform (`enter`, `k`, `esc`) render on the server with no client code.
- **Platform detection** (only when `keys` contains `mod`, `ctrl`, `shift` or `alt` and `platform` is not passed): those keys render through one small client leaf (`'use client'` on the leaf file only, spec #1 user story 5). It reads the platform with `useSyncExternalStore`:
  - `getServerSnapshot` returns `"other"`. React: "It will be used only during server rendering and during hydration of server-rendered content on the client. The server snapshot must be the same between the client and the server" (https://react.dev/reference/react/useSyncExternalStore). Server HTML and the hydration render agree, so there is no hydration mismatch.
  - `getSnapshot` reads the platform once; React then re-renders with it, so on Apple "Ctrl" becomes "⌘" right after hydration. The Key's `min-width` keeps the swap from moving the layout much (inference).
  - Detection is tested through stories that set `navigator.platform` before rendering (built in #17; no separate helper was needed). It follows MDN: "One case where `navigator.platform` can be useful is when you need to show users advice about whether the modifier key for keyboard shortcuts is the `⌘` command key (found on Apple systems) rather than the `Ctrl` control key" with `navigator.platform.startsWith("Mac") || navigator.platform === "iPhone"` (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform; the page shows it as "Baseline Widely available"). We add `"iPad"` (inference; iPadOS may also report a Mac platform, which the `startsWith("Mac")` test covers).
  - Not `navigator.userAgentData`: "This feature is not Baseline because it does not work in some of the most widely-used browsers." (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData), below the ADR-0002 floor.
- **Passing `platform`** resolves the modifiers on the server: no flash. Keys that end up as text (Ctrl, Shift, letters) need no client JavaScript; a glyph key (⌘, ↵, arrows) still renders through the client leaf, because its spoken name comes from the Provider's locale (built in #17). An app can derive it on the server from a request header. `Sec-CH-UA-Platform` "is a low entropy hint. Unless blocked by a user agent permission policy, it is sent by default" with values such as `"macOS"`, `"iOS"`, `"Windows"`, but it is "not Baseline because it does not work in some of the most widely-used browsers" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-CH-UA-Platform), so an app falls back to the `User-Agent` header or to omitting the prop (inference). Kbd itself reads no headers.
- A Kbd shows a hint, never the only label of an action (source).

## Motion

None.

- **Reduced motion:** nothing to remove.
- **Instant exit:** Kbd has no exit. The post-hydration glyph swap (detected platform) is a text change with no animation, which reads as correct because the hint simply settles to the user's keyboard.

## Keyboard

No APG pattern: the APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) has none for keyboard hints. The closest element is HTML `<kbd>`, which "represents user input (typically keyboard input)" and has "No corresponding role" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd).

Not focusable; no keyboard interaction. Tab skips it. The shortcut itself is the app's: WAI-ARIA 1.2 "User agents MUST NOT change keyboard behavior in response to the aria-keyshortcuts attribute. Authors MUST handle scripted keyboard events to process aria-keyshortcuts." (https://www.w3.org/TR/wai-aria-1.2/#aria-keyshortcuts).

## Accessibility

- **In prose** (no control to describe): Kbd is read. Glyph keys render the glyph `aria-hidden` plus a visually hidden spoken name ("Command", "Shift", "Enter"…) from `labels`, because screen readers announce these symbols inconsistently (inference). `<kbd>` can't take `aria-label`: ARIA in HTML says "Naming Prohibited" for `kbd` (https://www.w3.org/TR/html-aria/), hence hidden text rather than a name.
- **Inside a control** (Button, IconButton, menu items, Tooltip content describing a trigger): pass `aria-hidden` (native attribute, forwarded to the Group). The control carries the shortcut in `aria-keyshortcuts` instead, so its name stays its label ("Publish", not "Publish Command Enter"). This is how the Button spec's Kbd hint works. Components that render Kbd themselves (Command's footer) pass `aria-hidden` for the consumer. DropdownMenu and ContextMenu have no Shortcut Part: the consumer passes the Kbd as an Item child with `aria-hidden` and sets `aria-keyshortcuts` on the Item, as with Button.
- **`aria-keyshortcuts` names what the app binds.** WAI-ARIA 1.2: "Indicates keyboard shortcuts that an author has implemented", "a space-separated list of keyboard shortcuts", and authors "MUST specify modifier keys exactly according to the UI Events KeyboardEvent key Values spec" ("Alt", "Control", "Shift", "Meta"). So `mod+enter` is `Meta+Enter` on Apple and `Control+Enter` elsewhere; an app that binds both everywhere writes `"Meta+Enter Control+Enter"`.
- Contrast: `kbd-text-color` is `color-text-subtle` on `kbd-background-color` (`color-surface-nested`), a pair the token build holds to 4.5:1. The hairline is decorative; the fill and text identify the key (brand book exemption for the subtle hairline).
- **More contrast:** `kbd-border-color` is `color-border-subtle`, which steps up to `color-border-default` under `(prefers-contrast: more)` (token media override).
- **Forced colors:** the fill is dropped and the border becomes the system text colour (`border-color` and `color` are on the "Properties Affected by Forced Colors Mode" list, https://www.w3.org/TR/css-color-adjust-1/), so each key stays a bordered box. No extra rule.
- **Reduced transparency:** not affected (no Material).

## RTL

The Group sets `dir="ltr"`, so keys keep their written order (⌘ then K) in both directions; arrow glyphs are never mirrored, because they name physical keys. Mantine's own demo wraps its key combination in `<div dir="ltr">` (https://mantine.dev/core/kbd/). Judgement call: a combination is read in keyboard order, not reading order (inference). Spacing inside the Group uses `gap` and logical padding only.

## Component tokens

All exist (ported from the source): `kbd-height`, `kbd-min-width`, `kbd-padding-inline`, `kbd-border-radius`, `kbd-font`, `kbd-font-variant-numeric`, `kbd-background-color`, `kbd-text-color`, `kbd-border-color`, `kbd-gap`.

No new tokens. The border widths use semantic `border-width-default` (sides, top) and `border-width-thick` (block end, the 2 px "physical key" edge) directly: the Dictionary has no word for one edge, and no app is expected to change them (design decision; a `kbd-border-width` token can be added if one is).

## Built-in labels

Spoken names for glyph keys, rendered as visually hidden text. English defaults, overridable per instance through `labels` or app-wide through the Provider's `locale` (spec #1).

| Key     | Label                                                | Default                                                  |
| ------- | ---------------------------------------------------- | -------------------------------------------------------- |
| ⌘       | `command`                                            | "Command"                                                |
| ⌃       | `control`                                            | "Control"                                                |
| ⇧       | `shift`                                              | "Shift"                                                  |
| ⌥       | `option`                                             | "Option"                                                 |
| ↵       | `enter`                                              | "Enter"                                                  |
| ⌫       | `backspace`                                          | "Backspace"                                              |
| ↑ ↓ ← → | `arrowUp` · `arrowDown` · `arrowLeft` · `arrowRight` | "Up arrow" · "Down arrow" · "Left arrow" · "Right arrow" |

Text keys (Ctrl, Shift, Alt, Esc, Tab, Space, letters) are read as written.

## Feedback events

None. Kbd is not interactive.

## Sources

- Source guide: artifact `project/components/Kbd/README.md` ("Shortcut hint for menus, tooltips, buttons and the command palette — shows the key, never replaces a visible label."; "`mod` resolves per platform (⌘ / Ctrl). Glyphs: ⇧ ⌥ ↵ ⌫ ↑ ↓."; "Group → one `<kbd>` per key. Bottom border is 2px to read as a physical key."; "Native `<kbd>`. Announced as text; pair with `aria-keyshortcuts` on the control it describes.").
- Spec #1: user story 56 ("shortcuts shown with ⌘, and Ctrl elsewhere"); "Kbd renders ⌘ on Apple platforms, Ctrl elsewhere."
- MDN `<kbd>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd
- MDN `Navigator.platform`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform
- MDN `Navigator.userAgentData`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
- MDN `Sec-CH-UA-Platform`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-CH-UA-Platform
- React `useSyncExternalStore`: https://react.dev/reference/react/useSyncExternalStore
- WAI-ARIA 1.2 `aria-keyshortcuts`: https://www.w3.org/TR/wai-aria-1.2/#aria-keyshortcuts
- ARIA in HTML: https://www.w3.org/TR/html-aria/
- APG pattern index: https://www.w3.org/WAI/ARIA/apg/patterns/
- Chakra Kbd: https://chakra-ui.com/docs/components/kbd
- Mantine Kbd: https://mantine.dev/core/kbd/ ; Mantine use-hotkeys: https://mantine.dev/hooks/use-hotkeys/
- shadcn/ui Kbd: https://ui.shadcn.com/docs/components/kbd
- Radix Themes Kbd: https://www.radix-ui.com/themes/docs/components/kbd
- CSS Color Adjustment Level 1: https://www.w3.org/TR/css-color-adjust-1/
