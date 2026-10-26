# Navbar

The app's primary navigation as a row of links, placed in the app's top bar beside the Logo and any actions. Use it for the handful of top-level destinations that every page shares. For many destinations in groups, use a Sidebar; for the path to the current page, Breadcrumbs; for switching views within one page, Tabs; for actions, Buttons.

```tsx
import NextLink from "next/link";

import { Logo } from "@platform/ui/logo";
import { Navbar } from "@platform/ui/navbar";

<header className={styles.bar}>
  <a href="/">
    <Logo label="Alexandru Bereghici, home" />
  </a>
  <Navbar.Root aria-label="Main">
    <Navbar.Item>
      <Navbar.Link href="/work" aria-current="page">
        Work
      </Navbar.Link>
    </Navbar.Item>
    <Navbar.Item>
      <Navbar.Link asChild>
        <NextLink href="/writing">Writing</NextLink>
      </Navbar.Link>
    </Navbar.Item>
  </Navbar.Root>
</header>;
```

Status: draft for brand-owner review (phase 3). No source guide: drafted from the APG landmark and Link patterns, MDN, WCAG 2.2, the brand book (layout, density, elevation, materials, accessibility, motion), the Tabs source guide's indicator and the reference libraries.

## Anatomy

Root (nav → list) → Items (li) → Links (a → icon, optional).

- **Root.** A native `<nav>` holding one `<ul>` (list markers and UA margin/padding reset). The list is a wrapping flex row: `flex-wrap: wrap`, gap `navbar-gap`, items aligned to the block centre. The Root draws no bar: the app's `<header>` owns the bar's height, padding, background and hairline, and holds the Logo link and actions outside the `<nav>` (see Accessibility).
- **Item.** A native `<li>`, no styles of its own.
- **Link.** A native `<a href>` (not the Link component, which is always underlined for running text; Link spec: "a navigation list that wants bare text uses its own component, e.g. Navbar/Sidebar"). An inline-flex row of at least `navbar-item-min-height`, padding-inline `navbar-item-padding-inline`, radius `navbar-item-border-radius`, text `navbar-item-font` in `navbar-item-text-color`, no underline.
- **Indicator.** On the current link only: a bar of `navbar-indicator-height` (2 px) in `navbar-indicator-color` along the link's block-end edge, drawn by the link's `::after` pseudo-element (a `background-color` box, so the rest state has no border to force in forced colours). It is inset by the link's padding so it spans the text, as the Tabs indicator spans its tab's label, and stays clear of the rounded hover fill. The same visual language as the Tabs indicator (`tabs-indicator-*`: "A 2px moss indicator is anchored to the selected tab").
- **Icon** (optional) is a child, as in Button and Tag, spaced by `navbar-item-gap`. The Link sets `--ab-icon-size` / `--ab-icon-stroke-width` on itself to `size-icon-sm` and `stroke-width-lg`, the semantic values behind `icon-sm-*`, so the route ships no Icon tokens unless an icon is used. Decorative; the text names the link.

## API

`Navbar.Root`

| Prop                              | Type                    | Default | Notes                                                                                     |
| --------------------------------- | ----------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `aria-label` \| `aria-labelledby` | `string`                |         | One of the two is required (a union type), so every `<nav>` on the page has its own name. |
| `children`                        | `ReactNode`             |         | `Navbar.Item`s, rendered inside the `<ul>`.                                               |
| …native                           | `ComponentProps<"nav">` |         | `ref`, `className` and native attributes on the `<nav>`.                                  |

`Navbar.Item`: `ComponentProps<"li">`.

`Navbar.Link`

| Prop           | Type                  | Default  | Notes                                                                                                                       |
| -------------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `href`         | `string`              | required | Required unless `asChild` (then the child carries it).                                                                      |
| `asChild`      | `boolean`             | `false`  | Renders the single child element (a router link) with the Link's props and styles (Radix Slot), as Link.                    |
| `aria-current` | `"page"`              |          | Native. Marks the link to the page on screen; styled with `[aria-current="page"]`. The app sets it on one link (Behaviour). |
| …native        | `ComponentProps<"a">` |          | `ref`, `className`, `target` and every native attribute pass through.                                                       |

Names, checked against the reference libraries:

- **`Navbar`.** No majority name. Bootstrap: "Documentation and examples for Bootstrap's powerful, responsive navigation header, the navbar." (https://getbootstrap.com/docs/5.3/components/navbar/); HeroUI v2 `Navbar` "A responsive navigation header positioned on top side of your page" (https://v2.heroui.com/docs/components/navbar). Radix and shadcn call their component NavigationMenu, "A collection of links for navigating websites." (https://www.radix-ui.com/primitives/docs/components/navigation-menu, https://ui.shadcn.com/docs/components/navigation-menu), but its Trigger/Content/Viewport Parts exist for dropdown panels we leave out. MUI has `AppBar`, "The App Bar displays information and actions relating to the current screen." (https://mui.com/material-ui/react-app-bar/), and Mantine `AppShell.Header`, which "renders a `header` element" (https://mantine.dev/core/app-shell/); both are the whole bar, not its navigation. Mantine's own `Navbar` (v6: "Navbar root element is `nav`", https://v6.mantine.dev/core/app-shell/) and `AppShell.Navbar` ("fixed navbar on the left") are vertical, i.e. a Sidebar here. We keep the ticket's name, which is Bootstrap's and HeroUI's and says "top bar of links" in plain words (judgement call).
- **`Root` / `Item` / `Link`**: Radix `NavigationMenu.Root`, `NavigationMenu.Item`, `NavigationMenu.Link` ("A navigational link."); shadcn `NavigationMenuItem`, `NavigationMenuLink`; Bootstrap `.nav-item` on the `<li>` and `.nav-link` on the `<a>`. **No `List` Part:** Radix's Root holds a List plus a Viewport for the dropdowns; with no dropdowns nothing else goes inside our `<nav>`, so the Root renders the `<ul>` itself (judgement call, one Part fewer). Item stays as its own Part so a phase-4 Item can hold a dropdown trigger next to the links.
- **Current page as `aria-current`, no `active` prop.** Radix `Link` `active` (`boolean`, default `false`), "giving access to the `active` prop for setting `aria-current` and the active styles."; Mantine NavLink "Set the `active` prop to add active styles to `NavLink`." (https://mantine.dev/core/nav-link/); HeroUI `NavbarItem` `isActive`. Bootstrap uses the attribute itself: "Indicate the current item by using `aria-current="page"` for the current page". Every `active` prop ends up as `aria-current`, so the attribute is the API (judgement call, platform first; the shared contract for Breadcrumbs, Pagination and Sidebar).
- **`asChild`**: Radix NavigationMenu.Link takes `asChild`; shadcn: "Use the `render` prop to compose a custom link component such as Next.js `Link`."; Mantine NavLink "`<NavLink component={Link} href="/" />`". Spec #1 picks `asChild` (Link precedent).
- **Required name.** APG Navigation landmark: "If a page includes more than one navigation landmark, each should have a unique label." (https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html). An app with a Navbar and a Sidebar always has two, so the type requires `aria-label` or `aria-labelledby` and there is no English default (a default would give two `<nav>`s the same name).
- **Left out (YAGNI):** dropdown submenus (Radix `Trigger`/`Content`/`Viewport`/`Sub`/`Indicator`; phase 4 composes Popover or DropdownMenu inside a `Navbar.Item`), a mobile collapse or hamburger toggle (Bootstrap's collapse plugin, HeroUI `NavbarMenuToggle`/`NavbarMenu`; phase 4 composes a Sheet), brand and content Parts (Bootstrap `.navbar-brand`, HeroUI `NavbarBrand`/`NavbarContent`: the Logo link and actions sit in the app's `<header>`), a `position` prop (MUI `'absolute' | 'fixed' | 'relative' | 'static' | 'sticky'`, default `'fixed'`; HeroUI `static | sticky`: the app's header CSS, with `z-index-sticky`), `orientation`, arrow-key navigation, `disabled` links (Link precedent), a sliding indicator between pages.

## States

| State         | How it shows                                                                                                           | Exposed as            |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------- |
| rest          | `navbar-item-text-color`, no fill                                                                                      |                       |
| hovered       | Text `navbar-item-text-color-hovered`, fill `navbar-item-background-color-hovered`; only under `@media (hover: hover)` | `:hover`              |
| pressed       | Fill `navbar-item-background-color-pressed`                                                                            | `:active`             |
| current       | Text `navbar-item-text-color-selected` and the 2 px block-end indicator (a shape, so not colour alone)                 | `aria-current="page"` |
| focus-visible | 2 px focus ring, 3 px offset, `color-border-focused`                                                                   | `:focus-visible`      |

## Behaviour

- **Links, not a menu.** MDN `menu` role: "When including a "menu" for site navigation, do not use the `menu` role. Rather, for the main site navigation use the native HTML `<nav>` element or simply a list of links. The `menu` role should be reserved for composite widgets requiring focus management." (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role). The APG's disclosure navigation example likewise "does not use the WAI-ARIA menu role" because typical site navigation does not need "all the keyboard interactions specified by the menu and menubar pattern." (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/).
- **Current page.** The app puts `aria-current="page"` on the one link to the page on screen. MDN: "Represents the current page within a set of pages" and "Only mark one element in a set of elements as current with `aria-current`." (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current). In the Next.js App Router the pathname is client-only ("`usePathname` is a **Client Component** hook"; "Reading the current URL from a Server Component is not supported.", https://nextjs.org/docs/app/api-reference/functions/use-pathname), so an app whose Navbar sits in a layout computes `aria-current` in its own small client link wrapper passed through `asChild`. The Navbar does not read the URL itself (judgement call: it stays router-agnostic and server-only).
- **Narrow widths: the list wraps.** WCAG 1.4.10: "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels" (https://www.w3.org/WAI/WCAG22/Understanding/reflow.html); the brand book's layout: "Reflows to 320px with no horizontal scroll (1.4.10)." A horizontally scrolling strip would hide links off-screen and add a second scroll direction, so the `<ul>` wraps onto a second row instead, and link text itself may wrap (min-height, not a fixed height) for 200% text (judgement call; the Tabs source guide scrolls its tablist instead, but tabs are one widget, these are separate links). The Understanding page's own example of the alternative, "most navigation options are eventually behind a "hamburger" menu button", needs a Floating layer and is phase 4.
- **Landmark placement.** The `<nav>` goes inside the app's `<header>` at body level, which is the banner landmark: "A `banner` landmark identifies site-oriented content at the beginning of each page within a website." and "The HTML `header` element is not considered a `banner` landmark when it is descendant of" article, aside, main, nav or section (https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/banner.html). The Root is not itself a `<header>`: the bar also holds the Logo link and actions that are not navigation, and an app may already have its header.
- Server Component: no `'use client'`, no state and no handlers. With `asChild` the Slot only merges props onto the child (verified: the ui-next-fixture route renders it on the server).

## Motion

- Hover and press: `color` and `background-color` over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color`, as Link and Button.
- No press scale (judgement call: activating a link loads another page, so the press has no time to read; Link has none either).
- The indicator does not move: each page renders its own current link, so there is no element to glide between pages (moving it across navigations would need View Transitions; left out). The brand book's spring is for "segmented and tab indicators", where the user moves the indicator within one page.
- **Reduced motion:** nothing to remove; the only transitions are colour fades, which stay.
- **Instant exit:** Navbar has no exit. Hover-out reverses from the current colour; with no transition it simply switches, which reads as correct.

## Keyboard

APG pattern: **Link** (https://www.w3.org/WAI/ARIA/apg/patterns/link/), inside a **Navigation landmark** (https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html: "Navigation landmarks provide a way to identify groups (e.g. lists) of links"). Links are not tabs: no arrow keys, no roving tabindex. Native `<a href>` provides all of it.

| Key             | Action                                                                               |
| --------------- | ------------------------------------------------------------------------------------ |
| Tab / Shift+Tab | Moves focus to the next / previous link, in DOM order. Every link is a tab stop.     |
| Enter           | "Executes the link and moves focus to the link target." (APG Link)                   |
| Shift + F10     | "(Optional): Opens a context menu for the link." Provided by the browser. (APG Link) |

Screen readers also list the `<nav>` among the page's landmarks by its name, and a SkipLink before the header jumps past it (SkipLink spec).

**RTL:** no arrow keys, so nothing swaps. Tab order follows the DOM, which follows the reading direction.

## Accessibility

- Role `navigation` from `<nav>` (APG: "Use the HTML nav element to define a navigation landmark."; MDN `<nav>`: "represents a section of a page whose purpose is to provide navigation links", https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav), named by the required `aria-label`/`aria-labelledby`. The `<ul>` gives "list, N items" to screen readers (MDN's `<nav>` example: "a `<nav>` block is used to contain an unordered list (`<ul>`) of links").
- The current link is announced as "current page" through `aria-current="page"`, which MDN says "should be used to inform the assistive technology user what has been indicated via styling."
- **Not colour alone** (brand book: "State always pairs color with a label, a shape, a weight change or an underline"; spec #1 story 49): the current link has the indicator bar. Its colour `color-border-selected` is a 3:1 non-text role on every surface (contrast matrix), so the bar meets WCAG 1.4.11; `color-text-selected` is a 4.5:1 text role there too. Weight is not used: labels are already medium and the brand book allows "Two weights."
- Targets: links are at least `size-control-md` tall (32 px fine, 44 px coarse) and padded, above the 24 px minimum.
- **More contrast:** no change needed; text, indicator and focus colours are AA roles already.
- **Forced colors:** text and fill are forced by the UA. The indicator's `::after` is a `background-color` box, which the UA would force to the background, so under `@media (forced-colors: active)` it sets `background-color: Highlight` (CSS Color Adjust 1 forces a colour only "if its computed value is a color other than a system color", https://www.w3.org/TR/css-color-adjust-1/). The focus ring is an `outline` and takes the system colour.
- **Reduced transparency:** not affected. The Navbar has no Material and no elevation: it is in flow (UI glossary: Floating layers are "The only UI that takes elevation or material"; brand book: "Only floating layers (menus, popovers, toasts, dialogs) get elevation and material."). A sticky header that wants a translucent fill is the app's choice and outside this component.

## RTL

Logical properties only (`padding-inline`, `gap`, `inset-inline`): links run from the inline start and wrap in the reading direction. The indicator is inset equally on both sides, so it is symmetric. No arrow-key behaviour.

## Component tokens

Existing, reused: `icon-sm-size`, `icon-sm-stroke-width` (the link's icon). The focus ring uses `focus-ring-width`, `focus-ring-offset` and `color-border-focused` directly; the transitions use the `motion-*` semantic tokens.

Proposed new (`navbar` is a new component word):

| Token                                  | References                                           | `$type`    | Why                                                   |
| -------------------------------------- | ---------------------------------------------------- | ---------- | ----------------------------------------------------- |
| `navbar-gap`                           | `{semantic.space-inline-xs}`                         | dimension  | Space between links (each has its own padding), 4 px. |
| `navbar-item-min-height`               | `{semantic.size-control-md}`                         | dimension  | Link height, 32 px; 44 px on coarse pointers.         |
| `navbar-item-padding-inline`           | `{semantic.space-inset-sm}`                          | dimension  | Room for the hover fill around the text, 8 px.        |
| `navbar-item-gap`                      | `{semantic.space-inline-sm}`                         | dimension  | Icon to text, 8 px, as Button.                        |
| `navbar-item-border-radius`            | `{semantic.radius-sm}`                               | dimension  | Hover fill corners, as a sm control.                  |
| `navbar-item-font`                     | `{semantic.type-label-sm}`                           | typography | Control text, as the Tabs item.                       |
| `navbar-item-text-color`               | `{semantic.color-text-subtle}`                       | color      | Quiet at rest, as the Tabs item.                      |
| `navbar-item-text-color-hovered`       | `{semantic.color-text-default}`                      | color      | Hover.                                                |
| `navbar-item-text-color-selected`      | `{semantic.color-text-selected}`                     | color      | The current page.                                     |
| `navbar-item-background-color-hovered` | `{semantic.color-background-neutral-subtle-hovered}` | color      | Hover fill, as the tertiary Button.                   |
| `navbar-item-background-color-pressed` | `{semantic.color-background-neutral-subtle-pressed}` | color      | Press feedback, the only one on coarse pointers.      |
| `navbar-indicator-color`               | `{semantic.color-border-selected}`                   | color      | The current-page bar, as `tabs-indicator-color`.      |
| `navbar-indicator-height`              | `{semantic.border-width-thick}`                      | dimension  | 2 px, as `tabs-indicator-height`.                     |

Every word but `navbar` is in the Dictionary (`item`, `indicator`; `gap`, `min-height`, `padding-inline`, `border-radius`, `font`, `text-color`, `background-color`, `color`, `height`; `hovered`, `pressed`, `selected`). The current state uses the `selected` state word, the Dictionary's "The current item in a set".

## Built-in labels

None. The landmark name is required from the app (`aria-label`/`aria-labelledby`), and the links' text is children.

## Feedback events

None. Navigation is not a feedback moment (Link spec), and the Navbar has no client code.

## Sources

- WAI-ARIA APG Landmarks, Navigation: https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html ("Navigation landmarks provide a way to identify groups (e.g. lists) of links"; "If a page includes more than one navigation landmark, each should have a unique label."; "Use the HTML nav element to define a navigation landmark.") · Banner: https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/banner.html
- WAI-ARIA APG Link pattern: https://www.w3.org/WAI/ARIA/apg/patterns/link/ · Disclosure navigation example: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
- MDN `<nav>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav · `menu` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role · `aria-current`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current
- WCAG 2.2 Understanding 1.4.10 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- CSS Color Adjustment 1: https://www.w3.org/TR/css-color-adjust-1/
- Next.js `usePathname`: https://nextjs.org/docs/app/api-reference/functions/use-pathname
- Baseline (webstatus.dev, 2026-10-24): `nav` widely available (2015-07-29); `flexbox` widely (2015-09-30); `logical-properties` widely (2021-09-20); `interaction` media queries (`hover`) widely (2018-12-11); `forced-colors` widely (2022-09-12).
- Brand book README: Principles ("Flat in flow, lifted when floating."), Accessibility ("Not color alone.", "Resize and reflow."), Typography ("Two weights."), Motion ("Springs. Only where the user directly causes the movement: switch thumbs, segmented and tab indicators…"); guidelines `layout.html` ("Reflows to 320px with no horizontal scroll (1.4.10). Under 760 the label column stacks."), `density.html` (fine 24 · 28 · 32 · 40, coarse 32 · 40 · 44 · 48), `elevation.html` and `materials.html` (floating layers only).
- Source guide (indicator language only): artifact `project/components/Tabs/README.md` ("A 2px moss indicator is anchored to the selected tab and glides on a spring."; "Overflowing tablists scroll horizontally.").
- Radix NavigationMenu: https://www.radix-ui.com/primitives/docs/components/navigation-menu · shadcn/ui Navigation Menu: https://ui.shadcn.com/docs/components/navigation-menu · Bootstrap Navbar: https://getbootstrap.com/docs/5.3/components/navbar/ · HeroUI v2 Navbar: https://v2.heroui.com/docs/components/navbar · MUI App Bar: https://mui.com/material-ui/react-app-bar/, API https://mui.com/material-ui/api/app-bar/ · Mantine AppShell: https://mantine.dev/core/app-shell/ (v6: https://v6.mantine.dev/core/app-shell/) · Mantine NavLink: https://mantine.dev/core/nav-link/
