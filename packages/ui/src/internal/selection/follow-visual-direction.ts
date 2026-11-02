import type { KeyboardEvent } from "react";

// WebKit keeps Left as the previous radio even in RTL ("Seems strange, but we'll match it"):
// https://github.com/WebKit/WebKit/blob/main/Source/WebCore/html/RadioInputType.cpp
// Inside a Toolbar the Toolbar owns the arrow keys.
export function followVisualDirection(event: KeyboardEvent<HTMLElement>) {
  const step = event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0;
  const group = event.currentTarget;

  if (step === 0 || event.defaultPrevented || !group.matches(":dir(rtl)")) return;

  if (group.closest('[role="toolbar"]') !== null) return;

  if (!(event.target instanceof HTMLInputElement)) return;

  event.preventDefault();

  const radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const next = radios.at((radios.indexOf(event.target) + step) % radios.length);

  next?.focus();
  next?.click();
}
