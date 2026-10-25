# StatusDot

A tiny state marker for dense lists and tables: "● Operational". It always sits beside a text label, because colour is never the only signal. For a labelled status pill, use a Tag; for a count, use a Badge.

```tsx
import { StatusDot } from "@platform/ui/status-dot";

<span><StatusDot variant="success" /> Operational</span>
<span><StatusDot variant="warning" /> Degraded</span>
<span><StatusDot /> Unknown</span>
```

Status: draft for brand-owner review (phase 1). Source guide: `components/StatusDot/README.md` in the artifact.

## Anatomy

One element: a `<span>` dot, 6 px (`size-indicator`), circular, vertically centred on the text beside it (`vertical-align: middle`, inline-block).

- **success, warning, danger** are filled with the Role's icon colour.
- **neutral** is a hollow ring, so "unknown / idle" stays distinguishable without colour (source; WCAG 1.4.1).

## API

| Prop      | Type                                              | Default     | Notes                                                         |
| --------- | ------------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `variant` | `"neutral" \| "success" \| "warning" \| "danger"` | `"neutral"` | Exposed as `data-variant`. The four the source tokens define. |
| …native   | `ComponentProps<"span">`                          |             | `ref`, `className` and native attributes pass through.        |

Names, checked against the reference libraries:

- **`StatusDot`**: spec #1, "StatusDot keeps its name." Chakra's equivalent is Status, "Used to indicate the status of a process or state", with Parts `Status.Root` and `Status.Indicator` (https://chakra-ui.com/docs/components/status). MUI expresses it as a Badge variant: "Use `variant="dot"` for a compact status indicator without a count." (https://mui.com/material-ui/react-badge/). Radix, shadcn, React Aria, Base UI and Mantine document no status dot (Base UI list: https://base-ui.com/llms.txt). No name has a majority, so the source name stays.
- **Single part, no label Part.** Chakra's `Status.Root` wraps the text; the source keeps the label as the consumer's own text beside the dot, which keeps StatusDot a one-element Server Component.
- **`variant`** with Role values (as Badge and Tag). Chakra uses `colorPalette`; the Dictionary's Variant words keep the set closed. No `accent`: a status is an outcome, and the source defines no accent dot.
- **No `size`.** Chakra has `sm | md | lg`; the source has one size.

## States

| State                      | How it shows                 | Exposed as               |
| -------------------------- | ---------------------------- | ------------------------ |
| neutral                    | Hollow ring, `icon-subtlest` | `data-variant="neutral"` |
| success / warning / danger | Solid dot, `icon-{role}`     | `data-variant`           |

Not interactive: no hover, press, focus or disabled state.

## Behaviour

- Decorative: rendered `aria-hidden="true"`. The text label beside it carries the state.
- Server Component: no client code.
- Pulsing or "processing" animation is out of scope: the source has none, and a looping animation in a dense list is the high-frequency motion the brand book rules out.

## Motion

None. A variant change swaps the fill in one frame.

- **Reduced motion:** nothing to remove.
- **Instant exit:** StatusDot never exits on its own. When the status changes, the label text changes with it, so the instant colour swap reads correctly: the words, not the dot, announce the change.

## Keyboard

No APG pattern exists for a status indicator (https://www.w3.org/WAI/ARIA/apg/patterns/). The dot is hidden from the accessibility tree: MDN, "The `aria-hidden` attribute can be used to hide non-interactive content from the accessibility API." (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden). Its label is plain text (`generic`).

Not focusable; no keyboard interaction.

## Accessibility

- Source: "colour is never the only signal — always beside a text label." WCAG 1.4.1: "Color is not used as the only visual means of conveying information" (https://www.w3.org/TR/WCAG22/). The docs page shows the dot only with a label; a dot alone fails the requirement.
- The neutral ring differs by shape, not only colour, so idle/unknown reads apart from the filled states even in greyscale.
- Contrast: `icon-subtlest`, `icon-success`, `icon-warning`, `icon-danger` are icon roles in the AA matrix (3:1).
- **More contrast:** `color-icon-subtlest` steps up to `color-icon-subtle` under `(prefers-contrast: more)` (token media override), so the neutral ring darkens. Filled dots already pass.
- **Forced colors:** `background-color` and `border-color` are forced (MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors), so a filled dot would vanish into `Canvas` and the statuses would look alike. The dot sets `forced-color-adjust: none` and keeps its status colours, as the artifact's adaptive.css does (`.ab-status-dot{forced-color-adjust:none}`); the label still carries the state.
- **Reduced transparency:** not affected.

## RTL

No direction-dependent layout: the consumer places the dot before the label in source order, so it sits at the start in both directions. Spacing to the label uses `margin-inline-end`.

## Component tokens

Existing: `status-dot-size`, `status-dot-neutral-border-color`, `status-dot-success-background-color`, `status-dot-warning-background-color`, `status-dot-danger-background-color`.

Proposed new:

| Token                     | References                    | Why                                                                                                     |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `status-dot-border-width` | `border-width-default` (1 px) | The ring thickness of the neutral dot is a visual decision an app may tune; no existing token holds it. |

## Author-written text

None. StatusDot has no text.

## Feedback events

None.

## Sources

- Source guide: artifact `project/components/StatusDot/README.md` ("Tiny state marker in dense lists; colour is never the only signal — always beside a text label."; "Neutral is a hollow ring, so "unknown/idle" stays distinguishable without colour (WCAG 1.4.1).").
- WAI-ARIA APG pattern list: https://www.w3.org/WAI/ARIA/apg/patterns/
- MDN `aria-hidden`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden
- Chakra Status: https://chakra-ui.com/docs/components/status
- MUI Badge (dot): https://mui.com/material-ui/react-badge/
- Base UI component list: https://base-ui.com/llms.txt
- MDN forced-colors: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors; CSS Color Adjust 1: https://www.w3.org/TR/css-color-adjust-1/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
