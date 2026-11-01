import { expect, test } from "vitest";

import { getTextDirection } from "@abereghici/ui/text-direction";

test.each([
  ["ar", "rtl"],
  ["he-IL", "rtl"],
  ["fa-IR", "rtl"],
  ["en-US", "ltr"],
  ["ro-RO", "ltr"],
  ["ja", "ltr"],
] as const)("getTextDirection(%s) is %s", (locale, direction) => {
  expect(getTextDirection(locale)).toBe(direction);
});

test("an invalid tag reads left to right instead of throwing", () => {
  expect(getTextDirection("not a tag")).toBe("ltr");
});
