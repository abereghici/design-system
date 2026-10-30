# Performance: delivering `@abereghici/tokens` and `@abereghici/ui` to Next.js 16 apps

Researched 2026-10-23. Sources:

- **Next.js docs**: `nextjs.org/docs` (App Router, v16 docs; the pages' `lastUpdated` stamps run from 2026-07 to 2026-09), the Next 16 and 16.1 release posts, and the `vercel/next.js` source on GitHub (`canary`).
- **React docs**: `react.dev` (`'use client'`, `lazy`, `preload`, `<ViewTransition>`, React Compiler).
- **Web platform**: MDN, web.dev, developer.chrome.com, the SVG 2 and CSS Masking specs, webpack and Node.js docs.
- **Library sources**: raw files from GitHub and unpkg for Primer Octicons, Radix Icons, Lucide, MUI and Material Symbols, Atlassian `@atlaskit/icon`, Shopify Polaris, and SVGO v4.
- **modern-web-guidance**: the repo skill's CLI (`pnpm dlx modern-web-guidance@latest`, skill version `2026_10_16-6654652b`). See section 0 for the searches and the guides retrieved.

Every claim carries a short quote and its URL. Text marked **(inference)** is our reading and is not quoted. "Not found" means the sources we checked don't say.

## Question

Which performance techniques are standard for a React 19 design system that is consumed as source by Next.js 16 App Router apps? We cover six areas:

1. Icons: an external sprite, inline React SVG, or CSS `mask-image`.
2. CSS delivery: CSS Modules chunking and ordering, the cost of a large `:root` set of tokens, `light-dark()`, and containment.
3. Fonts: `next/font/local` or a plain `@font-face` shipped by the package.
4. JS and React: client boundaries, barrel files, React Compiler, and lazy loading.
5. Motion: compositor-only properties, discrete transitions, View Transitions, and `linear()`.
6. Measuring: size budgets, bundle analysis, and Core Web Vitals.

These are already settled and not re-decided here:

- the packages are consumed just-in-time as source;
- tokens are DTCG → Style Dictionary 5 → `--ab-*` custom properties with `light-dark()`;
- components use native popover, dialog, anchor positioning and invoker commands, with no headless library;
- React Compiler is on;
- CSS uses the layers `ab.reset, ab.tokens, ab.base, ab.components`;
- the Baseline floor is "newly available", with no fallbacks.

## Short answer

- **Icons.** Ship the 42 icons as inline SVG React components, run through SVGO, and keep them as server components with no `'use client'`.
  - Every major React icon library we checked does this: Octicons, Radix, Lucide, MUI, Atlaskit and Polaris. None makes a `<use>` sprite its primary React API.
  - Make icons decorative by default (`aria-hidden="true"`). When a `label` prop is passed, switch to `role="img"` with a name.
  - An external sprite is a valid option for a large, repeated icon set. It has two catches: `<use>` cannot load cross-origin files, and Next's `assetPrefix` CDN puts bundled assets on another origin.
  - Use `mask-image` only for pure decoration with a single colour.
- **CSS.**
  - Turbopack transpiles workspace packages automatically, so `transpilePackages` is not needed.
  - CSS Modules give per-component CSS that loads per route. CSS order follows import order, so declare the `@layer` order statement first, in the root layout.
  - Keep `cssChunking` at its default (`true`). `'graph'` is a Turbopack-only tuning knob, and there is no `'loose'` value.
  - A large `:root` costs little at rest. Changing a variable that inherits forces style recalc on every element that references it. Register only the custom properties you animate, using `@property` with `inherits: false`.
- **Fonts.**
  - Both families have variable versions upstream: `Figtree[wght]` (300–900) and `NotoSerif[wdth,wght]` (wght 100–900, wdth 62.5–100).
  - `next/font/local` generates metric-matched fallbacks and preloads only on the routes that use the font. But one call cannot give each file its own `unicode-range`, and it preloads every file you list. That would include the 186 KB Noto Serif latin-ext file.
  - Ship a package `@font-face` sheet that has per-subset `unicode-range` and uses `font-display: swap`. Add `font-size-adjust: from-font`, and preload only the Figtree latin file.
- **JS.**
  - Put `'use client'` only on the leaf files that need it.
  - Use per-component `exports` subpaths and `"sideEffects": ["*.css"]`. You can add `optimizePackageImports` as well.
  - Next 16 compiles workspace source with React Compiler, because only "foreign" (`node_modules`) code is skipped (inference from Next's source).
  - Load the Command palette and the DatePicker panel through `next/dynamic` when they open, and warm the import on hover or focus.
- **Motion.**
  - Animate only `transform`/`translate`/`scale` and `opacity`.
  - Use `@starting-style` for entry animations, which is Baseline newly available. `overlay` and transitions of `display` are not Baseline: they are limited availability, and Firefox lacks them. So, under a no-fallback floor, exit animations on top-layer elements will be instant in some browsers.
  - Store `linear()` springs as tokens.
  - In Next, `<ViewTransition>` is still `experimental.viewTransition`.
- **Measuring.**
  - Measure each subpath with size-limit (`import: "{ Button }"`), and use `next analyze` (16.1+) in a consuming app.
  - Collect field data with `useReportWebVitals` against the thresholds: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, all at p75.

## Findings

### 0. What the modern-web-guidance skill says to run

`SKILL.md` says: "Run `modern-web-guidance` directly with `pnpm dlx` using a **2–5 word action-oriented query** for a **single web platform capability or UI pattern**". The command it gives is `DISABLE_TELEMETRY=1 pnpm dlx modern-web-guidance@latest search "<query>" --skill-version 2026_10_16-6654652b`. Then you `retrieve "<id>"` the matching guides, "including … any broader discipline guide (e.g., … `performance` …) that applies".

- **Searches run, for items 2, 3 and 5:**
  - "defer offscreen rendering"
  - "reduce style recalculation custom properties"
  - "dark mode color scheme"
  - "optimize web font loading"
  - "reduce layout shift fonts"
  - "animate entry exit popover"
  - "view transitions"
  - "spring easing animation"
  - "measure core web vitals"
  - "optimize interaction responsiveness"
- **Guides retrieved:**
  - `performance`, `css`, `dark-mode`
  - `defer-rendering-heavy-content`, `interactions-in-complex-layouts`
  - `visually-stable-font-fallbacks`, `optimize-preload-priority`
  - `motion`, `animate-to-from-top-layer`, `animate-element-entry-exit`, `physics-based-easing`
  - `same-document-transitions`, `scoped-component-transitions`
  - `identify-inp-causes`
- **No guide covers custom-property recalc cost.** The search "reduce style recalculation custom properties" returned only unrelated guides (`reduce-style-repetition` with `@function`, `interactive-content-reveal`). The primary sources in section 2 cover that topic.
- **Browser policy.** The skill applies its fallback rules "unless the user has specified a custom browser support policy". Our policy is "newly available, no fallbacks", so the guides' fallback recipes are not adopted. The status lines they quote are used below to flag features that fall _below_ our floor.

### 1. Icons

#### 1.1 The three techniques

|                    | External sprite `<use href>`       | Inline React SVG                                                           | CSS `mask-image`                                             |
| ------------------ | ---------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| JS bundle          | ~0 (inference)                     | 0 if a server component; path data in JS if a client component (inference) | 0                                                            |
| RSC payload / HTML | `<svg><use>` stub only (inference) | full path data per instance (inference)                                    | class name only                                              |
| HTTP caching       | one cached file (inference)        | none; part of the HTML/RSC stream                                          | one cached file per icon or sheet                            |
| `currentColor`     | inherits from `<use>` (spec)       | yes                                                                        | yes, as `background-color: currentColor`; single colour only |
| Cross-origin       | **forbidden** (spec)               | n/a                                                                        | allowed with CORS (spec)                                     |
| Semantics          | on the outer `<svg>`               | on the `<svg>`                                                             | none on the element; needs a wrapper                         |

- **RSC payload.** "The RSC Payload contains: The rendered result of Server Components; Placeholders for where Client Components should be rendered and references to their JavaScript files." https://nextjs.org/docs/app/getting-started/server-and-client-components
  - (inference) An inline icon rendered by a server component costs no JS. Its markup appears in the HTML, and again in the RSC payload that streams with it.
- **A client boundary pulls icons into the bundle.** Once a file is marked `'use client'`, "all of its imports and the components it directly renders are included in the client bundle." (same URL)
  - (inference) An icon used inside a client component ships its path data as JS.
- **`<use>` cannot load cross-origin files.** "this specification does not allow cross-origin and data URL resource requests in 'use'." https://w3c.github.io/svgwg/svg2-draft/struct.html
  - MDN: "There is currently no defined way to set a cross-origin policy for `<use>` elements." https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use
- **`href` replaces `xlink:href`.** "`xlink:href` attribute is deprecated in favor of `href`." (same MDN URL)
- **Colour in the `<use>` shadow tree.** The tree "exhibits style encapsulation", and "elements in the shadow tree inherit styles from its host 'use' element". https://w3c.github.io/svgwg/svg2-draft/struct.html
  - MDN adds a caveat: "CSS properties are not guaranteed to be inherited by the cloned DOM unless you explicitly request them." https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use
  - (inference) `fill="currentColor"` written on the symbol's paths resolves against the `color` of the `<use>`.
- **The CDN trap.** `assetPrefix` applies to the "`/_next/` path (`.next/static/` folder)". It "does not influence… Files in the public folder". https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix
  - (inference) If the sprite is imported through the bundler and the app sets a CDN `assetPrefix`, the sprite becomes cross-origin and `<use>` stops working. A sprite only works when served from `public/` or through a same-origin rewrite.
- **`mask-image` and CORS.** "User agents must use the potentially CORS-enabled fetch method … for all `<mask-source>` … values on the mask-image … If this results in network errors, the effect is as if the value none had been specified." https://www.w3.org/TR/css-masking-1/
- **`mask-image` is Baseline.** "Widely available … since December 2023". https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image
- **Background and mask images carry no semantics.** "Browsers do not provide any special information on background images to assistive technology". https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/background-image
  - (inference) The same holds for masks.
- **Sprites ship every icon.** The Lucide sprite "includes all icons, which can significantly increase your app's bundle size and load time… Not recommended for high traffic production use." https://raw.githubusercontent.com/lucide-icons/lucide/main/docs/guide/static/svg-sprite.md
  - (inference) This weighs little with 42 icons that are mostly used.
- **Measured comparisons were not found in primary sources.** We found no first-party benchmark of sprite vs JSX costs. A widely shared figure ("costs a minimum of 3x more") comes from a personal blog quoting a tweet. It is not a primary source, so it is not relied on here.

#### 1.2 What the libraries do

- **Primer Octicons (`@primer/octicons-react`).** Inline JSX.
  - `renderOcticon.tsx` defaults `fill = 'currentColor'` and sets `aria-hidden` unless the icon is labelled. It uses `role = labelled && … ? 'img'` and renders `{title ? <title>{title}</title> : null}`. https://raw.githubusercontent.com/primer/octicons/main/lib/octicons_react/src/renderOcticon.tsx
  - It ships several natural heights and picks the `closestNaturalHeight`.
  - SVGO config: `multipass: true`, and preset-default with `removeViewBox: false`. https://raw.githubusercontent.com/primer/octicons/main/svgo.config.mts
  - The README also mentions "symbol IDs", so a sprite form exists. It is secondary. https://raw.githubusercontent.com/primer/octicons/main/README.md
- **Radix Icons (`@radix-ui/react-icons`).** Inline JSX on a 15×15 grid.
  - The components use `{ color = "currentColor", ...props }` and `fill={color}`. https://raw.githubusercontent.com/radix-ui/icons/master/packages/radix-icons/src/AccessibilityIcon.tsx
  - The generator "Swaps out all colors (except for "non") for stroke and fill to "currentColor"." https://raw.githubusercontent.com/radix-ui/icons/master/packages/generate-icon-lib/src/services.ts
  - ARIA defaults: not found in the component.
- **Lucide (`lucide-react`).** Inline JSX built from data arrays.
  - `Icon.mjs` starts with `"use client";`, so its icons are client components in RSC apps. https://unpkg.com/lucide-react@1.61.0/dist/esm/Icon.mjs
  - Defaults are `viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2`. https://raw.githubusercontent.com/lucide-icons/lucide/main/packages/shared/src/build/defaultReactAttributes.ts
  - Docs: "Lucide icons are hidden from screen readers by default with aria-hidden="true"". https://lucide.dev/guide/advanced/accessibility
  - "Only the icons you import are included in your final bundle." https://lucide.dev/guide/packages/lucide-react
  - Lucide's SVGO config: not checked.
- **Material.**
  - Material Symbols is a variable icon font with "four adjustable variable font axes (fill, weight, grade, and optical size)". https://developers.google.com/fonts/docs/material_symbols
  - `@mui/icons-material` generates one `"use client"` file per icon through `createSvgIcon`. https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-icons-material/templateSvgIcon.js
  - `SvgIcon` sets `aria-hidden={titleAccess ? undefined : true}` and `role={titleAccess ? 'img' : undefined}`, and renders a `<title>` when `titleAccess` is passed. https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-material/src/SvgIcon/SvgIcon.js
- **Atlassian (`@atlaskit/icon`).** The glyph is an SVG _string_, injected with `dangerouslySetGlyph: '<path fill="currentcolor" d="…"/>'`. https://unpkg.com/@atlaskit/icon@38.0.2/core/add.js
  - The wrapper is a `span` with `role={label?'img'}` and `aria-hidden={label?undefined:true}`. https://unpkg.com/@atlaskit/icon@38.0.2/dist/esm/components/icon-new.js
  - The docs require `label`, and say to set it to "an empty string ("")" when visible text already names the icon. https://atlassian.design/components/icon/usage
- **Shopify Polaris (`@shopify/polaris-icons`).** Components are generated with SVGR and carry only a `viewBox`. https://unpkg.com/@shopify/polaris-icons@9.3.1/dist/icons/AdjustIcon.svg.mjs
  - SVGO config: `removeViewBox: false` ("viewBox is needed in order to produce 20px by 20px containers"), `mergePaths: false` ("Merging… detached paths… can lead to rendering issues"), and `removeAttrs ['*:fill','svg:(width|height)']`. https://raw.githubusercontent.com/Shopify/polaris/main/polaris-icons/svgo.config.js
  - `Icon` always renders `aria-hidden="true"`. The label goes in `<Text as="span" visuallyHidden>`. https://raw.githubusercontent.com/Shopify/polaris/main/polaris-react/src/components/Icon/Icon.tsx
- **Vercel Geist.** The docs import from `@vercel/geistcn-assets/icons`. https://vercel.com/geist/geistcn-icons-and-logos
  - The package is not on the public npm registry.
  - How the icons are implemented: not found.
- **The pattern (inference).** All six open libraries ship inline JSX or SVG-string components, and sprites appear only as secondary static packages. The reasons they give: per-icon tree-shaking ("Only the icons you import…"), working `currentColor`, and no origin constraints.

#### 1.3 SVGO (v4)

- **v4 defaults changed.** "removeViewBox is no longer a default plugin to preserve scalability". "removeTitle is no longer a default plugin to preserve accessibility." https://raw.githubusercontent.com/svg/svgo/main/docs/06-migrations/01-migration-from-v3-to-v4.mdx
- **`removeDimensions`** removes width and height and "replaces it with the viewBox attribute if it's missing". https://raw.githubusercontent.com/svg/svgo/main/docs/04-plugins/removeDimensions.mdx
- **`convertColors`** takes a `currentColor` option: "If to convert all instances of a color to currentColor". https://raw.githubusercontent.com/svg/svgo/main/docs/04-plugins/convertColors.mdx
- **`prefixIds`** is for "reducing the likeliness of ID conflicts when multiple vectors are inlined into the same document". https://raw.githubusercontent.com/svg/svgo/main/docs/04-plugins/prefixIds.mdx
- **`multipass`**: "Pass over SVGs multiple times to ensure all optimizations are applied." https://raw.githubusercontent.com/svg/svgo/main/lib/types.ts
- **Our files (inference).** The ~8 KB per icon is very likely editor metadata (ids, `data-name`, transforms, clip-paths) plus unrounded coordinates. On single-path 24-unit icons, preset-default plus multipass typically removes most of that. Measure the result rather than assume it.

#### 1.4 Accessibility

- **Library consensus** (sources in 1.2):
  - icons are decorative by default, with `aria-hidden="true"`;
  - a label switches the icon to `role="img"` with `aria-label` or `<title>` (Octicons, MUI, Atlaskit);
  - Polaris and Lucide prefer visually hidden text.
- **Icon buttons.** Lucide says to put the name "on the button or in visually hidden text inside the button". https://lucide.dev/guide/advanced/accessibility
- **`focusable="false"` (inference).** Octicons, MUI and Polaris set it. It is a legacy IE/old-Edge fix and has no effect on our floor.

### 2. CSS delivery

#### 2.1 CSS Modules, chunking and order in Next 16

- **Workspace packages need no `transpilePackages`.** "Turbopack transpiles workspace packages (npm, pnpm, or Yarn workspaces) in your monorepo automatically under both routers. Webpack does the same for the App Router." https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
- **Order follows import order.** "The **order of your CSS** depends on the **order you import styles in your code**." The docs also say: "Turn off linters or formatters that auto-sort imports like ESLint's `sort-imports`". https://nextjs.org/docs/app/getting-started/css
- **Production output.** CSS is "concatenated into **many minified and code-split** `.css` files, ensuring the minimal amount of CSS is loaded for a route". "CSS ordering can behave differently in development, always ensure to check the build (`next build`)". (same URL)
- **Stylesheets are not removed on navigation.** Next "currently does not remove stylesheets as you navigate between routes which can lead to conflicts." (same URL)
- **`experimental.cssChunking` values** (https://nextjs.org/docs/app/api-reference/config/next-config-js/cssChunking):
  - "**`true` (default)** (**webpack and Turbopack**): Next.js will try to merge CSS files whenever possible, determining explicit and implicit dependencies between files from import order".
  - "**`'strict'`** (**webpack only**): Next.js will load CSS files in the correct order they are imported".
  - "**`'graph'`** (**Turbopack only**): Next.js uses a cost-based graph algorithm to group CSS across your routes". It takes `requestCost` (default `20000`) and `weightDistribution` (default `0.1`).
  - "For most applications, the default (`true`) is the right choice in either bundler". With `graph`, "a route can end up carrying some CSS it never imported when that keeps the overall cost down."
  - There is no `'loose'` value (not found).
- **CSS Modules scope styles per component.** "[CSS Modules] make this natural by scoping styles to the component that imports them". (cssChunking page, "Debugging what a route actually uses")
- **`@layer` and Next.** The Next docs don't mention `@layer` (not found). MDN:
  - "The first declared layer gets the lowest priority". https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
  - "Styles that are not defined in a layer always override styles declared in named and anonymous layers." (same URL)
  - (inference) If the `@layer ab.reset, ab.tokens, ab.base, ab.components;` statement loads first, in the root layout's global CSS, chunk order can no longer change precedence _between_ our layers. Order _within_ `ab.components` still follows import order, which only matters when two modules target the same element. Unlayered app CSS still wins over all of it.
- **The modern-web-guidance `css` guide agrees.** It says to "declare their order upfront (e.g. `@layer reset, base, theme, components, utilities;`)".

#### 2.2 The cost of a large `:root` set of custom properties

- **Inheritance is what costs.** The web.dev benchmark (https://web.dev/blog/at-property-performance) measured:
  - "Unregistered custom property (`--unregistered`): 256 runs per second (= 3.90ms per run)"
  - "Registered custom property with `inherits: true` (`--registered`): 252 runs per second (= 3.96ms per run)"
  - "Registered Custom Property that doesn't inherit: 214,110 runs per second (= 4.67µs per run)"
  - Its conclusion: "If you can register your custom property with `inherits: false`, you definitely should."
- **Blink copies style for nodes that don't use the variable.** The Igalia post (Igalia are the Chromium engineers who did the work) says that since Chrome 84, "the nodes with computed styles that don't have references to custom properties declarations shouldn't be affected by the new declaration". It adds "it's also just a first step". https://blogs.igalia.com/jfernandez/2020/08/13/improving-css-custom-properties-performance/
- **Element count drives recalc.** "the worst case cost of calculating the computed elements style is the number of elements multiplied by the selector count". https://web.dev/articles/reduce-the-scope-and-complexity-of-style-calculations
- **What this means for ~210 primitives plus semantic and component tokens (inference).** The static cost is the parse plus one inherited custom-property map, shared by the elements beneath `:root`. The quotes above show that the expensive moment is _changing_ an inherited variable high in the tree, because every element that references it is recalculated.
  - Theme switches through `color-scheme` are rare, user-initiated events and are acceptable.
  - Don't animate or JS-drive inherited `--ab-*` tokens. Instead, register per-component animated properties with `@property { inherits: false }`, or animate `transform`/`opacity`.
  - Registering _all_ tokens is unnecessary. The benchmark shows "a slight performance cost" for registration that keeps inheritance.
- **Component-tier tokens.** Declaring `--ab-button-*` on `:root` makes them inherit across the whole tree (inference). Declaring them on the component's own class keeps them off `:root`, but then the theme cannot override them from the top. Measured data on this trade-off: not found.

#### 2.3 `light-dark()` vs duplicated theme scopes

- **How it picks.** "The `light-dark()` function returns the first value if the used color scheme is `light` or if no preference is set and the second value if the used color scheme is `dark`." Its status is "Baseline 2024 Newly available". https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
- **The guide's view.** The modern-web-guidance `dark-mode` guide says `light-dark()` "eliminates the need for redundant media queries". It also says "MANDATORY: Apply the `color-scheme` property to the `html` element or the `:root` pseudo-class."
- **Performance comparison: not found.** No primary source we read compares the runtime cost of `light-dark()` with `[data-theme]` blocks.
  - (inference) `light-dark()` emits each colour token once instead of once per theme, so it ships less CSS.
  - (inference) A switch changes `color-scheme` at the root. That invalidates the elements using those colours, just as swapping a `[data-theme]` block would.

#### 2.4 `content-visibility` and `contain`

- **The headline result.** "rendering times going from 232ms to 30ms on initial page load". With `content-visibility: auto`, the element "gains layout, style and paint containment", plus size containment when off-screen. https://web.dev/articles/content-visibility
- **Status and guide rules.** The modern-web-guidance `defer-rendering-heavy-content` guide says:
  - "Baseline status for content-visibility: Newly available. It's been Baseline since 2025-09-15" (on our floor);
  - "You MUST pair `content-visibility: auto` with `contain-intrinsic-size`";
  - "DO NOT apply this property to elements within the initial, above-the-fold viewport";
  - "you MUST verify sequential keyboard reachability".
- **The guide's `performance` rules.** "DON'T apply `content-visibility: auto` on smaller, simpler pages" and "For isolated UI components (like modals or widgets), use `contain: layout style paint`".
- **`contain`.** "The contain CSS property indicates that an element and its contents are, as much as possible, independent from the rest of the document tree." For `paint`: "Descendants of the element don't display outside its bounds." It is widely available. https://developer.mozilla.org/en-US/docs/Web/CSS/contain
- **For a design system (inference).** `content-visibility` belongs to _page_ composition: long lists, feeds, data tables. Expose it as an opt-in, for example on a Table or List prop or as a utility class, not as a default inside components.
  - Paint containment clips overflow. Applying it to components that render focus rings or other outlines outside their box would cut them off.
  - Top-layer popovers and dialogs are not clipped by an ancestor's `contain: paint`. This is inference from how the top layer works and should be verified with anchor-positioned popovers.

#### 2.5 Per-component CSS

- **Tree-shaking of side-effect imports.** "A CSS file imported for its side effect alone needs to be added to the side effect list so it will not be unintentionally dropped in production mode". The page's example is `"sideEffects": ["./src/some-side-effectful-file.js", "*.css"]`. https://webpack.js.org/guides/tree-shaking/
- **Turbopack and `sideEffects`.** Whether Turbopack honours `sideEffects`: Turbopack docs not found. (inference) Assume the same semantics as webpack.
- **Keeping CSS per component (inference).** Each component's `.module.css` should be imported only by that component's file. Combined with per-component `exports` subpaths (section 4), a route then pulls only the CSS of the components it renders.

### 3. Fonts

#### 3.1 `next/font/local`

- **What it does.** "It includes **built-in automatic self-hosting** for any font file." https://nextjs.org/docs/app/api-reference/components/font
- **`src` is a path, not a module.** It is "relative to the directory where the font loader function is called" (same URL). In webpack's loader, a bare specifier is turned into `./${src}`, and Turbopack does a plain `lookup_path.join(&path)`. https://github.com/vercel/next.js/blob/canary/packages/next/src/build/webpack/loaders/next-font-loader/index.ts and `crates/next-core/src/next_font/local/mod.rs`
  - (inference) The app would point at `../../packages/tokens/fonts/…`, inside the Turbopack root, which breaks the package boundary.
- **`display`** accepts "`'auto'`, `'block'`, `'swap'`, `'fallback'` or `'optional'` with default value of `'swap'`." (font API page)
- **`preload` applies to every file.** "The default is `true`. Every font file a call loads shares this setting, because they become a single group of `@font-face` rules with one `font-family`." (font API page)
- **Preloading is per route.** The font "is only preloaded on the related routes". https://nextjs.org/docs/app/api-reference/components/font
- **Automatic fallbacks.** "Starting in Next 13, next/font automatically uses font metric overrides and size-adjust to provide matching font fallbacks." https://developer.chrome.com/blog/font-fallbacks
  - `adjustFontFallback` takes "`'Arial'`, `'Times New Roman'` or `false`". (font API page)
- **No per-file `unicode-range`.** `declarations` takes "An array of font face descriptor key-value pairs". In the loader source, they are spread inside `src.map(...)`, so a `unicode-range` you pass lands on _every_ file. https://github.com/vercel/next.js/blob/canary/packages/font/src/local/loader.ts
  - (inference) One call cannot express per-subset ranges.
- **Calls must be module-scope constants.** "Font loaders must be called and assigned to a const in the module scope". (`find_functions_outside_module_scope.rs`, same repo)

#### 3.2 Plain `@font-face` primitives

- **`unicode-range`.** "If the page doesn't use any character in this range, the font is not downloaded; if it uses at least one, the whole font is downloaded." https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range
- **Preload needs `crossorigin`.** "`font` and `fetch` preloading requires the `crossorigin` attribute to be set". https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
  - React's `preload(href, {as: "font"})` example omits `crossOrigin`. React also says that on the server, `preload` "only has an effect if you call it while rendering a component". https://react.dev/reference/react-dom/preload
  - (inference) Pass `crossOrigin: "anonymous"` anyway, per MDN.
  - The modern-web-guidance `performance` guide agrees: "Do include the `crossorigin` attribute for all fonts (even same origin fonts)". It also says "DON'T preload all fonts" and "DON'T use `fetchpriority="high"` on fonts".
- **`font-display`.** web.dev says: "Use font-display: optional for fonts used in body text", or "Use font-display: swap but make sure to deliver the font early enough that it does not cause a layout shift." https://web.dev/articles/font-best-practices
- **Fallback metrics.**
  - `size-adjust`: "defines a multiplier for glyph outlines and metrics associated with this font". It is widely available. https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust
  - `ascent-override` has "Limited availability ... not Baseline". https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/ascent-override
  - `descent-override` and `line-gap-override` were not fetched (inference: same status).
- **`font-size-adjust`.** The modern-web-guidance `visually-stable-font-fallbacks` guide gives "Baseline status for font-size-adjust: Newly available. It's been Baseline since 2024-07-25", and recommends `font-size-adjust: from-font`.
  - MDN caveat: "The adjustment is applied to each font used to render text, not only to fallback fonts." https://developer.mozilla.org/en-US/docs/Web/CSS/font-size-adjust
- **Format.** "Use only WOFF2 and forget about everything else." https://web.dev/articles/font-best-practices

#### 3.3 Variable fonts

- **Figtree is variable.** google/fonts `ofl/figtree` holds `Figtree[wght].ttf` and `Figtree-Italic[wght].ttf`. METADATA.pb gives `tag: "wght" min_value: 300.0 max_value: 900.0` with subsets `latin` and `latin-ext`.
  - Upstream `erikdkennedy/figtree` ships `fonts/webfonts/Figtree[wght].woff2` and `Figtree-Italic[wght].woff2`.
  - Google's CSS API serves `font-weight: 300 900;`. Its latin `unicode-range` begins `U+0000-00FF, U+0131, U+0152-0153, …`. https://fonts.googleapis.com/css2?family=Figtree:wght@300..900
- **Noto Serif is variable.** google/fonts `ofl/notoserif` holds `NotoSerif[wdth,wght].ttf` and `NotoSerif-Italic[wdth,wght].ttf`. The axes are `wdth` 62.5–100 and `wght` 100–900. Source: `notofonts/latin-greek-cyrillic`, archive `NotoSerif-v2.015.zip`.
- **Trade-off.** "a single variable font can be used as a replacement for multiple font files", and "Not everyone benefits from switching to variable fonts." https://web.dev/articles/font-best-practices
  - (inference) The variable files pay off when we use three or more weights of a family. The `wdth` axis adds bytes to Noto Serif and is only worth keeping if we use it. The Noto latin-ext subset (186 KB) dominates either way, so `unicode-range` matters more than the variable axes.

### 4. JS and React

- **What `'use client'` does.** It marks "the module and its transitive dependencies as client code". It "must be at the very beginning of a file, above any imports". Props from server components "must be serializable". https://react.dev/reference/rsc/use-client
- **Keep it at the leaves.** "add `'use client'` at the top of the files that define your interactive components instead of marking large parts of your UI as Client Components." The boundary "does not apply to Server Components passed as children or other props". https://nextjs.org/docs/app/getting-started/server-and-client-components
- **Advice for libraries.** "add the `"use client"` directive to entry points that rely on client-only features", and "some bundlers might strip out `"use client"` directives." (same URL)
  - (inference) Consuming source means no pre-build step can strip the directive.
- **`optimizePackageImports`.** It "will only load the modules you are actually using". Experimental. https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports
  - Why it exists: "There's a hidden cost with JavaScript runtimes in every `require(...)` and `import '...'`". Next "will analyze the entry file of `my-lib` and figure out if it's a barrel file". https://vercel.com/blog/how-we-optimized-package-imports-in-next-js
  - Whether it applies to workspace packages: not stated (not found). (inference) Any package name may be listed.
- **Per-component `exports`.** "only the defined subpath in `"exports"` can be imported". Patterns like `"./features/*.js": "./src/features/*.js"` are supported. https://nodejs.org/api/packages.html
- **React Compiler in Next 16.**
  - "`v16.0.0` `reactCompiler` stabilized and moved from `experimental.reactCompiler` to the top-level". https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
  - "Expect compile times in development and during builds to be higher when enabling this option as the React Compiler relies on Babel." https://nextjs.org/blog/next-16
  - What Turbopack skips: "We never run babel over foreign code". https://github.com/vercel/next.js/blob/canary/crates/next-core/src/next_shared/webpack_rules/babel.rs
  - What "foreign" means: "`foreign`: Matches code in `node_modules`, as well as some Next.js internals." https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
  - The webpack path likewise excludes `/node_modules/`. https://github.com/vercel/next.js/blob/canary/packages/next/src/build/babel/loader/get-config.ts
  - (inference) pnpm workspace packages resolve to `packages/ui/…`, which is not foreign, so the app's compiler compiles our source. React's advice to pre-compile libraries targets published packages ("it is not possible for an application's build pipeline to compile the libraries they use"; https://react.dev/blog/2024/10/21/react-compiler-beta-release). It does not apply to just-in-time source. Verify by looking for `react/compiler-runtime` / `_c(` in the built client chunk.
  - Escape hatch: `"use no memo"` is "a temporary escape hatch". https://react.dev/reference/react-compiler/directives/use-no-memo
- **Lazy loading.**
  - "Lazy loading applies to Client Components." `next/dynamic` "is a composite of `React.lazy()` and Suspense". https://nextjs.org/docs/app/guides/lazy-loading
  - The docs' load-on-demand pattern is `{showMore && <ComponentB />}`.
  - Restrictions: "`ssr: false` is not allowed with `next/dynamic` in Server Components", and "When a Server Component dynamically imports a Client Component, automatic code splitting is currently **not** supported." (same URL)
  - `React.lazy`: "Do not declare `lazy` components _inside_ other components". "Both the returned Promise and the Promise's resolved value will be cached". https://react.dev/reference/react/lazy

### 5. Motion

- **Two properties stay on the compositor.** "Today there are only two properties for which that is true - `transform`s and `opacity`". "every layer you create requires memory and management, and that's not free." https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count
  - The modern-web-guidance `motion` guide adds: "Prefer to animate `opacity` and `transform` (including individual transform properties, e.g. `translate` instead of `left/right/top/bottom`)".
  - The `performance` guide: "DON'T overuse `will-change` globally".
- **`@starting-style`.** It defines "starting values for properties set on an element that you want to transition from when the element receives its first style update". "Baseline 2024 Newly available". https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style
- **Exit animations on top-layer elements are below our floor.** From the modern-web-guidance `animate-to-from-top-layer` guide:
  - "Baseline status for transition-behavior: Newly available". That holds for the feature and for the `allow-discrete` keyword in the `transition` shorthand (web-features 3.44.0 `css.properties.transition.transition-behavior`, low 2024-08-06), not for the `transition-behavior` longhand (`css.properties.transition-behavior`, limited), so every rule writes `allow-discrete` in the shorthand.
  - "Browser support for overlay: Limited availability. … Unsupported in: Firefox and Safari."
  - "css.properties.transition-behavior.transitionable_display … Unsupported in: Firefox."
  - "Firefox 129+ parses `transition-behavior: allow-discrete` … without actually transitioning the `display` property (Firefox bug 1882408), causing elements to disappear immediately on exit."
  - The guide says "MANDATORY: Include `overlay` in your `transition` list for any element moving into or out of the top layer."
  - (inference) Under a no-fallback floor this degrades cleanly: entry animates everywhere, and exit is instant where `overlay` is missing.
- **`linear()` springs.**
  - "Creating complex curves such as bounce or spring effects is not possible in CSS". "you can use linear() to recreate complex easing functions if you compromise some of the precision." https://developer.chrome.com/docs/css-ui/css-linear-easing-function
  - The modern-web-guidance `physics-based-easing` guide adds:
    - "Baseline status for linear() easing: Widely available";
    - "apply `linear()` to properties that run on a separate thread, such as `transform` and `opacity`";
    - "more stops … increase the size of your CSS";
    - "Avoid Opacity for Bounces";
    - "Always include a duration".
- **View Transitions.** The guides give "Baseline status for View transitions: Newly available. It's been Baseline since 2025-10-14" (`same-document-transitions`). Element-scoped transitions are "Supported by: Chrome 147 … Unsupported in: Firefox and Safari" (`scoped-component-transitions`), which is below our floor.
  - Freezing: "During this time, the page is frozen, so delays here should be kept to a minimum." https://developer.chrome.com/docs/web-platform/view-transitions/same-document
  - What the overlay does: a document transition "attaches the `::view-transition` overlay to the `:root` element, which blocks pointer events on the rest of the page … and obscures `position: fixed` headers or open `[popover]` elements". (`scoped-component-transitions` guide)
  - React's `<ViewTransition>` activates on "a Transition, `<Suspense>`, or `useDeferredValue`". "React automatically calls `startViewTransition` itself behind the scenes so you should never do that yourself." https://react.dev/reference/react/ViewTransition
  - In Next it is `experimental.viewTransition` ("version: experimental"), described as "Enable ViewTransition API from React in App Router". https://unpkg.com/next@16.2.7/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/viewTransition.md
- **Reduced motion.** From the `motion` guide: "DO NOT globally apply `animation-duration: 0.01ms;` … handle motion preferences on a case-by-case basis".

### 6. Measuring

- **size-limit.** The `import` option is a "partial import to test tree-shaking. It could be `"{ lib }"`". "`@size-limit/preset-small-lib` … will only measure the size". https://github.com/ai/size-limit
  - How it handles CSS Modules in source packages: not found in the README.
- **The Turbopack analyzer.** Use `npx next analyze` ("Available in v16.1 and later"), which writes to `.next/diagnostics/analyze`. https://nextjs.org/docs/app/guides/package-bundling
  - The 16.1 post lists "View CSS and other imported asset sizes" and "Trace imports across server-to-client component boundaries". https://nextjs.org/blog/next-16-1
  - For webpack builds, use `@next/bundle-analyzer`. (package-bundling guide)
- **Web Vitals in the field.** `useReportWebVitals` "must be used in a Client Component". https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
- **Thresholds.** "LCP should occur within 2.5 seconds", "INP of 200 milliseconds or less", "CLS of 0.1. or less", at "the 75th percentile". https://web.dev/articles/vitals
- **Finding INP causes.** The modern-web-guidance `identify-inp-causes` guide points at Long Animation Frames and Event Timing entries. The `performance` guide gives "The 50ms Rule for INP".
- **Unused CSS.** Lighthouse "Reduce unused CSS" and the DevTools Coverage panel. Coverage counts "styles that only apply on interaction, such as `:hover`" as unused until triggered. (cssChunking page)

## Recommendations

These follow from the findings. They are proposals, not decisions.

### Icons

1. **Generate one component per icon** (`packages/ui/src/icons/<Name>.tsx`) from the 42 SVGs. Keep them server-safe, with no `'use client'`, so server-rendered icons ship 0 JS.
2. **One shared `Icon` primitive** renders `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">` (or `stroke` if the icons are outlines).
   - With no label it renders `aria-hidden="true"`.
   - With a `label` it renders `role="img"` plus `aria-label`.
   - Icon buttons put their name on the button.
   - Skip `focusable`.
3. **SVGO v4 config:** `multipass: true`, preset-default (which keeps `viewBox` and `title` in v4), `removeDimensions`, and `removeAttrs` for `fill`/`stroke` colours and `data-name`. Add `convertColors: { currentColor: true }` only if every icon is one colour. Add `mergePaths: false` only if artefacts appear. Record the before and after sizes.
4. **Don't build a sprite now.** Revisit only if one route shows the same icons hundreds of times (for example, table rows) and the RSC payload measurably grows. If you do build one, serve it from the app's `public/` (same origin; not covered by `assetPrefix`), use `href`, and run `prefixIds`.
5. **The brand logo** is an inline component too, with `role="img"` and an accessible name. It is above the fold, so inlining avoids a request (inference).

### CSS delivery

1. **Don't set `transpilePackages`** for the two workspace packages, and leave `cssChunking` at its default. Consider `'graph'` only after `next analyze` or Coverage shows unused CSS crossing routes.
2. **Ship `@abereghici/tokens/layers.css`** containing only `@layer ab.reset, ab.tokens, ab.base, ab.components;`. Import it first in the app's root layout, before the tokens and base CSS. Disable import auto-sorting for that file.
3. **One `.module.css` per component, imported only by that component.** Wrap each module's rules in `@layer ab.components`. Never import component CSS from a barrel.
4. **Keep the `:root` tokens static.**
   - Switch theme only through `color-scheme`, which `light-dark()` follows.
   - Don't animate or JS-write inherited `--ab-*` tokens.
   - For animated per-component values, declare `@property --ab-…-x { syntax: …; inherits: false; initial-value: … }` in the component's module.
   - Consider declaring component-tier tokens on the component class rather than `:root` if themes never need to override them. Measure first.
5. **Keep `light-dark()`.** It ships one declaration per colour token and needs no duplicated theme blocks.
6. **Don't apply `content-visibility` or `contain` by default.** Offer them as opt-ins on page-scale components (a `Table` or `List` prop) that require `contain-intrinsic-size: auto <estimate>`. Never put paint containment on components whose focus rings draw outside their box.

### Fonts

1. **Replace the static files with variable woff2:**
   - `Figtree[wght]` 300–900, roman plus italic if needed;
   - `NotoSerif[wght]`. Drop the `wdth` axis unless it is used; it would need instancing, which is a build-tool step outside these sources.
   - Keep the latin and latin-ext subsets as separate files.
2. **Ship a package stylesheet** (`@abereghici/tokens/fonts.css`) with one `@font-face` per family × style × subset. Each carries a `unicode-range` matching the Google Fonts ranges, a `font-weight` range (`300 900` / `100 900`), and `font-display: swap`. Put the `@font-face` rules in `ab.base` or unlayered (layers don't affect `@font-face`; inference).
3. **Stabilise the fallback.** Use `font-size-adjust: from-font` on the root font stack, which is newly available. Optionally, add a metric-matched local fallback `@font-face` (`src: local("Arial")` / `local("Times New Roman")` with `size-adjust`, plus `ascent-override`/`descent-override` as progressive enhancement). Fontaine or next/font's fontkit approach can generate the numbers.
4. **Preload exactly one file**, the Figtree latin roman, from the root layout. Use `preload(url, { as: "font", type: "font/woff2", crossOrigin: "anonymous" })` from `react-dom`. Never preload latin-ext.
5. **Don't adopt `next/font/local` for now.** It would preload every listed file, put one `unicode-range` on all files, and need a relative path into the package. Reconsider it if the apps value its automatic fallback more than per-subset ranges. The untested option is two calls per family (latin preloaded, latin-ext `preload: false`), which needs both family names in the stack.

### JS and React

1. **Put `'use client'` only in files that use state, effects, refs or event handlers.** Keep `Icon`, `Text`, `Stack`, `Card` and similar components server-safe. Let client components accept `children` so server content can pass through.
2. **Add per-component `exports` subpaths** (`"./button": "./src/button/index.ts"`, or a `./*` pattern), plus `"sideEffects": ["*.css"]` in both packages. Keep a root barrel only for convenience, and list `@abereghici/ui` in `optimizePackageImports` if the barrel is kept.
3. **React Compiler:** let the app compile the source; no library-side pre-compile is needed. Add a CI check that a built client chunk contains compiler output for `@abereghici/ui`. Use `"use no memo"` only with a comment explaining why.
4. **Command palette:** a small client trigger handles the shortcut and the button. The heavy palette is `dynamic(() => import('@abereghici/ui/command').then(m => m.CommandPalette))`, rendered only when open. Warm it with `import('@abereghici/ui/command')` on `pointerenter`/`focus` of the trigger.
5. **DatePicker:** the input field renders eagerly. The calendar grid, and any Temporal-dependent code, load the same way when the popover opens.

### Motion

1. **Motion tokens** hold durations and easings, including one or two `linear()` springs with few stops. Apply the springs only to `transform` and `scale`/`translate`.
2. **Popovers and dialogs:** use `@starting-style` for entry. Transition `opacity, translate, display, overlay` with `transition-behavior: allow-discrete`. Accept instant exits where `overlay` or a `display` transition is unsupported.
3. **No `will-change` in component CSS.** If needed, set it only during an interaction.
4. **Leave `<ViewTransition>` to the apps** while `experimental.viewTransition` remains experimental. Don't call `startViewTransition` inside components.
5. **Reduced motion is set per component**, nested inside each rule as `@media (prefers-reduced-motion: reduce)`. No global duration hack.

### Measuring

1. **Run size-limit in CI per subpath**, using an `import: "{ Button }"` entry per public component. Add budgets for `tokens.css`, `fonts.css` and the icon set (gzip), and fail on regressions.
2. **Keep a fixture Next app** (or one consuming app) that runs `next analyze --output` in CI. Diff the client JS per route and check that no server-only component crossed into the client graph.
3. **Field data:** use `useReportWebVitals` in each app, reporting LCP, INP and CLS at p75. Lab data: Lighthouse/Coverage on a kitchen-sink route, plus a Playwright check that opening the Command palette and the DatePicker stays under a 200 ms interaction budget (Event Timing).
4. **Record the SVGO before/after numbers and the font file sizes** in the package READMEs or the PR that introduces them.

## Open questions

1. **Whether Turbopack honours `sideEffects`.** Not found in the Turbopack docs. Verify with a build that imports one subpath.
2. **Whether `optimizePackageImports` affects workspace packages.** Not stated. Verify with `next analyze`.
3. **React Compiler on workspace source.** Our conclusion is inferred from Next's source (`foreign` = `node_modules`). Verify with the built output.
4. **The runtime cost of `light-dark()` vs `[data-theme]` blocks.** Not found. Measure in DevTools (Recalculate Style on theme toggle) if it matters.
5. **Top-layer elements under `contain: paint`.** We infer that popovers and dialogs escape the clip. Verify with anchor-positioned popovers inside a contained Table.
6. **size-limit with CSS Modules source.** Whether `preset-small-lib` measures CSS imported by TS source correctly is not in the README.
7. **Vercel Geist icons.** The implementation is not public. Not found.
8. **Instancing Noto Serif.** Dropping `wdth` from the variable file needs a font tool (for example fontTools `instancer`). That tool was not researched here.
