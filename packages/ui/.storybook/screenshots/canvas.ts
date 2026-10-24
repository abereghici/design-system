export let storyCanvas: HTMLElement;

export function rememberStoryCanvas({ canvasElement }: { canvasElement: HTMLElement }) {
  storyCanvas = canvasElement;
}
