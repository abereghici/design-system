/// <reference types="@vitest/browser-playwright" />
import { expect } from "vitest";
import { commands, server } from "vitest/browser";

import type { Locator } from "vitest/browser";

const pixels = async (base64: string) => {
  const bitmap = await createImageBitmap(
    await (await fetch(`data:image/png;base64,${base64}`)).blob(),
  );
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");

  context?.drawImage(bitmap, 0, 0);

  return context?.getImageData(0, 0, bitmap.width, bitmap.height).data;
};

/**
 * Whether `target` draws exactly the pixels of the screenshot `toMatchScreenshot(name)` stored for
 * this test file. A name with no stored screenshot matches nothing.
 */
export async function matchesScreenshot(target: Locator, name: string) {
  const test = expect.getState().testPath ?? "";
  const folder = test.slice(0, test.lastIndexOf("/"));
  const file = test.slice(folder.length + 1);
  const stored = await commands
    .readFile(
      `${folder}/__screenshots__/${file}/${name}-${server.browser}-${server.platform}.png`,
      "base64",
    )
    .catch(() => null);

  if (stored === null) return false;

  const [actual, expected] = await Promise.all([
    // toMatchScreenshot's own capture options, so both draw the same frame.
    pixels(
      await target.screenshot({
        save: false,
        animations: "disabled",
        caret: "hide",
        scale: "device",
      }),
    ),
    pixels(stored),
  ]);

  return (
    actual?.length === expected?.length &&
    actual?.every((value, at) => value === expected?.[at]) === true
  );
}
