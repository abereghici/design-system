/// <reference types="@vitest/browser-playwright" />
import type { StoryContext } from "@storybook/react-vite";

let canvas: HTMLElement | undefined;

/**
 * The canvas of the story that last rendered. The screenshot projects capture it in their own
 * afterEach, which runs after Storybook resumes the animations it pauses around this one.
 */
export const renderedCanvas = () => canvas;

interface AriaSnapshotParameters {
  readonly ariaSnapshot?: { readonly disable?: boolean };
}

/**
 * Records each rendered story under Vitest: its aria snapshot in the chromium instance, and its
 * canvas for the screenshot projects. `parameters: { ariaSnapshot: { disable: true } }` skips the
 * aria snapshot of a story whose accessibility tree is empty, which would match any tree.
 */
export async function snapshotStory({
  canvasElement,
  tags,
  parameters,
}: StoryContext & { parameters: AriaSnapshotParameters }) {
  // Proofs (`test-fn`) leave the story mid-interaction; snapshots record each story as rendered.
  if (tags.includes("test-fn")) return;

  // vitest/browser throws when imported outside Vitest, e.g. when the Storybook UI renders the story.
  const browser = await import("vitest/browser").catch(() => null);

  if (browser === null) return;

  const { page } = browser;
  const { expect, inject } = await import("vitest");

  if (inject("screenshotVariant") !== undefined) {
    canvas = canvasElement;

    return;
  }

  if (inject("reducedMotion") === false && parameters.ariaSnapshot?.disable !== true) {
    await expect.element(page.elementLocator(canvasElement)).toMatchAriaSnapshot();
  }
}
