import { beforeEach } from "vitest";

// Parallel Firefox pages take system focus from each other, and an unfocused frame ignores element.focus(), so user-event's Tab would leave focus on <body>.
beforeEach(() => {
  window.focus();
});
