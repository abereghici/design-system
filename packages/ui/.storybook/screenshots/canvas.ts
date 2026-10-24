let canvas: HTMLElement;

export const storyCanvas = () => canvas;

export function rememberStoryCanvas({ canvasElement }: { canvasElement: HTMLElement }) {
  canvas = canvasElement;
}
