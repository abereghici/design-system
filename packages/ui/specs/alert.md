# Alert

An inline message about the page or a task, in the flow of content: "Your trial ends in 3 days", "Couldn't save: the file is read-only". Use it for information that stays relevant until the situation changes. For brief, non-blocking confirmation of something the user just did, use a Toast; for a decision that must interrupt, use an AlertDialog. An Alert is not a Floating layer.

```tsx
import { Alert } from "@platform/ui/alert";
import { Link } from "@platform/ui/link";

<Alert.Root variant="warning">
  <Alert.Title>Your trial ends in 3 days</Alert.Title>
  <Alert.Description>
    Add a payment method to keep your projects. <Link href="/billing">Go to billing</Link>
  </Alert.Description>
</Alert.Root>

// Inserted after a failed submit: urgent, so it is announced.
<Alert.Root variant="danger" role="alert">
  <Alert.Title>Couldn't save changes</Alert.Title>
  <Alert.Description>The file is read-only. Duplicate it to edit.</Alert.Description>
  <Alert.Close onClick={() => setShowError(false)} />
</Alert.Root>
```

Status: draft for brand-owner review (phase 1). Source guide: none. Drafted from the brand principles, the Toast guide (`components/Toast/README.md`, its nearest relative) and the reference libraries.

## Anatomy

Root → status icon → Title (optional) + Description (optional) → Close (optional).

- **Root.** A `<div>` laid out as a grid: icon column, text column, close column. Radius 12, padding 12, a subtle fill per Variant. No elevation and no Material: the brand's principle 5 is "Flat in flow, lifted when floating. In-flow content separates with space, hairlines and surface steps. Only floating layers (menus, popovers, toasts, dialogs) get elevation and material."
- **Status icon.** Rendered by Root from `variant`, decorative (`aria-hidden`): `info` for neutral, `check-circle` for success, `warning` for warning, `danger` for danger (glyphs from the icon set; the info and warning glyphs carry the bob diamond, the one motif on this surface). Not a Part and not replaceable in phase 1.
- **Title.** A `<div>` in label type. Not a heading: an Alert is a message, not a section of the outline (design decision; shadcn and Chakra also render a `div`, see API).
- **Description.** A `<div>` in body type. May hold Links, inline code or a short list.
- **Close.** A native `<button>` with the `x` icon, drawn with IconButton's sm tokens (`icon-button-*`), at the inline end of the first row. It is not an IconButton instance, so one press dispatches only `ab-dismiss`. The only interactive Part.

At least one of Title or Description is required. There is no Action Part: an action is a Link or Button inside Description (shadcn's `AlertAction` is the only reference Part for it; deferred until a product needs it).

## API

`Alert.Root`

| Prop      | Type                                              | Default     | Notes                                                                                                                 |
| --------- | ------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| `variant` | `"neutral" \| "success" \| "warning" \| "danger"` | `"neutral"` | Exposed as `data-variant`. Sets the fill and the status icon.                                                         |
| `role`    | native (`"alert"` \| `"status"` \| none)          | none        | Not set by default. Pass `"alert"` only for an urgent message inserted after the page has loaded (see Accessibility). |
| …native   | `ComponentProps<"div">`                           |             | `ref`, `className` and every native attribute pass through.                                                           |

`Alert.Title`, `Alert.Description`: `ComponentProps<"div">`, passed through.

`Alert.Close`

| Prop      | Type                       | Default                | Notes                                                                     |
| --------- | -------------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `labels`  | `{ close?: string }`       | `{ close: "Dismiss" }` | The button's accessible name. Falls back to LocaleProvider, then English. |
| `onClick` | native                     |                        | The app removes the Alert here. Alert has no open state of its own.       |
| …native   | `ComponentProps<"button">` |                        | `ref`, `className`, `disabled` (as `aria-disabled`, per IconButton).      |

Names, checked against the reference libraries:

- **Component name `Alert`**: shadcn exports "`Alert`, `AlertAction`, `AlertDescription`, and `AlertTitle`" (https://ui.shadcn.com/docs/components/alert); Chakra `Alert.Root` (https://chakra-ui.com/docs/components/alert); MUI "Alerts give users brief and potentially time-sensitive information in an unobtrusive manner." (https://mui.com/material-ui/react-alert/); Mantine Alert (https://mantine.dev/core/alert/). Radix Themes calls it Callout (`Callout.Root`, `Callout.Icon`, `Callout.Text`, https://www.radix-ui.com/themes/docs/components/callout). React Aria, Base UI and Ark document no inline alert (not found in their component lists: https://react-aria.adobe.com/, https://base-ui.com/llms.txt — "Alert Dialog" and "Toast" only, https://ark-ui.com/llms.txt). Four of five libraries that have the component say Alert.
- **Parts `Root`, `Title`, `Description`**: Chakra's usage snippet composes `<Alert.Root>`, `<Alert.Indicator />`, `<Alert.Content>`, `<Alert.Title />`, `<Alert.Description />`; shadcn `AlertTitle`, `AlertDescription`. Radix's own Part words match: Dialog "Title: An accessible title…", "Description: An optional accessible description…" (https://www.radix-ui.com/primitives/docs/components/dialog). Chakra's `Content` wrapper is not needed because Root's grid places Title and Description in the text column (shadcn's source does the same: `col-start-2` on both, https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/alert.tsx). Chakra's `Indicator` renders the status icon from `status`; we draw it from Root instead, so Root, Title and Description stay Server Components with no shared context (judgement call).
- **Part `Close`**: Radix "Close: The button that closes the dialog." (Dialog). Chakra composes "the `Alert` with a close button"; MUI "When provided and no `action` prop is set, a close icon button is displayed"; Mantine `withCloseButton`. A Part follows the namespaced-Parts rule instead of MUI's `onClose` or Mantine's boolean.
- **`variant`**: shadcn "`"default" | "destructive"`"; Chakra `status` "`'info' | 'warning' | 'success' | 'error' | 'neutral'`" with `variant` for the visual style ("`'subtle' | 'surface' | 'outline' | 'solid'`"); MUI `severity` "The severity of the alert. This defines the color and icon used."; Mantine and Radix Themes `color`. No name has a majority. We take shadcn's `variant`, because there is only one axis here, the UI glossary defines Variant as "One of a component's enumerated visual treatments", and the source Toast already uses `variant: 'danger'`. The values come from the Dictionary's Role words (`neutral · success · warning · danger`), not Chakra's `info`/`error`, as in the Toast tokens (`toast-neutral-icon-color`, `toast-danger-…`). No `accent` Variant: the Dictionary reserves Accent for "The single brand action color".
- **`role` passthrough, no default**: MUI and Mantine default to `role="alert"` (MUI "By default, the Alert renders an element with the `role="alert"`"; Mantine "Root element role set to `alert`."), and shadcn hard-codes it. Radix Themes leaves it to the consumer: "Add a native WAI-ARIA alert role to the callout when the user's immediate attention is required". We follow Radix Themes, because MDN says the role "should not be used on HTML that the user hasn't interacted with" (see Accessibility).
- **`labels.close`**: MUI `closeText` "Override the default label for the _close popup_ icon button."; Mantine "Set `closeButtonLabel` prop to make close button accessible." Spec #1 replaces per-string props with the typed `labels` prop. The default "Dismiss" is the source Toast guide's word for the same control ("**Dismiss** recedes until the toast is hovered").

## States

| State                      | How it shows                                                           | Exposed as                |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------- |
| neutral                    | `surface-raised` fill, accent info icon                                | `data-variant="neutral"`  |
| success / warning / danger | The Role's `subtle` fill and icon colour; a distinct glyph per Variant | `data-variant`            |
| dismissible                | Close shown at the inline end                                          | Presence of `Alert.Close` |
| Close states               | IconButton's (hovered, pressed, focus-visible, disabled)               | IconButton's              |

## Behaviour

- Alert never hides itself. `Alert.Close` calls the consumer's `onClick`, then dispatches `ab-dismiss`; the app removes the Alert (MUI and Mantine work the same way with `onClose`). There is no `open`/`onOpenChange` pair in phase 1, so Root has no state.
- Never auto-dismissed. APG: "It is also important to avoid designing alerts that disappear automatically."
- Focus on dismiss: when the focused Close button unmounts, focus falls to `<body>`. The app moves focus to the next logical element (the heading or field the Alert was about) in the same handler. Inference from WCAG 2.4.3 Focus Order; documented on the docs page with an example.
- Copy states the status in words. The Title names the situation ("Couldn't save changes", not "Error"), so the message reads without the colour or icon.
- Server Components: `Alert.Root`, `Alert.Title` and `Alert.Description` have no handlers or state and are Server Components. `Alert.Close` is a `'use client'` leaf. The namespace is a directive-free `index.ts` (`export * as Alert from "./alert.tsx"`), per the UI scaffold.
- Width: fills its container; text wraps. Long words break (`overflow-wrap: anywhere` on the text column).

## Motion

None. An Alert is in-flow content: animating its appearance would move the content below it over time (inference from the brand's "Purposeful motion"). It appears and disappears in one frame.

- **Reduced motion:** nothing to remove. Close keeps IconButton's press behaviour, which already resolves `motion-scale-pressed` to `scale-100`.
- **Instant exit:** the exit is always instant. It reads as correct because the app removes the element and moves focus in the same update: the content below closes the gap in one frame and nothing is left half-drawn.

## Keyboard

APG pattern: **Alert** (https://www.w3.org/WAI/ARIA/apg/patterns/alert/). Keyboard interaction: "Not applicable." APG: "it is crucial they do not affect keyboard focus".

| Key                      | Action                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Tab / Shift+Tab          | Moves to / from Close and to any Link or Button inside Description. Root, Title and Description are not focusable. |
| Space / Enter (on Close) | APG Button: "Activates the button." Dismisses.                                                                     |

Alert never moves focus when it appears. There is no Escape binding: Escape belongs to Floating layers ("Esc closes only the topmost popover or dialog").

## Accessibility

- **Role.** No role by default: a message rendered with the page is ordinary content, read in order. APG: "screen readers do not inform users of alerts that are present on the page before page load completes." MDN: "The most important thing to know about the `alert` role is that it's for content that is dynamically displayed, not for content that appears on page load." and "It should not be used on HTML that the user hasn't interacted with." (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role).
- **`role="alert"`** when the app inserts an urgent message after load (a failed save, a lost connection). MDN: "Setting `role="alert"` is equivalent to setting `aria-live="assertive"` and `aria-atomic="true"`." and "screen readers … will automatically announce the updated content regardless of where keyboard focus when the role is added." WCAG technique ARIA19, "Using ARIA role=alert or Live Regions to Identify Errors" (https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), satisfies 4.1.3 Status Messages.
- **`role="status"`** is for less urgent dynamic messages (MDN: "Dynamic changes that are less urgent should use a less aggressive method, such as including `aria-live="polite"` or using an other live region role like `status`."). MDN's live region guide: "Establish the live region before updating its content. Start with an empty live region…" (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions). So `status` only works on an Alert that is already rendered and whose text changes; a newly inserted polite message belongs in a Toast. Documented on the docs page.
- **Icons** are decorative. The status is carried by the Title text (see Behaviour); the glyph shape is the visual second channel. The brand book: "State always pairs color with a label, a shape, a weight change or an underline."
- **Close** has an accessible name from `labels.close` ("Dismiss") and is a native `<button>` through IconButton. Its target follows IconButton sm (28, 40 on coarse pointers).
- **Contrast.** Title uses `color-text-default`, already checked on the three status fills (`contrast.ts` PAIRS) and on `surface-raised`. Description uses `color-text-subtle` and icons use `color-icon-{role}`; those pairs on the status fills are not in the matrix yet. Measured from the primitive hex values with the WCAG formula (inference, to be added to `PAIRS`): `text-subtle` 6.84–6.93:1 light, 7.21–7.41:1 dark; `icon-success` 7.27 / 10.51, `icon-warning` 3.40 / 10.91, `icon-danger` 5.34 / 8.20. All pass (4.5:1 text, 3:1 icons).
- **More contrast:** Description switches to `color-text-default` and Root draws a 1 px border in its Variant's icon colour, so the box edge and the secondary text both step up (`@media (prefers-contrast: more)`, reusing `alert-description-text-color` → title colour and `alert-{variant}-icon-color`).
- **Forced colors:** fills disappear, so Root draws a 1 px `CanvasText` border in `@media (forced-colors: active)`. Icons use `currentColor` and become `CanvasText`; the glyph shape and the Title still tell the Variants apart. Close follows IconButton.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only. The grid columns run inline-start → inline-end, so the icon is at the start and Close at the end in both directions. None of the status glyphs is directional, so none mirrors. No arrow-key behaviour.

## Component tokens

New component word `alert` (Dictionary change). All other words already exist.

| Token                            | References                        | Why                                      |
| -------------------------------- | --------------------------------- | ---------------------------------------- |
| `alert-padding`                  | `space-inset-md`                  | Box padding (12, as Toast)               |
| `alert-gap`                      | `space-inline-md`                 | Gap between icon, text and Close columns |
| `alert-body-gap`                 | `space-stack-xs`                  | Gap between Title and Description        |
| `alert-border-radius`            | `radius-lg`                       | 12, as Card                              |
| `alert-icon-size`                | `size-icon-sm`                    | Status icon, 16                          |
| `alert-title-font`               | `type-label-md`                   | Title type                               |
| `alert-title-text-color`         | `color-text-default`              |                                          |
| `alert-description-font`         | `type-body-xs`                    | Description type, as Card and Toast      |
| `alert-description-text-color`   | `color-text-subtle`               |                                          |
| `alert-neutral-background-color` | `color-surface-raised`            | "one step from the page"                 |
| `alert-success-background-color` | `color-background-success-subtle` |                                          |
| `alert-warning-background-color` | `color-background-warning-subtle` |                                          |
| `alert-danger-background-color`  | `color-background-danger-subtle`  |                                          |
| `alert-neutral-icon-color`       | `color-icon-accent`               | As `toast-neutral-icon-color`            |
| `alert-success-icon-color`       | `color-icon-success`              |                                          |
| `alert-warning-icon-color`       | `color-icon-warning`              |                                          |
| `alert-danger-icon-color`        | `color-icon-danger`               |                                          |

None exist yet. Close uses the existing `icon-button-*` tokens; the more-contrast and forced-colors borders use `border-width-default` directly.

Contrast matrix additions proposed for `packages/tokens/src/contrast.ts` PAIRS: `text-subtle` and `icon-{success,warning,danger}` on `background-{success,warning,danger}-subtle`.

Review item: IconButton's hover fill (`color-background-neutral-subtle-hovered`, sage-50 / night-900) equals the neutral Alert's fill in light (`surface-raised`, sage-50) and differs only slightly from the status fills, so Close's hover is barely visible inside an Alert. Hover is never the only feedback (press still scales), but the brand owner may want a dedicated Close hover token.

## Built-in labels

| Key     | Default   | Used by                       |
| ------- | --------- | ----------------------------- |
| `close` | "Dismiss" | `Alert.Close` accessible name |

## Feedback events

| Event        | When                                                     | `reason` |
| ------------ | -------------------------------------------------------- | -------- |
| `ab-dismiss` | After `Alert.Close`'s `onClick` runs on an enabled Close | `"user"` |

Detail: `{ component: "Alert", reason }`, dispatched from the Close button and bubbling. Adds `"ab-dismiss": DismissEvent` with `FeedbackEventDetail<"Alert">` to `src/events/events.ts` (Toast and Dialog widen the union later). Not dispatched when Close is disabled. No `ab-appear`: an Alert is not a system-initiated feedback moment in the way a toast is.

## Sources

- WAI-ARIA APG Alert pattern: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
- WAI-ARIA APG Button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- MDN `alert` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role
- MDN `status` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role
- MDN ARIA live regions: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
- WCAG 2.2 Understanding 4.1.3 Status Messages: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- shadcn/ui Alert: https://ui.shadcn.com/docs/components/alert and source https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/alert.tsx
- Chakra UI Alert: https://chakra-ui.com/docs/components/alert
- MUI Alert: https://mui.com/material-ui/react-alert/ and API https://mui.com/material-ui/api/alert/
- Mantine Alert: https://mantine.dev/core/alert/
- Radix Themes Callout: https://www.radix-ui.com/themes/docs/components/callout
- Radix Primitives Dialog (Part names): https://www.radix-ui.com/primitives/docs/components/dialog
- Brand book: principles 5 and 6, Accessibility ("Not color alone"), Personality (bob in the info and warning glyphs).
- Source Toast guide (nearest relative): artifact `project/components/Toast/README.md`.
