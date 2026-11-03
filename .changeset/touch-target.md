---
"@abereghici/ui": minor
---

Button, IconButton and ToggleButton: On touch screens, take presses in an invisible area above and below the button, up to `size-target-recommended` tall, while the button keeps its size. Inside a wrapping Toolbar, the area stops halfway to the next row. The area is a hidden `<span>` rendered last inside the button, or inside your element with `asChild`.
