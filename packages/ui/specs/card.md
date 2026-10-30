# Card

Groups content about one subject so it can be scanned and compared: a report, a project, a settings area. Don't nest cards, and don't use a card as a page section; in-flow content separates with space, hairlines and surface steps (brand book, "Flat in flow, lifted in overlays").

```tsx
import { Button } from "@platform/ui/button";
import { Card } from "@platform/ui/card";
import { Link } from "@platform/ui/link";

{
  /* Linked card: one stretched link, the title */
}
<Card.Root>
  <Card.Header>
    <Card.Title>
      <Link href="/reports/q3">Quarterly report</Link>
    </Card.Title>
    <Card.Description>Updated 2 hours ago</Card.Description>
  </Card.Header>
</Card.Root>;

{
  /* Horizontal, with an action */
}
<Card.Root orientation="horizontal">
  <Card.Header>
    <Card.Title>API keys</Card.Title>
    <Card.Description>2 active</Card.Description>
  </Card.Header>
  <Card.Footer>
    <Button size="sm">Manage</Button>
  </Card.Footer>
</Card.Root>;
```

Status: draft for brand-owner review (phase 1). Source guide: `components/Card/README.md` in the artifact.

## Anatomy

`Card.Root` → `Card.Header` (`Card.Title`, `Card.Description`) → `Card.Content` (optional) → `Card.Footer` (optional).

- **Root.** A `<div>` (any element through `asChild`: `<article>`, `<li>`). `surface-default` background, 1 px `border-subtle` hairline, radius 12, padding 16. Flat at rest: no elevation. It is the query container (`container-type: inline-size`) and renders one internal layout wrapper, because a container query styles the container's descendants, not the container (MDN: "apply styles to elements based on the size of the nearest ancestor with a containment context").
- **Header.** Groups Title and Description, stacked with `card-gap`.
- **Title.** An `<h3>` by default, serif 17/500 (`type-heading-xs`). Heading level depends on the page, so `asChild` renders the consumer's own heading (`<Card.Title asChild><h2>…</h2></Card.Title>`).
- **Description.** A `<p>`, 14 px (`type-body-xs`), `text-subtle`.
- **Content.** A `<div>` for the body: a list, a figure, a paragraph.
- **Footer.** A `<div>` for actions and secondary content. Items sit in a row with `card-footer-gap`.

## API

`Card.Root`

| Prop          | Type                         | Default      | Notes                                                                                                                                                                         |
| ------------- | ---------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | `"horizontal"` places Header and Content at the start and Footer at the end when the card itself is at least 480 px wide; narrower, it stacks. Exposed as `data-orientation`. |
| `asChild`     | `boolean`                    | `false`      | Renders the child element (`<article>`, `<li>`) with Root's props and styles.                                                                                                 |
| …native       | `ComponentProps<"div">`      |              | `ref`, `className`, native attributes.                                                                                                                                        |

`Card.Title`: `asChild` plus `ComponentProps<"h3">`. `Card.Header`, `Card.Content`, `Card.Footer`: `ComponentProps<"div">`. `Card.Description`: `ComponentProps<"p">`. All pass `ref` and `className`.

A linked card has no prop: put a link (Link, a Next.js `<Link>`, or a plain `<a href>`) inside `Card.Title`. Card's CSS stretches it (Behaviour).

Names, checked against the reference libraries:

- **Compound Parts instead of the source's config props** (`title`, `description`, `href`, `actions`): spec #1 "The source APIs use config arrays. Resolved: compound components." and user story 6.
- **`Card`**: shadcn "Displays a card with header, content, and footer." (https://ui.shadcn.com/docs/components/card); Chakra "Used to display content related to a single subject." (https://chakra-ui.com/docs/components/card); MUI "Cards contain content and actions about a single subject." (https://mui.com/material-ui/react-card/); Radix Themes "Container that groups related content and actions." (https://www.radix-ui.com/themes/docs/components/card); Mantine `Card` (https://mantine.dev/core/card/). Every library uses the name.
- **`Root`**: Chakra `Card.Root` (Usage: `<Card.Root>`); spec #1's Radix Part names.
- **`Header`**: shadcn "The `CardHeader` component is used for a title, description, and optional action."; Chakra `Card.Header`; MUI "Card Header: an optional wrapper for the Card header."
- **`Title`, `Description`**: shadcn "The `CardTitle` component is used for the card title." and "The `CardDescription` component is used for helper text under the title."; Chakra's anatomy lists "title, description". Radix uses the same Part names for Dialog.
- **`Content`**, not Chakra's `Card.Body`: shadcn "The `CardContent` component is used for the main card body."; MUI "Card Content: the wrapper for the Card content."; `Content` is also in spec #1's Radix list. Two of three libraries plus the Part rule.
- **`Footer`**: shadcn "The `CardFooter` component is used for actions and secondary content at the bottom of the card."; Chakra `Card.Footer`. MUI's `CardActions` ("an optional wrapper that groups a set of buttons") is narrower.
- **Left out:** shadcn's `CardAction` ("places content in the top-right of the header") is shadcn-only; Footer covers actions, and `orientation="horizontal"` covers the side placement. Mantine's `Card.Section` ("used to remove Card padding from its children") and MUI's `CardMedia` belong with media cards, which the source has none of. MUI's `CardActionArea` ("allows users to interact with the specified area of the Card") wraps content in a button and makes all of it the label; the stretched link avoids that (Behaviour).
- **`asChild` on Root**: Radix Themes "Use the `asChild` prop to render the card as a link or a button." (https://www.radix-ui.com/themes/docs/components/card). Ours is for semantics (`<article>`, `<li>`) only; rendering the whole card as `<a>` is what the stretched link replaces.
- **`orientation`**: no reference library documents a layout prop on Card; the name and values are the platform's `aria-orientation` and this library's Separator and RadioGroup. Chakra shows "Use the Card component to display content horizontally." but its props table has only `size`, `variant`, `as`, `asChild`, `unstyled` (https://chakra-ui.com/docs/components/card). The prop is the source's (`orientation="horizontal"`), kept because the behaviour is responsive (a container query), which `orientation` (a fixed axis in Radix) would misdescribe. **Judgement call** flagged for review.
- **No `variant` or `size`.** Chakra has `elevated | outline | subtle` and `sm | md | lg`, shadcn `size="sm"`; the source has one treatment.

## States

| State                  | How it shows                                                                                                                  | Exposed as                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| rest                   | Hairline border, no elevation                                                                                                 | `data-orientation`                            |
| hovered (linked)       | Border steps to `border-default`, `elevation-raised` shadow; fine pointers only (`@media (hover: hover) and (pointer: fine)`) | `:has()` on the title link's `:hover`         |
| focus-visible (linked) | 2 px focus ring around the whole card, 3 px offset, `color-border-focused`                                                    | `:has()` on the title link's `:focus-visible` |

A card without a link has only rest. There is no pressed state: the link navigates.

## Behaviour

- **Linked card: one stretched link.** Source: "Linked cards: one stretched link (the title) — the card is a single tab stop and announces as the title." Technique (Heydon Pickering, Inclusive Components, "Cards", https://inclusive-components.design/cards/): Root is `position: relative`, and the title link's `::after` is `position: absolute` with its edges at 0 ("This stretches the link's layout over the whole card, making it clickable like a button."). We write `inset: 0`. Wrapping the whole card in `<a>` is avoided because "all of the card contents form the label of the link" and "Some screen readers only read out the first element of a 'block link'".
- **Actions stay independently clickable.** Source: "Actions sit above the link layer and stay independently clickable." Footer and Content get `position: relative`, and the Footer is content-sized (`inline-size: fit-content`), so only its actions, not its empty row, sit above the link; Inclusive Components: "A declaration of `position:relative` will raise the link about the pseudo-content" and "no `z-index`, because the author link is after the primary link in the source". Card.Header comes first, so later Parts are above the stretched link without `z-index`.
- **Text selection.** Inclusive Components notes "it's now difficult to select the text within the card (the link acts as a mask over the top of it)". Card.Content is raised (above), so its text stays selectable; the Header text is part of the link target, as the source intends.
- **Hover and focus on the card, not the link.** `.root:has(.title a:hover)` and `.root:has(.title a:focus-visible)` style the Root; the link's own outline is removed only inside a Card.Title, because the Root draws the ring. `:has()` is Baseline widely available, "since December 2023" (MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/:has). Hovering a Footer button doesn't lift the card, because the link is not hovered then.
- **Title link look.** Inside Card.Title the link takes the title colour and font; the hover border and shadow are the affordance, not an underline.
- **Horizontal orientation.** The source calls it the row layout: "`container-type: inline-size`: `layout="row"` reflows horizontally at ≥ 480px of its own width, wherever it is placed." `container-type` is Baseline widely available, "since February 2023" (MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/container-type); so is `@container`. Horizontal, the internal wrapper is a flex row: Header and Content grow, Footer sits at the inline end, centred on the block axis, gap `space-inline-lg` (the artifact's `.ab-card[data-layout="row"]` column gap). Vertical, Header, Content and Footer stack with `card-gap`, as the artifact's `.ab-card-layout`. The 480 px threshold is a literal in the CSS module, not a token: MDN, "The `var()` function cannot be used in property names, selectors or anything else besides property values." (https://developer.mozilla.org/en-US/docs/Web/CSS/var).
- Server Component: no client code. The stretched link, hover, focus and horizontal orientation are all CSS.
- Only one link may be stretched: the one in Card.Title. Other links go in Content or Footer.

## Motion

- Hover (linked, fine pointers): border colour and shadow over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color`. No translate or scale: "lift" is the shadow, because the card is in flow and moving it would shift its neighbours' visual alignment (design decision).
- Keyboard focus shows the ring at once, with no transition (brand book: "No motion on keyboard-initiated … actions").
- **Reduced motion:** nothing moves; the colour and shadow fades stay (brand book: "Opacity and color fades remain").
- **Instant exit:** Card has no exit. Hover-out is a colour/shadow transition that reverses from its current value when interrupted, which reads correctly; with no transition at all the card simply returns to flat.

## Keyboard

APG pattern for a linked card: **Link** (https://www.w3.org/WAI/ARIA/apg/patterns/link/), "A link widget provides an interactive reference to a resource." A card itself has no APG pattern (https://www.w3.org/WAI/ARIA/apg/patterns/ lists none); a non-linked card is a `generic` container ("A nameless container element that has no semantic meaning on its own.", WAI-ARIA 1.2) or, through `asChild`, an `article` ("A section of a page that consists of a composition that forms an independent part of a document, page, or site.").

| Key             | Action                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Enter           | On the title link: "Executes the link and moves focus to the link target."                                                         |
| Shift + F10     | "(Optional): Opens a context menu for the link." (browser-provided)                                                                |
| Tab / Shift+Tab | The title link is the card's one tab stop; Footer and Content controls follow in source order. A non-linked card adds no tab stop. |

Native `<a href>` provides Enter, so no key handler is added.

## Accessibility

- The linked card announces as its title only (source; Inclusive Components). The description is not in the link's name; put it in `aria-describedby` on the link only if the title alone is ambiguous.
- Title is a real heading, so cards can be navigated by heading; set the level with `asChild` to fit the page outline.
- A list of cards should be a list (`<ul>` with `Card.Root asChild` on `<li>`), so the count is announced (inference).
- Targets: the whole card is the link target; Footer buttons keep their own sizes from `size-control-*`.
- Contrast: `text-default` and `text-subtle` on `surface-default` are in the AA matrix. The `border-subtle` hairline is decorative (brand book: "The subtle hairline border is decorative and is never the only boundary of a control"); the linked card's boundary on hover/focus is `border-default` and the focus ring.
- **More contrast:** `color-border-subtle` steps up to `color-border-default` under `(prefers-contrast: more)` (token media override), so the card edge strengthens.
- **Forced colors:** the border stays (border colours become a system colour), the hover shadow disappears ("`box-shadow` is forced to 'none'", MDN forced-colors), so hover adds nothing there; the focus ring uses `outline`, which forced colors paint in the system text colour (`CanvasText`). The link text takes `LinkText`.
- **Reduced transparency:** not affected (no Material).

## RTL

Logical properties only (`padding`, `inset`, `margin-inline`). The horizontal orientation follows inline direction, so Footer sits on the left in RTL. The stretched link uses `inset: 0`, direction-neutral. No arrow keys.

## Component tokens

Existing: `card-padding`, `card-gap`, `card-border-radius`, `card-border-width`, `card-background-color`, `card-border-color`, `card-border-color-hovered`, `card-shadow-hovered`, `card-title-font`, `card-title-text-color`, `card-description-font`, `card-description-text-color`.

Proposed new:

| Token             | References               | Why                                                                                               |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| `card-footer-gap` | `space-inline-sm` (8 px) | The gap between Footer actions; the source's `actions` had no token. Mirrors `dialog-footer-gap`. |

The horizontal gap is semantic `space-inline-lg`; the vertical gap reuses `card-gap`. Focus ring: semantic `focus-ring-width`, `focus-ring-offset`, `color-border-focused` (R6).

## Author-written text

None. Every string comes from the consumer's Parts.

## Feedback events

None from Card. The title link is the consumer's Link; any press feedback is Link's.

## Sources

- Source guide: artifact `project/components/Card/README.md` ("Surface-default, 1px subtle border, radius 12, 16 padding. Title serif 17/500, description 14."; "Linked cards: one stretched link (the title) — the card is a single tab stop and announces as the title. Hover lifts the border and adds raised elevation; focus ring wraps the card. Actions sit above the link layer and stay independently clickable."). Archived brand book: `elevation-raised` used for "linked card hover".
- WAI-ARIA APG Link pattern: https://www.w3.org/WAI/ARIA/apg/patterns/link/; pattern list: https://www.w3.org/WAI/ARIA/apg/patterns/
- WAI-ARIA 1.2 `generic`, `article`: https://www.w3.org/TR/wai-aria-1.2/
- Inclusive Components, Cards: https://inclusive-components.design/cards/
- shadcn/ui Card: https://ui.shadcn.com/docs/components/card
- Chakra Card: https://chakra-ui.com/docs/components/card
- Mantine Card: https://mantine.dev/core/card/
- MUI Card: https://mui.com/material-ui/react-card/
- Radix Themes Card: https://www.radix-ui.com/themes/docs/components/card
- MDN `container-type`, `@container`, container queries, `:has()`, `var()`: https://developer.mozilla.org/en-US/docs/Web/CSS/container-type, https://developer.mozilla.org/en-US/docs/Web/CSS/@container, https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries, https://developer.mozilla.org/en-US/docs/Web/CSS/:has, https://developer.mozilla.org/en-US/docs/Web/CSS/var
- MDN forced-colors: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
