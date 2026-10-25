declare module "vitest" {
  export interface TestContext {
    story?: { id: string; tags: string[] };
  }
}

let canvas: HTMLElement;

export const storyCanvas = () => canvas;

export function rememberStoryCanvas({ canvasElement }: { canvasElement: HTMLElement }) {
  canvas = canvasElement;
}
