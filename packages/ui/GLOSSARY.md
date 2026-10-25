# UI

The Bereghici design system's React components: the controls, overlays and layouts every app builds its interface from.

## Language

**Component**:
A named, documented building block of the interface (Button, Dialog, Select), named after the term the major UI libraries agree on.
_Avoid_: Widget, element, control (as a generic name)

**Part**:
A named piece of a compound component that the consumer composes (`Dialog.Trigger`, `Dialog.Content`).
_Avoid_: Slot, sub-component, child

**Variant**:
One of a component's enumerated visual treatments (primary, secondary, tertiary, danger).
_Avoid_: Kind, type, appearance

**Floating layer**:
UI that renders above the page flow: menus, popovers, tooltips, toasts, dialogs and sheets. The only UI that takes elevation or material.
_Avoid_: Overlay (as a generic term), portal, modal (unless it blocks the page)

**Feedback event**:
A bubbling, `ab-`-prefixed DOM event (`ab-press`, `ab-toggle`, `ab-confirm`, `ab-dismiss`, `ab-appear`) a component dispatches at a moment an app may want to answer with sound or haptics. Carries the component name and a `reason`. It fires after the consumer's handler for that moment has run, and only once a change request is accepted.
_Avoid_: Sound event, haptic event, callback

**Change request**:
A state change a component asks its consumer about before committing: the `on…Change` callback receives the value and `details` (`reason`, `event`, `cancel()`), and calling `cancel()` keeps the previous state. `cancel()` is the only way to stop it: a consumer's `preventDefault()` in its own handler keeps just its native meaning (a canceled click does not check a radio or run a button's command) and stops nothing the component does itself (Base UI: `preventBaseUIHandler()`, not `preventDefault()`).
_Avoid_: Change event, veto, controlled change

**Icon**:
A glyph from the carved icon set on the 24-unit grid, stroked in the surrounding text colour; decorative unless it has a label. Each one is its own component (`SearchIcon`).
_Avoid_: Glyph (as a component name), symbol, pictogram

**Logo**:
The Stâlpul cerului brand sign, rendered as a component.
_Avoid_: Mark, brand mark

**Separator**:
A thin line dividing content or groups of items.
_Avoid_: Divider, rule, hr

**Provider**:
The component an app mounts once at its root. It brings the global stylesheets (layer order, shared tokens, fonts, base) and the optional Locale, so apps import no CSS.
_Avoid_: Root, app shell, LocaleProvider, ThemeProvider

**Locale**:
A typed object holding a BCP 47 tag and every built-in label in that language (`enUS`, `roRO`), passed to the Provider.
_Avoid_: Translations, messages, i18n bundle

**Built-in label**:
A string a component supplies by default, from its namespace in the Locale. It names only elements the component owns (a Close button, the steppers), and it gives way to any name the consumer gives (`aria-label`, `aria-labelledby`, or a `<label for>` through `id`).
_Avoid_: Default text, i18n key
