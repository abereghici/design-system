# Pagination

Moves between the pages of a long, ordered result set (invoices, search results, a log) whose pages each have a URL. Use it when people need to jump to a page or come back to one. For a short list, show everything; for a feed read top to bottom, load more on demand; to move between sections of the site, use a Navbar or Sidebar.

```tsx
import { Pagination } from "@platform/ui/pagination";
import NextLink from "next/link";
import { roRO } from "@platform/ui/locales/ro-RO";

<Pagination
  page={page}
  count={12}
  getPageUrl={(page) => `/invoices?page=${page}`}
  linkComponent={NextLink}
/>

<Pagination
  page={2}
  count={40}
  getPageUrl={(page) => `?page=${page}`}
  locale={roRO}
  labels={{ page: (page) => `Pagina ${page}` }}
/>
```

Status: draft for brand-owner review (phase 3). No source guide: drafted from the WAI-ARIA navigation landmark and `aria-current` guidance (the APG has no pagination pattern), the IconButton and Link specs and the reference libraries.

## Anatomy

Root (nav → list) → Previous → page items and ellipses → Next.

- **Root.** A native `<nav>` named by `aria-label` from `labels.root`, wrapping a native `<ul>` with list styling reset: a single row (`display: flex`, no wrap), gap `pagination-gap`, items centred.
- **Previous / Next.** The IconButton component (md) with `asChild` around a link, each in its own `<li>`, so they look and press exactly like IconButton. Icon `ChevronRightIcon`, turned for Previous (RTL). Named by `labels.previous` / `labels.next`. With no target (first / last page) it is a plain disabled IconButton (Behaviour).
- **Page item.** A link per page, `<li>` → `<a href>` (or `linkComponent`), at least `pagination-item-min-width` wide and `pagination-item-height` tall, `pagination-item-padding-inline` for long numbers, radius `pagination-item-border-radius`, text `pagination-item-font` (tabular figures) in `pagination-item-text-color`. The visible text is the number formatted with `Intl.NumberFormat`; the accessible name is `labels.page`.
- **Current page item.** Fill `pagination-item-background-color-selected`, text `pagination-item-text-color-selected`, and a 1 px inset ring `pagination-item-border-color-selected`; carries `aria-current="page"`.
- **Ellipsis.** An `<li aria-hidden="true">` with a `MoreIcon` (`size="sm"`), the same footprint as a page item, `currentColor` from `pagination-item-text-color`. Not focusable, not a link.

## API

| Prop            | Type                                                                                   | Default             | Notes                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`          | `number`                                                                               | required            | The current page, 1-based, an integer in 1…`count` (as Mantine: "must be an integer in [1, total] interval"). Not corrected when out of range.                |
| `count`         | `number`                                                                               | required            | The total number of pages, an integer ≥ 1. Pages, not items.                                                                                                  |
| `getPageUrl`    | `(page: number) => string`                                                             | required            | The `href` of each page item and of Previous / Next.                                                                                                          |
| `linkComponent` | `ElementType`                                                                          | `"a"`               | Renders every enabled item (pages, Previous, Next) with this component, given `href`, `aria-label`, `aria-current`, `className` and children (a router link). |
| `locale`        | `Locale`                                                                               |                     | A shipped locale object: its `tag` formats the numbers (`"en"` without it) and its `labels.pagination` translate the names (Q15-2, Badge precedent).          |
| `labels`        | `{ root?: string; previous?: string; next?: string; page?: (page: string) => string }` | see Built-in labels | Each key overrides the locale's, then the English default. `page` receives the formatted number and lives only here (locale labels are strings).              |
| …native         | `ComponentProps<"nav">`                                                                |                     | `ref`, `className`, `aria-labelledby` and native attributes go on the `<nav>`.                                                                                |

Names, checked against the reference libraries:

- **`Pagination`**: MUI `Pagination` (https://mui.com/material-ui/api/pagination/), Mantine `Pagination` (https://mantine.dev/core/pagination/), Ark `Pagination` (https://ark-ui.com/react/docs/components/pagination), shadcn `Pagination` with `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` (https://ui.shadcn.com/docs/components/pagination). Every library that has one uses the name; Radix Primitives and Base UI have none (Base UI's 37 components, https://base-ui.com/react/overview/quick-start).
- **One component, no Parts.** MUI's `Pagination` is a single component that builds its items (`renderItem` default "`(item) => <PaginationItem {...item} />`"), as is Mantine's `<Pagination total={10} />`. Ark, shadcn and Mantine's `Pagination.Root` are compound and leave the range to the consumer. The range is the hard part, so the component owns it (judgement call; spec #1: "single-part components are plain").
- **`page`**: MUI `page` "The current page. … this pagination starts from `1`."; Ark `page` "The controlled active page". Mantine says `value`. Two of three say `page`.
- **`count` is pages (MUI), not items (Ark).** MUI `count` "The total number of pages."; Mantine `total` "Total number of pages, must be an integer". Ark's `count` is "Total number of data items" with `pageSize` "The controlled number of data items per page". We take MUI's name and meaning, which Mantine shares under another name; the app divides items by page size itself (judgement call).
- **`getPageUrl`**: Ark `getPageUrl` "Function to generate href attributes for pagination links." with `type: 'button' | 'link'`, and its reason: "paginate with real navigation, which crawlers can follow and users can open in a new tab." Ark passes `(details: PageUrlDetails)` (page and page size); we pass the page number, since there is no page size.
- **`linkComponent`**: MUI's router demo renders each item as `<PaginationItem component={Link} to={…} {...item} />` (PaginationItem `component`: "The component used for the root node. Either a string to use a HTML element or a component.", https://github.com/mui/material-ui/blob/master/docs/data/material/components/pagination/demos/link/PaginationLink.tsx); Mantine passes `getItemProps={(page) => ({ component: 'a', href: … })}`. Both use a polymorphic `component`; ours sits on the root and applies to every item, so it is prefixed (judgement call: spec #1's `asChild` needs a consumer-rendered child, and the items here are generated). Next.js: "`<Link>` is a React component that extends the HTML `<a>` element to provide prefetching and client-side navigation between routes." (https://nextjs.org/docs/app/api-reference/components/link)
- **Links only, no `onPageChange` / `defaultPage` / button mode (judgement call).** MUI (`onChange` "`function(event, page) => void`", `defaultPage` default `1`), Mantine (`onChange` "`(value: number) => void`", `defaultValue`) and Ark (`onPageChange`, `defaultPage`, `type` default `'button'`) default to client-state buttons; shadcn's Pagination is links only (`<PaginationLink href="#">`). The apps are Next.js App Router pages whose data loads on the server, where a page is a URL (`?page=2`); links work with no client JavaScript, can be opened in a new tab and are crawlable (Ark, above). Client-side paging still works by linking to `?page=n` through `linkComponent`. Without state, Pagination stays a Server Component. To change: add `onPageChange(page, details)` with `<button>` items, which makes it a client component.
- **No `active` / `isActive` prop.** shadcn `PaginationLink` `isActive` renders `aria-current={isActive ? "page" : undefined}` (source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/pagination.tsx); MUI sets `'aria-current': item === page ? 'page' : undefined` in `usePagination`. Ours derives it from `page`, so no prop.
- **No `disabled`.** MUI `disabled` "If `true`, the component is disabled."; Mantine `disabled` "Disables all controls". A link list has no disabled state (Link spec); hide the Pagination while results load instead.
- **`labels.page`**: MUI `getItemAriaLabel` "`function(type: string, page: number | null, selected: boolean) => string`", default `` `${selected ? '' : 'Go to '}page ${page}` `` and `` `Go to ${type} page` `` (source `Pagination.js`); Ark `translations` with `rootLabel: "pagination"`, `prevTriggerLabel: "previous page"`, `nextTriggerLabel: "next page"`, `itemLabel({ page, totalPages })` (Zag source, https://github.com/chakra-ui/zag/blob/main/packages/machines/pagination/src/pagination.connect.ts). Our keys follow Ark's split; the `labels` prop follows spec #1.
- **Left out (YAGNI):** `siblingCount` / `boundaryCount` (MUI, Ark; Mantine `siblings` / `boundaries`): fixed at the libraries' shared default of 1 (MUI `siblingCount` default `1`, `boundaryCount` default `1`; Ark "`siblingCount`: default `1`", "`boundaryCount`: default `1`"; Mantine "1 sibling (default)", "1 boundary (default)"). Also First / Last controls (MUI `showFirstButton`, `showLastButton`; Mantine `withEdges`; Ark `FirstTrigger`, `LastTrigger`), hiding Previous / Next (MUI `hidePrevButton`, `hideNextButton`; Mantine `withControls`), Mantine `withPages`, `hideWithOnePage`, `layout="responsive"`, `startValue`, custom icons, `size`, `shape`, `variant`, `color`, and Ark `pageSize` / `onPageSizeChange`.

## States

| State         | How it shows                                                                                                                                                                 | Exposed as                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| rest          | Page items: no fill, `pagination-item-text-color`. Previous / Next: IconButton rest                                                                                          | —                                 |
| hovered       | Fill `pagination-item-background-color-hovered`, text `pagination-item-text-color-hovered` (Previous / Next: IconButton hover); fine pointers only (`@media (hover: hover)`) | `:hover`                          |
| pressed       | Scale `motion-scale-pressed` (0.97), 100 ms                                                                                                                                  | `:active`                         |
| current       | Selected fill, text and 1 px inset ring; no hover change                                                                                                                     | `aria-current="page"`             |
| focus-visible | 2 px focus ring, 3 px offset, `color-border-focused`                                                                                                                         | `:focus-visible`                  |
| disabled      | Previous on page 1, Next on the last page: `opacity-disabled`, no hover or press                                                                                             | `aria-disabled="true"` (a button) |

## Behaviour

- **Range.** MUI's `usePagination` algorithm with `boundaryCount = 1` and `siblingCount = 1` (source: https://github.com/mui/material-ui/blob/master/packages/mui-material/src/usePagination/usePagination.js), so the row has at most 7 page slots and keeps that count while paging:
  - `siblingsStart = max(min(page − 1, count − 4), 3)`; `siblingsEnd = min(max(page + 1, 5), count − 2)`.
  - Items: page 1; then an ellipsis if `siblingsStart > 3`, else page 2 if `2 < count − 1`; then pages `siblingsStart…siblingsEnd`; then an ellipsis if `siblingsEnd < count − 2`, else page `count − 1` if `count − 1 > 1`; then page `count` if `count > 1`.
  - Examples with `count = 10`: page 1 → `1 2 3 4 5 … 10`; page 5 → `1 … 4 5 6 … 10`; page 10 → `1 … 6 7 8 9 10`. With `count ≤ 7` every page shows; `count = 1` → `1`. An ellipsis therefore always stands for at least two pages (MUI fills a one-page gap with the page).
- **Previous / Next** link to `getPageUrl(page − 1)` / `getPageUrl(page + 1)` through IconButton `asChild`. On the first (last) page, Previous (Next) has no target, so it renders a plain IconButton `<button>` with `aria-disabled="true"`: focusable (spec #1: "disabled controls stay focusable"), announced as dimmed, and its click is blocked by IconButton. A link without `href` (ARIA in HTML: "remove the href attribute", "`<a role=link aria-disabled=true>`") was the draft; lint rejects both `<a role="link">` (redundant role, missing `href`) and `<span role="link">` (prefer the tag), and MUI renders its disabled Previous / Next as disabled buttons too, so the button is the lint-clean equivalent (Q35-1).
- **The current page is a link** to its own URL with `aria-current="page"`, as shadcn's `PaginationLink isActive` and the APG breadcrumb example. Following it reloads the same page (harmless; judgement call).
- **Numbers:** `new Intl.NumberFormat(locale ?? "en").format(n)` for the visible text and `labels.page`. Server Component: it cannot read LocaleProvider or `document.documentElement.lang`, so `locale` is a prop with an `"en"` fallback (Q15-2). The digits are tabular (`pagination-item-font`), so the row's width changes only with the digit count.
- **Server Component.** No state and no handlers, no `'use client'`. Passing `getPageUrl` (a function) and `linkComponent` (a client component reference) works when the caller is a Server Component, because props between Server Components are not serialised (inference; tested in `apps/ui-next-fixture`). Called from a client component, Pagination renders on the client like any component.
- **One row.** The list does not wrap; with 7 slots plus Previous / Next at md size it needs about 9 × 32 px + gaps (≈ 320 px at fine pointers, more on coarse pointers where `size-control-md` grows to 44). At w320 with coarse pointers it can overflow; the Root sets `overflow-x: auto` on the list as the fallback (inference: checked in the w320 screenshot variant; a compact layout is left out under YAGNI).

## Motion

- Hover: background and text colour over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color`, as IconButton.
- Press: `scale` to `motion-scale-pressed` over `motion-duration-press` (100 ms), `motion-easing-enter` (brand book: "Pressable elements give slightly under the pointer.").
- No indicator moves between pages: activating an item navigates and the new page renders with the new current item. No spring (brand book: springs "Only where the user directly causes the movement: switch thumbs, segmented and tab indicators, the radio diamond, toast entrance").
- **Reduced motion:** `motion-scale-pressed` resolves to `scale-100` (token media override), so the press keeps only its colour change. Colour fades stay.
- **Instant exit:** Pagination has no exit. Hover-out reverses from the current colour; with no transition the fill switches, which reads as correct.

## Keyboard

No APG pattern: the APG pattern list has Breadcrumb, Landmarks and Link but no pagination (https://www.w3.org/WAI/ARIA/apg/patterns/). Pagination is a navigation landmark containing links, so the Link pattern applies to each item (https://www.w3.org/WAI/ARIA/apg/patterns/link/).

| Key             | Action                                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Moves focus through Previous, the page links and Next (native tab order); ellipses are skipped. A disabled Previous / Next stays in the order. |
| Enter           | "Executes the link and moves focus to the link target." (APG Link). Does nothing on a disabled Previous / Next (a blocked button).             |
| Shift + F10     | "(Optional): Opens a context menu for the link." Provided by the browser.                                                                      |

No arrow keys: it is a list of links, not a composite widget with one tab stop (MUI: "The pagination items are in tab order, with a tabindex of "0"."). No key handler is added.

**RTL:** no arrow-key behaviour, so nothing swaps.

## Accessibility

- The `<nav>` has the implicit `navigation` role (ARIA in HTML: `nav` → `role=navigation`), named by `labels.root` ("Pagination"); MUI: "The root node has a role of "navigation" and aria-label "pagination navigation" by default."; shadcn `aria-label="pagination"`.
- **Two Paginations for the same list** (above and below a table) are the same set of links, so they keep the same name. APG navigation landmark: "If a `navigation` landmark has an identical set of links … use the same label for each `navigation` landmark." A Pagination for a different list on the same page needs its own `labels.root` ("If a page includes more than one `navigation` landmark, each should have a unique label.", https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html).
- **Current page:** `aria-current="page"` on its link. MDN: "In a breadcrumb list, when a link within a set of pagination links is styled to indicate the user is currently on that page, aria-current="page" should be set on that link." and "Only mark one element in a set of elements as current with aria-current."
- **Names:** each page link is named `labels.page(formatted)` ("Page 3"), which contains the visible "3" (WCAG 2.5.3 Label in Name; inference that the containment satisfies it). Previous / Next are named by `labels.previous` / `labels.next`; their icons are decorative (Icon's `aria-hidden`).
- **Ellipsis is decorative** (`aria-hidden="true"`), as shadcn `PaginationEllipsis` (`<span aria-hidden …>`). The page numbers on either side already say which pages are skipped. MUI renders a visible "…" with no `aria-hidden` (judgement call: hidden, so screen readers hear only links).
- **Disabled Previous / Next:** a `button` with `aria-disabled="true"`, focusable (Behaviour, Q35-1).
- **Targets:** items are `size-control-md` (32, 44 on coarse pointers), above the 24 px minimum.
- **Contrast:** rest text `color-text-subtle` (matrix text role on every surface and on `background-neutral-subtle-hovered`); current text `color-text-selected` on `color-background-selected` (matrix); the current ring `color-border-selected` (3:1 on every surface). No new pairs.
- **Not colour alone:** the current page has the inset ring (a shape) as well as the fill and text colour, because the selected fill (`color-background-selected`) and the hover fill (`color-background-neutral-subtle-hovered`) resolve to the same value in light (`palette-sage-50`).
- **More contrast:** no change needed: the ring already uses `color-border-selected`, not a subtle hairline.
- **Forced colors:** fills disappear and `box-shadow` (the ring) computes to none (CSS Color Adjust 1: "box-shadow and text-shadow compute to none"), so the current item sets `background-color: Highlight` and `color: HighlightText` in `@media (forced-colors: active)` (system colours are not forced). Disabled Previous / Next use `GrayText`. The focus ring is an `outline`.
- **Reduced transparency:** not affected.

## RTL

The row runs from the inline start, so in RTL Previous is on the right and page 1 next to it. Next uses `ChevronRightIcon`, which the Icon component mirrors under `:dir(rtl)` (Icon spec list includes `chevron-right`), so it points left in RTL. Previous uses the same icon with `rotate: 180deg`, which composes with Icon's own `scale: -1 1` mirror instead of fighting it, so it points left in LTR and right in RTL. The icon set has no `chevron-left`.

## Component tokens

Existing (reused from IconButton for Previous / Next): `icon-button-md-size`, `icon-button-icon-size`, `icon-button-border-radius`, `icon-button-icon-color`, `icon-button-icon-color-hovered`, `icon-button-background-color-hovered`.

Proposed new:

| Token                                       | References                                           | `$type`    | Why                                                                   |
| ------------------------------------------- | ---------------------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `pagination-gap`                            | `{semantic.space-inline-xs}`                         | dimension  | Space between items                                                   |
| `pagination-item-height`                    | `{semantic.size-control-md}`                         | dimension  | Page item height (32; 44 on coarse pointers), same as Previous / Next |
| `pagination-item-min-width`                 | `{semantic.size-control-md}`                         | dimension  | One- and two-digit items are square                                   |
| `pagination-item-padding-inline`            | `{semantic.space-inset-xs}`                          | dimension  | Room for three-digit and longer numbers                               |
| `pagination-item-border-radius`             | `{semantic.radius-sm}`                               | dimension  | Matches IconButton's radius (8)                                       |
| `pagination-item-font`                      | `{semantic.type-data-md}`                            | typography | 13 px medium with tabular figures, so numbers keep their width        |
| `pagination-item-text-color`                | `{semantic.color-text-subtle}`                       | color      | Page numbers at rest, and the ellipsis icon (`currentColor`)          |
| `pagination-item-text-color-hovered`        | `{semantic.color-text-default}`                      | color      | Hovered page number                                                   |
| `pagination-item-background-color-hovered`  | `{semantic.color-background-neutral-subtle-hovered}` | color      | Hover fill, as IconButton                                             |
| `pagination-item-text-color-selected`       | `{semantic.color-text-selected}`                     | color      | Current page number                                                   |
| `pagination-item-background-color-selected` | `{semantic.color-background-selected}`               | color      | Current page fill                                                     |
| `pagination-item-border-color-selected`     | `{semantic.color-border-selected}`                   | color      | Current page ring (shape cue, Accessibility)                          |

The `selected` state word stands for `aria-current="page"`: the Dictionary has no `current` state (Tabs precedent, `tabs-item-text-color-selected`). Consumed as semantic tokens directly: `border-width-default` (ring width), `opacity-disabled`, `motion-scale-pressed`, `focus-ring-width`, `focus-ring-offset`, `color-border-focused`, and the `motion-*` tokens. New Dictionary component word: `pagination`. No new modifier words (`item` exists).

## Built-in labels

| Key        | Default                       | Used by                                                      |
| ---------- | ----------------------------- | ------------------------------------------------------------ |
| `root`     | "Pagination"                  | `aria-label` on `<nav>`                                      |
| `previous` | "Previous page"               | Previous link's `aria-label`                                 |
| `next`     | "Next page"                   | Next link's `aria-label`                                     |
| `page`     | ``(page) => `Page ${page}` `` | Each page link's `aria-label`; receives the formatted number |

`root`, `previous` and `next` are in the locale type and every shipped locale; Pagination is a Server Component and cannot read the UIProvider, so they arrive through `locale` (or `labels`). `page` is a function, so it is a `labels` key only. Defaults follow Ark's (`"previous page"`, `"next page"`, `` `page ${page}` ``) in sentence case.

## Feedback events

None of its own: page links dispatch nothing (Link spec). Previous / Next are IconButtons (`asChild` around the link), so an enabled one dispatches IconButton's `ab-press` (`component: "IconButton"`) when followed, and a disabled one dispatches nothing. Reusing IconButton keeps one source for its look and press (Q35-1).

## Sources

- WAI-ARIA APG pattern index (no pagination pattern): https://www.w3.org/WAI/ARIA/apg/patterns/ · APG navigation landmark: https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html ("Use the HTML `nav` element to define a `navigation` landmark.") · APG Link pattern: https://www.w3.org/WAI/ARIA/apg/patterns/link/
- ARIA in HTML: https://www.w3.org/TR/html-aria/ (`nav` "role=navigation"; `a` without `href` "role=generic", allowed roles "Any role"; the disabled-link note and Example 2 quoted above)
- MDN `aria-current`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current
- CSS Color Adjustment 1: https://www.w3.org/TR/css-color-adjust-1/
- Next.js Link: https://nextjs.org/docs/app/api-reference/components/link
- Baseline (webstatus.dev, 2026-10-24): `intl` (Intl, including `NumberFormat`) widely (low 2017-09-28); `individual-transforms` (`scale`) widely (low 2022-08-05); `dir-pseudo` (`:dir()`) widely (low 2023-12-07); `flexbox-gap` widely (low 2021-04-26); `forced-colors` widely (low 2022-09-12); `prefers-contrast` widely (low 2022-05-31).
- MUI Pagination API and guide: https://mui.com/material-ui/api/pagination/, https://mui.com/material-ui/react-pagination/ · `usePagination` source: https://github.com/mui/material-ui/blob/master/packages/mui-material/src/usePagination/usePagination.js · `Pagination.js` source (default aria labels, `<nav aria-label="pagination navigation">`): https://github.com/mui/material-ui/blob/master/packages/mui-material/src/Pagination/Pagination.js · PaginationItem API: https://mui.com/material-ui/api/pagination-item/
- Mantine Pagination: https://mantine.dev/core/pagination/ (props table via https://mantine.dev/llms/core-pagination.md)
- Ark Pagination: https://ark-ui.com/react/docs/components/pagination · Zag pagination source: https://github.com/chakra-ui/zag/blob/main/packages/machines/pagination/src/pagination.connect.ts
- shadcn/ui Pagination: https://ui.shadcn.com/docs/components/pagination and source https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/pagination.tsx
- Base UI component list: https://base-ui.com/react/overview/quick-start
