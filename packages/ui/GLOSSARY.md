# UI

The Bereghici design system's React components: the controls, overlays and layouts every app builds its interface from.

## Language

**Component**:
A named, documented building block of the interface (Button, Dialog, Select), named after the term the major UI libraries agree on. Each one is a single entry, `@abereghici/ui/<name>`; a capability it offers, such as a Table's row selection, is its props and Parts, never a Component of its own.
_Avoid_: Widget, element, control (as a generic name)

**Part**:
A named piece of a compound component that the consumer composes (`Dialog.Trigger`, `Dialog.Content`).
_Avoid_: Slot, sub-component, child

**Variant**:
One of a component's enumerated visual treatments (primary, secondary, tertiary, danger), or the Role a status component shows (neutral, success, warning, danger).
_Avoid_: Kind, type, appearance, tone, intent

**Overlay**:
UI that renders above the page flow: menus, popovers, tooltips, toasts, dialogs and sheets. The only UI that takes elevation or material.
_Avoid_: Floating layer, popup (as a generic term), portal, modal (unless it blocks the page)

**Feedback event**:
A bubbling DOM event (press, toggle, confirm, dismiss or appear) a component dispatches at a moment an app may want to answer with sound or haptics. It names the component and whether the user or the app caused it, and fires only after a change request is accepted. Not to be confused with the reason of a change request, which names what triggered the change.
_Avoid_: Sound event, haptic event, callback

**Change request**:
A state change a component asks its consumer about before committing it. The consumer receives the new value and the reason for it, and may cancel it, which keeps the previous state.
_Avoid_: Change event, veto, controlled change

**Listbox navigator**:
The active-descendant highlight both listbox popups share (Combobox, Command): focus stays in the input while the options re-rank as the query or the options change, the highlight lands on a shown, enabled option with its group heading in view, Down and Up step through those options and wrap, Home and End reach the ends while the input is empty, and the pointer moves it.
_Avoid_: Roving focus (that is Menu's), list navigation

**Field control**:
The control a Field labels, describes and validates: a native input, or a composite control such as DateField's segments, a FileTrigger or a DropZone.
_Avoid_: Field context, input binding

**Disabled look**:
The one treatment every disabled control gets: its text, icons, fill and edge take the disabled colour roles, its label dims with it, and the description that says why stays readable. A disabled control is never faded as a whole, because it stays focusable.
_Avoid_: Dimmed, greyed out, faded, inactive

**State attribute**:
A `data-*` attribute a component sets on its own element to expose a state for styling: present while a yes/no state holds, or carrying the value of an enumerated one.
_Avoid_: Data flag, state class

**Uncontrolled state**:
The state a component holds itself when the consumer gives only a starting value; a value the consumer controls always wins.
_Avoid_: Own state, internal state, local value

**Icon**:
A glyph from the carved icon set on the 24-unit grid, stroked in the surrounding text colour; decorative unless it has a label. Each one is its own component (`SearchIcon`).
_Avoid_: Glyph (as a component name), symbol, pictogram

**Logo**:
The Bereghici brand sign, rendered as a component.
_Avoid_: Mark, brand mark

**Separator**:
A thin line dividing content or groups of items.
_Avoid_: Divider, rule, hr

**UIProvider**:
The component an app mounts once at its root. It brings every global style the design system needs, so apps add none, and the app's Locale; it holds no other state and no text.
_Avoid_: Root, app shell, LocaleProvider, ThemeProvider

**Density**:
How tightly controls and the items of collections are packed, `comfortable` (the default) or `compact`, set with `data-density` on any element for everything inside it; the nearest setting wins, and touch screens keep their touch size in both.
_Avoid_: Size, scale, spacing mode, compact mode prop

**Locale**:
The language an app formats numbers and dates in, a BCP 47 tag such as `"ro-RO"`, set once on the UIProvider; every component that formats follows it. Dates are Gregorian in every Locale.
_Avoid_: Per-component locale, locale object, translations, i18n bundle

**Author-written text**:
Every name, label and message a component shows or announces comes from the app, as children or a named prop (`aria-label`, `closeLabel`, `noOptionsText`); the library ships none. Where a part would otherwise have no accessible name, its prop type requires the text.
_Avoid_: Built-in label, default text, i18n key

**Tier**:
What a Component does before hydration (ADR 0008). Tier 1 works from the server HTML alone, with JavaScript off too; Tier 2 shows its final content and becomes usable after hydration. A Tier 1 Component that fails before hydration has a bug; it is never moved to Tier 2.
_Avoid_: No-JS mode, SSR support, progressive enhancement level
