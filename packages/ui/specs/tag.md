# Tag

A static label for status, type or topic: "Draft", "Live", "Failed". It is never a button. To filter, use SegmentedControl or Checkbox; for a count, use a Badge; for a state marker in a dense list, use a StatusDot. Use one variant per meaning across the product.

```tsx
import { Tag } from "@platform/ui/tag";
import { CheckIcon } from "@platform/ui/icons/check";

<Tag>Draft</Tag>
<Tag variant="success"><CheckIcon data-icon="inline-start" /> Live</Tag>
<Tag variant="danger">Failed</Tag>
```

Status: draft for brand-owner review (phase 1). Source guide: `components/Tag/README.md` in the artifact.

## Anatomy

Container → leading icon (optional) → label.

- **Container.** A `<span>`, about 24 px tall: the 13 px label at line height 1.2 plus 4 px block padding. Radius 5 (`radius-xs`). Subtle fills only. The height is intrinsic and does not grow on coarse pointers, because a Tag is not a target (source: "does not grow on touch since tags are not interactive").
- **Icon** is a child, not a prop, marked `data-icon="inline-start"` (same convention as Button). It is decorative (`aria-hidden`) and takes the label colour (`currentColor`; brand book: icons take "the color of the text around it").
- **Label** is the children. The text wraps rather than truncates (see Behaviour).

## API

| Prop      | Type                                                          | Default     | Notes                                                         |
| --------- | ------------------------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `variant` | `"neutral" \| "accent" \| "success" \| "warning" \| "danger"` | `"neutral"` | Exposed as `data-variant`. The five the source tokens define. |
| …native   | `ComponentProps<"span">`                                      |             | `ref`, `className` and every native attribute pass through.   |

Names, checked against the reference libraries:

- **`Tag` as a static label**: Chakra "Used for categorizing or labeling content" (https://chakra-ui.com/docs/components/tag); Mantine's Badge "Display badge, pill or tag" (https://mantine.dev/core/badge/) and Pill "Removable and non-removable tags" (https://mantine.dev/core/pill/). In React Aria a tag is interactive: "A tag group is a focusable list of labels, categories, keywords, filters, or other items" (https://react-aria.adobe.com/TagGroup), with selection, removal and links. MUI's equivalent is Chip, "Chips are compact elements that represent an input, attribute, or action.", and "If the Chip is deletable or clickable then it is a button in tab order." (https://mui.com/material-ui/react-chip/). shadcn and Radix Themes have no Tag; their static label is `Badge` (see the Badge spec). Spec #1 keeps the source's `Tag`; its meaning here is Chakra's static Tag. **Judgement call:** if an interactive tag list is ever needed it becomes `TagGroup` (React Aria's name and APG grid/listbox behaviour) and never a mode of this component.
- **`variant`** with role values: Chakra uses `variant` for fill style ("`subtle`, `solid`, `outline`, `surface`") and `colorPalette` for hue; Radix Themes the same with `color`. The source has one fill style (subtle), so `variant` carries the Role, as on Button and Badge. The values are Dictionary Role/Variant words.
- **Icon as a child** instead of the source's `icon="check"` prop: Chakra composes it as a Part ("`Tag.StartElement`: an optional element at the start of the tag, typically an icon"); shadcn's `data-icon="inline-start"` convention keeps Tag single-part and the icon a Server Component (as on Button).
- **No close button, no `size`.** Chakra's `Tag.CloseTrigger` and sizes exist for interactive tags and dense layouts; the source has neither.

## States

| State | How it shows                   | Exposed as     |
| ----- | ------------------------------ | -------------- |
| rest  | Subtle Role fill and Role text | `data-variant` |

Tag is not interactive: no hover, press, focus or disabled state.

## Behaviour

- Text wraps inside the pill (`overflow-wrap: anywhere`) instead of overflowing, so a long label still reflows at 320 CSS px with no loss of content (WCAG 1.4.10: "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions"). Labels should be one or two words, so wrapping is the exception.
- Sentence case, a noun or past participle ("Draft", "Failed"), never a verb: a verb reads as an action.
- Server Component: no client code at all.

## Motion

None. A Tag swaps its label and variant instantly when status changes.

- **Reduced motion:** nothing to remove.
- **Instant exit:** Tag has no exit. A status change replaces text and fill in one frame; the new label names the new state, so nothing has to animate for it to read correctly.

## Keyboard

No APG pattern exists for a static tag (https://www.w3.org/WAI/ARIA/apg/patterns/ has none; the interactive React Aria TagGroup has no APG page either). The closest role is `generic`, WAI-ARIA 1.2: "A nameless container element that has no semantic meaning on its own." (https://www.w3.org/TR/wai-aria-1.2/#generic).

Not focusable; no keyboard interaction. Tab skips it.

## Accessibility

- The label is plain text in the reading order; screen readers read it with its neighbours ("Quarterly report, Draft"). No role, no `aria-label`.
- The icon is decorative and the label carries the meaning; colour is never the only signal (WCAG 1.4.1).
- Contrast: the source requires "text meets 4.5:1 on each". `text-{role}` on `background-{role}-subtle` (and `text-subtle` on `surface-nested`) are in the AA matrix.
- **More contrast:** text tokens already pass 4.5:1; no change. The fill is decorative.
- **Forced colors:** fills are removed (MDN forced-colors list: "`background-color`", https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors). Tag draws a 1 px transparent border at all times, which forced colors turns into a system colour (CSS Color Adjust 1, "its used value is instead forced to a system color", https://www.w3.org/TR/css-color-adjust-1/), so the pill outline stays.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only (`padding-inline`, `gap`). `data-icon="inline-start"` sits on the start side in both directions. No arrow keys.

## Component tokens

Existing: `tag-padding-block`, `tag-padding-inline`, `tag-gap`, `tag-border-radius`, `tag-font`, `tag-{neutral,accent,success,warning,danger}-background-color`, `tag-{neutral,accent,success,warning,danger}-text-color`.

Proposed new:

| Token           | References             | Why                                                                                                                    |
| --------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `tag-icon-size` | `size-icon-xs` (14 px) | The source shows an icon in a Tag but has no size token for it; 14 px fits the 13 px label without raising the height. |

The forced-colors border uses semantic `border-width-default` directly.

## Built-in labels

None. Every string in a Tag comes from its children.

## Feedback events

None. Tag is not interactive.

## Sources

- Source guide: artifact `project/components/Tag/README.md` ("Static label for status, type or topic; never a button — for filters use SegmentedControl or Checkbox."; "~24 tall … radius 5. Subtle fills only; text meets 4.5:1 on each.").
- WAI-ARIA APG pattern list: https://www.w3.org/WAI/ARIA/apg/patterns/
- WAI-ARIA 1.2 `generic`: https://www.w3.org/TR/wai-aria-1.2/#generic
- Chakra Tag: https://chakra-ui.com/docs/components/tag
- Mantine Badge and Pill: https://mantine.dev/core/badge/, https://mantine.dev/core/pill/
- React Aria TagGroup: https://react-aria.adobe.com/TagGroup
- MUI Chip: https://mui.com/material-ui/react-chip/
- shadcn/ui Badge: https://ui.shadcn.com/docs/components/badge
- MDN forced-colors: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors; CSS Color Adjust 1: https://www.w3.org/TR/css-color-adjust-1/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
