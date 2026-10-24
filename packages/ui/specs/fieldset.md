# Fieldset

Groups related controls under one caption (a postal address, notification settings, a set of checkboxes) and can disable them all at once. It is the native `<fieldset>` with its `<legend>`. For a single choice among options use RadioGroup, which is a fieldset of its own.

```tsx
import { Fieldset } from "@platform/ui/fieldset";
import { Switch } from "@platform/ui/switch";
import { TextField } from "@platform/ui/text-field";

<Fieldset.Root>
  <Fieldset.Legend>Notifications</Fieldset.Legend>
  <Switch name="mentions" defaultChecked>Mentions</Switch>
  <Switch name="digest">Weekly digest</Switch>
</Fieldset.Root>

<Fieldset.Root disabled={!canEditBilling}>
  <Fieldset.Legend>Billing address</Fieldset.Legend>
  <TextField label="Street" name="street" autoComplete="street-address" />
  <TextField label="City" name="city" autoComplete="address-level2" />
</Fieldset.Root>
```

Status: draft for brand-owner review (phase 2). No source guide; the source RadioGroup guide uses "`<fieldset>` + `<legend>`".

## Anatomy

Root → Legend → controls.

- **Root.** A native `<fieldset>`. The UA border, padding and margin are reset to none; children stack with `fieldset-gap` (8). No fill, no elevation (in-flow content, brand principle 5).
- **Legend.** A native `<legend>`, the first child of Root, in `fieldset-legend-font` (13/500, the field label type). It is the group's accessible name.

A Fieldset can contain Fields, TextFields, Checkboxes, Switches and other Fieldsets. A description or error for the whole group goes in a Field.Root wrapped around the Fieldset (Field contract); the Fieldset itself has no description Part (judgement call: Ark and Chakra add `HelperText`/`ErrorText` Parts, Base UI and shadcn do not).

## API

`Fieldset.Root`

| Prop       | Type                         | Default | Notes                                                                                                                               |
| ---------- | ---------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `disabled` | `boolean`                    | `false` | Native `disabled` on the `<fieldset>`: every control inside is disabled, unfocusable and left out of the submission. See Behaviour. |
| …native    | `ComponentProps<"fieldset">` |         | `ref`, `className`, `name`, `form` and every native attribute pass through.                                                         |

`Fieldset.Legend`: `ComponentProps<"legend">`.

Names, checked against the reference libraries:

- **`Fieldset.Root` / `Fieldset.Legend`**: Base UI "Groups a shared legend with related controls. Renders a `<fieldset>` element." with `Fieldset.Legend` (https://base-ui.com/react/components/fieldset); Ark `Fieldset.Root`, `Fieldset.Legend` (https://ark-ui.com/react/docs/components/fieldset); Chakra `Fieldset.Root`, `Fieldset.Legend` (https://chakra-ui.com/docs/components/fieldset); shadcn `FieldSet` "Container that renders a semantic `fieldset`" and `FieldLegend` (https://ui.shadcn.com/docs/components/field); Mantine `Fieldset` with a `legend` prop (https://mantine.dev/core/fieldset/). The component is `Fieldset` in four of five; Parts follow Radix's naming (`Root`) as spec #1 requires.
- **Legend renders `<legend>`, not a `<div>`.** Base UI's Legend "Renders a `<div>` element." The native element names the group with no script and no `aria-labelledby` (MDN: "The caption for the fieldset is given by the first legend element nested inside it."), so the platform wins (spec #1, "Behaviour comes from the platform first").
- **`disabled`**: Chakra "Use the `disabled` prop to disable the fieldset to disable all input elements within the fieldset."; Mantine "`disabled` prop disables all inputs and buttons inside the fieldset".

## States

| State    | How it shows                                                          | Exposed as                                 |
| -------- | --------------------------------------------------------------------- | ------------------------------------------ |
| rest     | Legend and controls                                                   | —                                          |
| disabled | Legend in `color-text-disabled`; each control shows its disabled look | native `disabled`, `:disabled` on controls |

## Behaviour

- **Native disabling.** This is the one place spec #1 allows native `disabled` ("`aria-disabled="true"` by default … native `disabled` only inside fieldsets"). HTML: "The disabled attribute, when specified, causes all the form control descendants of the fieldset element, excluding those that are descendants of the fieldset element's first legend element child, if any, to be disabled." MDN: "they are not editable and won't be submitted along with the form. They won't receive any browsing events, like mouse clicks or focus-related events." So a disabled Fieldset removes its controls from the tab order and from `FormData`, which a single `aria-disabled` control does not do. Use it when the whole group is unavailable and the Legend explains why; use per-control `disabled` (focusable) when one control needs to stay discoverable.
- Controls built on native elements (`input`, `select`, `textarea`, `button`) are disabled by the fieldset without any script. Every phase-2 control renders a native element, so all of them follow it. Their styles target `:disabled` as well as `[aria-disabled="true"]`.
- Server Component: no state or handlers. `Fieldset.Root` and `Fieldset.Legend` render plain elements.

## Motion

None.

- **Reduced motion:** nothing to remove.
- **Instant exit:** nothing exits.

## Keyboard

No pattern of its own. Tab moves through the controls inside in document order. A disabled Fieldset's controls are skipped (native), except any control inside the Legend.

## Accessibility

- Role `group`, named by the Legend (native). APG Switch: "The set is contained in an HTML fieldset and the label for the set is contained in an HTML legend element." APG Checkbox: "If a set of checkboxes is presented as a logical group with a visible label, the checkboxes are included in an element with role group that has the property aria-labelledby set to the ID of the element containing the label." The native pair gives both without ARIA.
- Screen readers announce the Legend when focus enters the group (inference from the group name; checked in the screen-reader pass).
- Disabled: pair with an explanation, for example in the Legend text or a description in a wrapping Field.
- **More contrast, reduced transparency:** not affected. **Forced colors:** text only; disabled controls use `GrayText` (each control's spec).

## RTL

Logical properties only; the Legend sits at the inline start. The UA's legend placement inside the border is reset with the border, so nothing depends on direction.

## Component tokens

New component word `fieldset` and element word `legend` (Dictionary change).

| Token                        | References           | Why                                       |
| ---------------------------- | -------------------- | ----------------------------------------- |
| `fieldset-gap`               | `space-stack-sm`     | Gap between the Legend and each control   |
| `fieldset-legend-font`       | `type-label-sm`      | The field label type (`input-label-font`) |
| `fieldset-legend-text-color` | `color-text-default` |                                           |

Disabled Legend text uses `color-text-disabled` directly.

## Built-in labels

None.

## Feedback events

None.

## Sources

- Source guide: artifact `project/components/RadioGroup/README.md` ("`<fieldset>` + `<legend>`").
- HTML Living Standard, the fieldset element: https://html.spec.whatwg.org/multipage/form-elements.html
- MDN `<fieldset>` (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset) and `<legend>` (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend).
- Baseline (webstatus.dev, 2026-10-24): `fieldset` widely available.
- WAI-ARIA APG Switch and Checkbox patterns: https://www.w3.org/WAI/ARIA/apg/patterns/switch/, https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
- Base UI Fieldset: https://base-ui.com/react/components/fieldset · Ark Fieldset: https://ark-ui.com/react/docs/components/fieldset · Chakra Fieldset: https://chakra-ui.com/docs/components/fieldset · shadcn Field: https://ui.shadcn.com/docs/components/field · Mantine Fieldset: https://mantine.dev/core/fieldset/
