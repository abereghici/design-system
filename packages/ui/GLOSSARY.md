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
A bubbling, `ab-`-prefixed DOM event (`ab-press`, `ab-toggle`, `ab-confirm`, `ab-dismiss`, `ab-appear`) a component dispatches at a moment an app may want to answer with sound or haptics. Carries the component name and a `reason`.
_Avoid_: Sound event, haptic event, callback

**Logo**:
The Stâlpul cerului brand sign, rendered as a component.
_Avoid_: Mark, brand mark

**Separator**:
A thin line dividing content or groups of items.
_Avoid_: Divider, rule, hr
