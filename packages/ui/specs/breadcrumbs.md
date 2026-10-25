# Breadcrumbs

Shows where the current page sits in the site's hierarchy, as a trail of links to its parent pages, placed before the page's main content. Use it on pages two or more levels deep. For the site's main sections use a Navbar or a Sidebar; for steps in a process (checkout, onboarding) use a step indicator, not Breadcrumbs.

```tsx
import { Breadcrumbs } from "@platform/ui/breadcrumbs";
import NextLink from "next/link";

<Breadcrumbs.Root>
  <Breadcrumbs.Item>
    <Breadcrumbs.Link asChild>
      <NextLink href="/">Home</NextLink>
    </Breadcrumbs.Link>
  </Breadcrumbs.Item>
  <Breadcrumbs.Item>
    <Breadcrumbs.Link href="/projects">Projects</Breadcrumbs.Link>
  </Breadcrumbs.Item>
  <Breadcrumbs.Item>
    <Breadcrumbs.Link href="/projects/atlas" aria-current="page">Atlas</Breadcrumbs.Link>
  </Breadcrumbs.Item>
</Breadcrumbs.Root>

<Breadcrumbs.Root labels={{ root: "Fil d’Ariane" }}>…</Breadcrumbs.Root>
```

Status: draft for brand-owner review (phase 3). No source guide: drafted from the WAI-ARIA APG Breadcrumb pattern, the Link spec and the reference libraries.

## Anatomy

Root (nav → ordered list) → Items (separator → link).

- **Root.** A native `<nav>` (the navigation landmark) named by `aria-label` from `labels.root`, wrapping a native `<ol>` with list styling reset. The list is a wrapping flex row (`flex-wrap: wrap`), gap `breadcrumbs-gap`, text in `breadcrumbs-font`.
- **Item.** A native `<li>`, `display: inline-flex`, centred, `min-block-size: size-target-min` (24) so wrapped rows keep targets apart (Accessibility).
- **Separator.** Drawn by the Item, not a Part: a `ChevronRightIcon` (`size="sm"`, 16, decorative: `aria-hidden` from the Icon component) before the link, in `breadcrumbs-separator-icon-color`. Hidden on the first Item (`li:first-child`), so it only ever sits between two items.
- **Link.** The Link component (a native `<a href>`, or the child element with `asChild`), so the underline, hover and focus are Link's own. Ancestors: text `breadcrumbs-item-text-color`, underlined like Link (`link-underline-*`). The current page (`aria-current="page"`): `link-text-color`, no underline.

## API

`Breadcrumbs.Root`

| Prop     | Type                    | Default                  | Notes                                                                                                     |
| -------- | ----------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `locale` | `Locale`                | en-US                    | A shipped locale; translates `root` on the server.                                                        |
| `labels` | `{ root?: string }`     | `{ root: "Breadcrumb" }` | Built-in labels: the landmark's `aria-label`.                                                             |
| …native  | `ComponentProps<"nav">` |                          | `ref`, `className`, `aria-labelledby` and native attributes go on the `<nav>`. The `<ol>` takes no props. |

`Breadcrumbs.Item`: `ComponentProps<"li">`.

`Breadcrumbs.Link`

| Prop      | Type                  | Default  | Notes                                                                                                                                                             |
| --------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `href`    | `string`              | required | Required unless `asChild` (then the child carries it), as Link.                                                                                                   |
| `asChild` | `boolean`             | `false`  | Renders the single child element (a router link) with the Part's props and styles (Radix Slot).                                                                   |
| …native   | `ComponentProps<"a">` |          | `ref`, `className`, `aria-current` and native attributes pass through. The consumer sets `aria-current="page"` on the current page's link; nothing else marks it. |

Names, checked against the reference libraries:

- **`Breadcrumbs`**: React Aria `Breadcrumbs` / `Breadcrumb`, "Breadcrumbs display a hierarchy of links to the current page or resource in an application." (https://react-aria.adobe.com/Breadcrumbs); MUI `Breadcrumbs` (https://mui.com/material-ui/api/breadcrumbs/); Mantine `Breadcrumbs`, "Separates list of react nodes with given separator" (https://mantine.dev/core/breadcrumbs/). shadcn uses `Breadcrumb` (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`, https://ui.shadcn.com/docs/components/breadcrumb) and Chakra `Breadcrumb.Root/List/Item/Link/CurrentLink/Separator/Ellipsis` (https://chakra-ui.com/docs/components/breadcrumb). Radix Primitives and Base UI have none (Base UI's list of 37 components has no Breadcrumb, https://base-ui.com/react/overview/quick-start). Three libraries say `Breadcrumbs`, two `Breadcrumb`.
- **Parts `Root` / `Item` / `Link`**: Chakra's `Breadcrumb.Root`, `Breadcrumb.Item`, `Breadcrumb.Link` and shadcn's `BreadcrumbItem`, `BreadcrumbLink`. No `List` Part: Root renders the `<nav>` and the `<ol>` together, as React Aria's `Breadcrumbs` is the list itself (its DOM props are typed `HTMLOListElement`). shadcn and Chakra split them; nothing needs styling the list apart from the landmark (judgement call, fewer Parts).
- **`asChild`**: shadcn `BreadcrumbLink` takes `asChild` in its source (`const Comp = asChild ? Slot.Root : "a"`, https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/breadcrumb.tsx); its docs now say "you can use the `render` prop on `<BreadcrumbLink />`". Spec #1 uses `asChild`.
- **Current page is a link with `aria-current="page"`, no `Page` / `CurrentLink` Part and no `isCurrent` prop.** APG's example marks up the last crumb as `<a href="" aria-current="page">Breadcrumb Example</a>`, and its table says `aria-current=page` is "Applied to the last link in the set to indicate that it represents the current page." The libraries differ: shadcn `BreadcrumbPage` is a `<span role="link" aria-disabled="true" aria-current="page">`, "displays the current page in the breadcrumb (non-clickable)"; Chakra has `CurrentLink`; React Aria's last `<Breadcrumb>` has no `href` and is styled with `[data-current]`; MUI's basic demo uses plain `Typography`, and another demo says "Keep the last breadcrumb interactive." We follow the APG example and the shared contract (the native attribute is the API, styled with `[aria-current="page"]`), so one Part covers both (judgement call). A consumer who wants plain text puts text in the Item instead: APG "If the element representing the current page is not a link, aria-current is optional."
- **Separator drawn by the Item, no `separator` prop and no Separator Part.** MUI `separator` "Custom separator node." default `'/'`; Mantine "adds a given separator (defaults to `/`)"; shadcn `BreadcrumbSeparator` "You can pass custom children to override the default separator icon."; React Aria draws `ChevronRight` inside each item. The system has one separator (the chevron), so it is not configurable (judgement call).
- **`labels.root` default "Breadcrumb"**: APG's example `aria-label=Breadcrumb` "Provides a label that describes the type of navigation provided in the `nav` element." shadcn hard-codes `aria-label="breadcrumb"`; MUI: "Be sure to add a `aria-label` description on the `Breadcrumbs` component." The `labels` prop follows spec #1 ("a typed `labels` prop per component").
- **Left out (YAGNI):** collapsing (MUI `maxItems` default 8, `itemsBeforeCollapse`, `itemsAfterCollapse`, `expandText` "Show path"; shadcn `BreadcrumbEllipsis`; Chakra `Ellipsis`), a custom `separator`, React Aria's `onAction`, `isDisabled` and `items`, Chakra's `size` and `variant`. A long trail wraps onto more lines instead of collapsing (Behaviour).

## States

| State         | How it shows                                                                                                                 | Exposed as              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| rest          | Ancestor links in `breadcrumbs-item-text-color`, underline `link-underline-color`                                            | —                       |
| hovered       | Underline `link-underline-color-hovered` (accent), as Link; fine pointers only (`@media (hover: hover) and (pointer: fine)`) | `:hover`                |
| focus-visible | 2 px focus ring, 3 px offset, `color-border-focused`                                                                         | `:focus-visible`        |
| current       | `link-text-color` (`color-text-default`), no underline, no hover change                                                      | `[aria-current="page"]` |

## Behaviour

- Navigation is the browser's (or the router's, through `asChild`). No click handler, no state: every Part is a Server Component (no `'use client'`). With `asChild` the Slot only merges props onto the child, as in Link (the Slot must not use hooks; verified when built).
- **Long trails wrap.** The list wraps between items (`flex-wrap`), and a long item name wraps inside its link (`overflow-wrap: anywhere`). Nothing is truncated, so no crumb's text or accessible name is hidden (judgement call; shadcn's list does the same: `"flex flex-wrap items-center … break-words"`).
- The separator sits inside the Item that follows it, so it wraps with that item: a wrapped row starts with a chevron, and no row ends with one (from the markup; checked in the w320 screenshot variant).
- Order: root first, current page last, as APG: "a list of links to the parent pages of the current page in hierarchical order."

## Motion

- Hover: `text-decoration-color` over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color`, as Link.
- No press scale, as Link (text in a line).
- **Reduced motion:** nothing to remove; the only transition is a colour fade, which stays.
- **Instant exit:** Breadcrumbs has no exit. Hover-out reverses from the current colour; with no transition the underline switches colour, which reads as correct.

## Keyboard

APG pattern: **Breadcrumb** (https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/). Its Keyboard Interaction section: "Not applicable." The links are native, so the Link pattern applies to each (https://www.w3.org/WAI/ARIA/apg/patterns/link/).

| Key             | Action                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| Tab / Shift+Tab | Moves focus to the next / previous link (native tab order).               |
| Enter           | "Executes the link and moves focus to the link target." (APG Link)        |
| Shift + F10     | "(Optional): Opens a context menu for the link." Provided by the browser. |

No arrow keys: it is a list of links, not a composite. No key handler is added.

**RTL:** no arrow-key behaviour, so nothing swaps.

## Accessibility

- APG: "Breadcrumb trail is contained within a navigation landmark region." and "The landmark region is labelled via aria-label or aria-labelledby." Root's `<nav>` has the implicit `navigation` role (ARIA in HTML: `nav` → `role=navigation`), named by `labels.root`; a consumer `aria-labelledby` also passes through.
- APG: "The link to the current page has aria-current set to `page`." MDN: "Only mark one element in a set of elements as current with aria-current." (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
- An ordered list (`<ol>`), as APG's example and MUI: "The set of links is structured using an ordered list (`<ol>` element)." Screen readers announce the item count.
- **Separators are decorative.** APG's example draws them "via CSS" "To prevent screen reader announcement of the visual separators between links". We draw an icon element instead and hide it with `aria-hidden` (Icon's default when it has no `label`), as MUI: "they are hidden with `aria-hidden`." (judgement call: one glyph source, and the Icon component's RTL mirror).
- **Landmark names:** a second Breadcrumbs on the same page needs a different `labels.root` (APG landmarks: "If a page includes more than one `navigation` landmark, each should have a unique label.", https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html).
- **Targets:** links are at least 24 px tall (Item `min-block-size`), and items are separated by the chevron and two gaps, so WCAG 2.5.8 holds on wrapped rows too (inference; measured in the build).
- **Contrast:** ancestor text `color-text-subtle` and current `color-text-default` are matrix text roles (4.5:1 on every surface). The underline uses `color-border-default` (3:1). The separator is decorative and needs no contrast.
- **Not colour alone:** ancestors are underlined and the current page is not, so the current page differs by shape as well as colour.
- **More contrast:** no change needed (text roles already pass; the underline already uses `color-border-default`).
- **Forced colors:** links take the system link colour and the underline stays (Link spec). The current page sets `color: CanvasText` in `@media (forced-colors: active)` (system colours are not forced), so it reads as text, not a link colour, and still has no underline. The separator is `currentColor`.
- **Reduced transparency:** not affected.

## RTL

Logical properties only; the list runs from the inline start, so the root is on the right in RTL. The separator is `chevron-right`, which the Icon component mirrors under `:dir(rtl)` (Icon spec RTL list: "`arrow-right`, `arrow-up-right`, `chevron-right`, `log-out`"), so it points from parent to child in both directions.

## Component tokens

Existing (reused from Link): `link-text-color` (current page), `link-underline-color`, `link-underline-color-hovered`, `link-underline-thickness`, `link-underline-offset`.

Proposed new:

| Token                              | References                       | `$type`    | Why                                                                     |
| ---------------------------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `breadcrumbs-gap`                  | `{semantic.space-inline-xs}`     | dimension  | Space between a separator and the links on each side, and between rows  |
| `breadcrumbs-font`                 | `{semantic.type-body-xs}`        | typography | The trail's type (14 px, line height 160 so wrapped rows stay readable) |
| `breadcrumbs-item-text-color`      | `{semantic.color-text-subtle}`   | color      | Ancestor links, a step quieter than the current page                    |
| `breadcrumbs-separator-icon-color` | `{semantic.color-icon-subtlest}` | color      | The chevron                                                             |

Consumed as semantic tokens directly: `size-target-min` (Item minimum height, a system rule), `focus-ring-width`, `focus-ring-offset`, `color-border-focused`, and the `motion-*` tokens. New Dictionary component word: `breadcrumbs`. No new modifier words (`item`, `separator` exist).

## Built-in labels

| Key    | Default      | Used by                 |
| ------ | ------------ | ----------------------- |
| `root` | "Breadcrumb" | `aria-label` on `<nav>` |

Root is a Server Component and cannot read the Provider, so it takes the shipped `locale` object (as Pagination does) and `labels` overrides; without either, `breadcrumbs` in `src/provider/locales/en-US/breadcrumbs.ts` is the en-US default (Q19-1).

## Feedback events

None. Navigation is not a feedback moment (Link spec), and dispatching one would need a client handler on every link.

## Sources

- WAI-ARIA APG Breadcrumb pattern: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/ ("A breadcrumb trail consists of a list of links to the parent pages of the current page in hierarchical order."; "Breadcrumbs are often placed horizontally before a page's main content."; Keyboard Interaction "Not applicable."; the four Roles, States and Properties bullets quoted above).
- APG Breadcrumb example: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/examples/breadcrumb/ (markup `<nav aria-label="Breadcrumb" class="breadcrumb"><ol>…<a href="" aria-current="page">Breadcrumb Example</a>`; its CSS draws the separator with `nav.breadcrumb li + li::before { … content: ""; }`).
- APG Link pattern: https://www.w3.org/WAI/ARIA/apg/patterns/link/ · APG navigation landmark: https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html
- ARIA in HTML: https://www.w3.org/TR/html-aria/ (`nav` "role=navigation"; `ol` "role=list"; `li` in a list "role=listitem")
- MDN `aria-current`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current ("Represents the current page within a set of pages such as the link to the current document in a breadcrumb.")
- CSS Color Adjustment 1 (system colours are not forced): https://www.w3.org/TR/css-color-adjust-1/
- Baseline (webstatus.dev, 2026-10-24): `flexbox-gap` widely (low 2021-04-26); `dir-pseudo` (`:dir()`) widely (low 2023-12-07); `forced-colors` widely (low 2022-09-12); `text-decoration` widely; `prefers-contrast` widely (low 2022-05-31).
- React Aria Breadcrumbs: https://react-aria.adobe.com/Breadcrumbs · MUI Breadcrumbs API and guide: https://mui.com/material-ui/api/breadcrumbs/, https://mui.com/material-ui/react-breadcrumbs/ · Mantine Breadcrumbs: https://mantine.dev/core/breadcrumbs/ · shadcn/ui Breadcrumb: https://ui.shadcn.com/docs/components/breadcrumb and source https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/breadcrumb.tsx · Chakra Breadcrumb: https://chakra-ui.com/docs/components/breadcrumb · Base UI component list: https://base-ui.com/react/overview/quick-start
