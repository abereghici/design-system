/**
 * The element the current story renders into. Portable stories mount into an anonymous `<div>`
 * appended to `<body>` (storybook 10.6.3 `runStory`), so there is no selector for it; the
 * officially exposed reference is the story context's `canvasElement`, which preview.tsx records
 * here in a `beforeEach`. The screenshot setup file reads it from the same module.
 */
let current: HTMLElement | undefined;

export function rememberStoryCanvas(canvasElement: HTMLElement): void {
  current = canvasElement;
}

export function storyCanvas(): HTMLElement {
  if (current === undefined) {
    throw new Error("No story canvas recorded: preview.tsx must call rememberStoryCanvas.");
  }
  return current;
}
