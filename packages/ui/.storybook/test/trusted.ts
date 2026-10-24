// Popover light dismiss, close watchers and :focus-visible react only to trusted input, which user-event's synthetic events are not; Playwright's are.
export async function trusted() {
  const { userEvent } = await import("vitest/browser");
  return userEvent;
}
