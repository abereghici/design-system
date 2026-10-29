/// <reference types="@vitest/browser-playwright" />
import type { StoryContext } from "@storybook/react-vite";

interface AriaSnapshotParameters {
  readonly ariaSnapshot?: { readonly disable?: boolean };
}

/**
 * Records each rendered story under Vitest: its screenshot in the screenshot projects, its aria
 * snapshot in the chromium instance. `parameters: { ariaSnapshot: { disable: true } }` skips the
 * aria snapshot of a story whose accessibility tree is empty, which would match any tree.
 */
export async function snapshotStory({
  id,
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
  const variant = inject("screenshotVariant");

  if (variant !== undefined) {
    const topLayer = document.querySelector(":modal, :popover-open") !== null;
    const height = document.documentElement.scrollHeight;

    if (!topLayer && height > innerHeight) await page.viewport(innerWidth, height);

    await expect(
      page.elementLocator(topLayer ? document.documentElement : canvasElement),
    ).toMatchScreenshot(`${id}-${variant.name}`);
  } else if (inject("reducedMotion") === false && parameters.ariaSnapshot?.disable !== true) {
    await expect.element(page.elementLocator(canvasElement)).toMatchAriaSnapshot();
  }
}
