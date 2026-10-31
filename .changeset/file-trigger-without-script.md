---
"@abereghici/ui": patch
---

FileTrigger works with JavaScript off: the browser's own file input takes the trigger's place, named by the trigger's text and in the tab order, so the form still submits the chosen files. Once hydrated, nothing changes: the trigger opens the picker and the input stays hidden. A DropZone's file input does the same.
