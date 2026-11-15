import { readFile } from "node:fs/promises";

import { expect, test } from "vitest";

import { generateEntry } from "./generate-entry.ts";

test("the committed root entry is exactly what the generator writes from the public subpaths", async () => {
  const committed = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");

  expect(committed).toBe(await generateEntry());
});
