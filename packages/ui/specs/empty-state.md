# EmptyState

Stands in for content that isn't there yet: an empty list, a search with no results, a project with no files. It says what is missing, why, and offers the next step. Use it in place of the empty region, not beside it. For a load that is still running, use Skeleton or Spinner; for an error, use an Alert.

```tsx
import { EmptyState } from "@platform/ui/empty-state";
import { Button } from "@platform/ui/button";
import { FilesIcon } from "@platform/ui/icons/files";
import { PlusIcon } from "@platform/ui/icons/plus";

<EmptyState.Root>
  <EmptyState.Indicator>
    <FilesIcon />
  </EmptyState.Indicator>
  <EmptyState.Title>No files yet</EmptyState.Title>
  <EmptyState.Description>Upload a file or create one to get started.</EmptyState.Description>
  <div>
    <Button variant="primary"><PlusIcon data-icon="inline-start" /> New file</Button>
    <Button variant="secondary">Upload</Button>
  </div>
</EmptyState.Root>

// Under a section that already has an <h2>, keep the default <h3>. Elsewhere, pick the level:
<EmptyState.Title asChild><h2>No results for "moss"</h2></EmptyState.Title>
```

Status: draft for brand-owner review (phase 1). Source guide: none. Drafted from the brand principles and the reference libraries.

## Anatomy

Root → Indicator (optional) → Title → Description (optional) → actions (optional, plain children).

- **Root.** A `<div>`, a centred column with padding and a gap. No fill, border or elevation: it sits in the region it replaces (brand principle 5, "Flat in flow").
- **Indicator.** A `<div>` holding one icon (or a small image), drawn large and in subtle ink. No motif here.
- **Title.** An `<h3>` by default, in heading type. `asChild` sets the level.
- **Description.** A `<p>` in body type, subtle ink, kept to a readable measure.
- **Actions.** Any children after Description (usually one primary Button and at most one secondary). Not a Part: Root's gap and centring lay them out. One primary per view still applies.

## API

`EmptyState.Root`, `EmptyState.Indicator`, `EmptyState.Description`: `ComponentProps<"div">` / `ComponentProps<"p">`, passed through (`ref`, `className`, native attributes).

`EmptyState.Title`

| Prop      | Type                   | Default | Notes                                                                                                                          |
| --------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `asChild` | `boolean`              | `false` | Renders the single child (e.g. `<h2>`) with the Title's props and styles (Radix Slot). The look stays the same at every level. |
| …native   | `ComponentProps<"h3">` |         | `ref`, `className`, `id` pass through.                                                                                         |

No Variants and no sizes.

Names, checked against the reference libraries:

- **Component name `EmptyState`**: Chakra `EmptyState`: "Used to indicate when a resource is empty or unavailable." (https://chakra-ui.com/docs/components/empty-state); shadcn calls it `Empty`: "Use the Empty component to display an empty state." (https://ui.shadcn.com/docs/components/empty); React Aria uses the term for a prop, `renderEmptyState`: "Provides content to display when there are no items in the list." (https://react-aria.adobe.com/ListBox). Radix, Base UI, Ark, MUI and Mantine document no such component (not found; Base UI https://base-ui.com/llms.txt and Ark https://ark-ui.com/llms.txt component lists). We keep spec #1's `EmptyState`, which is Chakra's name and React Aria's term; shadcn's `Empty` is the only other.
- **Parts `Root`, `Indicator`, `Title`, `Description`**: Chakra's own example composes `<EmptyState.Root>`, `<EmptyState.Content>`, `<EmptyState.Indicator>`, `<EmptyState.Title>`, `<EmptyState.Description>` (`apps/compositions/src/examples/empty-state-with-action.tsx` in chakra-ui/chakra-ui); shadcn `EmptyMedia` ("display the media of the empty state such as an icon or an image"), `EmptyTitle`, `EmptyDescription`. `Indicator` is both Chakra's word and one of spec #1's Radix Part names.
- **No `Content` Part**: the two libraries disagree on what it means. Chakra's `Content` wraps everything, actions included (the same example puts the indicator, title, description and the `<ButtonGroup>` inside `<EmptyState.Content>`); shadcn's `EmptyContent` holds only the actions, with `EmptyHeader` "wraps the empty media, title, and description." Root does the layout itself, so neither wrapper is needed and the ambiguous name is avoided (judgement call).
- **Title is a heading**: Chakra's Title renders `h3` (`EmptyStateTitle = withContext<…>("h3", "title")`, `packages/react/src/components/empty-state/empty-state.ts` in chakra-ui/chakra-ui); shadcn's `EmptyTitle` renders a `div` (`data-slot="empty-title"`, https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/empty.tsx). We follow Chakra: the title names the region, and screen-reader users navigate by headings (see Accessibility).
- **`asChild` for the level**: Chakra's Root documents `asChild` "Use the provided child element as the default rendered element, combining their props and behavior." Spec #1 makes `asChild` the composition mechanism, so no `as` or `level` prop.
- **No `size`**: Chakra has "`'sm'`, `'md'`, and `'lg'`. The default is `'md'`."; shadcn has none. Phase 1 ships one size; a denser placement (a table cell, a menu) overrides `empty-state-padding` and `empty-state-icon-size`. A size union can be added when a second size is designed.
- **No `EmptyMedia variant="icon"`** (shadcn "`"default" | "icon"`"): the Indicator never draws a box, in keeping with "Quiet. Neutral surfaces."

## States

| State | How it shows   | Exposed as |
| ----- | -------------- | ---------- |
| rest  | The only state | none       |

Its actions carry their own states.

## Behaviour

- Copy: Title says what is missing ("No files yet", "No results for "moss""); Description says why or what to do. Sentence case. The action label is a verb.
- Search and filter results: the Title quotes the query, and Description offers to clear filters.
- Centred text; the column is capped at `empty-state-max-width`, so lines stay readable in wide regions.
- Every Part is a Server Component; nothing is `'use client'`. Actions bring their own client code.

## Motion

None. EmptyState replaces content in place; its appearance is the content change itself.

- **Reduced motion:** nothing to remove.
- **Instant exit:** EmptyState never animates out. When items arrive, the app renders them in its place in the same update; the region swaps in one frame, so there is no half-state to read wrongly.

## Keyboard

No APG pattern exists for an empty state (the APG patterns index lists 30 patterns, from Accordion to Window Splitter, and none for an empty state: https://www.w3.org/WAI/ARIA/apg/patterns/). The closest elements are the HTML headings `<h1>`–`<h6>` and the paragraph.

| Key             | Action                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Moves to / from the actions only. Root, Indicator, Title and Description are not focusable and have no keyboard interaction. |

## Accessibility

- **No role.** It is ordinary content. Root does not get `role="status"`: MDN's live region guide says "Establish the live region before updating its content. Start with an empty live region…" (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions), and an EmptyState is inserted, not updated. When a search or filter empties a list, the app announces the count ("No results") through its own `role="status"` region that is always rendered (MDN `status`: "advisory information that is not important enough to justify an alert", https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role). Documented on the docs page.
- **Heading level.** MDN: "Do not skip heading levels: always start from `<h1>`, followed by `<h2>` and so on." and "A common navigation technique for users of screen reading software is to quickly jump from heading to heading…" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements). The `<h3>` default fits the common case, a list inside a section headed `<h2>` (inference). Anywhere else, set the level with `asChild`.
- **Indicator** content is decorative: Icon is `aria-hidden` by default, and an image gets `alt=""`. The Title carries the meaning.
- **Contrast.** Title `color-text-default` and Description `color-text-subtle` are checked on every Surface by the matrix. The icon uses `color-icon-subtle` (3:1 checked, though decorative).
- **Reflow.** The column wraps at 320 CSS px; actions wrap onto new lines (`flex-wrap`).
- **More contrast:** `color-text-subtle` and `color-icon-subtle` already pass AA; no change. The component has no border to raise.
- **Forced colors:** text and icons take system colours (`CanvasText`); nothing relies on a fill. No change needed.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only. The column is centred, so it reads the same in both directions; actions follow the inline direction (primary first, at the start). Icons in the Indicator are not mirrored unless the Icon itself is directional (Icon handles `:dir(rtl)`). No arrow-key behaviour.

## Component tokens

New component word `empty-state` (Dictionary change). All other words already exist.

| Token                                | References           | Why                                              |
| ------------------------------------ | -------------------- | ------------------------------------------------ |
| `empty-state-padding`                | `space-inset-xl`     | Padding around the column (24)                   |
| `empty-state-gap`                    | `space-stack-md`     | Gap between Indicator, text and actions (16)     |
| `empty-state-max-width`              | `size-container-xs`  | Readable measure for Title and Description (320) |
| `empty-state-icon-size`              | `size-icon-xl`       | Indicator icon, 32                               |
| `empty-state-icon-color`             | `color-icon-subtle`  | Indicator ink                                    |
| `empty-state-title-font`             | `type-heading-xs`    | Noto Serif 17/500                                |
| `empty-state-title-text-color`       | `color-text-default` |                                                  |
| `empty-state-description-font`       | `type-body-sm`       | Figtree 15                                       |
| `empty-state-description-text-color` | `color-text-subtle`  |                                                  |

None exist yet. Title and Description sit closer than the Root gap: Description takes `margin-block-start: calc(var(--ab-space-stack-xs) - var(--ab-empty-state-gap))`, so the pair reads as one group (design decision; no extra token).

## Built-in labels

None. Every string comes from its children.

## Feedback events

None. EmptyState has no interaction of its own; its actions dispatch their own (`ab-press` from Button).

## Sources

- WAI-ARIA APG patterns index (no empty-state pattern): https://www.w3.org/WAI/ARIA/apg/patterns/
- MDN heading elements: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements
- MDN ARIA live regions: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
- MDN `status` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role
- Chakra UI EmptyState: https://chakra-ui.com/docs/components/empty-state and source `packages/react/src/components/empty-state/empty-state.ts` (github.com/chakra-ui/chakra-ui)
- shadcn/ui Empty: https://ui.shadcn.com/docs/components/empty and source https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/empty.tsx
- React Aria ListBox (`renderEmptyState`): https://react-aria.adobe.com/ListBox
- Base UI and Ark component lists: https://base-ui.com/llms.txt, https://ark-ui.com/llms.txt
- Brand book: principle 5 ("Flat in flow"), Direction ("Quiet"), Accessibility (Resize and reflow).
