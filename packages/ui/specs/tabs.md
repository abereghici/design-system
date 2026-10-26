# Tabs

Switches between peer sections that share one context (Overview / Activity / Settings), one panel at a time. For modes or views of the same content (List / Board), use SegmentedControl; to move between pages, use Navbar or Sidebar links; for sections the user may open several of at once, use Accordion.

```tsx
import { Tabs } from "@platform/ui/tabs";
import { Badge } from "@platform/ui/badge";

<Tabs.Root defaultValue="overview">
  <Tabs.List aria-label="Project">
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">
      Activity <Badge>{3}</Badge>
    </Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">…</Tabs.Content>
  <Tabs.Content value="activity">…</Tabs.Content>
  <Tabs.Content value="settings">…</Tabs.Content>
</Tabs.Root>

<Tabs.Root value={tab} onValueChange={setTab}>…</Tabs.Root>
```

Status: draft for brand-owner review (phase 3). Source guide: `components/Tabs/README.md` in the artifact.

## Anatomy

Root → List (Triggers → indicator) → Contents.

- **Root.** A `<div>` holding the List and the Contents.
- **List.** A `<div role="tablist">` laid out as a row of Triggers with `tabs-gap`, `tabs-height` tall (content box) plus a `tabs-list-border-width` hairline in `tabs-list-border-color` along its block-end edge. It scrolls horizontally when the Triggers overflow (`overflow-x: auto`, `scrollbar-width: none`, as the source CSS; source: "Overflowing tablists scroll horizontally"). A Trigger's focus ring is drawn inside it (`outline-offset: -focus-ring-width`, as the source CSS), so the scroll container never clips it.
- **Trigger.** A native `<button type="button" role="tab">`, `tabs-height` tall (40, 48 on coarse pointers), label in `tabs-item-font`, `tabs-item-text-color`. Children are the label and, optionally, a Badge (the source's `badge: 3`).
- **Indicator.** The List's `::after`: a bar of `tabs-indicator-height` (2 px) in `tabs-indicator-color` on the List's block-end edge, as wide as the selected Trigger. It is positioned with CSS anchor positioning, not measured in script (see Behaviour). Decorative. There is no Indicator Part (below).
- **Content.** A `<div role="tabpanel">` per Trigger, `space-stack-md` padding on its block sides. Every Content is rendered; the inactive ones carry `hidden`.

## API

`Tabs.Root`

| Prop            | Type                                                        | Default | Notes                                                                                                    |
| --------------- | ----------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `value`         | `string`                                                    |         | Controlled.                                                                                              |
| `defaultValue`  | `string`                                                    |         | Uncontrolled. One of `value` / `defaultValue` is required (a union type): one tab is always selected.    |
| `onValueChange` | `(value: string, details: Tabs.ChangeEventDetails) => void` |         | Before the change commits. `details`: `reason` (`"none"`: a click or an arrow key), `event`, `cancel()`. |
| …native         | `ComponentProps<"div">`                                     |         | `ref`, `className` and native attributes.                                                                |

`Tabs.List`: `ComponentProps<"div">`, plus `aria-label` or `aria-labelledby`, one of them required in the type.

`Tabs.Trigger`

| Prop       | Type                                            | Default | Notes                                                          |
| ---------- | ----------------------------------------------- | ------- | -------------------------------------------------------------- |
| `value`    | `string`                                        |         | Required. No whitespace: it becomes part of the element `id`s. |
| `children` | `ReactNode`                                     |         | The label, optionally with a Badge.                            |
| …native    | `ComponentProps<"button">` minus `type`, `role` |         | `ref`, `className`, `onClick` and native attributes.           |

`Tabs.Content`

| Prop    | Type                    | Default | Notes                                                               |
| ------- | ----------------------- | ------- | ------------------------------------------------------------------- |
| `value` | `string`                |         | Required; matches a Trigger.                                        |
| …native | `ComponentProps<"div">` |         | `ref`, `className`, `tabIndex` (default `0`) and native attributes. |

Names, checked against the reference libraries:

- **`Tabs`**: Radix "A set of layered sections of content—known as tab panels—that are displayed one at a time." (https://www.radix-ui.com/primitives/docs/components/tabs); Base UI "A component for toggling between related panels on the same page." (https://base-ui.com/react/components/tabs); React Aria "Tabs organize content into multiple sections and allow users to navigate between them." (https://react-aria.adobe.com/Tabs); Ark "Flexible navigation tool with various modes and features." (https://ark-ui.com/react/docs/components/tabs); Mantine "Switch between different views" (https://mantine.dev/core/tabs/); MUI `Tabs` (https://mui.com/material-ui/api/tabs/). Every library says Tabs.
- **`Root` / `List` / `Trigger` / `Content`**: Radix's anatomy `<Tabs.Root>`, `<Tabs.List>`, `<Tabs.Trigger />`, `<Tabs.Content />`; Ark the same four plus `Tabs.Indicator`. Base UI uses `Tabs.Tab` and `Tabs.Panel` plus `Tabs.Indicator`; Mantine `Tabs.Tab` / `Tabs.Panel`; React Aria `TabList`, `Tab`, `TabPanels`, `TabPanel`. Radix names win (naming rule).
- **No Indicator Part.** Base UI's Indicator is "A visual indicator that can be styled to match the position of the currently active tab." and is placed from script-measured CSS variables (`--active-tab-left`, `--active-tab-width`, …, plus `renderBeforeHydration` "to render itself before React hydrates"). Here the List draws it in CSS from the selected Trigger's anchor box, so there is nothing to compose and nothing to hydrate (source: "No JS measurement" is the SegmentedControl's rule, followed here; judgement call).
- **`value` / `defaultValue` / `onValueChange(value, details)`**: Radix `defaultValue`, `value`, `onValueChange`; Base UI "`(value: Tabs.Tab.Value, eventDetails: Tabs.Root.ChangeEventDetails) => void`", whose reason "is 'none' for user-initiated changes, such as a click or keyboard navigation". Base UI's other reasons (`'initial'`, `'disabled'`, `'missing'`) are automatic fallbacks that this API cannot produce (a tab is always given, nothing is disabled).
- **List named in the type**: APG "If the tab list has a visible label, the element with role tablist has aria-labelledby set to a value that refers to the labelling element. Otherwise, the tablist element has a label provided by aria-label." The source's `label="Project"` becomes `aria-label`.
- **Automatic activation only, no `activationMode`.** APG: "It is recommended that tabs activate automatically when they receive focus as long as their associated tab panels are displayed without noticeable latency." The source: "←/→ move and activate". Radix `activationMode` "`"automatic" | "manual"`" default `"automatic"`, React Aria `keyboardActivation` default `'automatic'`, Ark `activationMode` default `'automatic'`, Base UI `activateOnFocus` default `false`.
- **Every panel rendered, inactive ones `hidden`.** APG's automatic activation "typically requires tab panel content to be preloaded." Radix and Base UI unmount inactive panels by default (Radix `forceMount`, Base UI `keepMounted` "Whether to keep the HTML element in the DOM while the panel is hidden."; Ark `lazyMount` / `unmountOnExit`). Rendering them all keeps inactive panels' state (a half-filled field survives a tab switch) and needs no mount logic (judgement call).
- **Left out (YAGNI):** `orientation` (vertical tabs; Radix, Base UI, Ark, React Aria), `activationMode` / manual activation, a focusable disabled Trigger (all libraries; APG keeps disabled tabs focusable: "Tab elements in a set of Tabs" are among its `aria-disabled` examples, so a later one follows the spec #1 contract; the native `disabled` a Trigger inherits from `<button>` can't take focus, so the arrow keys skip it), `loop` (Radix, default `true`; Base UI `loopFocus`; we always wrap, as APG), `dir` (Radix; read from the DOM), `asChild` / tabs as links (Base UI `nativeButton={false}` with `render={<Link />}`, React Aria `href`, Ark `navigate`; links between pages are Navbar or Sidebar), lazy mounting, Base UI `data-activation-direction`, MUI scroll buttons, Ark `deselectable` and `composite`, and `hidden="until-found"` for find-in-page (below the floor, see Sources).

## States

| State         | How it shows                                                                          | Exposed as                             |
| ------------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| rest          | Label in `tabs-item-text-color` (subtle)                                              | `aria-selected="false"`                |
| hovered       | Label in `tabs-item-text-color-hovered`; fine pointers only                           | `:hover` under `@media (hover: hover)` |
| selected      | Label in `tabs-item-text-color-selected`; the indicator under it                      | `aria-selected="true"`                 |
| focus-visible | 2 px ring in `color-border-focused`: inset on the Trigger, 3 px offset on the Content | `:focus-visible`                       |
| hidden panel  | Not rendered to the screen or the accessibility tree                                  | `hidden` on the Content                |

## Behaviour

- **Ids and relations.** The Root takes a `useId()`; each Trigger's `id` is `{id}-trigger-{value}` with `aria-controls` = `{id}-content-{value}`, and each Content's `aria-labelledby` points back at its Trigger (APG: "Each element with role tab has the property aria-controls referring to its associated tabpanel element." and "Each element with role tabpanel has the property aria-labelledby referring to its associated tab element.").
- **Change.** A click on a Trigger, or an arrow/Home/End key on a Trigger, calls `onValueChange(value, details)`. `details.cancel()` keeps the current tab and focus stays where it was. Otherwise the uncontrolled value changes (controlled: the parent decides), the new Trigger takes focus (also after a click, since Safari does not focus a clicked button), and `ab-toggle` fires. Choosing the selected tab again does nothing.
- **Roving tabindex.** The selected Trigger has `tabindex="0"`, the others `tabindex="-1"` (APG "Managing Focus Within Components Using a Roving tabindex": "the element that is to be included in the tab sequence has tabindex="0" and all other focusable elements contained in the composite have tabindex="-1"."). Selection follows focus, so the tab stop is always the selected tab, which is APG's "When focus moves into the tab list, places focus on the active tab element."
- **Indicator, without measuring.** The selected Trigger (`[aria-selected="true"]`) gets `anchor-name: --ab-tabs-selected`; the List sets `anchor-scope: --ab-tabs-selected` and `position: relative`; its `::after` is `position: absolute` with `position-anchor: --ab-tabs-selected`, `inset-inline-start: anchor(self-start)`, `inset-inline-end: anchor(self-end)` and `inset-block-end: 0`. `anchor-scope` is required: without it, a lookup that is not an ancestor returns "the last element el in tree order", so a second Tabs on the page would steal the indicator (spec: "When a design pattern is re-used, anchor-scope can prevent naming clashes across identical components."). `position-anchor` is always written explicitly (floating-platform research). The indicator and its anchor sit in the same scroll container, so they scroll together (inference; the build tests a scrolled List in three engines). A pseudo-element as the anchor-positioned box is an inference too (the spec lets a pseudo-element be an anchor; the build verifies the `::after` positions in three engines).
- **Overflow.** After a change commits, the List calls `scrollIntoView({ block: "nearest", inline: "nearest" })` on the selected Trigger, so a partly hidden tab scrolls fully into view (MDN `nearest`: "Scrolls as little as possible to bring the element into view. … If the element is already visible, no scrolling is done."). `focus()` alone also scrolls (MDN: "By default the browser will scroll the element into view after focusing it"), but React Aria's toolbar source notes "Focusing an item that is only partially visible doesn't scroll it fully into view", and Safari does not focus a clicked button (MDN `<button>`: "Most browsers do give focus to a button being clicked, but Safari does not, by design", quoted in the floating-platform research).
- **Panels.** The inactive Contents carry `hidden`; MDN: "The browser will not render elements that are in the _hidden_ state." The Content's CSS never sets `display` on a hidden panel (MDN: "changing the value of the CSS `display` property on a hidden element will override the _hidden_ state"). Each Content has `tabindex="0"` by default, the panel's tab stop (APG: "When the tabpanel does not contain any focusable elements or the first element with content is not focusable, the tabpanel should set tabindex="0" to include it in the tab sequence of the page."; Radix's rendered tabpanel carries `tabindex="0"`). A panel that starts with a focusable control can pass `tabIndex={-1}`.
- **Pointer vs keyboard.** A Trigger's `pointerdown` sets `data-pointer` on the List and its `keydown` removes it (the Checkbox rule), so the motion below runs only for pointer changes. The keys are handled on the Triggers, not the List: a tablist with key handlers would have to be focusable itself (`jsx-a11y/interactive-supports-focus`), and the roving tab stop belongs to the selected Trigger.
- Client components (`'use client'`) for every Part: Root holds state, List handles keys, Trigger and Content read the selected value from context. Content children can be Server Components.

## Motion

- **Indicator glides on a spring** (source: "A 2px moss indicator is anchored to the selected tab and glides on a spring."; brand book springs: "segmented and tab indicators"): under `[data-pointer]`, the `::after` transitions `inset-inline-start` and `inset-inline-end` over `tabs-duration` (`motion-duration-spring`, 400 ms) with `tabs-easing` (`motion-easing-spring`). The anchor-positioning spec: "transitions or animations of a property using an anchor function will work "as expected" for all sorts of possible changes: … the anchor-name property being changed on anchors". Engines: webstatus.dev `anchor-positioning-animations` is limited (Chrome 125, Safari 26; no Firefox), so this is a progressive enhancement: in Firefox the indicator jumps to the new tab, which reads as correct.
- **Panel entry** (source: "Panels enter with a 200ms fade + 5px rise + 2px blur"): under `[data-pointer]`, the newly shown Content transitions `opacity` 0 → 1, `translate` from `0 var(--ab-motion-distance-swap)` (5 px) to `0 0` and `filter` from `blur(var(--ab-motion-blur-swap))` (2 px) to none, over `motion-duration-swap` (200 ms) with `motion-easing-enter`, started by `@starting-style` (MDN: "an element will transition from its `@starting-style` styles when it is first rendered in the DOM, or when it transitions from `display: none` to a visible value"). Brand book: "Swaps add a small lift and blur to mask the crossfade."
- **Keyboard and first render: no motion.** Arrow-key changes move the indicator and swap the panel instantly (brand book: "No motion on keyboard-initiated or high-frequency (100+ per day) actions."). Without `data-pointer` the first panel does not animate on page load either.
- Trigger label colour: `motion-duration-hover-in` / `-hover-out` with `motion-easing-color`, as Button.
- **Reduced motion:** the indicator does not travel (no inset transition under `(prefers-reduced-motion: reduce)`; it jumps). The panel keeps its fade: `motion-distance-swap` and `motion-blur-swap` resolve to 0 under reduced motion (token media overrides). Brand book: "Reduced motion zeroes distance, blur and scale; fades stay."
- **Instant exit:** the old panel gets `hidden` and disappears in the same frame (`display: none`), with no exit animation in any engine; the new panel is already in place, so it reads as correct.

## Keyboard

APG pattern: **Tabs**, automatic activation (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). The Triggers handle the keys; Space and Enter are the native button's.

| Key           | Action                                                                                                                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tab           | "When focus moves into the tab list, places focus on the active tab element." "When the tab list contains the focus, moves focus to the next element in the page tab sequence outside the tablist, which is the tabpanel unless the first element containing meaningful content inside the tabpanel is focusable." |
| Right Arrow   | "Moves focus to the next tab. If focus is on the last tab element, moves focus to the first tab." Activates it ("Optionally, activates the newly focused tab"; automatic activation).                                                                                                                              |
| Left Arrow    | "moves focus to the previous tab. If focus is on the first tab, moves focus to the last tab." Activates it.                                                                                                                                                                                                        |
| Home          | "(Optional): Moves focus to the first tab." Activates it. In the source ("Home/End first/last").                                                                                                                                                                                                                   |
| End           | "(Optional): Moves focus to the last tab." Activates it.                                                                                                                                                                                                                                                           |
| Space / Enter | "Activates the tab if it was not activated automatically on focus." Already active here; native button click, no change.                                                                                                                                                                                           |

Up and Down are not handled: APG "If the tab list is horizontal, it does not listen for Down Arrow or Up Arrow so those keys can provide their normal browser scrolling functions even when focus is inside the tab list." Shift+F10 and Delete (APG, for tabs with menus or closable tabs) do not apply.

**RTL:** the Trigger reads `:dir(rtl)` on its List at keydown and swaps Left and Right, so Left moves to the next tab in visual order (spec #1 user story 54). Home and End are logical (first and last tab) in both directions.

## Accessibility

- Roles `tablist`, `tab`, `tabpanel`; `aria-selected` on every Trigger ("The active tab element has the state aria-selected set to true and all other tab elements have it set to false."). ARIA in HTML allows `role="tab"` on `button` ("Roles: checkbox, combobox, gridcell, link, menuitem, …, tab, or treeitem"). `aria-orientation` is not set: "The default value of aria-orientation for a tablist element is horizontal."
- The tablist is named by `aria-label` or `aria-labelledby` (required). Each panel is named by its Trigger.
- A Badge inside a Trigger joins the tab's name ("Activity 3"). Pass `aria-label` on the Trigger for a fuller name ("Activity, 3 new") when the number alone is unclear, as the Badge spec's sample does on a link ("Inbox, 3 unread").
- **Contrast.** Selected is shown by the indicator (`color-border-selected`, a border role checked at 3:1 on every surface by the contrast matrix) and the label's colour step; the label colours are text roles already in the matrix.
- **More contrast:** `tabs-list-border-color` is `color-border-subtle`, which steps up to `color-border-default` (token media override). Nothing else changes.
- **Forced colors:** the indicator is a `background-color` box, which the UA would force to the background, so under `@media (forced-colors: active)` it uses `background-color: Highlight` (CSS Color Adjust 1 forces a colour only "if its computed value is a color other than a system color", https://www.w3.org/TR/css-color-adjust-1/). The List hairline is a border and takes a system colour. The focus ring is an `outline`.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only: the Triggers run from the inline start, the indicator uses `inset-inline-start` / `inset-inline-end` with `self-start` / `self-end` anchor sides (which the floating-platform research verified in RTL islands in all three engines), and the List scrolls from the inline start. A Badge sits after the label in reading order. Arrow keys: see Keyboard.

## Component tokens

Existing (ported from the source): `tabs-height`, `tabs-gap`, `tabs-item-font`, `tabs-item-text-color`, `tabs-item-text-color-hovered`, `tabs-item-text-color-selected`, `tabs-indicator-color`, `tabs-indicator-height`, `tabs-list-border-color`, `tabs-list-border-width`, `tabs-duration`, `tabs-easing`.

No new tokens. The panel entry uses the semantic swap tokens directly (`motion-duration-swap`, `motion-distance-swap`, `motion-blur-swap`, `motion-easing-enter`), the Root's stack gap `space-stack-md`, and the focus ring `focus-ring-width`, `focus-ring-offset`, `color-border-focused`.

## Author-written text

None. The tab labels and the tablist name come from the consumer.

## Feedback events

| Event       | When                                                        | `reason` |
| ----------- | ----------------------------------------------------------- | -------- |
| `ab-toggle` | After a user change commits (click, arrow key, Home or End) | `"user"` |

Detail: `{ component: "Tabs", reason }`, dispatched from the newly selected Trigger. Not dispatched when the change is cancelled, when the selected tab is chosen again, or when a controlled `value` changes from the parent. Arrow-key changes dispatch it too (RadioGroup precedent). `events.ts` widens the `ab-toggle` component union with `"Tabs"`.

## Sources

- Source guide: artifact `project/components/Tabs/README.md` ("Switch between peer sections that share a context (Overview / Activity / Settings); for modes of the same content, use SegmentedControl."; "A 2px moss indicator is anchored to the selected tab and glides on a spring. Panels enter with a 200ms fade + 5px rise + 2px blur (collapses under reduced motion)."; "←/→ move and activate · Home/End first/last · Tab moves into the panel."; "WAI-ARIA tabs: `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`, roving tabindex. Overflowing tablists scroll horizontally.").
- Brand book, Motion ("No motion on keyboard-initiated or high-frequency (100+ per day) actions."; "Swaps add a small lift and blur to mask the crossfade."; springs "Only where the user directly causes the movement: switch thumbs, segmented and tab indicators, …"). Guidelines `motion.html` ("Reduced motion zeroes distance, blur and scale; fades stay.").
- WAI-ARIA APG Tabs: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ · Keyboard interface (roving tabindex; focusability of disabled controls): https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- ARIA in HTML: https://www.w3.org/TR/html-aria/
- CSS Anchor Positioning 1 (`anchor-scope`, target anchor lookup, transitions note): https://drafts.csswg.org/css-anchor-position-1/ · MDN `anchor-scope`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/anchor-scope
- MDN `@starting-style`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style · `HTMLElement.focus()`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus · `Element.scrollIntoView()`: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView · `hidden`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden
- CSS Color Adjustment 1: https://www.w3.org/TR/css-color-adjust-1/
- Baseline (webstatus.dev and `web-features` 3.44.0, 2026-10-24): `anchor-positioning` limited as a whole (only for `position-visibility`; floating-platform research), with the keys used here Baseline low: `css.properties.anchor-name` and `css.types.anchor` 2026-01-13, `css.properties.anchor-scope` 2026-01-13, `css.properties.position-anchor` 2026-09-14. `anchor-positioning-animations` limited (Chrome 125, Safari 26): progressive enhancement only. `starting-style` newly, 2024-08-06. `scrollbar-width` newly, 2024-12-11. `scroll-into-view` widely. `hidden-until-found` limited (no Safari; `api.Element.beforematch_event` low 2025-12-12), so find-in-page into inactive panels is left out.
- Floating platform research (anchor facts, `self-*` sides in RTL, explicit `position-anchor`): `docs/research/floating-platform.md`.
- Radix Tabs: https://www.radix-ui.com/primitives/docs/components/tabs · Base UI Tabs: https://base-ui.com/react/components/tabs · React Aria Tabs: https://react-aria.adobe.com/Tabs · Ark Tabs: https://ark-ui.com/react/docs/components/tabs · Mantine Tabs: https://mantine.dev/core/tabs/ · MUI Tabs API: https://mui.com/material-ui/api/tabs/ · React Aria `useToolbar` source (the partial-visibility note): https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/toolbar/useToolbar.ts
