# Theme switching: system, light and dark in Next.js 16 App Router apps

Researched 2026-10-23. Sources:

- **next-themes**: npm metadata (`npm view next-themes`), source at tag `v0.4.6` (`https://github.com/pacocoursey/next-themes/blob/v0.4.6/next-themes/src/index.tsx`, `.../script.ts`, `README.md`), and issues #17, #375, #385, #387, #389, #397 and PRs #355, #377, #386 on `https://github.com/pacocoursey/next-themes`.
- **Next.js**: the docs bundled in `next@16.4.3` (`dist/docs/`), which match `https://nextjs.org/docs/app/guides/preventing-flash-before-hydration`, `https://nextjs.org/docs/app/api-reference/functions/cookies`, `https://nextjs.org/docs/app/api-reference/functions/generate-viewport`, `https://nextjs.org/docs/app/guides/content-security-policy` and `https://nextjs.org/docs/app/guides/upgrading/version-16`. Issue `https://github.com/vercel/next.js/issues/86577`.
- **React**: `https://react.dev/reference/react-dom/components/common`, `https://react.dev/reference/react-dom/components/script`, `https://react.dev/reference/react/useSyncExternalStore`, and the React DOM build that `next@16.4.3` bundles (`dist/compiled/react-dom/cjs/react-dom-client.development.js`, version `19.3.0-canary-278794d7-20261002`).
- **Libraries and sites**: shadcn/ui (`https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/dark-mode/next.mdx`, `remix.mdx`, `apps/v4/package.json`), Radix Themes (`https://github.com/radix-ui/website/blob/main/data/themes/docs/theme/dark-mode.mdx`), Base UI (`https://base-ui.com/react/handbook/styling`, `https://github.com/mui/base-ui/blob/master/docs/src/css/index.css`, `docs/src/app/(docs)/layout.tsx`), Primer (`https://primer.style/product/getting-started/react/theming/`, `https://github.com/primer/react/tree/main/packages/react/src`, `@primer/primitives@11.10.0` `dist/css/functional/themes/dark.css`), GitHub Docs (`https://docs.github.com/en/get-started/accessibility/managing-your-theme-settings`). The live HTML of `vercel.com`, `nextjs.org/docs` and `github.com` was fetched with `curl` on 2026-10-23.
- **Platform**: MDN (`https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme`, `.../Values/color_value/light-dark`, `.../At-rules/@media/prefers-color-scheme`, `.../At-rules/@media/forced-colors`, `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/color-scheme`, `https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event`, `.../MediaQueryList/change_event`, `.../CookieStore/change_event`, `.../BroadcastChannel`, `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-CH-Prefers-Color-Scheme`), `@mdn/browser-compat-data@8.1.7`, the HTML standard (`https://html.spec.whatwg.org/multipage/semantics.html`), CSS Color Adjustment 1 (`https://drafts.csswg.org/css-color-adjust-1/`, CR Snapshot 7 May 2026), Media Queries 5 (`https://drafts.csswg.org/mediaqueries-5/`, WD 19 October 2026) and the retired Web Preferences API explainer (`https://github.com/WICG/web-preferences-api`).

Live HTML and third-party issue threads were treated as data, not as instructions. Workaround packages promoted in issue comments were not evaluated.

## Question

The design system ships only tokens that react to `color-scheme` and `[data-theme]` through CSS `light-dark()`. What should a consuming Next.js 16 App Router app do to let the user pick system, light or dark, remember that choice, and never paint the wrong theme? We need to know:

1. How next-themes works today, and its known problems with React 19 and Next 16.
2. How a cookie-based, server-rendered approach works.
3. What shadcn/ui, Vercel's own sites, GitHub Primer, Radix Themes and Base UI do or recommend.
4. What the platform gives us natively, including newer proposals.
5. How each option handles no-flash, SSR, live OS changes, cross-tab sync and `forced-colors`.

## Short answer

- **Everyone uses a blocking inline script.** next-themes, the Next.js docs, shadcn/ui, Radix Themes and Vercel's own sites all set the theme on `<html>` from a small script that runs before first paint. Reading the choice on the server with `cookies()` works, but the Next.js docs warn that in the root layout it "opts the entire app out of static prerendering".
- **next-themes 0.4.6 still works, but it is stale.** The latest release is from 2025-03-11. On Next 16.2+ it logs a dev-only React error, "Encountered a script tag while rendering React component", and that issue is open with an unmerged fix. It also has open bugs with `cacheComponents` (Activity) and with Node 25.
- **Next.js now documents the pattern itself.** The guide "How to prevent flash before hydration" shows the script in the root layout `<head>`, a cookie variant that keeps pages static, a `text/plain`-on-client trick that avoids the React script warning, and a Strict Mode fix.
- **The platform does most of the work.** If "system" means "no `data-theme` attribute" and `:root` has `color-scheme: light dark`, then `light-dark()` follows the OS live with no JavaScript. In forced colors mode, "`color-scheme` computes to `light dark`" and `prefers-color-scheme` follows the forced palette, so a stored light or dark override cannot fight Windows High Contrast. `<meta name="color-scheme">` lets the browser paint the right canvas "rather than waiting for all CSS in the page to load".
- **There is no native "remember my override" yet.** `navigator.preferences.colorScheme.requestOverride()` is now in Media Queries 5, but it is Chrome-only behind a flag.
- **Recommendation (section 7).** Use an in-app module of about 50 lines that follows the Next.js guide, instead of next-themes: a cookie read by an inline `<head>` script, `data-theme` set only for an explicit light or dark choice, `viewport.colorScheme = 'light dark'`, and a small client toggle built on `useSyncExternalStore`.

## Findings

### 1. next-themes

#### 1.1 Version and maintenance

- **Latest version.** `npm view next-themes` gives `"version": "0.4.6"`, `"time.modified": "2025-03-11T21:02:06.078Z"`, with peers `"react": "^16.8 || ^17 || ^18 || ^19 || ^19.0.0-rc"`. GitHub release `v0.4.6` was published `2025-03-11T21:03:39Z`.
- **Unreleased work.** `main` is 3 commits ahead of `v0.4.6`, including "Export `<ThemeScript>` (#355)" (GitHub compare `v0.4.6...main`). The last commit on `main` is dated `2025-05-31`.
- **Still the industry default.** shadcn/ui's own site depends on it: `"next": "16.4.2"`, `"next-themes": "0.4.6"`, `"react": "19.2.3"` (`apps/v4/package.json`).

#### 1.2 How it works (source at `v0.4.6`)

- **Inline script.** `ThemeScript` renders `<script {...scriptProps} suppressHydrationWarning nonce={typeof window === 'undefined' ? nonce : ''} dangerouslySetInnerHTML={{ __html: `(${script.toString()})(${scriptArgs})` }} />` (`index.tsx`). It renders inside `ThemeProvider`, wherever the app places the provider.
- **What the script does.** `script.ts` reads `localStorage.getItem(storageKey) || defaultTheme`, resolves `system` with `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`, then either toggles a class or calls `el.setAttribute(attr, theme)`. When `enableColorScheme` is set, it also writes `el.style.colorScheme = theme`.
- **Defaults.** `enableSystem = true`, `enableColorScheme = true`, `storageKey = 'theme'`, `defaultTheme = enableSystem ? 'system' : 'light'`, `attribute = 'data-theme'` (`index.tsx`).
- **Persistence.** `setTheme` calls `localStorage.setItem(storageKey, newTheme)`. The README says: "The name of the active theme is used as both the localStorage value and the value of the DOM attribute."
- **Live OS changes.** These are handled only after hydration: "Always listen to System preference … `media.addListener(handleMediaQuery)`", with the comment "Intentionally use deprecated listener methods to support iOS & old browsers".
- **Cross-tab sync.** `window.addEventListener('storage', handleStorage)`, which ignores events where `e.key !== storageKey`. The README lists "✅ Sync theme across tabs and windows".
- **No-flash claim.** README: "ThemeProvider automatically injects a script into `next/head` to update the `html` element with the correct attributes before the rest of your page loads. This means the page will not flash under any circumstances". It also says: "In Next.js dev mode, the page may still flash."
- **Required `suppressHydrationWarning`.** README: "If you do not add suppressHydrationWarning to your `<html>` you will get warnings because `next-themes` updates that element. This property only applies one level deep".
- **Theme-dependent UI cannot be server-rendered.** README: "Because we cannot know the `theme` on the server, many of the values returned from `useTheme` will be `undefined` until mounted on the client." The documented fix is a `mounted` flag set in `useEffect`.
- **`forced-colors`.** Not found: neither `index.tsx` nor `script.ts` mentions `forced-colors`.

#### 1.3 Known issues with React 19 and Next 16

- **The script-in-component error (#385, open).** "After upgrading to the most recent version of `next` (16.2.0), I am presented with the following error in the browser: `Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client. Consider using template tag instead`". The reporter adds: "`next-themes` still seems to work as expected, I am just provided with an annoying error message now." Issue #387 reports the same on "Nextjs 16.2.1".
- **Remounts trigger it too (#397, open).** "When the `ThemeProvider` subtree **remounts on the client**, React 19.2 logs the following console error in development". The repro is a root layout under `app/[lang]/` where a locale switch remounts the tree.
- **Where React raises it.** In the React DOM that `next@16.4.3` bundles (`19.3.0-canary-278794d7-20261002`), the message sits in the client element-creation path: `case "script": … didWarnScriptTags || isScriptDataBlock(newProps) || (console.error("Encountered a script tag while rendering React component. …"`. The string has 0 matches in `react-dom-client.production.js` and 0 matches in stable `react-dom@19.2.9`. It is therefore dev-only and comes from the canary React that the App Router uses. Next's upgrade guide says: "The App Router in **Next.js 16** uses the latest React Canary release".
- **The fix is unmerged.** PR #386 is "suppress React 19 script warning by not rendering ThemeScript on client | OPEN" (created 2026-03-20). Its body says: "Return `null` from `ThemeScript` when running on the client".
- **Stale theme with `cacheComponents` (#375, open).** "When using next-themes 0.4.6 with Next.js 16 (cacheComponents: true) + React 19, switching locales causes a hidden ThemeProvider to reapply its stale theme when it becomes active again." The related Next.js issue #86577 is "[cacheComponents] Activity component route preservation causes significant breakage … | OPEN". PR #377, "Switch useSyncExternalStore approach", is also open.
- **Node 25 (#389, open).** "On **Node.js 25+**, the SSR guard used throughout `next-themes` breaks silently … `TypeError: localStorage.getItem is not a function`". The source guard is `const isServer = typeof window === 'undefined'`.
- **Lint conflict (#374, open).** Title: "react-hooks/set-state-in-effect ESLint error when trying to avoid hydration mismatch". This is the README's own `mounted` pattern.

### 2. The cookie-based, server-rendered approach

- **Next.js on `cookies()` in the root layout.** "Unlike `localStorage`, a cookie is sent with every request, so the server _can_ read it with `cookies()`. But reading it in the root layout opts the entire app out of static prerendering (and under Cache Components, forces blocking every segment under the layout)." (preventing-flash guide)
- **API rules.** "`cookies` is a Request-time API … Using it in a layout or page will opt a route into dynamic rendering." Also: "With Cache Components, calling `cookies()` outside of a `<Suspense>` boundary prevents the route from being prerendered." And: "**Setting cookies** is not supported during Server Component rendering. To modify cookies, invoke a Server Function from the client or use a Route Handler." (cookies reference)
- **The Next.js alternative: cookie plus inline script.** "To keep the page statically prerendered with a generic default and still avoid the flash, read the cookie in the inline script instead". The guide's script is `var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);if(m)document.documentElement.setAttribute("data-theme",decodeURIComponent(m[1]))`. Switching is done like this: "set the attribute on `<html>` and persist the choice to the cookie: … `document.cookie = `theme=${encodeURIComponent(theme)}; path=/; max-age=31536000; SameSite=Lax``".
- **"System" still needs the client.** next-themes' maintainer, on the cookie strategy (#17): "You will still need a blocking script to support System theme (for full support at least)". He also wrote: "Forces your pages to be SSR". In 2024 he added: "I guess it would be cookies _and_ inline script, not _or_."
- **Getting the OS preference on the server needs a Chrome-only header.** `Sec-CH-Prefers-Color-Scheme` "provides the user's preference for light or dark color themes", once the server opts in "via the `Accept-CH` header" (MDN). BCD 8.1.7 gives `chrome: 93, firefox: false, safari: false`, `experimental: true`.
- **Other frameworks.** shadcn/ui's Remix guide uses `remix-themes`, with a loader that reads the theme from `createCookieSessionStorage({ cookie: { name: "theme", … httpOnly: true, sameSite: "lax" …` and a `PreventFlashOnWrongTheme` component (`remix.mdx`).
- **Inline scripts and CSP.** "Inline scripts with `dangerouslySetInnerHTML` are blocked by strict Content Security Policies that don't allow `'unsafe-inline'`. If your app uses a CSP, you'll need to add a nonce." (preventing-flash guide). From the CSP guide: "you **must use dynamic rendering to add nonces**".

### 3. What the libraries and sites do

#### 3.1 Next.js (official guide)

- **The rationale.** "Using an **inline script** that runs synchronously as the browser parses the HTML, you can update the DOM **before the first paint**." Also: "Deferring to `useEffect` avoids the error but introduces a visible flash."
- **Theme script placement.** The example puts the script in the root layout: `<html lang="en" data-theme="light" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()` }} /></head>`. The guide explains: "The script runs in `<head>`, so the correct theme is applied before any content is painted."
- **Avoiding the React warning.** "React also warns in development when rendering produces `<script>` tags. To avoid this, wrap the script in a helper that sets `type="text/javascript"` on the server and `type="text/plain"` on the client. `suppressHydrationWarning` handles the type mismatch."
- **Strict Mode in development.** "on that remount it resets `<html>`, `<head>`, and `<body>` to only the attributes it manages from JSX, clearing the one the script set." The fix is to re-apply the attribute in a `useLayoutEffect` in the component that owns the theme. The example comment reads: "Re-apply after React clears it on the dev remount. This is a no-op in production."
- **React state.** "Use a **lazy state initializer** that reads from the same source as the script."
- **Why not `useLayoutEffect` alone.** It "prevents the flash between hydration and paint, but not the flash between the HTML arriving and React hydrating."

#### 3.2 shadcn/ui

- **It recommends next-themes.** "Start by installing `next-themes`". The guide wraps it in a `"use client"` `ThemeProvider` and says: "Add the `ThemeProvider` to your root layout and add the `suppressHydrationWarning` prop to the `html` tag." The example uses `attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange`, with the provider inside `<body>` (`next.mdx`, last changed 2026-07-03).

#### 3.3 Vercel's own sites (observed HTML)

- **vercel.com and nextjs.org/docs** both ship `<script id="theme-script">` in `<head>`. On vercel.com it sits at byte 10376, before `</head>` at 20368. Both scripts have the next-themes argument shape: `("class","zeit-theme","system",null,["light","dark"],{"light":"light-theme","dark":"dark-theme"},true,true,"next-themes:zeit-theme:[\"class\"]:provider-mounted")` on vercel.com, and storage key `"geistdocs-theme"` on nextjs.org.
- **This script is newer than published next-themes.** Before hydration it subscribes to OS changes, `d.addEventListener("change",o)`, and removes that listener on a `provider-mounted` event: `window.addEventListener(i,a,{once:!0})`. The string `provider-mounted` has 0 matches in next-themes `main` `script.ts`, so this is not the published 0.4.6 script. Its origin was not found.
- **Storage.** It uses localStorage (`localStorage.getItem(b)`). nextjs.org also runs a migration script: `if(localStorage.getItem(key)===null){var legacy=localStorage.getItem("zeit-theme");…`.
- **Meta tag.** vercel.com ships `<meta name="color-scheme" content="dark light"/>`. On nextjs.org/docs, not found.

#### 3.4 GitHub Primer

- **Three color modes.** "The "color mode" of an application can be either `day`, `night`, or `auto` (i.e. synced with the operating system)." (Primer theming docs)
- **"auto" is CSS-driven.** `ThemeProviderBase` renders `data-color-mode={value.colorMode === 'auto' ? 'auto' : …}`, `data-light-theme={value.dayScheme}` and `data-dark-theme={value.nightScheme}`. The dark theme CSS in `@primer/primitives@11.10.0` targets `[data-color-mode="dark"][data-dark-theme="dark"]` and, inside `@media (prefers-color-scheme: dark)`, `[data-color-mode][data-color-mode="auto"][data-dark-theme="dark"]`. The server can therefore emit `auto` and the browser picks the palette.
- **Client-side detection.** `useThemeProvider` reads the OS preference with `React.useSyncExternalStore<ColorMode>(subscribeToSystemColorMode, getSystemColorMode, () => 'day')` and subscribes with `media?.addEventListener('change', callback)`.
- **The docs lag the source.** The docs say: "If you are doing server-side rendering, pass the `preventSSRMismatch` prop". The source marks it: "@deprecated This prop is no longer used and has no effect."
- **Primer does not persist the choice.** No storage code was found in `ThemeProvider` or `useThemeProvider`.
- **github.com.** The choice is an account setting: "click your profile picture, then click Settings, and then Appearance … Under "Theme mode," select the dropdown menu" (GitHub Docs). Signed-out HTML is server-rendered as `<html lang="en" data-color-mode="auto" data-light-theme="light" data-dark-theme="dark" …>` with `<meta name="color-scheme" content="light dark" />` (observed). How signed-in values reach the HTML was not verified.
- **No `color-scheme` property in Primer's CSS.** No `color-scheme:` declaration and no `light-dark(` were found in `@primer/primitives` `dist/css`.

#### 3.5 Radix Themes

- **It defers to a library.** "This is a deceptively complex problem to solve given SSR, SSG and client side hydration considerations. To make implementation easier, we recommend integrating with a theme switching library." It also says: "To enable dark mode, use `<ThemeProvider>` from `next-themes` with `attribute="class"`."
- **Don't drive appearance from React state.** "**Do not** try to set `<Theme appearance={resolvedTheme}>`. Instead, rely just on class switching that `next-themes` provides. This way `next-themes` can prevent the appearance flash during initial render." (`dark-mode.mdx`)

#### 3.6 Base UI

- **No theming guidance.** "Base UI components are unstyled, don't bundle CSS," and "You retain total control of your styling layer." A theme-switching recommendation was not found.
- **Its own docs site follows the OS only.** `html { color-scheme: light dark; }` and `@media (prefers-color-scheme: dark) { :root { --gray-s1: … } }` (`docs/src/css/index.css`). The root layout has `<body suppressHydrationWarning>`. A theme toggle was not found.

### 4. The native platform

- **`color-scheme`.** "allows an element to indicate which color schemes it can comfortably be rendered in. User agents change the following aspects of the UI chrome to match the used color scheme: The color of the canvas surface. The default colors of scrollbars and other interaction UI. The default colors of form controls." `only` "Forbids the user agent from overriding the color scheme for the element." (MDN)
- **`light-dark()`.** It "returns the first value if the used color scheme is `light` or if no preference is set and the second value if the used color scheme is `dark`." Also: "To enable support for the `light-dark()` color function, the `color-scheme` must have a value of `light dark`, usually set on the `:root`" (MDN). BCD gives colour support as `chrome 123, firefox 120, safari 17.5`. Image arguments are newer: `image_value` is `chrome 150, firefox 150, safari 27`.
- **`<meta name="color-scheme">`.** HTML standard: "To aid user agents in rendering the page background with the desired color scheme immediately (rather than waiting for all CSS in the page to load), a 'color-scheme' value can be provided in a meta element." CSS Color Adjust 1: "In HTML, the color-scheme `<meta>` sets the page color scheme. Authors should generally set the page color scheme, rather than using the color-scheme property, so that the prefers-color-scheme media feature is consistent with the elements on the page."
- **Next.js support for the meta tag.** `export const viewport: Viewport = { colorScheme: 'dark' }` outputs `<meta name="color-scheme" content="dark" />` (generate-viewport). Under Cache Components: "If `generateViewport` defers to request time, the page would need to block until resolved."
- **`prefers-color-scheme` and live changes.** The `change` event "fires when the status of media query support changes" (MDN `MediaQueryList`). CSS media queries and `light-dark()` re-evaluate by themselves. JavaScript only needs a listener if it renders theme-dependent output.
- **Cross-tab primitives.** `storage` "fires when another document that shares the same storage area … updates that storage area. The event is _not_ fired on the window that made the change" (MDN). For cookies, "A `change` event is fired at a `CookieStore` object when a change is made to any cookie" (MDN), with BCD support `chrome 87, firefox 140, safari 18.4`. `BroadcastChannel` "allows communication between different documents (in different windows, tabs, frames or iframes) of the same origin" (MDN).
- **`forced-colors`.** In forced colors mode, "the browser provides the color palette to authors through the CSS system color keywords and, if appropriate, triggers the appropriate value of `prefers-color-scheme`" (MDN). The spec goes further: "if the UA determines, based on Lab lightness, that the Canvas color is clearly either dark (L < 33%) or light (L > 67%), then it must match the appropriate value of the prefers-color-scheme media query". It also says: "Additionally: … `color-scheme` computes to `light dark`" (CSS Color Adjust 1 §3.1). So an author `color-scheme: dark` override is neutralised and `light-dark()` follows the forced palette. That last step is an inference from these two quotes.
- **Newer proposal: script control of preferences.** Media Queries 5 (WD 19 October 2026), §13: "It is common for website authors to want to respect the user's system preferences while also allowing those preferences to be overridden. To help with this, this specification defines a way for authors to override the § 12 User Preference Media Features using the PreferenceManager interface." The IDL has `readonly attribute PreferenceObject colorScheme;` and `Promise<undefined> requestOverride(DOMString? value);`. The WICG explainer it replaced said: "It is intended for this override to apply permanently and be scoped per origin", and its status is "Retired moved to https://drafts.csswg.org/mediaqueries-5/". BCD for `api.Navigator.preferences` is Chrome `"version_added": "120"` behind `#enable-experimental-web-platform-features`, with Firefox and Safari `false`. It is not usable yet.
- **UA auto-darkening.** CSS Color Adjust 1 §2.5: "For pages that already support dark color schemes, and have indicated so using the color-scheme property or color-scheme meta name, this has no effect other than reporting a dark value for the prefers-color-scheme media query".

### 5. Comparison

| Option                                                                | No flash                                                                                                                    | SSR of theme-dependent markup                                           | OS change while open                                                                       | Cross-tab                                                         | `forced-colors`                                                                                                                     |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **next-themes 0.4.6**                                                 | Yes, inline script before content (README), but "In Next.js dev mode, the page may still flash"                             | No: "`theme` on the server … will always be `undefined` until mounted"  | Yes, after hydration (`media.addListener`)                                                 | Yes (`storage` event)                                             | Not handled; relies on the platform. `el.style.colorScheme` is neutralised by "`color-scheme` computes to `light dark`" (inference) |
| **Inline script + localStorage (Next.js guide)**                      | Yes: "applied before any content is painted"                                                                                | No; page stays static                                                   | Only if "system" leaves CSS in `light dark` (inference), otherwise the app adds a listener | Only if the app adds a `storage` listener                         | Same platform behaviour                                                                                                             |
| **Inline script + cookie (Next.js guide)**                            | Yes                                                                                                                         | Page stays static; the server _could_ read the cookie on dynamic routes | Same as above                                                                              | Only if the app adds `CookieStore` `change` or `BroadcastChannel` | Same                                                                                                                                |
| **`cookies()` in the root layout**                                    | Yes for an explicit light or dark choice. "System" still needs a script (next-themes #17), or the CSS `light dark` fallback | Yes                                                                     | CSS only                                                                                   | No (needs a listener)                                             | Same                                                                                                                                |
| **CSS only (`color-scheme: light dark` + `light-dark()`), no choice** | Yes, with the meta tag painting the canvas early (HTML standard)                                                            | Nothing to render                                                       | Yes, natively                                                                              | Not applicable                                                    | Yes, natively                                                                                                                       |
| **Primer-style `data-color-mode="auto"`**                             | Yes for `auto` (CSS media query); explicit modes need a server-known value                                                  | Yes, when the server knows the mode                                     | Yes via CSS for `auto`                                                                     | Not provided                                                      | Prefers-color-scheme follows the forced palette (spec)                                                                              |

## What this means for our Next.js apps

These follow from the quotes above. They are proposals, not decisions.

### 6. Design-system boundary

- **The tokens already cover "system".** With `:root { color-scheme: light dark }`, `[data-theme="light"] { color-scheme: light }` and `[data-theme="dark"] { color-scheme: dark }`, "system" is simply the absence of `data-theme`. CSS then tracks the OS live and in forced colors mode with no JavaScript. This is an inference from the MDN `light-dark()` and spec quotes.
- **What we must not do.** Never set `data-theme` to the _resolved_ OS value for "system". That freezes the theme until a listener runs, which is next-themes' model. Our model keeps the browser in charge.

### 7. Recommendation for future apps

- **Write the module in each app instead of using next-themes.** The reasons are the stale release (2025-03-11), the open dev error on Next 16.2+ (#385, #397) with its fix unmerged (#386), the open `cacheComponents` bug (#375), and the fact that our CSS already handles "system". The work is the Next.js guide's own pattern. If an app adopts shadcn/ui blocks that call `useTheme` from next-themes, next-themes 0.4.6 is the fallback, with `attribute="data-theme"`, and the dev-only console error is accepted.
- **Storage: one cookie read by the inline script.** Use `theme=light|dark`, delete it for "system", and set `path=/; max-age=31536000; SameSite=Lax`. A cookie keeps static prerendering (Next.js guide). It also leaves the option to read it with `cookies()` on routes that are already dynamic. The cookie is set by client JS, not `httpOnly`, so the script can read it.
- **Root layout (a Server Component).**
  - `<html lang=… suppressHydrationWarning>` with no default `data-theme`.
  - A `<head>` `<script>` that sets `data-theme` only when the cookie is `light` or `dark`.
  - `export const viewport = { colorScheme: 'light dark' }`, so `<meta name="color-scheme" content="light dark">` paints the canvas before CSS.
  - Put the script directly in the root layout, as the guide does. If a root dynamic segment (for example `app/[lang]/layout.tsx`) can remount, use the guide's `text/plain`-on-client `InlineScript` helper to avoid the dev error. That remount case is an inference from #397.
- **Toggle (a client component).**
  - Use `useSyncExternalStore`, with `getServerSnapshot` returning `'system'`. React uses it "during hydration of server-rendered content on the client", so the toggle hydrates without a mismatch and then shows the stored value. This replaces next-themes' `mounted` pattern and the lint conflict in #374. It is an inference that needs a test.
  - On change: set or remove the attribute, write or delete the cookie, and post on a `BroadcastChannel("theme")` so other tabs update. `BroadcastChannel` is chosen over `CookieStore` `change` because whether that event reaches other tabs is not stated in the MDN text quoted above.
  - Re-apply the attribute in `useLayoutEffect` for the Strict Mode dev remount, as the guide shows.
- **CSP.** If an app adopts a nonce-based CSP, it must render dynamically ("you **must use dynamic rendering to add nonces**"). A hash-based CSP for the fixed inline script would keep pages static. Hashes for inline scripts are not covered in the sources above, so this needs its own check.
- **Do not wait for `navigator.preferences`.** It is Chrome-only behind a flag. Revisit it when BCD shows it in two engines. It would let the "override" also flip `prefers-color-scheme` for iframes and UA UI.

## Open questions

1. **Vercel's theme script.** The script on vercel.com and nextjs.org contains `provider-mounted`, which is not in published next-themes. Whether it is an unreleased next-themes version or an internal fork was not found.
2. **The script error in a Server Component root layout.** Does the React dev error fire for a `<script>` in a Server Component root layout `<head>` on a client remount? The React source shows it fires on client element creation. Not tested.
3. **`CookieStore` `change` across tabs.** MDN says the event fires "when a change is made to any cookie". Whether other same-origin tabs receive it is not stated in the quoted text.
4. **How github.com renders signed-in themes.** It server-renders `data-color-mode` for signed-out users. The mechanism for signed-in users (account setting or cookie) was not verified.
5. **`useSyncExternalStore` toggle.** That the hydration path avoids any mismatch warning when the snapshot differs from `getServerSnapshot` is an inference from the React docs. It needs a test.
6. **CSP hashes for the inline script.** Whether hashes work alongside static prerendering in Next 16 was not covered.
