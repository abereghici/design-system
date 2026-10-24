# Badge

A count or a very short status attached to another element: a tab, a nav item, an icon button. Use it for numbers ("3", "99+") and single-glyph marks ("!"). For a static label about status, type or topic ("Draft", "Live"), use a Tag. For a state marker in a dense list, use a StatusDot.

```tsx
import { Badge } from "@platform/ui/badge";

<a href="/inbox" aria-label="Inbox, 3 unread">
  Inbox <Badge>{3}</Badge>
</a>
<Badge variant="accent">{12}</Badge>
<Badge variant="danger" max={99}>{1280}</Badge>   {/* renders "99+" */}
<Badge variant="danger">!</Badge>
```

Status: draft for brand-owner review (phase 1). Source guide: `components/Badge/README.md` in the artifact.

## Anatomy

Container → content.

- **Container.** A `<span>`, a 16 px tall pill (`radius-full`), min-width 16 so a single digit is a circle. Neutral is a nested-surface fill; accent and danger are bold fills.
- **Content.** Tabular figures (`type-data-sm`, `font-variant-numeric: tabular-nums`), so a changing count doesn't jiggle. A number is formatted and capped (see API); a string is rendered as given.

## API

| Prop       | Type                                     | Default                              | Notes                                                                                                                  |
| ---------- | ---------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `variant`  | `"neutral" \| "accent" \| "danger"`      | `"neutral"`                          | Exposed as `data-variant`. The three the source tokens define.                                                         |
| `max`      | `number`                                 | `99`                                 | Applies only when `children` is a number. A count above `max` renders `max` formatted plus the overflow label ("99+"). |
| `labels`   | `{ overflow?: (max: string) => string }` | `{ overflow: (max) => \`${max}+\` }` | The only built-in string. `max` arrives already formatted.                                                             |
| `children` | `number \| string`                       |                                      | A number is formatted with `Intl.NumberFormat` in the current locale.                                                  |
| …native    | `ComponentProps<"span">`                 |                                      | `ref`, `className` and every native attribute pass through.                                                            |

Names, checked against the reference libraries:

- **`Badge` for a count** follows MUI, where Badge is the count attached to another element: "`max` … Max count to show." (https://mui.com/material-ui/api/badge/). Elsewhere `Badge` is a static label: shadcn "Displays a badge or a component that looks like a badge." (https://ui.shadcn.com/docs/components/badge), Radix Themes "Stylized badge element." (https://www.radix-ui.com/themes/docs/components/badge), Chakra "Used to highlight an item's status for quick recognition." (https://chakra-ui.com/docs/components/badge), Mantine "Display badge, pill or tag" (https://mantine.dev/core/badge/). Mantine names the count-on-a-corner component Indicator: "Display element at the corner of another element" (https://mantine.dev/core/indicator/). Base UI and React Aria have no Badge (Base UI's component list: https://base-ui.com/llms.txt; React Aria's TagGroup page names none). Spec #1 keeps both Badge and Tag from the source, so Badge is the count (MUI's meaning) and Tag is the static label (Chakra's `Tag`, "Used for categorizing or labeling content", https://chakra-ui.com/docs/components/tag). **Judgement call for the brand owner:** a consumer coming from shadcn or Radix Themes will reach for `Badge` to write "Draft"; the Tag spec's docs page must cross-link.
- **`max`**: MUI "`max` … Max count to show.", type `number`, default `99` (https://mui.com/material-ui/api/badge/); MUI guide "Use the `max` prop to cap large numeric values." (https://mui.com/material-ui/react-badge/). Mantine calls it `maxValue`: "Set `maxValue` prop to display `{maxValue}+` when the label exceeds the maximum value." (https://mantine.dev/core/indicator/). We take MUI's name and default, which match the source's "Cap at "99+"".
- **Content as `children`**, not MUI's `badgeContent` ("The content rendered within the badge.") or Mantine's `label`: our Badge is placed next to its owner, not wrapped around it (the source places it inside the tab or nav item), so the content is the element's own children.
- **No `showZero` / `invisible`.** MUI hides at zero by default ("The badge hides automatically when `badgeContent` is zero."). Our Badge doesn't wrap its owner, so the consumer simply doesn't render it; no prop needed.
- **No `size`.** The source has one size (16 tall). Chakra and Mantine offer sizes; nothing in the source needs them.

## States

| State    | How it shows             | Exposed as                                             |
| -------- | ------------------------ | ------------------------------------------------------ |
| rest     | Variant fill and text    | `data-variant`                                         |
| overflow | `max` formatted plus "+" | `data-overflow` (present when the count exceeds `max`) |

Badge is not interactive: no hover, press, focus or disabled state.

## Behaviour

- Number formatting: `new Intl.NumberFormat(locale).format(n)`. MDN: "The `Intl.NumberFormat` object enables language-sensitive number formatting." (Baseline widely available, "since September 2017"). So 1 280 in `de` reads "1.280" and `max` 1000 overflows to "1.000+".
- **Locale on the server.** Badge must work as a Server Component (spec #1 user story 4), but the locale comes from the client `LocaleProvider` (or `document.documentElement.lang`). The Badge root is server-safe; when `children` is a number it renders a tiny `'use client'` leaf that reads the locale and `labels.overflow` from `LocaleProvider` and formats. A string child needs no client code. (Design decision; the leaf is also what Meter, Progress and any other server-rendered `Intl` output should share.)
- Negative numbers and non-integers are rendered as formatted; `max` caps only from above.
- Content stays short: one to four characters. A word belongs in a Tag.

## Motion

None. A count change swaps the text instantly; it is a high-frequency change, and the brand book says "No motion on keyboard-initiated or high-frequency (100+ per day) actions".

- **Reduced motion:** nothing to remove.
- **Instant exit:** Badge has no exit animation. When the count drops to zero the consumer stops rendering it, and it disappears in one frame, which reads as "nothing left" with no transition to cut short.

## Keyboard

No APG pattern exists for a badge (the APG pattern list, https://www.w3.org/WAI/ARIA/apg/patterns/, has none). The closest role is `generic`, WAI-ARIA 1.2: "A nameless container element that has no semantic meaning on its own." (https://www.w3.org/TR/wai-aria-1.2/#generic). A `<span>` has it implicitly.

Not focusable; no keyboard interaction. Tab skips it; focus lands on the owning link or button.

## Accessibility

- The count belongs in the owner's accessible name. Source: "Screen readers: include the count in the parent's label ("Inbox, 3 unread")." MUI: "its meaning should be part of that element's accessible name" with the example `aria-label="Inbox, 4 unread messages"` (https://mui.com/material-ui/react-badge/).
- With no `aria-label` on the owner, the Badge text joins the owner's name ("Inbox 3"). That is acceptable for small counts, but "99+" and "!" don't say what they count, so the docs show `aria-label` on the owner as the default recipe, with the exact count ("Inbox, 1 280 unread"), not the capped one.
- Not a live region. `role="status"` would announce every count change, which is noise for a count the user isn't watching (inference). A count that must be announced belongs in a Toast.
- Not colour alone: the count or glyph carries the meaning; the fill only adds emphasis (WCAG 1.4.1: "Color is not used as the only visual means of conveying information").
- Contrast: `on-accent` / `on-danger` on their bold fills and `text-subtle` on `surface-nested` are in the AA matrix (`packages/tokens/src/contrast.ts`).
- **More contrast:** text tokens already pass 4.5:1; no change. The pill shape is decorative.
- **Forced colors:** fills are removed ("`background-color`" is in the forced list, MDN https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors). Badge draws a 1 px transparent border at all times (inside its height), which forced colors turns into a visible system colour (CSS Color Adjust: "if its computed value is a color other than a system color, its used value is instead forced to a system color", https://www.w3.org/TR/css-color-adjust-1/), so the pill outline stays.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only (`padding-inline`, `min-inline-size`). The "+" placement comes from `labels.overflow`, so a locale that writes it first can override it. Digits follow the locale's numbering system through `Intl.NumberFormat`. No arrow keys.

## Component tokens

All exist (`packages/tokens/src/tokens/component.tokens.json`): `badge-height`, `badge-min-width`, `badge-padding-inline`, `badge-border-radius`, `badge-font`, `badge-font-variant-numeric`, `badge-{neutral,accent,danger}-background-color`, `badge-{neutral,accent,danger}-text-color`.

No new tokens. The transparent forced-colors border uses semantic `border-width-default` directly.

## Built-in labels

| Key        | Default                | Used for                                              |
| ---------- | ---------------------- | ----------------------------------------------------- |
| `overflow` | `(max) => \`${max}+\`` | The capped count ("99+"). `max` is already formatted. |

## Feedback events

None. Badge is not interactive and never appears on its own initiative.

## Sources

- Source guide: artifact `project/components/Badge/README.md` ("16 tall pill, tabular figures. Cap at "99+". Screen readers: include the count in the parent's label ("Inbox, 3 unread").").
- WAI-ARIA APG pattern list (no badge pattern): https://www.w3.org/WAI/ARIA/apg/patterns/
- WAI-ARIA 1.2 `generic`: https://www.w3.org/TR/wai-aria-1.2/#generic
- MUI Badge API and guide: https://mui.com/material-ui/api/badge/, https://mui.com/material-ui/react-badge/
- Mantine Badge and Indicator: https://mantine.dev/core/badge/, https://mantine.dev/core/indicator/
- shadcn/ui Badge: https://ui.shadcn.com/docs/components/badge
- Radix Themes Badge: https://www.radix-ui.com/themes/docs/components/badge
- Chakra Badge and Tag: https://chakra-ui.com/docs/components/badge, https://chakra-ui.com/docs/components/tag
- Base UI component list: https://base-ui.com/llms.txt
- MDN `Intl.NumberFormat`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- MDN forced-colors: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors; CSS Color Adjust 1: https://www.w3.org/TR/css-color-adjust-1/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
