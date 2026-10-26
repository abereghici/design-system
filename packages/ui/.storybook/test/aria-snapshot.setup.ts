import { afterEach, expect } from "vitest";
import { page } from "vitest/browser";

import { storyCanvas } from "../screenshots/canvas.ts";

// Proofs (`test-fn`) leave the story mid-interaction; the snapshot records each story as rendered.
afterEach(async ({ story, task }) => {
  if (!story || task.result?.state === "fail") return;

  if (!story.tags.includes("aria-snapshot") || story.tags.includes("test-fn")) return;

  await expect.element(page.elementLocator(storyCanvas())).toMatchAriaSnapshot();
});
