# Link

Navigates to another page, or to a place on the same page. Use it in running text and in lists of destinations. To trigger an action, use a Button (or an IconButton); a link without a destination is not a link. To jump past repeated navigation, use a SkipLink.

```tsx
import { Link } from "@platform/ui/link";
import NextLink from "next/link";

<Text>Read the <Link href="/docs/tokens">token guide</Link> first.</Text>

<Link asChild>
  <NextLink href="/settings">Settings</NextLink>
</Link>

<Link href="https://github.com/abereghici" target="_blank">GitHub (opens in a new tab)</Link>
```

Status: draft for brand-owner review (phase 1). Source guide: none (the source styles every `a` in `archived/tokens/base.css` with the `link-*` tokens; no component guide). Drafted from that rule, the brand principles and the reference libraries.

## Anatomy

Text → trailing icon (optional).

- **Root.** A native `<a href>`, inline, inheriting font and size from the surrounding text. Text colour `link-text-color`; always underlined with `link-underline-color` at `link-underline-thickness` (1 px) and `link-underline-offset` (3 px). This is the source's `a` rule, as a component.
- **Icon** (optional) is a child marked `data-icon="inline-end"` (or `inline-start`), as in Button, e.g. an external-link arrow. Decorative; the text names the link.

## API

| Prop      | Type                  | Default  | Notes                                                                                                              |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `href`    | `string`              | required | Required unless `asChild` (then the child carries it).                                                             |
| `asChild` | `boolean`             | `false`  | Renders the single child element (a router link) with Link's props and styles (Radix Slot).                        |
| …native   | `ComponentProps<"a">` |          | `ref`, `className`, `target`, `rel`, `aria-current`, `download` and every native attribute pass through unchanged. |

No `variant`, `underline`, `color`, `size` or `disabled` prop (see below).

Names, checked against the reference libraries:

- **`Link`**: Radix Themes "Semantic element for navigation between pages." (https://www.radix-ui.com/themes/docs/components/link); React Aria "A link allows a user to navigate to another page or resource within a web page or application." (https://react-aria.adobe.com/Link); Chakra `Link` "Used to provide accessible navigation" (https://chakra-ui.com/docs/components/link); MUI `Link` (https://mui.com/material-ui/api/link/). Mantine calls it `Anchor`, "Display link with theme styles" (https://mantine.dev/core/anchor/). Base UI has no Link (not in its component list, https://base-ui.com/react/overview/quick-start). Four libraries use `Link`.
- **`asChild` for router links.** Chakra: "Use the asChild prop to compose Link with framework links like (Next.js)", with `<ChakraLink asChild>` wrapping `<NextLink href="/about">`; Radix Themes lists `asChild` "`boolean`". MUI and Mantine use a polymorphic `component` prop (MUI "The `Link` component provides the `component` prop to handle this use case.", https://mui.com/material-ui/react-link/; Mantine "`<Anchor component={Link} href="/" />`"). React Aria: "To integrate with a client side router, use the render prop to delegate to your router's link component." Spec #1 picks `asChild` for composition, which Radix and Chakra use.
- **No `underline` prop.** Radix Themes `underline` "`"auto" | "always" | "hover" | "none"`" default "`auto`"; MUI `underline` "`'always'`, `'hover'`, `'none'`" default "`'always'`"; Mantine "`always`", "`hover`", "`never`", "`not-hover`". Our link text is `color-text-default`, the same colour as body text, so the underline is the only thing that marks a link in text. The brand book's "State always pairs color with a label, a shape, a weight change or an underline" leaves no room for `hover`/`none`. Always underlined, as MUI's default (judgement call; a navigation list that wants bare text uses its own component, e.g. Navbar/Sidebar in phase 3).
- **No `variant` / `color`.** Chakra `variant` "`'underline' | 'plain'`", Radix and MUI `color`. The source has one link treatment (`link-*` tokens only); colour variants are not needed (judgement call).
- **No `disabled`.** HTML disables only form controls: "An element is said to be actually disabled if it is one of the following: a button element that is disabled…" (https://html.spec.whatwg.org/multipage/semantics-other.html). MUI: "If a link doesn't have a meaningful href, it should be rendered using a `<button>` element". React Aria has `isDisabled` (renders a link that does nothing); we follow HTML and MUI.

## States

| State         | How it shows                                                                                                                       | Exposed as                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| rest          | `link-text-color`, underline `link-underline-color`                                                                                |                              |
| hovered       | Underline `link-underline-color-hovered` (accent); fine pointers only (`@media (hover: hover) and (pointer: fine)`, as the source) | `:hover`                     |
| focus-visible | 2 px focus ring, 3 px offset, `color-border-focused`; wraps with the text across lines                                             | `:focus-visible`             |
| current       | Not styled by Link. Navigation components (Breadcrumbs, Navbar) style `aria-current` themselves                                    | `aria-current` (passthrough) |

`:visited` is not styled (design decision: the source has no visited colour, and the underline is the same either way).

## Behaviour

- Navigation is the browser's (or the router's, through `asChild`). Link adds no click handler and no script.
- New tab: `target="_blank"` is passed through. Link adds no `rel`: HTML already returns noopener when "target is an ASCII case-insensitive match for "_blank"" and the link types "do not include the opener keyword" (https://html.spec.whatwg.org/multipage/links.html). Say it in the text ("opens in a new tab") or add a trailing icon with the same words in a VisuallyHidden; MUI: for new windows "add an aria-label to inform screen reader users".
- Link text says where it goes; MUI: "avoid generic descriptions like "click here" or "go to"".
- Server Component: no `'use client'`. With `asChild` the Slot only merges props onto the child element; the child (Next.js `Link`) brings its own client boundary (inference; the Slot must not use hooks, verified when it is built).

## Motion

- Hover: `text-decoration-color` over `motion-duration-hover-in` (120 ms) in and `motion-duration-hover-out` (250 ms) out, `motion-easing-color` (the source's `transition: text-decoration-color var(--ab-motion-duration-hover-out) var(--ab-motion-easing-color)`).
- No press scale: a link is text in a line, and scaling it would move the words around it.
- **Reduced motion:** nothing to remove; the only transition is a colour fade, which stays.
- **Instant exit:** Link has no exit. Hover-out reverses from the current colour; with no transition the underline simply switches colour, which reads as correct.

## Keyboard

APG pattern: **Link** (https://www.w3.org/WAI/ARIA/apg/patterns/link/). "Authors are strongly encouraged to use a native host language link element, such as an HTML `<A>` element with an `href` attribute."

| Key             | Action                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| Enter           | "Executes the link and moves focus to the link target."                   |
| Shift + F10     | "(Optional): Opens a context menu for the link." Provided by the browser. |
| Tab / Shift+Tab | Moves focus to / from the link.                                           |

Space does not activate a link (the APG lists only Enter), which is how users tell a link from a button. Native `<a href>` provides all of it; no key handler is added.

## Accessibility

- Role `link` from the native `<a href>`. APG: "The element containing the link text or graphic has role of link". HTML: "If the a element has no href attribute, then the element represents a placeholder", which is why `href` is required.
- The accessible name is the text. An icon-only link is an IconButton with `asChild` around an `<a href>` or a router link, and takes `aria-label`.
- **Not colour alone:** the underline is always drawn; `link-underline-color` (`color-border-default`) is a 3:1 border role, so the underline itself meets non-text contrast.
- **More contrast:** no change needed; text is `color-text-default` and the underline already uses `color-border-default`, not the subtle hairline.
- **Forced colors:** the UA forces `color` and `text-decoration-color` ("text-decoration-color" is in CSS Color Adjust 1's list of forced properties, https://www.w3.org/TR/css-color-adjust-1/), so the link takes the system link colour (inference: the UA picks `LinkText` for links) and the underline stays. The focus ring is an `outline`, so the system colour applies.
- **Reduced transparency:** not affected.

## RTL

Text direction comes from the document. The underline and focus ring are symmetric. `data-icon="inline-start"`/`"inline-end"` use logical margins, and a directional icon (an arrow) is mirrored by the Icon component with `:dir(rtl)`. No arrow-key behaviour.

## Component tokens

All exist (ported from the source): `link-text-color`, `link-underline-color`, `link-underline-color-hovered`, `link-underline-thickness`, `link-underline-offset`.

No new tokens. The focus ring uses `focus-ring-width`, `focus-ring-offset` and `color-border-focused` directly (R6), and the transition uses the `motion-*` semantic tokens. If the base stylesheet styles bare `a` elements, it uses the same `link-*` tokens, so a Link and a plain `<a>` in Markdown content look the same.

## Author-written text

None. The text is the children.

## Feedback events

None. Navigation is not one of the feedback moments (`ab-toggle`, `ab-confirm`, `ab-dismiss`, `ab-appear`, `ab-press`), and dispatching one would need a client handler on every link.

## Sources

- Source styles: artifact `project/archived/tokens/base.css` ("`a{color:var(--ab-link-text-color);text-decoration:underline;text-decoration-color:var(--ab-link-underline-color);…}`" and "`@media (hover:hover) and (pointer:fine){a:hover{text-decoration-color:var(--ab-link-underline-color-hovered);…}}`").
- WAI-ARIA APG Link pattern: https://www.w3.org/WAI/ARIA/apg/patterns/link/
- HTML `a` element: https://html.spec.whatwg.org/multipage/text-level-semantics.html; links and noopener: https://html.spec.whatwg.org/multipage/links.html; disabled elements: https://html.spec.whatwg.org/multipage/semantics-other.html
- Radix Themes Link: https://www.radix-ui.com/themes/docs/components/link
- React Aria Link: https://react-aria.adobe.com/Link
- Chakra Link: https://chakra-ui.com/docs/components/link
- MUI Link API and guide: https://mui.com/material-ui/api/link/, https://mui.com/material-ui/react-link/
- Mantine Anchor: https://mantine.dev/core/anchor/
- Base UI component list: https://base-ui.com/react/overview/quick-start
- CSS Color Adjustment 1: https://www.w3.org/TR/css-color-adjust-1/
