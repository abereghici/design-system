---
"@abereghici/ui": patch
---

Component files do one job each: Tree's and Slider's state and Tree's keyboard navigation sit beside their Root; the Toaster's timers, stacking, announcements, swipe and topmost-modal tracking, and DropZone's `accept` matching and drop target, sit in files of their own; and Slider, Splitter and the Toaster's swipe share one pointer drag. Nothing changes for consumers.
