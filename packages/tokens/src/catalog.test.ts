import { expect, test } from "vitest";

import { buildTokens, SOURCE_GLOB } from "./build.ts";

const built = await buildTokens({ source: [SOURCE_GLOB] });
const sheets = [built.css, ...Object.values(built.components)].join("\n");
const byName = (a: string, b: string) => a.localeCompare(b);

test("lists every token the stylesheets declare, once", () => {
  const declared = new Set(sheets.match(/(?<=^ {4}--)ab-[\w\-]+(?=:)/gmv));

  expect(built.catalog.map(({ name }) => name).toSorted(byName)).toEqual(
    [...declared].toSorted(byName),
  );
});

test("gives each token the value and media overrides the stylesheets declare", () => {
  const mismatched = built.catalog.flatMap(({ name, value, conditions }) =>
    [value, ...conditions.map((condition) => condition.value)]
      .filter((declared) => !sheets.includes(`--${name}: ${declared};`))
      .map((declared) => `${name}: ${declared}`),
  );

  expect(mismatched).toEqual([]);
});

test("files a component token under its component and every other token under a family", () => {
  expect(built.catalog.find(({ name }) => name === "ab-button-gap")).toMatchObject({
    tier: "component",
    group: "button",
  });
  expect(built.catalog.find(({ name }) => name === "ab-color-text-subtle")).toMatchObject({
    tier: "semantic",
    group: "Color",
    type: "color",
  });
});
