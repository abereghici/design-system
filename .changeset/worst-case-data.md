---
"@abereghici/tokens": minor
"@abereghici/ui": minor
---

Components hold up with long, unbreakable, translated and enlarged text:

- Toast's title keeps its width beside a long action, and with enlarged text the actions move below the description.
- Dialog and AlertDialog wrap their content inside the dialog instead of scrolling sideways.
- Select shows a long chosen option on one line, ending in "…", where the browser can style selects.
- Link, Sidebar items and Tooltip break long URLs and emails instead of overflowing.
- A horizontal Stepper too narrow for its labels stacks like a vertical one.
- SegmentedControl scrolls sideways with faded edges when its items don't fit.
- Avatar initials stay inside the circle with enlarged text, and skip generational suffixes ("Jr.", "III") and words that start with an emoji.
- Calendar and RangeCalendar head their columns with narrow weekday names ("M"), keeping the full name for screen readers.
- FileTrigger and DropZone show every chosen file name on hover, and screen readers read them all.
- A disabled tertiary Button keeps no border or fill.
- Button and Splitter panels break a word too long for them instead of overflowing.
- SkipLink wraps a long label instead of running its focus ring off the screen.
- DateRangePicker spaces its range with plain spaces, so the server renders the same text the browser does.

Focus is visible in two more places: a multiple Combobox rings its box while its text input has focus, and the Command search marks its divider in the focus color.

ToggleButtonGroup joins its buttons into one shape, with shared edges and rounded ends; `--ab-toggle-button-group-gap` is removed. Toolbar draws a track around its controls (`--ab-toolbar-padding`, `--ab-toolbar-border-radius`, `--ab-toolbar-background-color`), and ToggleButtons inside it show an edge only when pressed.

Slider and FileTrigger are Tier 2, as their before-hydration checks show: their final markup renders on the server and they work once hydrated.
