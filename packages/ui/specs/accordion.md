# Accordion

A stack of sections the user can expand and collapse, for secondary content ("Billing", "Security", FAQ answers). Never hide a primary task or a required field inside one. To switch between peer views of the same place, use Tabs; for a single show/hide toggle with no stack around it, use a plain `<details>`.

```tsx
import { Accordion } from "@platform/ui/accordion";

<Accordion.Root defaultValue={["billing"]}>
  <Accordion.Item value="billing">
    <Accordion.Trigger>Billing</Accordion.Trigger>
    <Accordion.Content>Invoices are sent on the first of each month.</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="security">
    <Accordion.Trigger>Security</Accordion.Trigger>
    <Accordion.Content>Two-factor authentication is on.</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>

<Accordion.Root multiple value={open} onValueChange={setOpen}>
  <Accordion.Item value="shipping">
    <Accordion.Trigger>Shipping</Accordion.Trigger>
    <Accordion.Content>Orders ship within two working days.</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="returns">
    <Accordion.Trigger>Returns</Accordion.Trigger>
    <Accordion.Content>Return any item within 30 days.</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

Status: draft for brand-owner review (phase 3). Source guide: `components/Accordion/README.md` in the artifact.

## Anatomy

Root → Items (details → Trigger (summary → text → chevron) → Content).

- **Root.** A `<div>` holding the Items, with an `accordion-border-width` hairline in `accordion-border-color` at its block start (source CSS). No role.
- **Item.** A native `<details>`. In single mode every Item of the Root shares one generated `name`, which makes the group exclusive natively (spec #1: "`<details name>` for Accordion"). Each Item draws an `accordion-border-width` hairline in `accordion-border-color` at its block end.
- **Trigger.** A native `<summary>`, the first child of the Item, with the UA marker removed (`::-webkit-details-marker`; a flex `<summary>` has no `list-item` marker). A flex row: the text in `accordion-trigger-font` / `accordion-trigger-text-color` at the inline start, the `chevron-down` Icon (`size="sm"`, decorative) in `accordion-trigger-icon-color` at the inline end, `accordion-trigger-gap` between them, `accordion-trigger-padding-block` above and below. The whole row is the hit target.
- **Content.** A `<div>` after the Trigger, inside the Item's `::details-content`. Text in `accordion-panel-font` / `accordion-panel-text-color`, `accordion-panel-padding-block` at its block end (the Trigger's padding already separates it from the text above). The padding sits on the Content, not on `::details-content`, so a collapsed Item measures 0.

No Header Part (see API).

## API

`Accordion.Root`

| Prop            | Type                                                                    | Default | Notes                                                                                                                          |
| --------------- | ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `multiple`      | `boolean`                                                               | `false` | `false`: at most one Item open (shared `name`). `true`: any combination (no `name`).                                           |
| `value`         | `string[]`                                                              |         | Controlled: the `value`s of the open Items. In single mode at most one.                                                        |
| `defaultValue`  | `string[]`                                                              | `[]`    | Uncontrolled.                                                                                                                  |
| `onValueChange` | `(value: string[], details: Accordion.Root.ChangeEventDetails) => void` |         | `details`: `reason` (`"trigger-press"` \| `"none"`), `event`, `cancel()`. Only `"trigger-press"` can be cancelled (Behaviour). |
| …native         | `ComponentProps<"div">`                                                 |         | `ref`, `className` and native attributes.                                                                                      |

`Accordion.Item`

| Prop    | Type                                             | Default | Notes                                                                        |
| ------- | ------------------------------------------------ | ------- | ---------------------------------------------------------------------------- |
| `value` | `string`                                         |         | Required. Identifies the Item in Root's `value`.                             |
| …native | `ComponentProps<"details">` minus `open`, `name` |         | `ref`, `className`, `id` and native attributes. Root owns `open` and `name`. |

`Accordion.Trigger`: `ComponentProps<"summary">`; `children` is the label (phrasing content). `Accordion.Content`: `ComponentProps<"div">`.

Names, checked against the reference libraries:

- **Component and Parts `Root`, `Item`, `Trigger`, `Content`**: Radix anatomy "Accordion.Root", "Accordion.Item", "Accordion.Header", "Accordion.Trigger", "Accordion.Content" (https://www.radix-ui.com/primitives/docs/components/accordion); Base UI `Root`, `Item`, `Header`, `Trigger`, `Panel` (https://base-ui.com/react/components/accordion); Ark `Root`, `Item`, `ItemTrigger`, `ItemContent`, `ItemIndicator` (https://ark-ui.com/react/docs/components/accordion); Mantine `Accordion.Item`, `Accordion.Control`, `Accordion.Panel`, "Divide content into collapsible sections." (https://mantine.dev/core/accordion/). Part words follow Radix (spec #1 naming rule). No Indicator Part: the chevron is drawn by the Trigger (as Checkbox's check).
- **`multiple`**: Base UI "`multiple` … `false` … Whether multiple items can be open at the same time."; Ark "`multiple` … Whether multiple accordion items can be expanded at the same time." (default `false`); Mantine "For `multiple={true}`, set `value` as an array of strings." Radix uses `type` "Set the `type` prop to `multiple` to enable opening multiple items at once." Three of four say `multiple`, and its `false` default maps onto the native shared `name`. The source's `exclusive` prop (default non-exclusive) is renamed and its default inverted (judgement call: library majority; Base UI, Ark and Mantine all default to one open Item).
- **`value: string[]` / `defaultValue` / `onValueChange(value, details)`**: Base UI "`value` `Value[]` … The controlled value of the item(s) that should be expanded." and "`onValueChange` `((value: Value[], eventDetails: Accordion.Root.ChangeEventDetails) => void)`"; Ark "`value` (`string[]`): The controlled value of the expanded accordion items." One array type in both modes (Base UI, Ark), not Radix/Mantine's `string | string[]` switch.
- **`reason` values**: Base UI "`type AccordionRootChangeEventReason = 'trigger-press' | 'none';`". Same words here: `"trigger-press"` for a Trigger click or Enter/Space, `"none"` for a change the browser made (Behaviour).
- **No `collapsible`.** Radix "Use the `collapsible` prop to allow all items to close." (default `false`); Ark "`collapsible` … Whether an accordion item can be closed after it has been expanded." A native exclusive group always lets the open Item close (the summary's activation behaviour removes `open`, HTML spec, Behaviour), so every Accordion here is collapsible, as Base UI's.
- **No Header Part, and no heading inside the Trigger.** APG: "Each accordion header button is wrapped in an element with role heading". Radix "Header: Wraps an `Accordion.Trigger`. Use the `asChild` prop to update it to the appropriate heading level"; Base UI's Header "Renders an `<h3>` element."; Mantine `order` "sets the heading level for the `Accordion.Control` root element". With `<details>` the heading cannot wrap the trigger: HTML requires the summary "As the first child of a details element". A heading inside the summary is allowed ("Phrasing content, optionally intermixed with heading content") but MDN warns: "The role assigned to the `<summary>` element varies across browsers. Some still assign it a default button role, which removes all roles from its children. This inconsistency can cause issues for users of assistive technologies such as screen readers (`<h4>` in the previous example will have its role removed and will not be treated as a heading for these users)." So the Accordion adds no headings; a Heading above the Accordion names the group in the outline (judgement call: spec #1's `<details name>` platform choice over APG's heading structure; see Accessibility).
- **No `asChild` on Trigger.** The Trigger must be the `<summary>` for the native behaviour, so it cannot render a link or another element.
- Left out (YAGNI): `disabled` on Root and Item (Radix, Base UI), `orientation` and `dir` (Radix; Base UI deprecates `orientation` "following the APG guidance update … to remove roving focus"), `hiddenUntilFound` / `keepMounted` (Base UI; native `<details>` content is always in the DOM and findable), Mantine `chevron` / `chevronPosition` / `disableChevronRotation`, an Indicator Part (Ark `ItemIndicator`), a `region` role on Content (APG "Optionally").

## States

| State         | How it shows                                                          | Exposed as                                                    |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| collapsed     | Trigger only; chevron points down                                     | `details:not([open])`; the summary's collapsed state (native) |
| expanded      | Content shown below the Trigger; chevron rotated 180°                 | `[open]` on the Item; the summary's expanded state (native)   |
| hovered       | Chevron in `accordion-trigger-icon-color-hovered`; fine pointers only | `:hover` on the Trigger under `@media (hover: hover)`         |
| focus-visible | 2 px ring, 3 px offset around the Trigger row                         | `:focus-visible` on the summary (base stylesheet ring)        |

## Behaviour

- **One state path.** The Root holds `value` (controlled or uncontrolled). Each Item renders `open={value.includes(item.value)}` and, in single mode, the Root's generated `name` (`useId()`). React writes `open`; the browser keeps the group exclusive.
- **Trigger press** (click, or Enter/Space, which activate a summary through `click`; inference from the summary's activation behaviour, tested in three engines). The Trigger's `click` handler calls `event.preventDefault()`, which stops the native toggle: HTML's summary activation behaviour is "If the open attribute is present on parent, then remove it. Otherwise, set parent's open attribute to the empty string.", and the DOM dispatch algorithm runs it only "If event ’s canceled flag is unset". It then computes the next value (close: remove this Item; open: add it in `multiple` mode, replace the value in single mode), calls `onValueChange(next, { reason: "trigger-press", event, cancel })` and, unless `cancel()` was called, commits it (uncontrolled) or leaves it to the parent (controlled). When React then sets `open` on one Item of a named group, the browser closes the other: "If the open attribute is set on otherElement … Remove the open attribute on otherElement." The state already says so, so nothing else runs.
- **Browser-made changes** (`reason: "none"`). Find-in-page and fragment navigation open a closed Item themselves: HTML's ancestor revealing algorithm appends "( ancestor 's parent node, " details ")" for content "slotted into the second slot of a details element which does not have an open attribute" and then sets `open`. The Item listens for `toggle` ("Fire an event named toggle at element , using ToggleEvent", queued as a task, so it fires after the change and is not cancelable). If the Item's `open` differs from the latest value (kept in a ref), the Root reads the open Items of this Accordion from the DOM, calls `onValueChange(next, { reason: "none", event, cancel })` once, and commits it (uncontrolled). `cancel()` does nothing here: the browser has already revealed the match, and closing it again would hide what the user searched for. A controlled parent must accept the change.
- **Content is always rendered.** `<details>` keeps its content in the DOM while collapsed, which is what makes it findable; there is no mount/unmount and no `keepMounted`.
- One client module (`'use client'`): Root (state, context), Item (`toggle` listener), Trigger (`click`, `pointerdown`, `keydown`) and Content (a plain `<div>`). Server Components can be passed into any Part as children.

## Motion

From the source: "Height animates from 0 to auto with `interpolate-size: allow-keywords` and `::details-content` (250ms ease-in-out) — no JS measuring; chevron rotates 180°."

- **Expand:** `details::details-content { block-size: 0; overflow-y: clip }`, `details[open]::details-content { block-size: auto }`, with `transition: block-size, content-visibility allow-discrete` over `accordion-duration` (`motion-duration-expand`, 250 ms) and `accordion-easing` (`motion-easing-move`). `interpolate-size: allow-keywords` is already set on `:root` by the base stylesheet (inherited: MDN "The interpolate-size value is inherited, so animating to (or from) an intrinsic size value can be enabled for an entire document by setting it on the document root"). MDN `::details-content`: with `content-visibility … allow-discrete` "the content is visible for the entire duration of the transition".
- **Collapse:** the same transition over `accordion-exit-duration` (`motion-duration-exit`, 150 ms): exits are faster than entrances (brand book).
- **Fade:** the `::details-content` also fades `opacity` 0 → 1 over `accordion-duration` with `motion-easing-color` (source CSS). It is a fade, so it stays under reduced motion.
- **Chevron:** `rotate: 180deg` on `[open]`, same duration and easing as the height. Symmetric glyph, so a rotation, not a swap.
- **Pointer only.** The transitions apply only while the Trigger has `data-pointer` (set on `pointerdown`, removed on `keydown`; the Item reads it with `:has()`) (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions."; same rule as Checkbox). Find-in-page reveals are therefore instant too, so the browser scrolls to the match in its final position, unless the Trigger was last pressed with a pointer (the marker stays until the next key press). Long unbroken labels and panel text wrap anywhere, so nothing overflows at 320 px.
- **Progressive enhancement.** `interpolate-size` is Chromium-only (webstatus.dev limited). Elsewhere `block-size` cannot interpolate to `auto` and the Item opens and closes in one frame, exactly like a native `<details>`; that reads as correct.
- **Reduced motion:** the base stylesheet sets `interpolate-size` only under `prefers-reduced-motion: no-preference`, and the Accordion's transitions sit in the same query. With reduced motion the height and the chevron change instantly (both are movement; the brand book removes "movement, scaling, blur and stagger"); the content fade stays.
- **Instant exit:** a collapse with no transition removes the content in one frame and the Items below move up at once, as native `<details>` does; no state waits for the animation.

## Keyboard

APG pattern: **Accordion** (https://www.w3.org/WAI/ARIA/apg/patterns/accordion/). Native `<summary>` provides it; no key handler is added.

| Key           | Action                                                                                                                                                                                                                                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enter / Space | "When focus is on the accordion header for a collapsed panel, expands the associated panel. If the implementation allows only one panel to be expanded, and if another panel is expanded, collapses that panel. When focus is on the accordion header for an expanded panel, collapses the panel if the implementation supports collapsing." |
| Tab           | "Moves focus to the next focusable element; all focusable elements in the accordion are included in the page Tab sequence."                                                                                                                                                                                                                  |
| Shift + Tab   | "Moves focus to the previous focusable element; all focusable elements in the accordion are included in the page Tab sequence."                                                                                                                                                                                                              |

No arrow keys, Home or End: the current APG page lists only these keys, and Base UI deprecated its roving-focus props "following the APG guidance update" (aria-practices PR 3434).

**RTL:** no arrow-key behaviour, so nothing to swap.

## Accessibility

- **Roles.** The summary is the Trigger's button: HTML-AAM maps it to "ROLE_SYSTEM_PUSHBUTTON States: STATE_SYSTEM_EXPANDED / STATE_SYSTEM_COLLAPSED" (MSAA), "Control Type: Button Control Pattern: ExpandCollapse" (UIA), "AXRoleDescription: "disclosure triangle"" (AX). The expanded state comes from the native mapping, so no `aria-expanded` or `aria-controls` is added (ARIA in HTML for summary: "No role if the summary element is a summary for its parent details element").
- **Departure from APG's heading structure** (judgement call, see API). Screen-reader users navigating by heading do not land on each section; they reach the Triggers by Tab or by button navigation. Put a Heading before the Accordion for the group. If a product needs per-section headings in the outline, that is a different component (sections with Headings, or a scripted APG accordion), not this one.
- **Find-in-page:** the source guide's "content findable with in-page search (auto-expands)" comes from the HTML ancestor revealing algorithm. Which engines run it for `<details>` is not stated on webstatus.dev. The build checked fragment navigation into a closed Item with Playwright 1.64.1 in Chromium, Firefox and WebKit: each opens it, closes the other Item of the group, and the Root's value follows. Ctrl/Cmd+F cannot be driven by a test, so find-in-page itself is checked in the manual screen-reader pass. Enter and Space on a Trigger toggle it in all three engines (the same run, real key presses); story proofs cannot cover them because `userEvent` dispatches untrusted key events, which never activate a summary.
- **Contrast.** Trigger text `color-text-default`, chevron `color-icon-subtle` (3:1 role in the matrix), Content text `color-text-subtle`; all are in the contrast matrix on every surface. The hairline (`color-border-subtle`) is decorative (brand book exemption); the Trigger text is the control.
- **Targets:** the Trigger row is at least `accordion-trigger-padding-block` × 2 + one line of `type-label-md` (12 + 22.4 + 12 ≈ 46 px), above 24 px and the coarse-pointer sizes.
- **More contrast:** the chevron uses `accordion-trigger-icon-color-hovered` (`color-icon-default`), Content text uses `accordion-trigger-text-color` (`color-text-default`), and the hairline uses `color-border-default` (`@media (prefers-contrast: more)`).
- **Forced colors:** the chevron is `currentColor` and becomes `CanvasText`; the hairline is a border and takes the system colour; the focus ring is an `outline`. Nothing relies on a fill.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only: text at the inline start, chevron at the inline end, the hairline on the block end. `chevron-down` is symmetric and is not mirrored (it is not on the Icon mirror list). No arrow-key behaviour.

## Component tokens

Existing (ported from the source): `accordion-trigger-padding-block`, `accordion-trigger-font`, `accordion-trigger-text-color`, `accordion-trigger-icon-color`, `accordion-trigger-icon-color-hovered`, `accordion-panel-padding-block`, `accordion-panel-font`, `accordion-panel-text-color`, `accordion-border-color`, `accordion-border-width`, `accordion-duration`, `accordion-easing`.

Proposed new:

| Token                     | References             | `$type`   | Why                                                             |
| ------------------------- | ---------------------- | --------- | --------------------------------------------------------------- |
| `accordion-exit-duration` | `motion-duration-exit` | duration  | Collapse runs faster than expand (brand book: exits are faster) |
| `accordion-trigger-gap`   | `space-inline-md`      | dimension | Minimum space between a long label and the chevron              |

The chevron size comes from the Icon's own `size="sm"` (16 px); the more-contrast hairline uses `color-border-default` directly.

## Author-written text

None. The Trigger's text is its name.

## Feedback events

| Event       | When                                                      | `reason` |
| ----------- | --------------------------------------------------------- | -------- |
| `ab-toggle` | After a `"trigger-press"` change commits (pointer or key) | `"user"` |

Detail: `{ component: "Accordion", reason }`, dispatched from the Trigger and bubbling. One event per press, also in single mode where a second Item closes. Not dispatched for `reason: "none"` (find-in-page and fragment navigation are not a toggle the user pressed) or when the change is cancelled. Keyboard presses dispatch it too (RadioGroup precedent: sound is the app's decision).

## Sources

- Source guide: artifact `project/components/Accordion/README.md` ("Progressive disclosure for secondary content; never hide primary tasks or required fields inside one."; "Height animates from 0 to auto with `interpolate-size: allow-keywords` and `::details-content` (250ms ease-in-out) — no JS measuring; chevron rotates 180°."; "Native `<details>/<summary>`: Enter/Space toggle, state announced, content findable with in-page search (auto-expands)."). Brand book, Motion ("Exits are faster than entrances.", "No motion on keyboard-initiated or high-frequency (100+ per day) actions.", "Reduced motion removes movement, scaling, blur and stagger.").
- HTML Living Standard, `details` and `summary` (content models, `name` exclusivity, summary activation behaviour, toggle task): https://html.spec.whatwg.org/multipage/interactive-elements.html · ancestor revealing algorithm: https://html.spec.whatwg.org/multipage/interaction.html
- DOM Standard, dispatch (activation behaviour only when not cancelled): https://dom.spec.whatwg.org/
- MDN `<details>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details · `<summary>` (headings warning): https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary · `::details-content`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::details-content · `interpolate-size`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size
- HTML-AAM (`summary` mapping): https://www.w3.org/TR/html-aam-1.0/ · ARIA in HTML: https://www.w3.org/TR/html-aria/
- Baseline (webstatus.dev, 2026-10-24): `details` widely available (low 2020-01-15); `details-name` newly available (low 2024-09-03); `details-content` newly available (low 2025-09-16); `transition-behavior` newly available (low 2024-08-06); `interpolate-size` and `calc-size` limited (Chromium 129 only; progressive enhancement, absence reads as a native instant toggle).
- WAI-ARIA APG Accordion: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
- Radix Accordion: https://www.radix-ui.com/primitives/docs/components/accordion · Base UI Accordion: https://base-ui.com/react/components/accordion (and https://base-ui.com/react/components/accordion.md for the reason type) · Ark Accordion: https://ark-ui.com/react/docs/components/accordion · Mantine Accordion: https://mantine.dev/core/accordion/
