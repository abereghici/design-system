/// <reference types="@vitest/browser-playwright" />
import { diff } from "@blazediff/core";
import { expect } from "vitest";
import { commands, server } from "vitest/browser";

import type { Locator } from "vitest/browser";

const decode = async (base64: string) => {
  const bitmap = await createImageBitmap(
    await (await fetch(`data:image/png;base64,${base64}`)).blob(),
  );
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");

  context?.drawImage(bitmap, 0, 0);

  return context?.getImageData(0, 0, bitmap.width, bitmap.height);
};

/**
 * Whether `toMatchScreenshot(name)` would pass: `target` draws the screenshot stored under `name` for
 * this test file, compared as Vitest compares them. A name with no stored screenshot matches nothing.
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
    decode(
      await target.screenshot({
        save: false,
        animations: "disabled",
        caret: "hide",
        scale: "device",
      }),
    ),
    decode(stored),
  ]);

  if (actual === undefined || expected === undefined) return false;

  if (actual.width !== expected.width || actual.height !== expected.height) return false;

  return diff(expected.data, actual.data, undefined, actual.width, actual.height) === 0;
}
