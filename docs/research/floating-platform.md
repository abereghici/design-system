# Floating layers on the platform: popover, invoker commands and anchor positioning in three engines

Researched 2026-10-24 (spike #4). Proof: `apps/spike-floating/`, a throwaway spike deleted in R1 (2026-10-24); it remains in the repository history at commit `b7cb122`. Its last run that day (`vitest run`, Vitest 5.0.5 browser mode, Playwright 1.64.1) passed 51 of 51 tests in 3 files across Chromium, Firefox and WebKit: invoker commands, `popover=auto` Escape and focus return, light dismiss, anchor positioning with `position-try-fallbacks: flip-block`, implicit anchoring from a `commandfor` invoker, `dir` in the top layer, the `anchor()` recipe, and `@starting-style` entry and exit motion.

Sources:

- **Engines under test**: the browsers that Playwright 1.64.1 installs. Its `browsers.json`: Chromium `"browserVersion": "156.0.8078.4"`, Firefox `"browserVersion": "157.0"`, WebKit `"browserVersion": "27.2"`. Run headless on macOS (darwin arm64).
- **Test runner**: Vitest 5.0.5 browser mode with `@vitest/browser-playwright` 5.0.5 and Vite 8.3.5 (all npm `latest` on 2026-10-24). Docs at tag `v5.0.5` of `vitest-dev/vitest` and `v8.3.5` of `vitejs/vite`.
- **Baseline**: the webstatus.dev API (`https://api.webstatus.dev/v1/features/<id>`), fetched 2026-10-24, and `web-features` 3.44.0 (`data.json`, including `status.by_compat_key`) with `@mdn/browser-compat-data` 8.1.7, both npm `latest` on the same day.
- **MDN**: `mdn/content` at commit `d49a4a4b409c60938b544e315358e27068991484`.
- **Specs**: HTML Living Standard, popover section (`https://html.spec.whatwg.org/multipage/popover.html`, "Last Updated 22 October 2026"); CSS Anchor Positioning 1 (`https://drafts.csswg.org/css-anchor-position-1/`, W3C Working Draft 6 September 2026).
- **Bug tracker**: Mozilla Bugzilla bug 2050071, read through the REST API.

## Question

The Floating layers (Tooltip, Popover, DropdownMenu, ContextMenu, Combobox, Select) are to be built on `popover`, invoker commands and CSS anchor positioning, with `@starting-style` for entry and `overlay` for exit (ADR-0001, ADR-0002). Per engine, does each of these work: open and close via commands, anchoring and flip, entry animation, exit, `dir` inheritance in the top layer, light dismiss and Escape? What is each feature's Baseline status, and which gaps change the component specs?

## Short answer

| Behaviour                                                                      | Chromium 156                 | Firefox 157   | WebKit 27.2                         |
| ------------------------------------------------------------------------------ | ---------------------------- | ------------- | ----------------------------------- |
| `commandfor` + `toggle-popover` / `hide-popover`                               | works                        | works         | works                               |
| Escape closes `popover=auto`                                                   | works                        | works         | works                               |
| Focus back to the invoker after Escape (keyboard-opened)                       | yes                          | yes           | yes                                 |
| Focus back to the invoker after Escape (mouse-opened)                          | yes                          | yes           | **no**: stays on the hidden element |
| Light dismiss (click outside closes, click inside does not)                    | works                        | works         | works                               |
| `position-anchor` + `position-area`, explicit `anchor-name`                    | works                        | works         | works                               |
| Implicit anchor from `commandfor` (no `anchor-name`)                           | works                        | works         | works                               |
| `position-try-fallbacks: flip-block`                                           | works                        | works         | works                               |
| `dir` inherited by the top-layer popover from its DOM parent                   | yes                          | yes           | yes                                 |
| `position-area` with `dir="rtl"` on `<html>`                                   | mirrors                      | mirrors       | mirrors                             |
| `position-area` in a `dir="rtl"` subtree of an LTR page, plain keywords        | resolves LTR (as spec'd)     | **misplaced** | resolves LTR (as spec'd)            |
| `position-area` in a `dir="rtl"` subtree, `self-*` keywords                    | mirrors                      | **misplaced** | mirrors                             |
| `anchor()` on logical insets with `self-start`/`self-end`, LTR and rtl subtree | works, flips                 | works, flips  | works, flips                        |
| Entry transition with `@starting-style`                                        | animates                     | animates      | animates                            |
| Exit transition with `display`/`overlay` `allow-discrete`                      | animates, stays in top layer | **instant**   | **instant**                         |

- **Everything the components need works in all three engines**, with two exceptions: exit animations run only in Chromium, and `position-area` is unreliable in Firefox when the popover sits in an RTL subtree of an LTR page.
- **Anchor positioning is not Baseline as a whole.** webstatus.dev says `"status": "limited"`. The only reason is two `position-visibility` values that only Safari 27 has. Every other part of the feature, including all the parts we use, is Baseline newly available (section 3).
- **The portable recipe** for a Floating layer: open it with `commandfor`, rely on the implicit anchor (no `anchor-name`), and position it with `position-area` plus `position-try-fallbacks: flip-block`. Where a Floating layer can sit inside an RTL island of an LTR page, use `anchor()` on logical insets with `self-*` sides and `position-anchor: auto` instead (section 5).

## Findings

### 1. Open and close via invoker commands

- **Observed**: in all three engines, clicking a `<button commandfor="id" command="toggle-popover">` opens the popover (`:popover-open` matches). A `command="hide-popover"` button inside closes it. Without the `command` attribute the test fails (mutation check), so the test can fail.
- **Baseline**: webstatus.dev `invoker-commands`: `"status": "newly"`, `"low_date": "2025-12-12"` (Chrome 135, Firefox 144, Safari 26.2). `popover`: `"status": "newly"`, `"low_date": "2025-01-27"`; `web-features` puts the `popover` attribute key itself at `"baseline": "high"` from `2024-04-16`.
- **MDN** (Invoker Commands API): "The Invoker Commands API provides a way to declaratively assign behaviors to buttons, allowing control of interactive elements when the button is enacted (clicked or invoked via a keypress, such as the spacebar or return key)."

### 2. Light dismiss, Escape and focus return

- **Observed**: in all three engines, Escape closes a `popover` (auto) popover, a click outside closes it, and a click inside does not.
- **Observed, focus**: after a keyboard-activated open (focus the trigger, press Enter), Escape returns focus to the trigger in every engine. After a mouse-activated open, Chromium and Firefox also return focus to the trigger. WebKit leaves focus on the now-hidden close button.
- **Why WebKit differs**. MDN `<button>`: "Whether clicking on a `<button>` … causes it to (by default) become focused varies by browser and OS. Most browsers do give focus to a button being clicked, but Safari does not, by design". The HTML spec, show popover: "Let originallyFocusedElement be document's focused area of the document's DOM anchor", then "set element's previously focused element to originallyFocusedElement". Hide popover: "If focusPreviousElement is true and document's focused area of the document's DOM anchor is a shadow-including inclusive descendant of element, then run the focusing steps for previouslyFocusedElement". Inference: in WebKit the focused area before opening was the document, so nothing focusable is restored and focus stays where it was, inside the now-hidden popover. The test pins this per engine.
- **MDN** (Using the Popover API): auto popovers "can be "light dismissed" — this means that you can hide the popover by clicking outside it", and "can also be closed, using browser-specific mechanisms such as pressing the <kbd>Esc</kbd> key". Also: "when closing the popover via the keyboard (usually via the <kbd>Esc</kbd> key), focus is shifted back to the invoker."

### 3. Anchoring and flip

- **Observed**: in all three engines, `anchor-name` on the trigger plus `position-anchor` and `position-area: block-end span-inline-end` on the popover put the popover's top edge on the trigger's bottom edge, start-aligned. With the trigger at the bottom of the viewport, `position-try-fallbacks: flip-block` moves it above. With no `anchor-name` and no `position-anchor`, a popover opened by a `commandfor` button anchors to that button.
- **The UA sheet needs one reset**: the popover gets `margin: 0`. Its default `margin: auto` centres it. MDN's popover anchor example also starts with `margin: 0;`.
- **Implicit anchor**. MDN (Using CSS anchor positioning): "When using the Popover API to associate a popover with a control, an implicit anchor reference is made between the two. This can occur when: Declaratively associating a popover with a control using the `popovertarget` and `id` attributes or the `commandfor` and `id` attributes." The HTML spec, show popover: "Set element's implicit anchor element to source."
- **`anchor()` needs `position-anchor: auto`**. MDN (Using the Popover API): "The implicit anchor is adopted automatically when you position the popover with `position-area`. However, if you position it using `anchor()` or `anchor-center`, `position-anchor: auto` is required to opt in. The initial value of `position-anchor` is `normal`, which behaves as `none` while `position-area` is `none`." The spec agrees: `Initial: normal`, and `normal` means "If position-area is none, behaves as none. Otherwise, behaves as auto." Observed: in Chromium, `anchor()` without `position-anchor: auto` did not anchor at all (the popover sat at the viewport origin). Firefox and WebKit anchored anyway. Always write `position-anchor: auto` with `anchor()`.
- **Baseline**:
  - webstatus.dev `anchor-positioning`: `"status": "limited"`, with only `safari` and `safari_ios` "27" listed as available.
  - `web-features` 3.44.0 lists 325 compat keys for that feature. 323 are Baseline low. The two that are not are `css.properties.position-visibility.anchor-valid` and `css.properties.position-visibility.anchor-visible` (support: Safari 27 only).
  - The keys we use, from `status.by_compat_key`: `css.properties.anchor-name`, `css.properties.position-area`, `css.properties.position-area.span-inline-end`, `css.properties.position-area.span-self-inline-end`, `css.properties.position-try-fallbacks.flip-block`, `css.types.anchor`, `css.properties.inset-inline-start.anchor` and `html.elements.button.commandfor.implicit_anchor_reference` are `"baseline": "low"`, `"baseline_low_date": "2026-01-13"` (Firefox 147). `css.properties.position-area.self-block-end` is low from `2026-02-24`. `css.properties.position-anchor`, `.auto` and `.normal` are low from `2026-09-14` (Chrome 151, Firefox 151, Safari 27).
  - Inference: anchor positioning meets the floor key by key, not as a webstatus.dev feature. `position-visibility` is below the floor.

### 4. `dir` in the top layer

- **Observed**: in all three engines, a popover inside a `dir="rtl"` element matches `:dir(rtl)` and computes `direction: rtl` while it is in the top layer. This confirms the inference in `feedback-events-and-i18n.md` section 7 that native top-layer elements keep their DOM parent's direction.
- **Observed, document-level RTL**: with `dir="rtl"` on `<html>`, `position-area: block-end span-inline-end` mirrors (right edges align) in all three engines.
- **Observed, RTL island in an LTR page**:
  - Plain logical keywords (`span-inline-end`) resolve against the LTR viewport in Chromium and WebKit, so the popover spans rightwards. That is what the spec says: "the plain logical keywords (start, end, etc) refer to the writing mode of the box's containing block", and a popover's containing block is the viewport.
  - `self-*` keywords mirror in Chromium and WebKit. Spec: "The self-* logical keywords (self-start, self-x-end, etc) are identical, but refer to the box's own writing mode." The two kinds cannot be mixed: `CSS.supports("position-area", "block-end span-self-inline-end")` is false in every engine, while `self-block-end span-self-inline-end` is true.
  - **Firefox misplaces every `position-area` value in an RTL island.** Plain, `self-*` and physical (`bottom span-left`, `bottom left`) keywords all put the popover outside the computed cell, even with an explicit `anchor-name`. A popover with `dir="ltr"` inside the island is misplaced too. Bugzilla 2050071 (NEW, "Core :: Layout: Positioned") has the summary "position-area inline keywords (span-inline-end / inline-end) are not resolved against RTL direction, mispositioning the anchored element". It may be the same bug; that was not confirmed.
  - `anchor()` on logical insets (`inset-block-start: anchor(self-end); inset-inline-start: anchor(self-start)`, plus `position-anchor: auto`) places the popover correctly in all three engines, in LTR and in an RTL island, and `flip-block` still flips it.
- **Baseline**: webstatus.dev `dir-pseudo`: `"status": "widely"`. MDN: "The `:dir()` CSS pseudo-class matches elements based on the directionality of the text contained in them."

### 5. Entry and exit motion

- **Observed, entry**: with MDN's recipe (`opacity: 0` → `1` inside `:popover-open`, `@starting-style { opacity: 0 }`, `transition: opacity, display allow-discrete, overlay allow-discrete`), an `opacity` CSS transition is running right after the popover opens, in all three engines. Without `@starting-style` it is not (the red run before the CSS existed).
- **Observed, exit**: right after `hidePopover()`:
  - Chromium keeps `display: block`, `overlay: auto` and a running `opacity` transition, sampled over 6 frames.
  - Firefox and WebKit compute `display: none` at once, have no running transitions and have no `overlay` property. Dropping `overlay` from the transition list does not change that in either engine. The exit is instant.
- **Baseline**:
  - webstatus.dev `starting-style`: `"status": "newly"`, `"low_date": "2024-08-06"`.
  - `transition-behavior`: `"status": "newly"`, `"low_date": "2024-08-06"`. But BCD marks Firefox `"partial_implementation": true`, with the note "Transitioning the `display` property with `allow-discrete`, a common use case for this property, is not supported", citing bug 1882408.
  - `overlay`: `"status": "limited"`, Chrome 117 only. BCD: Firefox `"version_added": false` (bug 1841456), Safari `"version_added": false`.
  - `web-features` `display-animation`: `"baseline": false`, with support listing Chrome 117 and Safari 18. Observed: WebKit 27.2 still does not keep a hiding popover rendered.
- **MDN** (`overlay`): adding it to the transition list "causes its removal from the top layer to be deferred so it can be animated instead of disappearing immediately". MDN (`@starting-style`): "`display` is added to the list of transitioned elements to ensure the animated element is visible … throughout both the entry and exit animations. Without this, the exit animation would not be visible; in effect, the popover would just disappear."

## Gaps that affect component specs

1. **Exit motion is Chromium-only.** In Firefox and WebKit, Floating layers disappear instantly. User story 62 already expects this. Write the exit transition once (`display`, `overlay`, `allow-discrete`); it degrades to instant with no fallback.
2. **`position-area` in RTL islands is broken in Firefox.** Document-level RTL is fine everywhere. Components that may render in a mixed-direction subtree (Tooltip, Popover, DropdownMenu, Combobox, Select) should use `anchor()` on logical insets with `self-start`/`self-end` sides and `position-anchor: auto`, plus `position-try-fallbacks: flip-block`. `position-area` is fine for apps that set `dir` only on `<html>`.
3. **Use only the `self-*` keywords for logical `position-area` values.** Plain `start`/`end` keywords follow the viewport, not the component's direction.
4. **No `anchor-name` per instance.** The implicit anchor from `commandfor` works everywhere, so components don't need generated anchor names or `anchor-scope`.
5. **Always set `position-anchor: auto` with `anchor()`.** Chromium follows the spec's `normal` initial value and drops the implicit anchor otherwise.
6. **Do not use `position-visibility`**: its `anchor-valid`/`anchor-visible` values are Safari-only, and they are why webstatus.dev marks anchor positioning "limited".
7. **Focus after a mouse-opened popover in WebKit.** Escape leaves focus on a hidden element inside the popover, because Safari doesn't focus buttons on click. User story 35 ("return focus to its invoker") does not hold there from the platform alone. Components that must meet it need a small `toggle`-event handler that moves focus to the invoker when focus is inside the closing layer. That handler is script.
8. **Reset `margin: 0`** on every anchored popover; the UA `margin: auto` centres it.

## Recommendations

- Floating layers use `popover` + `commandfor`/`command` + the implicit anchor, as planned in ADR-0001.
- Default positioning, in a shared CSS Module: `margin: 0; position-anchor: auto; inset: auto; inset-block-start: anchor(self-end); inset-inline-start: anchor(self-start); position-try-fallbacks: flip-block;` (side and alignment vary per component). This works in every engine, including RTL islands.
- Entry: `@starting-style`. Exit: `transition: … display <d> allow-discrete, overlay <d> allow-discrete;`, accepted as instant in Firefox and WebKit.
- The ADR-0002 floor is checked per compat key for anchor positioning. That decision is logged as an open question (Q4-1).
