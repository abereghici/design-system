/// <reference types="@vitest/browser-playwright" />
import { expect } from "vitest";
import { commands } from "vitest/browser";

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
 * Whether `target` draws exactly the pixels of the story's light screenshot, so another variant's
 * screenshot of it would only repeat that one. A story without a light screenshot yet draws its own.
 */
export async function sameAsLight(target: Locator, story: string) {
  const file = expect.getState().testPath?.split("/").at(-1) ?? "";
  const light = await commands
    .readFile(`__screenshots__/${file}/${story}-light-chromium-linux.png`, "base64")
    .catch(() => null);

  if (light === null) return false;

  const [drawn, stored] = await Promise.all([
    pixels(await target.screenshot({ save: false })),
    pixels(light),
  ]);

  return (
    drawn?.length === stored?.length && drawn?.every((value, at) => value === stored?.[at]) === true
  );
}
