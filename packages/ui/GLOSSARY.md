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
A state change a component asks its consumer about before committing: the `on…Change` callback receives the value and `details` (`reason`, `event`, `cancel()`), and calling `cancel()` keeps the previous state. A consumer's `preventDefault()` in its own handler keeps just its native meaning. Where the event's native default is the change itself (an input's checkedness, a `<summary>` toggle, a `commandfor` command), it cancels that default, so the component neither reports nor applies the change (HTML runs no activation behavior for a canceled click; `composeEventHandlers` in `events.ts`, as Radix's). Where there is no native default (a Tab's button click, a Tabs arrow key, whose default is only scrolling), it stops nothing the component does itself, and `cancel()` is the only way to stop the change (Base UI: `preventBaseUIHandler()`, not `preventDefault()`).
_Avoid_: Change event, veto, controlled change

**Listbox navigator**:
The active-descendant keyboard both listbox popups share (Combobox, Command): focus stays in the input while Down and Up step through the shown, enabled options and wrap, and Home and End reach the ends while the input is empty.
_Avoid_: Roving focus (that is Menu's), list navigation

**Field control**:
The one seam between a Field and the control inside it: `useFieldControl` for a native input, `useField` for a composite control (DateField segments, a FileTrigger, a DropZone), giving the Field's ids, blocked state, `aria-invalid` and server error, and `useFormReset` for a form reset.
_Avoid_: Field context (as an API), input binding

**Disabled look**:
The one treatment every disabled control gets: its parts swap to the `*-disabled` colour roles (`text-disabled` ink, `icon-disabled` glyphs and marks, `background-disabled` fill, `border-disabled` edge), the label next to it takes `text-disabled`, and the description that says why stays readable. Never `opacity`: a disabled control stays focusable (`aria-disabled`), and opacity on it fades its focus ring below WCAG 1.4.11's 3:1, then fades again in any disabled ancestor. Button, Field, Command and Calendar set the precedent; Primer (`fgColor-disabled`, `bgColor-disabled`), Carbon (`$text-disabled`, `$icon-disabled`) and Atlassian (`color.text.disabled`) do the same.
_Avoid_: Dimmed, greyed out, faded, inactive

**State attribute**:
A `data-*` attribute a component sets on its own element so CSS can style a state. A yes/no state is present with the empty string while it holds and absent otherwise (`data-selected=""`), as HTML boolean attributes are; an enumerated one carries its value (`data-variant="danger"`, `data-side="top"`). Never `"true"` or `"false"`.
_Avoid_: Data flag, state class

**Uncontrolled state**:
The state a component holds itself when the consumer passes only the `default…` prop, named `uncontrolled` in the code (`const [uncontrolled, setUncontrolled] = useState(defaultValue)`); the controlled prop wins whenever it is defined. React's controlled and uncontrolled components, Radix's `useControllableState`.
_Avoid_: Own state, internal state, local value

**Icon**:
A glyph from the carved icon set on the 24-unit grid, stroked in the surrounding text colour; decorative unless it has a label. Each one is its own component (`SearchIcon`).
_Avoid_: Glyph (as a component name), symbol, pictogram

**Logo**:
The Stâlpul cerului brand sign, rendered as a component.
_Avoid_: Mark, brand mark

**Separator**:
A thin line dividing content or groups of items.
_Avoid_: Divider, rule, hr

**UIProvider**:
The component an app mounts once at its root. It brings the global stylesheets (layer order, shared tokens, fonts, base) and the optional Locale, so apps import no CSS.
_Avoid_: Root, app shell, LocaleProvider, ThemeProvider

**Locale**:
A typed object holding a BCP 47 tag and every built-in label in that language (`enUS`, `roRO`), passed to the UIProvider.
_Avoid_: Translations, messages, i18n bundle

**Built-in label**:
A string a component supplies by default, from its namespace in the Locale. It names only elements the component owns (a Close button, the steppers), and it gives way to any name the consumer gives (`aria-label`, `aria-labelledby`, or a `<label for>` through `id`). Precedence: the consumer's `labels`, then the UIProvider's Locale, then the component's own en-US namespace.
_Avoid_: Default text, i18n key
