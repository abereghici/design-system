# Sidebar

The app's vertical navigation: links to its sections, optionally in labelled groups, in a column beside the main content. Use it when an app has more destinations than a Navbar row holds, or destinations that fall into groups. For a few top-level destinations, use a Navbar; for the path to the current page, Breadcrumbs; for a table of contents within one page, a list of Links; for actions, Buttons.

```tsx
import NextLink from "next/link";

import { FolderIcon } from "@platform/ui/icons/folder";
import { Sidebar } from "@platform/ui/sidebar";

<Sidebar.Root aria-label="Workspace">
  <Sidebar.Group>
    <Sidebar.Item>
      <Sidebar.Link href="/inbox">Inbox</Sidebar.Link>
    </Sidebar.Item>
  </Sidebar.Group>
  <Sidebar.Group label="Projects">
    <Sidebar.Item>
      <Sidebar.Link href="/projects/tokens" aria-current="page">
        <FolderIcon data-icon="inline-start" /> Tokens
      </Sidebar.Link>
    </Sidebar.Item>
    <Sidebar.Item>
      <Sidebar.Link asChild>
        <NextLink href="/projects/ui">UI</NextLink>
      </Sidebar.Link>
    </Sidebar.Item>
  </Sidebar.Group>
</Sidebar.Root>;
```

Status: draft for brand-owner review (phase 3). No source guide: drafted from the APG landmark and Link patterns, MDN, WCAG 2.2, the brand book (layout, density, elevation, materials, accessibility, motion), the Navbar spec (shared link states and indicator) and the reference libraries.

## Anatomy

Root (nav) → Groups (group → label, optional → list) → Items (li) → Links (a → icon, optional).

- **Root.** A native `<nav>`, a block column whose Groups stack with `sidebar-gap`, padding `sidebar-padding`. It sets no width, height, background, border or scrolling: the app's layout places the column (a `size-container-2xs`, 224 px, grid track is the documented example), separates it from the content and decides what scrolls (see Behaviour).
- **Group.** A `<div>` holding an optional label and one `<ul>` (list markers and UA margin/padding reset). With a `label`, the div is `role="group"` with `aria-labelledby` pointing at the label. Links stack with no gap; the label sits `sidebar-group-gap` above them.
- **Label** (drawn by Group from its `label` prop). A `<div>` with a generated `id`, text `sidebar-group-label-font` in `sidebar-group-label-text-color`, padding-inline `sidebar-group-label-padding-inline` so it lines up with the link text.
- **Item.** A native `<li>`, no styles of its own.
- **Link.** A native `<a href>` (not the Link component; Link spec: "a navigation list that wants bare text uses its own component, e.g. Navbar/Sidebar"). A full-width flex row of at least `sidebar-item-min-height`, padding-inline `sidebar-item-padding-inline`, gap `sidebar-item-gap`, radius `sidebar-item-border-radius`, text `sidebar-item-font` in `sidebar-item-text-color`, no underline.
- **Indicator.** On the current link only: a bar of `sidebar-indicator-width` (2 px) in `sidebar-indicator-color` along the link's inline-start edge, drawn by the link's `::before` pseudo-element, inset at both block ends by the item's radius so it runs along the straight part of the fill's edge. The same bar as the Navbar's, turned to the column's axis.
- **Icon** (optional) is a child marked `data-icon="inline-start"`, as in Button, Tag and Navbar. The Link sets `--ab-icon-size` / `--ab-icon-stroke-width` to `size-icon-sm` and `stroke-width-lg` (the values behind `icon-sm-*`). Decorative; the text names the link.

## API

`Sidebar.Root`

| Prop                              | Type                    | Default | Notes                                                                                     |
| --------------------------------- | ----------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `aria-label` \| `aria-labelledby` | `string`                |         | One of the two is required (a union type), so every `<nav>` on the page has its own name. |
| `children`                        | `ReactNode`             |         | `Sidebar.Group`s.                                                                         |
| …native                           | `ComponentProps<"nav">` |         | `ref`, `className` and native attributes.                                                 |

`Sidebar.Group`

| Prop       | Type                    | Default | Notes                                                                                                 |
| ---------- | ----------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `label`    | `ReactNode`             |         | The group's visible name. Present: `role="group"` + `aria-labelledby`. Absent: a plain list, no role. |
| `children` | `ReactNode`             |         | `Sidebar.Item`s, rendered inside the `<ul>`.                                                          |
| …native    | `ComponentProps<"div">` |         | `ref`, `className` and native attributes on the group `<div>`.                                        |

`Sidebar.Item`: `ComponentProps<"li">`.

`Sidebar.Link`

| Prop           | Type                  | Default  | Notes                                                                                                    |
| -------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `href`         | `string`              | required | Required unless `asChild`.                                                                               |
| `asChild`      | `boolean`             | `false`  | Renders the single child (a router link) with the Link's props and styles (Radix Slot), as Link.         |
| `aria-current` | `"page"`              |          | Native. Marks the link to the page on screen; styled with `[aria-current="page"]`. One link per Sidebar. |
| …native        | `ComponentProps<"a">` |          | `ref`, `className`, `target` and every native attribute pass through.                                    |

Names, checked against the reference libraries:

- **`Sidebar`**: shadcn "A composable, themeable and customizable sidebar component." (https://ui.shadcn.com/docs/components/sidebar); MUI "The navigation drawers (or "sidebars") provide ergonomic access to destinations in a site or app functionality" (https://mui.com/material-ui/react-drawer/). Mantine calls the column `AppShell.Navbar`, "fixed navbar on the left" (https://mantine.dev/core/app-shell/), which would clash with our horizontal Navbar. shadcn's name, MUI's own word and the ticket agree.
- **`Root` / `Group` / `Item` / `Link`**: shadcn `Sidebar`, `SidebarGroup`, `SidebarMenuItem`, `SidebarMenuButton`; Radix NavigationMenu `Item` and `Link` ("A navigational link."); Mantine `NavLink` ("Navigation link", https://mantine.dev/core/nav-link/). Group is the Radix Part word for a labelled set. shadcn's `SidebarMenu`/`SidebarMenuItem`/`SidebarMenuButton` are not taken: the links are not a menu (Behaviour), and `Link` matches Navbar and Breadcrumbs.
- **Group `label` prop, no `GroupLabel` Part.** shadcn has `SidebarGroupLabel`. A separate Part would have to hand its `id` to the Group through context, and "Server Components cannot create context" (https://react.dev/reference/rsc/server-components), so the Group draws its own label from a prop and links it with `useId` (React lists only "`useId` currently cannot be used in async Server Components"; the Group is not async, inference verified when built). Judgement call: one Part fewer, still server-only.
- **No `List` Part, no Header/Footer/Content Parts.** shadcn has `SidebarHeader`, `SidebarContent`, `SidebarFooter`; Mantine `AppShell.Section` is "utility for grouping content inside `AppShell.Navbar`". The app puts a heading, a workspace switcher or an account row around the `<nav>` in its own column, which also keeps non-links out of the navigation landmark.
- **Current page as `aria-current`, no `isActive`.** shadcn: "Use the `isActive` prop to mark a menu item as active."; Mantine NavLink: "Set the `active` prop to add active styles to `NavLink`."; Radix `active`. The attribute is the API, as in Navbar (judgement call, platform first; shared contract).
- **`asChild`**: Radix Slot (spec #1); Mantine NavLink "use components in the `component` prop, for example, Next.js `Link`".
- **Required name**: APG "If a page includes more than one navigation landmark, each should have a unique label." A Sidebar usually sits beside a Navbar, so the type requires one and there is no English default.
- **Left out (YAGNI):** collapsing the whole sidebar (shadcn `collapsible: "offcanvas" | "icon" | "none"`, `SidebarRail`, `SidebarTrigger`, the "`cmd+b`" shortcut, `SidebarProvider` state; Mantine `collapsed: { mobile, desktop }`), the off-canvas mobile drawer (Mantine "The navbar is hidden on mobile by default and can be toggled with the burger button."; phase 4 composes a Sheet around the same Root), collapsible groups and nested links (shadcn `SidebarMenuSub`, Mantine nested `NavLink` children; later composable from Accordion's `<details>`), `side` and `variant` (shadcn `left`/`right`, `sidebar`/`floating`/`inset`), a fixed width (shadcn `SIDEBAR_WIDTH = "16rem"`; the app's grid owns it), group and item actions and badges (`SidebarGroupAction`, `SidebarMenuAction`, `SidebarMenuBadge`), `disabled` links (Link precedent).

## States

| State         | How it shows                                                                                                                                  | Exposed as            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| rest          | `sidebar-item-text-color`, no fill                                                                                                            |                       |
| hovered       | Text `sidebar-item-text-color-hovered`, fill `sidebar-item-background-color-hovered`; only under `@media (hover: hover)`                      | `:hover`              |
| pressed       | Fill `sidebar-item-background-color-pressed`                                                                                                  | `:active`             |
| current       | Fill `sidebar-item-background-color-selected`, text `sidebar-item-text-color-selected` and the 2 px inline-start indicator (not colour alone) | `aria-current="page"` |
| focus-visible | 2 px focus ring, 3 px offset, `color-border-focused`                                                                                          | `:focus-visible`      |

## Behaviour

- **Links, not a menu.** MDN: "When including a "menu" for site navigation, do not use the `menu` role. Rather, for the main site navigation use the native HTML `<nav>` element or simply a list of links." (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role).
- **Groups.** A labelled Group is `role="group"`, not a `<section>`: a named `<section>` becomes a landmark (MDN: implicit role "`region` if the element has an accessible name, otherwise `generic`", https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section), which would put one landmark per group inside the navigation landmark. MDN `group`: "identifies a set of user interface objects that is not intended to be included in a page summary or table of contents by assistive technologies." (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/group_role). The `<ul>` sits inside the group, so the list keeps only `<li>` children (MDN: "When a `group` is used in the context of `list`, limit the children of the `group` to `listitem` elements").
- **Current page.** The app sets `aria-current="page"` on the one link to the page on screen (MDN: "Only mark one element in a set of elements as current with `aria-current`."). In the Next.js App Router that needs a client link wrapper through `asChild` ("`usePathname` is a **Client Component** hook", https://nextjs.org/docs/app/api-reference/functions/use-pathname), as in Navbar. A link to a parent section of the current page is not marked (judgement call: `aria-current="page"` means this page; MDN's other values are not needed yet).
- **Scrolling.** The Sidebar does not scroll itself. The app's column scrolls (native `overflow-y: auto` on the grid track, or a ScrollArea around the Root) when the links are taller than the viewport, so the Sidebar never nests a second scroller inside the app's (judgement call).
- **Narrow widths.** The Sidebar is in flow, so the app's layout stacks it above the content (or leaves it out) below `breakpoint-md` (760 px), as the brand book's layout does for its label column ("Under 760 the label column stacks."); WCAG 1.4.10 asks for no "scrolling in two dimensions" at 320 CSS px (https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Links are full width and their text wraps (min-height, not a fixed height), so a stacked Sidebar reflows. An off-canvas drawer needs a Floating layer and is phase 4.
- Server Component: no `'use client'`, no state and no handlers. `useId` in Group is a render-time hook with no client behaviour (verified: the ui-next-fixture route renders the labelled group on the server).

## Motion

- Hover and press: `color` and `background-color` over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color`.
- No press scale and no moving indicator, for the same reasons as Navbar (navigation replaces the page; the brand book's indicator spring is for tabs and segmented controls within a page).
- **Reduced motion:** nothing to remove; colour fades stay.
- **Instant exit:** Sidebar has no exit. Hover-out reverses from the current colour; with no transition it simply switches.

## Keyboard

APG pattern: **Link** (https://www.w3.org/WAI/ARIA/apg/patterns/link/), inside a **Navigation landmark** ("Navigation landmarks provide a way to identify groups (e.g. lists) of links", https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html). No arrow keys and no roving tabindex. Native `<a href>` provides all of it.

| Key             | Action                                                                               |
| --------------- | ------------------------------------------------------------------------------------ |
| Tab / Shift+Tab | Moves focus to the next / previous link, in DOM order. Every link is a tab stop.     |
| Enter           | "Executes the link and moves focus to the link target." (APG Link)                   |
| Shift + F10     | "(Optional): Opens a context menu for the link." Provided by the browser. (APG Link) |

Group labels are not focusable.

**RTL:** no arrow keys, so nothing swaps.

## Accessibility

- Role `navigation` from `<nav>` (APG: "Use the HTML nav element to define a navigation landmark."), named by the required `aria-label`/`aria-labelledby`. Not `<aside>`: a complementary landmark is "a supporting section of the document" that "remains meaningful when separated from the main content" (https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/complementary.html); a sidebar of links is navigation.
- Each labelled Group is announced with its label (`role="group"` + `aria-labelledby`); each `<ul>` gives "list, N items". Whether every screen reader announces the group name on entering is not documented (inference; the screen-reader pass checks it).
- **Not colour alone:** the current link has the indicator bar (`color-border-selected`, a 3:1 non-text role on `color-background-selected` and every surface in the contrast matrix) as well as its fill and `color-text-selected` (4.5:1 on `color-background-selected`, matrix). In light, `color-background-selected` and the hover fill are the same step (`palette-sage-50`), so the bar and the text colour carry the state; that is why the bar is not optional.
- Targets: links are at least `size-control-md` tall (32 px fine, 44 px coarse) and full width.
- **More contrast:** no change needed; the group label's `color-text-subtlest` steps up through its own token override, the rest are AA roles already.
- **Forced colors:** text and fills are forced by the UA. The indicator's `::before` sets `background-color: Highlight` under `@media (forced-colors: active)` (CSS Color Adjust 1 forces only "a color other than a system color", https://www.w3.org/TR/css-color-adjust-1/). The focus ring is an `outline`.
- **Reduced transparency:** not affected. No Material, no elevation: the Sidebar is in flow (UI glossary, Floating layer; brand book: "Only floating layers (menus, popovers, toasts, dialogs) get elevation and material."). The phase-4 drawer takes the Sheet's.

## RTL

Logical properties only (`padding-inline`, `inset-inline-start`); the radius is uniform, so nothing else flips. The indicator sits at the inline start, so it is on the left in LTR and on the right in RTL. `data-icon="inline-start"` follows the same side. Where the app places the column is its own layout's logical grid.

## Component tokens

Existing, reused: `icon-sm-size`, `icon-sm-stroke-width` (the link's icon). Focus ring and motion use semantic tokens directly.

Proposed new (`sidebar` is a new component word):

| Token                                    | References                                           | `$type`    | Why                                                |
| ---------------------------------------- | ---------------------------------------------------- | ---------- | -------------------------------------------------- |
| `sidebar-padding`                        | `{semantic.space-inset-sm}`                          | dimension  | Inset of the column's content, 8 px.               |
| `sidebar-gap`                            | `{semantic.space-stack-md}`                          | dimension  | Between Groups, 16 px.                             |
| `sidebar-group-gap`                      | `{semantic.space-stack-xs}`                          | dimension  | Group label to its links, 4 px.                    |
| `sidebar-group-label-font`               | `{semantic.type-label-sm}`                           | typography | Group label text.                                  |
| `sidebar-group-label-text-color`         | `{semantic.color-text-subtlest}`                     | color      | Quieter than the links it names.                   |
| `sidebar-group-label-padding-inline`     | `{semantic.space-inset-sm}`                          | dimension  | Lines the label up with the link text.             |
| `sidebar-item-min-height`                | `{semantic.size-control-md}`                         | dimension  | Link row height, 32 px; 44 px on coarse pointers.  |
| `sidebar-item-padding-inline`            | `{semantic.space-inset-sm}`                          | dimension  | 8 px.                                              |
| `sidebar-item-gap`                       | `{semantic.space-inline-sm}`                         | dimension  | Icon to text, 8 px.                                |
| `sidebar-item-border-radius`             | `{semantic.radius-sm}`                               | dimension  | Fill corners, as a sm control.                     |
| `sidebar-item-font`                      | `{semantic.type-label-sm}`                           | typography | Control text, as Navbar.                           |
| `sidebar-item-text-color`                | `{semantic.color-text-subtle}`                       | color      | Rest.                                              |
| `sidebar-item-text-color-hovered`        | `{semantic.color-text-default}`                      | color      | Hover.                                             |
| `sidebar-item-text-color-selected`       | `{semantic.color-text-selected}`                     | color      | The current page.                                  |
| `sidebar-item-background-color-hovered`  | `{semantic.color-background-neutral-subtle-hovered}` | color      | Hover fill.                                        |
| `sidebar-item-background-color-pressed`  | `{semantic.color-background-neutral-subtle-pressed}` | color      | Press feedback.                                    |
| `sidebar-item-background-color-selected` | `{semantic.color-background-selected}`               | color      | Current-page fill (shadcn's active row).           |
| `sidebar-indicator-color`                | `{semantic.color-border-selected}`                   | color      | The current-page bar, as `navbar-indicator-color`. |
| `sidebar-indicator-width`                | `{semantic.border-width-thick}`                      | dimension  | 2 px, as `navbar-indicator-height`.                |

Every word but `sidebar` is in the Dictionary (`group`, `label`, `item`, `indicator`; `padding`, `gap`, `font`, `text-color`, `padding-inline`, `min-height`, `border-radius`, `background-color`, `color`, `width`; `hovered`, `pressed`, `selected`).

## Built-in labels

None. The landmark name is required from the app, and group labels and link text are the app's.

## Feedback events

None. Navigation is not a feedback moment (Link spec), and the Sidebar has no client code.

## Sources

- WAI-ARIA APG Landmarks, Navigation: https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html · Complementary: https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/complementary.html ("complementary landmarks should be top level landmarks (e.g. not contained within any other landmarks).")
- WAI-ARIA APG Link pattern: https://www.w3.org/WAI/ARIA/apg/patterns/link/
- MDN `<nav>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav ("A document may have several `<nav>` elements, for example, one for site navigation and one for intra-page navigation. `aria-labelledby` can be used in such case to promote accessibility") · `<section>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section · `group` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/group_role · `menu` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role · `aria-current`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current
- WCAG 2.2 Understanding 1.4.10 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- CSS Color Adjustment 1: https://www.w3.org/TR/css-color-adjust-1/
- React Server Components: https://react.dev/reference/rsc/server-components · `useId`: https://react.dev/reference/react/useId · Next.js `usePathname`: https://nextjs.org/docs/app/api-reference/functions/use-pathname
- Baseline (webstatus.dev, 2026-10-24): `nav` widely available (2015-07-29); `flexbox` widely (2015-09-30); `logical-properties` widely (2021-09-20); `interaction` media queries (`hover`) widely (2018-12-11); `forced-colors` widely (2022-09-12).
- Brand book README: Principles ("Flat in flow, lifted when floating."), Accessibility ("Not color alone.", "Targets. At least 24 × 24 CSS px"), Typography ("Two weights."), Motion (springs); guidelines `layout.html` ("Reflows to 320px with no horizontal scroll (1.4.10). Under 760 the label column stacks."), `density.html`, `elevation.html`, `materials.html`.
- shadcn/ui Sidebar: https://ui.shadcn.com/docs/components/sidebar · MUI Drawer: https://mui.com/material-ui/react-drawer/ · Mantine AppShell: https://mantine.dev/core/app-shell/ · Mantine NavLink: https://mantine.dev/core/nav-link/ · Radix NavigationMenu: https://www.radix-ui.com/primitives/docs/components/navigation-menu
