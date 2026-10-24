import { expect, test } from "vitest";

import { getDirection } from "@platform/ui/direction";

test.each([
  ["ar", "rtl"],
  ["he-IL", "rtl"],
  ["fa-IR", "rtl"],
  ["en-US", "ltr"],
  ["ro-RO", "ltr"],
  ["ja", "ltr"],
] as const)("getDirection(%s) is %s", (locale, direction) => {
  expect(getDirection(locale)).toBe(direction);
});

test("an invalid tag reads left to right instead of throwing", () => {
  expect(getDirection("not a tag")).toBe("ltr");
});
