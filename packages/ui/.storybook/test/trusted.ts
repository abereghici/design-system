// Popover light dismiss, close watchers and :focus-visible react only to trusted input, which user-event's synthetic events are not; Playwright's are.
export async function trusted() {
  const { userEvent } = await import("vitest/browser");
  return userEvent;
}

/**
 * Replays what WebKit delivers when Enter confirms an IME composition: `compositionend`, then the
 * Enter keydown with `isComposing` already false (WebKit bug 165004). Playwright has no IME input.
 */
export function confirmComposition(target: Element) {
  target.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
}

/** Moves the pointer off the story so hover state never leaks between proofs. */
export async function parkPointer() {
  // vitest/browser throws when imported outside Vitest, e.g. when the Storybook UI renders the story.
  const user = await trusted().catch(() => null);
  await user?.hover(document.body, { position: { x: 0, y: 0 } });
}
