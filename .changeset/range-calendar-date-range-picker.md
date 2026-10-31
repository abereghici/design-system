---
"@abereghici/ui": minor
"@abereghici/tokens": minor
---

Add RangeCalendar (`@abereghici/ui/range-calendar`) and DateRangePicker (`@abereghici/ui/date-range-picker`). RangeCalendar chooses a start and an end day with two presses and Calendar's keyboard; every day of the range is selected, and its ends carry `data-selection-start` and `data-selection-end`, which Calendar's selected day now carries too. DateRangePicker types both dates in one field, or picks them on a RangeCalendar in `DateRangePicker.Content`; it submits them as ISO dates under `startName` and `endName`, marks an end before the start invalid with `reversedMessage`, and shows two of the browser's own date inputs with JavaScript off. Their tokens ship in `@abereghici/tokens/components/range-calendar.css` and `date-range-picker.css`.
