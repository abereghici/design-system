# Text

Sets a run of text in one of the system's type roles: body for reading, label for control text, data for tabular figures, code, overline for group labels, and display for a serif statement. Use it when plain inherited body text isn't enough. For a section title use Heading, for a keyboard key use Kbd, and for a link use Link.

```tsx
import { Text } from "@platform/ui/text";

<Text>Invoices are sent on the first working day of the month.</Text>
<Text variant="body" size="sm" color="subtle">Last synced 2 minutes ago</Text>
<Text variant="overline" as="span">Recent</Text>
<Text variant="data" as="span">1,204.50</Text>
<Text variant="code">pnpm build</Text>
<Text variant="display">Quiet tools for loud work.</Text>
```

Status: draft for brand-owner review (phase 1). No source guide: drafted from the brand book's Typography section ("Set text by its role (heading, body, label, data, code) so size, weight and line height stay in sync.") and the reference libraries.

## Anatomy

One element (`<p>` by default, `<code>` for `variant="code"`). Its type comes from one semantic type role. No margins.

## API

| Prop      | Type                                                               | Default                              | Notes                                                                                                            |
| --------- | ------------------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `variant` | `"body" \| "label" \| "data" \| "code" \| "overline" \| "display"` | `"body"`                             | The type role. Exposed as `data-variant`.                                                                        |
| `size`    | depends on `variant` (below)                                       | `"md"`, or the role's only size      | Exposed as `data-size`. Maps to `type-{variant}-{size}`.                                                         |
| `color`   | `"default" \| "subtle" \| "subtlest"`                              | `"default"`                          | Exposed as `data-color`. Maps to `color-text-{…}`. Replaces the legacy HTML `color` attribute in the props type. |
| `as`      | `"p" \| "span" \| "div" \| "label" \| "code"`                      | `"p"`; `"code"` for `variant="code"` | Purely semantic.                                                                                                 |
| …native   | `ComponentProps<"p">` (minus `color`)                              |                                      | `ref`, `className`, `htmlFor` (with `as="label"`) and every native attribute pass through.                       |

`variant` and `size` form one discriminated union, so only sizes that exist as semantic tokens can be written:

| `variant`  | `size`                    | Token              |
| ---------- | ------------------------- | ------------------ |
| `body`     | `xs` · `sm` · `md` · `lg` | `type-body-*`      |
| `label`    | `sm` · `md` · `lg`        | `type-label-*`     |
| `data`     | `sm` · `md`               | `type-data-*`      |
| `code`     | `md`                      | `type-code-md`     |
| `overline` | `sm`                      | `type-overline-sm` |
| `display`  | `md`                      | `type-display-md`  |

`kbd` and `heading` roles are not offered: they belong to Kbd and Heading.

Names, checked against the reference libraries:

- **`Text`**: Radix Themes, Chakra and Mantine use `Text`; MUI uses `Typography`. `Text` is the majority name.
- **`variant`** for the type role: MUI "The Typography component uses the `variantMapping` prop to associate a UI variant with a semantic element." and its variants include "h1 … body1, body2, button, caption, and overline" (https://mui.com/material-ui/react-typography/). Radix Themes and Mantine offer only `size`; Chakra uses `textStyle`: "Use the `fontSize` or `textStyle` prop to change the size of the text." (https://chakra-ui.com/docs/components/text). Our type roles differ in family, weight and figure style, not only size, so a size alone can't name them. MUI's `variant` is the one library name for that axis. The values are the Dictionary's type categories.
- **`size`**: Radix Themes "`size` | `Responsive<enum>`" (https://www.radix-ui.com/themes/docs/components/text); Mantine `<Text size="xs">` with `xs`–`xl` (https://mantine.dev/core/text/). The values are the Dictionary's size words.
- **`color`**: Radix Themes "`color` | `enum`"; Mantine `c` (`"dimmed"`, `"teal.4"`). We take Radix's name. The values are the neutral text Emphasis steps, not Roles: status colour on loose text would carry meaning by colour alone, and status text belongs to Alert and the form Field.
- **`as`**: Radix Themes "`as` | `"span" | "div" | "label" | "p"` | `"span"`" and "This prop is purely semantic and does not alter visual appearance." Mantine: "its default root element is `p`" and changes it with `component`. The default is `p`, as in Mantine (and MUI's `body1`), because Text most often sets a paragraph. `code` is added so the code role renders a `<code>` element.
- **No `weight`.** Radix ("`weight` | `"light" | "regular" | "medium" | "bold"`") and Mantine (`fw`) have one. The brand book fixes weight per role ("Two weights. Regular for reading, medium for headings, labels and emphasis."), and medium text is a `label` role or a `<strong>` child.
- **No `truncate`, `lineClamp`, `align`, `trim`, `wrap` or `asChild`.** Radix, Mantine and Chakra document truncation ("Set the `truncate` prop to add `text-overflow: ellipsis` styles.", Mantine). Truncation hides content when text is resized to 200% or reflowed at 320 px (brand book Accessibility: "no loss of content"), so it is not offered as a one-word prop. `className` covers the rare case.

## States

| State | How it shows                              | Exposed as                                |
| ----- | ----------------------------------------- | ----------------------------------------- |
| rest  | The role's type in the chosen text colour | `data-variant`, `data-size`, `data-color` |

No interactive states.

## Behaviour

- CSS per role: `font: var(--ab-type-{variant}-{size}); letter-spacing: var(--ab-type-{variant}-{size}-letter-spacing)`. The `font` shorthand can't set letter spacing, so the tokens package keeps it as its own token (tokens README, "Value types"). The roles that have them also set `font-variant-numeric: var(--ab-type-data-{size}-font-variant-numeric)` (data) and `font-variant-numeric` plus `text-transform: var(--ab-type-overline-sm-text-transform)` (overline).
- Wrapping: Text sets nothing. The opt-in base stylesheet (spec #1 user story 17) applies `text-wrap: pretty` to body copy. `text-wrap-pretty` is Baseline "limited" (Chrome 117, Safari 26, no Firefox; https://api.webstatus.dev/v1/features/text-wrap-pretty), below ADR-0002's floor, so no component depends on it. Where it is missing, text wraps normally, which is correct. Radix Themes says the same of its `wrap="pretty"`: it is experimental and best used as a progressive enhancement.
- `body-lg` and `display-md` are fluid (`font-size-19-21`, `-24-26`).
- Server Component: no state, no handlers, no `'use client'` (spec #1 user story 4).

## Motion

None. Text never animates.

- **Reduced motion:** nothing to reduce.
- **Instant exit:** Text has no exit. A text change is instant, as for any static text.

## Keyboard

APG pattern: **none.** The APG pattern index (https://www.w3.org/WAI/ARIA/apg/patterns/) has no text or paragraph pattern. The element is HTML `<p>` (or `<span>`, `<div>`, `<label>`, `<code>`), with its native semantics.

Not focusable; no keyboard interaction. `as="label"` with `htmlFor` gives the label's native behaviour: activating it moves focus to its control.

## Accessibility

- Semantics come from the element only; Text adds no role.
- `color="subtlest"` is the lowest text Emphasis that still passes AA (Dictionary: "Lowest contrast that passes AA"), checked on every surface in every Theme by the tokens build. Don't use it for text a user needs in order to act.
- Overline is uppercased by CSS (`text-transform`), so screen readers read the source casing. Write the source in sentence case.
- **More contrast:** `color-text-subtlest` steps up to `color-text-subtle` under `(prefers-contrast: more)` (token media override). Default and subtle are unchanged.
- **Forced colors:** text colour is forced to `CanvasText` by the browser; nothing to redraw.
- **Reduced transparency:** not affected (no Material).

## RTL

Direction and alignment follow `dir` from the document; alignment is `text-align: start`. Numbers in `data` follow the Unicode bidi algorithm; format them with `Intl.NumberFormat` before passing them in (spec #1: "`Intl.*` for all formatting"). `code` is usually left-to-right content inside right-to-left text: the consumer sets `dir="ltr"` on it.

## Component tokens

None. Text maps each prop value to one semantic token (`type-*`, `color-text-*`), which the ui-scaffold rules allow ("only `--ab-*` semantic or component tokens"). Component tokens would repeat the type roles one-to-one (`text-body-md-font = {semantic.type-body-md}`) with nothing to override that the semantic tier doesn't already own. The word `text` is also already a Dictionary property word (`text-color`), so `text-text-color` would be a confusing name.

No new Dictionary words.

## Built-in labels

None. Every string comes from the children.

## Feedback events

None. Text isn't interactive.

## Sources

- Brand book (artifact `project/README.md`), Typography: "Roles, not sizes."; "Two weights."; Accessibility: "Text resizes to 200% and reflows at 320 CSS px with no loss of content."
- Tokens README, "Value types" (typography and letter spacing): `packages/tokens/README.md`
- webstatus.dev `text-wrap-pretty`: https://api.webstatus.dev/v1/features/text-wrap-pretty
- WAI-ARIA APG pattern index: https://www.w3.org/WAI/ARIA/apg/patterns/
- Radix Themes Text: https://www.radix-ui.com/themes/docs/components/text
- Mantine Text: https://mantine.dev/core/text/
- Chakra Text: https://chakra-ui.com/docs/components/text
- MUI Typography: https://mui.com/material-ui/react-typography/
