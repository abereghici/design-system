# Feedback events and i18n/RTL: public-API patterns for packages/ui

Researched 2026-10-23. Every claim below carries a verbatim quote from official docs, library source on GitHub, MDN, the HTML spec, react.dev or Baseline data (web-features / webstatus.dev). Where something was not found, it says so. Statements marked "inference" are our reading, not a quote.

Sources:

### Feedback events (Q-A)

- **Base UI**: `https://base-ui.com/react/components/dialog`, `https://base-ui.com/react/components/switch`, `https://base-ui.com/react/handbook/customization`, `https://base-ui.com/react/handbook/typescript`, and source `https://github.com/mui/base-ui/blob/master/packages/react/src/internals/createBaseUIEventDetails.ts`.
- **Radix**: `https://www.radix-ui.com/primitives/docs/components/dialog`, and source `https://github.com/radix-ui/primitives/blob/main/packages/react/dialog/src/dialog.tsx`, `.../dismissable-layer/src/dismissable-layer.tsx` and `.../toggle/src/toggle.tsx`.
- **React Aria / React Spectrum**: `https://react-aria.adobe.com/Modal`, `https://react-aria.adobe.com/frameworks`, `https://react-spectrum.adobe.com/v3/routing.html`, and source `https://github.com/adobe/react-spectrum/blob/main/packages/@react-types/shared/src/events.d.ts`.
- **Ark UI / Zag**: `https://ark-ui.com/docs/components/dialog`, and source `https://github.com/chakra-ui/zag/blob/main/packages/machines/dialog/src/dialog.types.ts`.
- **MUI**: `https://mui.com/material-ui/api/dialog/` and `https://mui.com/material-ui/api/snackbar/`.
- **Mantine**: `https://mantine.dev/core/modal/`, and source `https://github.com/mantinedev/mantine/blob/master/packages/@mantine/core/src/components/ModalBase/ModalBase.tsx`.
- **Shoelace**: `https://shoelace.style/components/dialog`, `https://shoelace.style/getting-started/usage`, and source `https://github.com/shoelace-style/shoelace/blob/next/src/internal/shoelace-element.ts`, `.../src/events/sl-show.ts` and `.../src/events/sl-request-close.ts`.
- **Web Awesome**: `https://webawesome.com/docs/components/dialog`, and source `https://github.com/shoelace-style/webawesome/blob/next/packages/webawesome/src/events/show.ts` and `.../hide.ts`.
- **Material Web**: source `https://github.com/material-components/material-web/blob/main/dialog/internal/dialog.ts` and `.../switch/internal/switch.ts`.
- **Spectrum Web Components**: source `https://github.com/adobe/spectrum-web-components/blob/main/1st-gen/packages/overlay/src/events.ts`, `.../Overlay.ts` and `.../overlay-types.ts`.
- **Platform and React**: MDN `https://developer.mozilla.org/en-US/docs/Web/API/Event/Event`, `.../API/CustomEvent/CustomEvent`, `.../API/EventTarget/dispatchEvent` and `.../Web/Security/User_activation`; React `https://react.dev/reference/react-dom/components#custom-html-elements` and `https://react.dev/reference/rsc/use-client`.

### i18n and RTL (Q-B)

- **Radix**: docs `https://www.radix-ui.com/primitives/docs/utilities/direction-provider`, `…/components/tabs`, `…/components/slider`, `…/overview/accessibility`; source `https://github.com/radix-ui/primitives/blob/main/packages/react/direction/src/direction.tsx`, `…/packages/react/roving-focus/src/roving-focus-group.tsx`, `…/packages/react/slider/src/slider.tsx`.
- **Base UI**: docs `https://base-ui.com/react/utils/direction-provider` (source `https://github.com/mui/base-ui/blob/master/docs/src/app/(docs)/react/utils/direction-provider/page.mdx`); source `…/packages/react/src/direction-provider/DirectionProvider.tsx`, `…/packages/react/src/internals/direction-context/DirectionContext.tsx`, `…/packages/react/src/internals/composite/root/useCompositeRoot.ts`.
- **React Aria**: docs `https://react-aria.adobe.com/quality`, `https://react-aria.adobe.com/frameworks`, `https://react-aria.adobe.com/I18nProvider`, `https://react-aria.adobe.com/useLocale`, `…/useDateFormatter`, `…/useNumberFormatter`, `…/useCollator` (doc sources under `https://github.com/adobe/react-spectrum/tree/main/packages/dev/s2-docs/pages/react-aria`); source under `https://github.com/adobe/react-spectrum/tree/main/packages/react-aria/src/i18n` (`I18nProvider.tsx`, `useDefaultLocale.ts`, `utils.ts`, `server.tsx`, `useLocalizedStringFormatter.ts`), `…/src/tabs/TabsKeyboardDelegate.ts`, `…/src/slider/useSliderThumb.ts`, `…/src/menu/useSubmenuTrigger.ts`.
- **Ark UI / Zag**: docs `https://ark-ui.com/docs/utilities/locale`; source `https://github.com/chakra-ui/ark/tree/main/packages/react/src/providers/locale`, `https://github.com/chakra-ui/zag/blob/main/packages/machines/pagination/src/pagination.types.ts`.
- **Mantine**: docs `https://mantine.dev/styles/rtl/`; source `https://github.com/mantinedev/mantine/blob/master/packages/@mantine/core/src/core/DirectionProvider/DirectionProvider.tsx`.
- **MUI**: docs `https://mui.com/material-ui/customization/right-to-left/` (source `https://github.com/mui/material-ui/blob/master/docs/data/material/customization/right-to-left/right-to-left.md`), `https://mui.com/material-ui/guides/localization/`; MUI X localization docs under `https://github.com/mui/mui-x/tree/master/docs/data` (data-grid, date-pickers, charts).
- **WAI-ARIA APG**: `https://www.w3.org/WAI/ARIA/apg/patterns/slider/`, `…/patterns/tabs/`, `…/patterns/menubar/`, `…/patterns/radio/`, `…/practices/keyboard-interface/`.
- **Platform**: MDN `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:dir`, `…/Web/HTML/Reference/Global_attributes/dir`, `…/Web/HTML/Reference/Global_attributes/lang`, `…/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo`, `…/Web/JavaScript/Reference/Global_Objects/Intl`, `…/Web/CSS/Guides/Logical_properties_and_values`; HTML spec `https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute`; MDN browser-compat-data `https://github.com/mdn/browser-compat-data`; web-features `https://github.com/web-platform-dx/web-features/blob/main/features/intl-locale-info.yml`; Baseline status from `https://api.webstatus.dev/v1/features/<id>` (`dir-pseudo`, `dir`, `intl-locale-info`, `logical-properties`).
- **React**: `https://react.dev/reference/rsc/server-components`, `https://react.dev/reference/rsc/use-client`.

## Question

We are building an internal React 19 design system. It is RSC-safe, built on native web platform features, and uses no headless library. The reference libraries are Radix/shadcn, React Aria, Base UI, Ark UI/Chakra, MUI and Mantine, plus Material Web, Shoelace/Web Awesome and Spectrum Web Components for DOM events. We need answers to two questions:

1. **Q-A, feedback events.** Apps want to play sounds or haptics when the user toggles, confirms or dismisses something, or when something appears. The design system must not play sounds itself. Is there a documented, type-safe pattern for this? We compare three candidates: (1) bubbling DOM `CustomEvent`s, (2) callbacks with a details object that carries a `reason`, and (3) a provider-level hook. For each one we check how it is typed and whether it works across an RSC boundary.
2. **Q-B, i18n and RTL.** How do these libraries handle direction, locale, built-in strings, `Intl` formatting, arrow keys that flip in RTL, and CSS logical properties and `:dir()`? What does the platform now give us natively, and how do the libraries stay RSC-friendly?

## Short answer

### Feedback events (Q-A)

- **No library documents a feedback (sound or haptics) API.** None of the reference libraries ships a provider or hook for "something was toggled, confirmed, dismissed or appeared". A code search for `haptic` and `vibrate` returned 0 hits in mui/base-ui, radix-ui/primitives, adobe/react-spectrum, mantinedev/mantine and chakra-ui/ark. The other repos were not checked because the API rate-limited the search.
- **Bubbling DOM events are the web-component norm.** Shoelace and Web Awesome dispatch prefixed (`sl-*`, `wa-*`) events with `bubbles: true, composed: true`. They type them by augmenting `GlobalEventHandlersEventMap`. Spectrum Web Components uses the same augmentation for `sp-opened`/`sp-closed`. Material Web fires plain, non-bubbling `open`/`close`/`cancel` events.
- **React libraries use callbacks. Only some carry a reason.**
  - Base UI passes a typed `eventDetails` with `reason`, the native `event`, `trigger`, `cancel()` and `allowPropagation()`.
  - MUI passes a `reason` string (`"escapeKeyDown"`, `"backdropClick"`, `"clickaway"`, `"timeout"`).
  - Shoelace's `sl-request-close` and Web Awesome's `wa-hide` carry a `detail.source`.
  - Radix, React Aria, Ark UI and Mantine pass only the new state (`open: boolean`, `{ open }`) or nothing (`() => void`).
- **The RSC boundary decides this.** Callback props cannot be passed from a Server Component, because react.dev says functions "that are not exported from client-marked modules or marked with `'use server'`" are not serializable. A bubbling DOM event needs no prop. One client listener near the root can hear events from a subtree that is server-rendered.
- **Recommendation.** Use both channels, built from one source:
  - typed, Base-UI-style `(value, details)` callbacks for local control;
  - and one bubbling, prefixed, `GlobalEventHandlersEventMap`-typed `CustomEvent` per feedback moment, which an app-level client listener maps to sounds or haptics.

### i18n and RTL (Q-B)

- **Direction is a React context in every library checked, and none of them except Mantine reads the DOM.** Radix and Base UI default to `'ltr'` when no provider is present. Both say, or show in code, that the app must set `dir` on `<html>` itself. React Aria and Ark UI derive direction from the locale. Mantine is the exception: it reads and observes `document.documentElement`'s `dir`.
- **Locale is a separate context.** React Aria (`I18nProvider`/`useLocale`) and Ark UI (`LocaleProvider`/`useLocaleContext`) return `{locale, direction}`. React Aria falls back to `navigator.language`, but returns `en-US`/`ltr` during SSR. Radix, Base UI and Mantine core have no locale provider (none found).
- **Built-in strings use three patterns.** MUI uses theme locale objects plus a `localeText` prop in MUI X. Zag/Ark use a per-component `translations` prop. React Aria ships its own ICU dictionaries for "30+ languages" and offers a server-injected script for SSR. No global "override any string" provider was found in React Aria.
- **Formatting wraps `Intl.*`.** React Aria's `useDateFormatter`/`useNumberFormatter`/`useCollator` "wrap a builtin browser" `Intl` object, keyed on the context locale.
- **Arrow keys flip in RTL.** Radix, Base UI and React Aria all swap ArrowLeft/ArrowRight in RTL for tabs, roving focus, sliders and submenus. The APG pages checked do not mention RTL at all.
- **The platform covers most of this now.** `:dir()` is Baseline Widely available (since 2026-06-07). Logical properties are Widely available. `Intl.Locale.prototype.getTextInfo()` is Baseline Newly available (2026-07-21, Firefox 153). `dir` inherits through the DOM, `dir="auto"` handles unknown text, and `lang` declares the language "but does not imply the base direction".
- **The RSC-friendly pattern is to put `lang`/`dir` on `<html>` from the server and keep providers client-only.** React Aria's documented Next.js setup does this. Server Components "cannot create context". So any context-based direction or locale needs a `'use client'` provider. Reading `dir`/`lang` from the DOM or CSS needs no provider.

## Findings: feedback events (Q-A)

### 1. DOM CustomEvents dispatched from components

- **Shoelace emits bubbling, composed events.** `shoelace-element.ts` `emit()`: "`new CustomEvent(name, { bubbles: true, cancelable: false, composed: true, detail: {}, ...options })`".
- **Shoelace explains the prefix.** `shoelace.style/getting-started/usage`: "All custom events are prefixed with `sl-` to prevent collisions with standard events and other libraries." It also says to listen for "`sl-change` instead of `click`".
- **Shoelace types each event with a global event map.** `src/events/sl-show.ts`: "`export type SlShowEvent = CustomEvent<Record<PropertyKey, never>>;` … `declare global { interface GlobalEventHandlersEventMap { 'sl-show': SlShowEvent; } }`".
- **Shoelace events can carry a typed cause.** `sl-request-close.ts`: "`CustomEvent<{ source: 'close-button' | 'keyboard' | 'overlay' }>`". The docs say: "Emitted when the user attempts to close the dialog by clicking the close button, clicking the overlay, or pressing escape. Calling `event.preventDefault()` will keep the dialog open."
- **Shoelace pairs "before" and "after" events.** `shoelace.style/components/dialog`: `sl-show` is "Emitted when the dialog opens.", and `sl-after-show` is "Emitted after the dialog opens and all animations are complete."
- **Web Awesome uses event classes.** `webawesome/src/events/show.ts`: "`export class WaShowEvent extends Event { constructor() { super('wa-show', { bubbles: true, cancelable: true, composed: true }); } }`". The same `declare global { interface GlobalEventHandlersEventMap { 'wa-show': WaShowEvent; } }` follows.
- **Web Awesome's hide event carries a source.** `hide.ts`: "`interface WaHideEventDetails { source: Element; }`". The docs: "You can inspect `event.detail.source` to see which element caused the dialog to close." Also: "If the source is the dialog element itself, the user has pressed `Escape` or the dialog has been closed programmatically." No `reason` field is defined.
- **Spectrum Web Components uses the same typing.** `overlay-types.ts`: "`interface GlobalEventHandlersEventMap { 'sp-opened': CustomEvent<OverlayOpenCloseDetail>; 'sp-closed': CustomEvent<OverlayOpenCloseDetail>; }`". `Overlay.ts`: "@fires sp-opened - announces that an overlay has completed any entry animations".
- **Spectrum Web Components makes bubbling opt-in and has a reason field.** `events.ts` `OverlayStateEvent`: "`detail!: { interaction: string; reason?: 'external-click'; }`" with "`super(type, { bubbles: publish, composed: publish })`".
- **Material Web uses unprefixed events that don't bubble.** `dialog.ts`: "`@fires open {Event} Dispatched when the dialog is opening before any animations.`" and "`new Event('close', {cancelable: true})`". `cancel` is "Dispatched when the dialog has been canceled by clicking on the scrim or pressing Escape." `switch.ts`: "@fires change {Event} Fired whenever `selected` changes due to user". No event-map augmentation was found in the two files read.
- **Radix uses CustomEvents internally, but they don't bubble.** `dismissable-layer.tsx`: "`new CustomEvent(name, { bubbles: false, cancelable: true, detail })`". It types them as "`type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;`". These are delivered to props, not meant for app-level listening.
- **Platform defaults.** MDN `Event()`: `bubbles` "The default is `false`." `composed`: "whether the event will trigger listeners outside of a shadow root … The default is `false`." `CustomEvent` `detail`: "It defaults to `null`."
- **Dispatch is synchronous.** MDN `dispatchEvent`: "`dispatchEvent()` invokes all applicable event handlers synchronously before returning." So a listener runs inside the same user gesture.
- **User activation rules affect feedback.** MDN User activation lists `Navigator.vibrate()` and "Autoplay of Media and Web Audio APIs (in particular for `AudioContexts`)" under sticky activation. Sticky activation "is not reset after it has been set initially". This matters for "something appears" events that are not themselves user-initiated.
- **React 19 can listen to custom events on custom elements.** react.dev: "You can listen for these events using an `on` prefix when binding to the event via JSX", for example `onspeak`. Also: "Events are case-sensitive and support dashes (`-`)", for example `onsay-hi`. That page documents this for custom elements only. Not found: any react.dev statement that `on<custom>` props work on built-in elements such as `<div>`, so app listeners for our events should use `addEventListener`.

### 2. Callbacks with a reason or details object

- **Base UI: a second `eventDetails` argument.** `base-ui.com/react/handbook/customization`: "The `eventDetails` property is passed as a second argument to Base UI event handlers." It says "`reason` is used to determine why the change event occurred" and "`cancel` stops the component from changing its internal state". It also says "`allowPropagation` allows the DOM event to propagate in cases where Base UI stops the propagation."
- **Base UI Dialog signature.** `base-ui.com/react/components/dialog`: "`(open: boolean, eventDetails: Dialog.Root.ChangeEventDetails) => void`". The reasons are `'trigger-press'`, `'outside-press'`, `'escape-key'`, `'close-press'`, `'focus-out'`, `'imperative-action'` and `'none'`. It also has `onOpenChangeComplete`: "Event handler called after any animations complete when the dialog is opened or closed."
- **Base UI Switch.** `base-ui.com/react/components/switch`: "`(checked: boolean, eventDetails: Switch.Root.ChangeEventDetails) => void`", with "`type SwitchRootChangeEventReason = 'none'`".
- **Base UI types the native event by reason.** `createBaseUIEventDetails.ts`: "Maps a change `reason` string to the corresponding native event type". For example, "`[REASONS.escapeKey]: KeyboardEvent;`" and "`[REASONS.outsidePress]: MouseEvent | PointerEvent | TouchEvent;`". The details also carry "`trigger: Element | undefined;`" and "`isCanceled: boolean;`".
- **Base UI exports the types per part.** `base-ui.com/react/handbook/typescript`: "`ChangeEventDetails` (such as `Combobox.Root.ChangeEventDetails`) is the object passed to change handlers". Also: "`ChangeEventReason` … is the union of possible reason strings for a change event."
- **Radix: state only. Cause comes from separate props.** `dialog.tsx`: "`onOpenChange?: { bivarianceHack(open: boolean): void }['bivarianceHack']`". `toggle.tsx`: "`onPressedChange?: { bivarianceHack(pressed: boolean): void }`". Cause-specific hooks live on Content: "`onEscapeKeyDown?: { bivarianceHack(event: KeyboardEvent): void }`", plus `onPointerDownOutside`, `onFocusOutside` and `onInteractOutside` (`dismissable-layer.tsx`). The docs table lists them only as type "function".
- **React Aria: state only on overlays.** `react-aria.adobe.com/Modal`: `onOpenChange` is "`((isOpen: boolean) => void) | undefined`" — "Handler that is called when the overlay's open state changes." No reason parameter was found.
- **React Aria press events carry the input modality.** `events.d.ts`: "`pointerType: PointerType;`" where "`PointerType = 'mouse' | 'pen' | 'touch' | 'keyboard' | 'virtual'`". It also has "`type: 'pressstart' | 'pressend' | 'pressup' | 'press';`" and "By default, press events stop propagation to parent elements". That last point means a page-level DOM listener would not see them unless `continuePropagation()` is called.
- **Ark UI / Zag: a details object without a reason.** `ark-ui.com/docs/components/dialog`: "`onOpenChange`: `(details: OpenChangeDetails) => void`". Zag `dialog.types.ts`: "`export interface OpenChangeDetails { open: boolean }`".
- **MUI: a positional reason string.** Dialog: "`function(event: object, reason: string) => void`", where "`reason` Can be: `"escapeKeyDown"`, `"backdropClick"`." Snackbar: "Can be: `"timeout"` (`autoHideDuration` expired), `"clickaway"`, or `"escapeKeyDown"`." The type is `string`, not a literal union, in the API docs.
- **Mantine: no arguments.** `ModalBase.tsx`: "`/** Called when modal/drawer is closed */ onClose: () => void;`". Not found: any reason argument.

### 3. Provider-level hook

- **No feedback provider was found in any of the libraries.** Not found in docs or source. A code search for `haptic` and `vibrate` returned 0 results in five of the repos (see the short answer).
- **The closest precedent is React Aria / Spectrum routing.** `react-aria.adobe.com/frameworks`: "render a `RouterProvider` to configure React Aria links to use React Router." React Spectrum's `Provider` takes "a `navigate` function received from your router for performing a client side navigation" (`react-spectrum.adobe.com/v3/routing.html`). Its options are typed by module augmentation: "`declare module '@adobe/react-spectrum' {`" with a `routerOptions` property.
- **That provider has to be a client component.** `v3/routing.html`: "`Provider` should be rendered from a client component at the root of each page or layout", and its App Router example starts with `'use client';`.

### 4. React Server Components boundary

- **Functions can't cross as props.** `react.dev/reference/rsc/use-client`: "Prop values passed from a Server Component to Client Component must be serializable." It lists these as not supported: "Functions that are not exported from client-marked modules or marked with `'use server'`".
- **So callbacks need a client parent.** Any `onOpenChange`/`onCheckedChange` callback (Base UI, Radix, React Aria, MUI) can only be wired from a client component. A server page that renders `<Switch>` cannot attach feedback through props.
- **A client wrapper can hold server children.** react.dev: "Client Components can render Server Components because you can pass JSX as props." Also: "`'use client'` defines the boundary between server and client code on the _module dependency tree_, not the render tree."
- **Bubbling events need no prop.** A bubbling `CustomEvent` reaches an ancestor listener with no prop at all. So one client `<FeedbackListener>` (or a provider) that wraps server-rendered children can hear every component's events. This follows from MDN `bubbles` and the react.dev quote above; no library documents this exact pattern.
- **A provider still works, but only for client consumers.** A context-based feedback provider would also have to be a client component (see the React Spectrum quote). Components would read it with `useContext`, so it works only inside components that are client components anyway. Our interactive components are.

## Findings: i18n and RTL (Q-B)

### 1. Direction

- **Radix: context only, LTR default.** The docs say the provider "Wraps your app to provide global reading direction" and "Enables all primitives to inherit global reading direction." The source has `const DirectionContext = React.createContext<Direction | undefined>(undefined);` and `return localDir || globalDir || Direction.LTR;`. Nothing reads the DOM `dir`. The docs do not say whether the provider sets `<html dir>`, and the source shows it renders only a context provider.
- **Base UI: context only, the app sets `dir`.** The docs say: "`<DirectionProvider>` enables child Base UI components to adjust behavior based on RTL text direction, but does not affect HTML and CSS. The `dir="rtl"` HTML attribute or `direction: rtl` CSS style must be set additionally by your own application code." The source has `return context?.direction ?? 'ltr';` and the provider prop is `direction?: TextDirection` with `@default 'ltr'`.
- **Base UI: portals.** About `useDirection`, the docs say: "This is useful for wrapping portaled components that may be rendered outside your application root and are unaffected by the `dir` attribute set within."
- **Mantine: reads and syncs the DOM.** The docs say: "It is required to set the `dir` attribute on the root element of your application, usually the `html` element." The prop doc in the source reads: "Determines whether direction should be updated on mount based on `dir` attribute set on root element (usually html element) @default true". The source reads `document.documentElement.getAttribute('dir')` on mount, watches it with a `MutationObserver` (`attributeFilter: ['dir']`), and `setDirection` writes `document.documentElement.setAttribute('dir', direction)`.
- **MUI: three steps.** The docs say: "Add `dir="rtl"` to the app's root `<html>` to set the global text direction". They also say "Use the `createTheme()` API to set the theme direction to `'rtl'`" and "Install the `@mui/stylis-plugin-rtl`". There is a portal warning too: "Components that use React portals (like the Dialog) do _not_ inherit the `dir` attribute from parents, because they actually render outside of their parental DOM trees."
- **React Aria: direction comes from the locale.** In `I18nProvider.tsx`, the provider computes `direction: isRTL(locale) ? 'rtl' : 'ltr'`. `isRTL` in `utils.ts` uses `typeof locale.getTextInfo === 'function' ? locale.getTextInfo() : locale.textInfo`. If neither exists, it guesses from the script, then from a list of RTL languages.
- **Ark UI: direction comes from the locale.** The source has `dir: isRTL(locale) ? 'rtl' : 'ltr'`. The docs say: "If no `LocaleProvider` is setup, the default locale for the app will be `en-US` and therefore the direction will be `ltr`."

### 2. Locale and providers

- **React Aria: default detection.** The docs say: "React Aria automatically detects the user's current language by default." In the source, `getDefaultLocale` reads `window[Symbol.for('react-aria.i18n.locale')]`, then `navigator.language`, then `'en-US'`. It also listens for `languagechange`.
- **React Aria: SSR fallback.** A comment in `useDefaultLocale.ts` reads: "We cannot determine the browser's language on the server, so default to en-US. This will be updated after hydration on the client to the correct value."
- **React Aria: override.** The docs say: "`I18nProvider` allows you to override the default locale as determined by the browser/system setting with a locale defined by your application". And: "`useLocale` should be used in the root of your app to define the lang and dir attributes so that the browser knows which language and direction the user interface should be rendered in."
- **React Aria: the types.** `export interface Locale { locale: string; direction: Direction; }`. The JSDoc reads: "Returns the current locale and layout direction."
- **Ark UI.** The docs say: "The `LocaleProvider` component sets the locale for your app, formatting dates, numbers, and other locale-specific data." And: "To access the current locale and direction settings, use the `useLocaleContext` hook." Both source files start with `'use client'`.
- **Radix, Base UI and Mantine core.** No locale provider was found in the pages or source read. Only direction providers were found.
- **MUI.** Locale is set through the theme. The docs say: "Use the theme to configure the locale text globally". And: "The default locale of Material UI is English (United States)."

### 3. Built-in strings

- **MUI core: theme locale objects.** You pass a locale object such as `zhCN` from `@mui/material/locale` to `createTheme`. To customise, the docs say: "To create your own translation, or to customize the English text, copy this file to your project".
- **MUI X: a `localeText` prop.** The Data Grid docs say: "You can use the `localeText` prop to pass in your own text and translations." The Charts docs say: "This applies `localeText` to all charts inside the provider." For Date Pickers the example is `localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}`.
- **Zag/Ark: a typed per-component `translations` prop.** In `pagination.types.ts`: "Specifies the localized strings that identifies the accessibility elements and their states", followed by `translations?: IntlTranslations | undefined`. The keys are typed, for example `prevTriggerLabel?: string` and `itemLabel?: ((details: ItemLabelDetails) => string)`. So pluralised and parameterised labels are functions.
- **React Aria: shipped ICU dictionaries.** The docs say: "React Aria includes localized strings for 30+ languages". The `useLocalizedStringFormatter` JSDoc reads: "Supports interpolating variables, selecting the correct pluralization, and formatting numbers. Automatically updates when the locale changes."
- **React Aria: SSR strings.** In `server.tsx`: "A PackageLocalizationProvider can be rendered on the server to inject the localized strings needed by the client into the initial HTML." It writes `window[Symbol.for('react-aria.i18n.strings')]`. The frameworks page adds: "This will omit the localized strings from the JavaScript bundle. The strings for the user's language are injected into the HTML instead."
- **React Aria: overriding a shipped string.** No public global override API was found in the pages and source read.
- **Radix: labels are the app's job.** The accessibility page says: "Ultimately it's up to you to provide those labels so that users have the proper context when navigating your application."
- **Base UI and Mantine.** Not checked in detail; no strings API was found in the pages read.

### 4. Formatting

- **React Aria hooks wrap `Intl`.** The `useDateFormatter` docs say it "wraps a builtin browser Intl.DateTimeFormat object to provide a React Hook that integrates with the i18n system in React Aria. It handles formatting dates for the current locale, updating when the locale changes, and caching of date formatters for performance." `useNumberFormatter` (`Intl.NumberFormat`) and `useCollator` (`Intl.Collator`) use the same wording.
- **React Aria calendars.** The docs say it "handles dates and numbers in many calendar and numbering systems".
- **Ark UI.** The provider folder contains `use-date-formatter.ts`, `use-collator.ts` and `use-filter.ts` (repo tree listing). Their docs were not read.
- **Platform: the default locale differs between server and client.** MDN on the `locales` argument: "`undefined` (or omitted): The implementation's default locale will be used." On a server that is the server's locale, so formatting without an explicit locale can differ from the client (inference). MDN also suggests: "you can use the user's preferred language provided by navigator.language".

### 5. Keyboard in RTL

- **Radix roving focus (tabs, toolbars, radio groups).** `getDirectionAwareKey` reads: `if (dir !== Direction.RTL) return key; return key === 'ArrowLeft' ? 'ArrowRight' : key === 'ArrowRight' ? 'ArrowLeft' : key;`.
- **Radix slider.** `const isSlidingFromLeft = (isDirectionLTR && !inverted) || (!isDirectionLTR && inverted);`. The docs only say "Supports Right to Left direction." The `dir` prop has no description in the Tabs or Slider docs, and the keyboard rows only say "depending on `orientation`".
- **Base UI composite (tabs, menus, toolbars).** `useCompositeRoot.ts`: `const horizontalForwardKey = isRtl ? ARROW_LEFT : ARROW_RIGHT;`.
- **React Aria tabs.** From `TabsKeyboardDelegate.ts`: "getKeyLeftOf/getKeyRightOf follow the locale's text direction regardless of orientation, so ArrowLeft always moves to the next tab in RTL. getKeyAbove/getKeyBelow are never flipped."
- **React Aria slider and submenus.** The slider has `let reverseX = direction === 'rtl';`. `useSubmenuTrigger.ts` branches on `direction === 'ltr'` / `direction === 'rtl'` for its open and close keys. The docs say React Aria "supports right-to-left interactions (e.g. keyboard navigation)."
- **WAI-ARIA APG says nothing about RTL.** The slider, tabs, menubar, radio and keyboard-interface pages contain no "right-to-left" or "RTL" text (checked by grep). The slider page only says: "reversing the direction of the value change for the keys specified above, e.g., having Up Arrow decrease the value, could create a more intuitive experience." The keyboard-interface page says: "In left to right languages, for example, create a tab sequence that moves focus left to right and then top to bottom."

### 6. CSS logical properties and `:dir()`

- **Logical properties.** MDN: "Logical properties define direction‐relative equivalents to their corresponding physical properties." React Aria's quality page links to them for margins, padding and borders: "Make sure your design supports right-to-left layout". Baseline: `logical-properties` is "widely" (low 2021-09-20, high 2024-03-20).
- **MUI and Mantine flip CSS with tooling.** MUI uses `@mui/stylis-plugin-rtl`. Mantine says: "then you can use the `rtl` mixin in `.css` files". The MUI and Mantine RTL pages do not mention logical properties.
- **`:dir()` matches inherited direction.** MDN: "`:dir()` will match the value calculated by the user agent, even if inherited." By contrast, `[dir=…]` selectors "ignore elements that lack it — even if they inherit a direction from their parent. (Similarly, `[dir=rtl]` and `[dir=ltr]` won't match the `auto` value.)"
- **`:dir()` ignores the CSS `direction` property.** MDN: "It doesn't account for _styling_ directionality, i.e., the directionality set by CSS properties such as direction."
- **Baseline.** `dir-pseudo` is "widely" (low 2023-12-07, high 2026-06-07). In BCD: Chrome 120, Firefox 49, Safari 16.4.

### 7. What the platform gives natively

- **`dir` inherits through the DOM.** MDN: "If an element has no `dir` attribute, it generally inherits the direction of its parent element, or the host if the parent node is a ShadowRoot. If no ancestor sets a direction, the default is left-to-right." The HTML spec, Undefined state: "Otherwise Return the parent directionality of element."
- **`dir="auto"`.** MDN says it "lets the user agent determine the base direction from the text, generally using the first character with a strong directionality". And: "The `auto` value should be used for data with an unknown directionality, like data coming from user input or external data." Also: "Omitting `dir` does not enable automatic direction detection."
- **Set `dir` on the root even for one script.** MDN: "it is recommended to explicitly set `dir` on the root element, which is especially important for RTL scripts". The HTML spec: "Authors are strongly encouraged to use the dir attribute to indicate text direction rather than using CSS".
- **`lang`.** MDN: "The attribute contains a single BCP 47 language tag." And: "The `lang` attribute declares the language, but does not imply the base direction" (from the `dir` page).
- **`Intl.Locale.prototype.getTextInfo()`.** MDN: it "returns the ordering of characters indicated by either `ltr` (left-to-right) or by `rtl` (right-to-left) for this locale". Example: `new Intl.Locale("ar").getTextInfo() // { direction: "rtl" }`. Older engines had an accessor: "In some versions of some browsers, this method was implemented as an accessor property called `textInfo`."
- **`getTextInfo()` support.** BCD: Chrome 130 (accessor `textInfo` from 99), Firefox 153, Safari 17 (accessor from 15.4). web-features groups it under "Intl.Locale info", which is "newly" with `baseline_low_date: 2026-07-21`.
- **`dir` attribute Baseline.** "widely" (low 2015-07-29). A separate Baseline id for `dir="auto"` was not found.
- **Native top-layer elements keep their DOM parent (inference).** The portal problems quoted from MUI and Base UI come from rendering "outside of their parental DOM trees". A native `<dialog>` or `[popover]` rendered in place keeps its DOM parent, so by the spec's "parent directionality" rule it inherits `dir`. That conclusion comes from the quoted spec text, not from a source that says it directly.

### 8. RSC

- **Context needs a client module.** react.dev: "Server Components cannot create context, but they can render a context provider imported from a Client Component module." From the `use-client` page: "Server Components cannot use most Hooks."
- **The providers are client modules.** Base UI `DirectionContext.tsx` and `DirectionProvider.tsx` start with `'use client'`. So do Ark UI's `locale-provider.tsx` and `use-locale-context.ts`. The Radix `direction.tsx` file read has no directive at the top of the source; whether its build adds one was not checked.
- **React Aria's documented Next.js app-router setup.** It says to "ensure the locale on the server matches the client". The root layout (a Server Component) sets `<html lang={lang} dir={isRTL(lang) ? 'rtl' : 'ltr'}>` from `Accept-Language`. A `"use client"` `ClientProviders` file wraps `<I18nProvider locale={lang}>`. `isRTL` is imported from `react-aria-components/I18nProvider` and called on the server.
- **Mantine depends on the DOM.** It reads `document` in an effect, so on the server it renders `initialDirection` (default `ltr`) until it mounts. That follows from the source above (inference).
- **Reading direction from the DOM or CSS needs no React context at all.** Logical properties, `:dir()` and inherited `dir`/`lang` all work in server-rendered HTML (inference from the platform quotes above).

## What this means for packages/ui

These follow from the quotes above. They are proposals, not decisions.

### Feedback events

1. **Keep typed callbacks for control.** Follow Base UI's shape: `(value, details)` with `details.reason` as a literal union per component, plus the native `event`, `trigger` and `cancel()`. Export `Component.ChangeEventDetails` and `ChangeEventReason` types. This is the only surveyed design that is both typed and carries a reason.
2. **Add a feedback channel as bubbling DOM events.**
   - Each interactive component dispatches one `CustomEvent` per feedback moment from its root element, with `bubbles: true` (plus `composed: true` in case it is ever inside a shadow root). The moments are toggle, confirm, dismiss and appear.
   - Use a prefixed name such as `ab-toggle`, `ab-confirm`, `ab-dismiss` and `ab-appear`, as `sl-*`/`wa-*`/`sp-*` do, to "prevent collisions with standard events and other libraries".
   - Type `detail` per event, e.g. `{ reason, component, value }`, and declare it through `declare global { interface GlobalEventHandlersEventMap { … } }`, as Shoelace, Web Awesome and Spectrum Web Components do.
   - Make it non-cancelable. Cancelling belongs to the callback channel.
   - Dispatch after the state commits, in the same task as the user gesture. Dispatch is synchronous, so audio and `vibrate()` run under user activation.
3. **Ship a small optional client helper, not a sound engine.** For example, a `'use client'` `<FeedbackListener onFeedback={…}>` or a `useFeedbackListener(ref, handler)` that calls `addEventListener` for the `ab-*` events on a wrapper around server-rendered children. The app owns the sound and haptic mapping and any `prefers-reduced-motion` or user setting.
4. **Don't build the context provider first.** A context-based provider works, but it duplicates the event channel and is a client-only API. Add it only if apps need per-subtree overrides.
5. **Treat "appear" events carefully.** Toasts and popovers that appear without a gesture rely on sticky activation for audio and vibration (MDN). Mark these with `reason: 'programmatic'` so apps can choose to stay silent.

### i18n and RTL

- **The app sets `lang` and `dir` on `<html>` on the server. The design system never sets them.** This matches React Aria's Next.js recipe, MDN ("explicitly set `dir` on the root element"), and the Base UI and MUI instructions. For direction, export a tiny pure helper such as `getDirection(locale)` that uses `new Intl.Locale(locale).maximize().getTextInfo().direction`. It is Baseline Newly available on 2026-07-21, which fits our floor. Fall back to `textInfo` the way React Aria's `isRTL` does. The helper is safe to call in a Server Component.
- **Styling uses CSS only.** Use logical properties everywhere, and `:dir(rtl)` for the rare physical case such as mirrored icons. Do not use `[dir=rtl]`, which misses inherited direction and `auto`. With this, no styling needs a provider or a stylis plugin.
- **Behaviour reads direction from the DOM, with no default provider.** Arrow-key flipping in tabs, sliders, menus and toolbars needs the direction in JS. Read it at event time from the element: `el.matches(':dir(rtl)')`, or `getComputedStyle(el).direction` if CSS overrides must count. Because we use native `popover`/`<dialog>` and not portals, popups inherit `dir` from their DOM parent. That avoids the portal gap that MUI and Base UI document (inference, see section 7). Server Components then need no direction context at all.
- **Optional client `LocaleProvider` only where JS needs the locale.** Formatting and built-in strings need it. Make it a `'use client'` provider that takes `locale` from the server, like React Aria and Ark. When it is absent, components fall back to the nearest `[lang]` in the DOM (`el.closest('[lang]')?.lang`), then `document.documentElement.lang`. Never fall back to `navigator.language` during render, which is the server/client mismatch React Aria's comment describes. Format with `Intl.*` and an explicit locale, cached per locale like React Aria's hooks. A Server Component can format directly by passing the locale.
- **Built-in strings: a typed per-component `labels` (or `translations`) prop, plus provider-level defaults.** The per-component prop follows Zag. Keep keys typed, and make plural or parameterised labels functions (`itemLabel(details)`). Ship English defaults in code. Let the optional `LocaleProvider` accept a typed, partial messages object, like MUI's `localeText` on a provider. Components merge them as prop > provider > default. Keep the default English strings in a plain module so Server Components can pass them as props.
- **Test RTL keyboard behaviour explicitly.** The APG gives no RTL guidance. The libraries agree on the rule: in RTL, ArrowLeft and ArrowRight swap for horizontal movement, and Up and Down never flip (React Aria tabs comment).

## Open questions

### Feedback events

1. **Exact `OverlayOpenCloseDetail` fields in Spectrum Web Components.** Not read; only the event-map lines were quoted.
2. **Material Web event typing.** Not found in the two files read. Whether it augments any event map elsewhere was not checked.
3. **Haptics in other repos.** The `haptic`/`vibrate` searches for chakra-ui/zag, mui/material-ui and shoelace-style/webawesome were rate-limited, so the result there is unknown.
4. **React Aria `PressEvent` and DOM listeners.** A page-level DOM listener for native `click` may still see React Aria presses, since `stopPropagation` there concerns React Aria's own handlers. This was not verified.
5. **Mantine `onClose` reason.** The docs page did not render its props table. Only the `ModalBase` source (`() => void`) was checked.

### i18n and RTL

1. **`dir="auto"` Baseline.** No separate web-features id for the `auto` value was found. Only `dir` as a whole ("widely") was found.
2. **Radix `'use client'`.** Whether the published `@radix-ui/react-direction` build carries a `'use client'` directive was not checked. The source file read has none.
3. **Overriding React Aria's shipped strings.** Not found. Only the dictionary mechanism and server injection were read.
4. **Mantine and Base UI string APIs.** Not found in the pages read.
5. **Performance of `:dir()` in JS keydown handlers.** Reading `matches(':dir(rtl)')` at event time is not benchmarked in any source read. It is assumed to be cheap (inference).
6. **Ark UI formatter hooks.** The files exist, but their docs were not read.
