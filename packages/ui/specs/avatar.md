# Avatar

A person's picture, with their initials or a generic glyph while the picture loads or when there is none. Use it next to a name in lists, comments and account menus. For the brand sign, use the Logo; for a status marker, use a StatusDot beside a text label.

```tsx
import { Avatar } from "@platform/ui/avatar";

{/* Named by the image's alt; initials "AB" show until it loads, or if it fails */}
<Avatar.Root>
  <Avatar.Image src="/u/alexandru.jpg" alt="Alexandru Bereghici" />
  <Avatar.Fallback name="Alexandru Bereghici" />
</Avatar.Root>

{/* Decorative: the name is already written beside it */}
<Avatar.Root size="sm" aria-hidden="true">
  <Avatar.Image src="/u/ana.jpg" alt="" />
  <Avatar.Fallback name="Ana Popescu" />
</Avatar.Root>
Ana Popescu
```

Status: draft for brand-owner review (phase 1). No source guide; drafted from the brand principles and the reference libraries.

## Anatomy

`Avatar.Root` → `Avatar.Image` (optional) → `Avatar.Fallback`.

- **Root.** A `<span>`, a circle (`radius-full`) of 24 (sm) or 32 (md) px, `overflow: clip`. Image and Fallback share one grid cell, the Image on top. Root is not named itself (see Accessibility).
- **Image.** A native `<img>`, `object-fit: cover`. Transparent (`opacity: 0`) until it has loaded, and stays transparent if it fails. It stays in the accessibility tree in every status, so its `alt` always names the avatar.
- **Fallback.** Initials derived from `name` (or the consumer's children) on a `surface-nested` disc in `text-subtle`; with no name, the `user` icon. Visible from the first server-rendered paint until the image has loaded. Always `aria-hidden`: it is the picture's stand-in, not a second name.

## API

`Avatar.Root`

| Prop    | Type                     | Default | Notes                                                                          |
| ------- | ------------------------ | ------- | ------------------------------------------------------------------------------ |
| `size`  | `"sm" \| "md"`           | `"md"`  | 24 / 32 px. Exposed as `data-size`.                                            |
| …native | `ComponentProps<"span">` |         | `ref`, `className`, native attributes (`aria-hidden` for a decorative avatar). |

`Avatar.Image`

| Prop                    | Type                                                 | Default | Notes                                                                                                 |
| ----------------------- | ---------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `src`, `alt`            | native                                               |         | `alt` is required by the type: the person's name, or `""` when the name is written beside the avatar. |
| `onLoadingStatusChange` | `(status: "loading" \| "loaded" \| "error") => void` |         | Called when the status changes.                                                                       |
| …native                 | `ComponentProps<"img">`                              |         | `loading`, `decoding`, `srcSet`, `sizes`, `ref`, `className` pass through.                            |

`Avatar.Fallback`

| Prop       | Type                     | Default | Notes                                                                                 |
| ---------- | ------------------------ | ------- | ------------------------------------------------------------------------------------- |
| `name`     | `string`                 |         | Initials are derived from it. Not an accessible name (the Fallback is `aria-hidden`). |
| `children` | `ReactNode`              |         | Replaces the derived initials (custom initials, an icon).                             |
| …native    | `ComponentProps<"span">` |         | `ref`, `className`.                                                                   |

Names, checked against the reference libraries:

- **`Avatar`** with **`Root` / `Image` / `Fallback`**: Radix "An image element with a fallback for representing the user." with Parts Root ("Contains all the parts of an avatar."), Image ("The image to render. By default it will only render when it has loaded.") and Fallback ("An element that renders when the image hasn't loaded.") (https://www.radix-ui.com/primitives/docs/components/avatar); Base UI `Avatar.Root`, `Avatar.Image`, `Avatar.Fallback` (https://base-ui.com/react/components/avatar); Chakra `Avatar.Root`, `Avatar.Image`, `Avatar.Fallback` (https://chakra-ui.com/docs/components/avatar); shadcn `Avatar`, `AvatarImage`, `AvatarFallback` (https://ui.shadcn.com/docs/components/avatar). Mantine and MUI ship a single `Avatar` (https://mantine.dev/core/avatar/, https://mui.com/material-ui/react-avatar/).
- **`onLoadingStatusChange`**: Radix Image prop `onLoadingStatusChange`; Base UI "Callback fired when the loading status changes." (same name). Chakra puts `onStatusChange` on Root. Two libraries agree.
- **`name` on Fallback**: Chakra Fallback "The name to derive the initials from. If not provided, the fallback will display a generic icon."; Mantine "To display initials instead of the default placeholder, set the `name` prop to the name of the person." Radix, Base UI and shadcn take initials as children (`<AvatarFallback>CN</AvatarFallback>`), which `children` keeps.
- **`size`**: Chakra "`full`, `2xs`, `xs`, `sm`, `md` (default), `lg`, `xl`, `2xl`"; Mantine "xs, sm, md, lg, and xl"; shadcn `"default" | "sm" | "lg"`. We ship the two sizes existing semantic tokens cover (see Component tokens).
- **No Fallback delay** (Radix `delayMs`, Base UI `delay`, "How long to wait before showing the fallback."). The delay exists to avoid a fallback flash on a client-only render. Ours renders the Fallback on the server and keeps it until the image has loaded (as Base UI: "So is the fallback, which stays visible until hydration resolves the loading status."), so there is nothing to delay.
- **No `shape` / `variant`, no `Avatar.Group`.** Chakra `square | rounded | full`, MUI "If you need square or rounded avatars, use the `variant` prop", Mantine `Avatar.Group`, MUI `AvatarGroup`. Not needed in phase 1; a later phase can add a Group.

## States

| State    | How it shows                                             | Exposed as                                                                      |
| -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| loading  | Fallback visible, Image transparent                      | `data-loading` on Image (Base UI's name: "Present while the image is loading.") |
| loaded   | Image fades in over the Fallback; the Fallback is hidden | neither attribute                                                               |
| error    | Image stays transparent; Fallback stays                  | `data-error` on Image (Base UI: "Present when the image failed to load.")       |
| no image | Fallback only                                            | no Image Part                                                                   |

Not interactive: no hover, press, focus or disabled state. Wrap it in a Link or Button to make it one.

## Behaviour

- **Server and client split.** Root and Fallback are Server Components. Image is the only `'use client'` leaf, because the load status needs script. Image renders its `<img>` into the server HTML with `data-loading`, so the browser starts fetching before hydration (Base UI: "With `keepMounted`, the image is part of the server-rendered HTML and starts loading before hydration."). Root hides the Fallback with CSS only, `:has(> img:not([data-loading], [data-error]))`, so the Fallback needs no client code. `:has()` is Baseline widely available "since December 2023" (MDN). Without JavaScript the Fallback stays, which is a correct avatar.
- **Status after hydration.** The image may have finished before React attaches listeners, so on mount Image reads `complete` and `naturalWidth`: MDN `complete` is true when the image "has been fully fetched" and also when it "is "broken;" that is, the image failed to load"; `naturalWidth` "returns 0" when "the image data is not available". `complete && naturalWidth > 0` is loaded, `complete && naturalWidth === 0` is error; otherwise `load` / `error` events decide. (Design decision; React's own event replay is not relied on.)
- **Cached images appear without a fade.** An image already complete at mount shows at once (Base UI: "A cached image is displayed immediately, without an enter animation.").
- **Initials.** First grapheme of the first word plus first grapheme of the last word, segmented with `Intl.Segmenter` (MDN: "enables locale-sensitive text segmentation, enabling you to get meaningful items (graphemes, words or sentences) from a string"; Baseline widely available "since April 2024"). One word gives one letter. Grapheme segmentation keeps combining marks and emoji whole. Case is set with CSS `text-transform: uppercase`, which follows the element's `lang` (MDN: "The `text-transform` property takes into account language-specific case mapping rules", "The language is defined by the `lang` HTML attribute"), so no server-side locale is needed.
- `src` changes reset the status to loading; the Fallback shows until the new image loads.

## Motion

- Image enter: `opacity` 0 → 1 over `motion-duration-swap` (200 ms), `motion-easing-enter`. A colour/opacity fade only, so it is not "movement".
- No motion on a cached image (above), and none on the Fallback.
- **Reduced motion:** the fade stays (brand book: "Opacity and color fades remain"); nothing moves or scales.
- **Instant exit:** Avatar has no exit animation. On error the Image simply never becomes visible, and the Fallback, painted beneath it from the first frame, is what remains, so nothing changes on screen and nothing can read as a glitch.

## Keyboard

No APG pattern exists for an avatar (https://www.w3.org/WAI/ARIA/apg/patterns/). The closest role is `img`, WAI-ARIA 1.2: "A container for a collection of elements that form an image." and "authors _MUST_ provide a label using the aria-label or aria-labelledby attribute." (https://www.w3.org/TR/wai-aria-1.2/#img). The Image is a native `<img>`.

Not focusable; no keyboard interaction. When the avatar is inside a Link or Button, that element's keyboard behaviour applies.

## Accessibility

- **One accessible name, whichever Part shows.** The name is the Image's `alt`. The `<img>` stays in the tree while loading, loaded and broken (it is only transparent), so the name never changes with the load status, and the server-rendered Fallback needs no status-dependent ARIA. The Fallback is always `aria-hidden`, so the initials are never read letter by letter and the name is never heard twice.
- **No Image Part** (initials only): the avatar is decorative by default. If it must carry the name on its own, set `role="img"` and `aria-label` on Root; WAI-ARIA 1.2: "authors _MUST_ provide a label using the aria-label or aria-labelledby attribute", and `img` has "Children Presentational: True".
- **Decorative avatars.** When the name is written beside the avatar, use `alt=""` and `aria-hidden` on Root. MDN: `alt=""` "indicates that this image is _not_ a key part of the content"; `aria-hidden` "can be used to hide non-interactive content from the accessibility API".
- No `alt` text flash: the Image is transparent while loading and on error, so the browser's broken-image box or alt text never paints (MDN: "Alt text is also displayed on the page if the image can't be loaded").
- Contrast: `text-subtle` and `icon-subtle` on `surface-nested` are in the AA matrix.
- **More contrast:** text and icon tokens already pass; no change.
- **Forced colors:** the Fallback disc fill is removed (`background-color` is forced, MDN forced-colors). Root draws a 1 px transparent border at all times, which forced colors turns into a system colour (CSS Color Adjust 1, https://www.w3.org/TR/css-color-adjust-1/), so the circle stays visible. Initials take `CanvasText`. Photos are unaffected.
- **Reduced transparency:** not affected (no Material).

## RTL

The circle is symmetric. Initials follow the logical order of the name's words (first word, last word) and the Fallback sets `dir="auto"`, so an Arabic or Hebrew name renders its initials in its own direction (inference). No arrow keys.

## Component tokens

New component word **`avatar`** (Dictionary change: add to `COMPONENTS` in `packages/tokens/src/naming.ts`). All other words exist.

| Token                     | References             | `$type`    | Why                                                           |
| ------------------------- | ---------------------- | ---------- | ------------------------------------------------------------- |
| `avatar-sm-size`          | `size-icon-lg` (24)    | dimension  | sm diameter                                                   |
| `avatar-md-size`          | `size-icon-xl` (32)    | dimension  | md diameter (default)                                         |
| `avatar-border-radius`    | `radius-full`          | dimension  | Circle; overridable to a rounded square                       |
| `avatar-background-color` | `color-surface-nested` | color      | Fallback disc, the same neutral fill as neutral Tag and Badge |
| `avatar-text-color`       | `color-text-subtle`    | color      | Initials                                                      |
| `avatar-icon-color`       | `color-icon-subtle`    | color      | Generic `user` glyph                                          |
| `avatar-font`             | `type-label-sm`        | typography | md initials (13 px / 500)                                     |
| `avatar-sm-font`          | `type-data-sm`         | typography | sm initials (12 px), so two letters fit 24 px                 |
| `avatar-icon-size`        | `size-icon-sm` (16)    | dimension  | md glyph                                                      |
| `avatar-sm-icon-size`     | `size-icon-xs` (14)    | dimension  | sm glyph                                                      |

Sizes come from `size-icon-*`, not `size-control-*`, because control sizes grow on coarse pointers and an avatar is not a target. A larger profile size (40–56 px) has no non-growing semantic token today; adding one is a tier 2 change and is left out (open question for review).

The image fade uses semantic `motion-duration-swap` and `motion-easing-enter` directly.

## Author-written text

None. The accessible name is the consumer's `alt` and `name`.

## Feedback events

None. Avatar is not interactive, and loading an image is not a user moment.

## Sources

- Brand book: principles ("Platform before script", "Rationed color"), iconography (the `user` glyph, `assets/icons/user.svg`).
- WAI-ARIA APG pattern list (no avatar pattern): https://www.w3.org/WAI/ARIA/apg/patterns/
- WAI-ARIA 1.2 `img`: https://www.w3.org/TR/wai-aria-1.2/#img
- Radix Avatar: https://www.radix-ui.com/primitives/docs/components/avatar
- Base UI Avatar: https://base-ui.com/react/components/avatar
- Chakra Avatar: https://chakra-ui.com/docs/components/avatar
- shadcn/ui Avatar: https://ui.shadcn.com/docs/components/avatar
- Mantine Avatar: https://mantine.dev/core/avatar/
- MUI Avatar: https://mui.com/material-ui/react-avatar/
- MDN `<img>`, `HTMLImageElement.complete`, `naturalWidth`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img, https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/complete, https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalWidth
- MDN `Intl.Segmenter`, `text-transform`, `:has()`, `aria-hidden`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter, https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform, https://developer.mozilla.org/en-US/docs/Web/CSS/:has, https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden
- MDN forced-colors: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors; CSS Color Adjust 1: https://www.w3.org/TR/css-color-adjust-1/
