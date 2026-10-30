import { existsSync, globSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

import { describe, expect, test } from "vitest";

import { catalog } from "@abereghici/tokens/catalog";

const ui = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(ui, path), "utf8");
const files = (pattern: string) => globSync(pattern, { cwd: ui });
const captures = (text: string, regex: RegExp) =>
  [...text.matchAll(regex)].map(([, match = ""]) => match);
const sorted = (names: Iterable<string>) =>
  [...new Set(names)].toSorted((a, b) => a.localeCompare(b));

const pages = new Map(files(".storybook/docs/**/*.mdx").map((page) => [page, read(page)]));
const names = catalog.map(({ name }) => name);
const byName = new Map(catalog.map((token) => [token.name, token]));
const queries = new Set(catalog.flatMap(({ conditions }) => conditions.map(({ query }) => query)));

// The first word of every family's token names, with and without `color-`, as pages write them.
const families = new Set(
  catalog
    .filter(({ tier }) => tier !== "component")
    .flatMap(({ name }) => [name.split("-")[1], name.replace("ab-color-", "").split("-")[0]]),
);

// CSS properties the pages name, which share a first word with a token family.
const cssProperties = new Set(["font-size", "line-height", "color-scheme", "z-index"]);

/** A token name as the pages write it, with `*` and `{a, b}` placeholders, as a pattern. */
function referencePattern(reference: string) {
  const source = reference
    .replace(/^--(?:ab-)?|^ab-/v, "")
    .replaceAll("*", String.raw`[a-z0-9\-]+`)
    .replaceAll(/\{([^\}]+)\}/gv, (_, inner: string) =>
      inner.includes(",") ? `(?:${inner.split(/,\s*/v).join("|")})` : String.raw`[a-z0-9\-]+`,
    );

  return new RegExp(`^ab-(?:color-)?${source}$`, "v");
}

/** The token names a page mentions in prose code spans, in `--ab-*` text, and in `of` props. */
function referencesIn(page: string) {
  // A template such as `--ab-palette-${hue}-*` names any token in that place.
  const text = page.replaceAll(/\$\{[^\}]*\}/gv, "*");
  const prose = text.replaceAll(/```[\s\S]*?```/gv, "");

  return [
    ...captures(prose, /`([^`\s]+)`/gv),
    ...[...text.matchAll(/--ab-[\w\-]*\w(?:-\*)?/gv)].map(([match]) => match),
    ...captures(text, /\bof="([^"]+)"/gv),
  ].filter(
    (name) =>
      !cssProperties.has(name) &&
      name.includes("-") &&
      families.has(name.replace(/^--ab-|^ab-/v, "").split("-")[0]),
  );
}

const unknownTokens = (text: string) =>
  referencesIn(text).filter((reference) => {
    const pattern = referencePattern(reference);

    return !names.some((name) => pattern.test(name));
  });

const docsIds = new Set(
  [
    ...[...pages.values()].map((text) => captures(text, /<Meta title="([^"]+)"/gv)[0] ?? ""),
    ...files("src/*/*.stories.tsx").map(
      (story) => captures(read(story), /title: "([^"]+)"/gv)[0] ?? "",
    ),
  ].map((title) => `${title.toLowerCase().replaceAll(/[^a-z0-9]+/gv, "-")}--docs`),
);

/** Named imports from `@abereghici/ui/*` that no module exports. */
const brokenImports = (text: string) =>
  [...text.matchAll(/import \{([^\}]+)\} from "@abereghici\/ui\/([\w\/\-]+)"/gv)].flatMap(
    ([, imported = "", path = ""]) => {
      const file = path.startsWith("icons/") ? `src/icon/${path}.tsx` : `src/${path}/index.ts`;
      const source = existsSync(resolve(ui, file)) ? read(file) : "";

      return imported
        .split(",")
        .map((name) => name.trim())
        .filter((name) => !new RegExp(String.raw`\b${name}\b`, "v").test(source))
        .map((name) => `${name} from ${path}`);
    },
  );

const stem = (file: string) => basename(file).split(".")[0] ?? file;

const curved = (source: string) =>
  /<(?:circle|ellipse|rect)\b/v.test(source) ||
  captures(source, /\bd="([^"]+)"/gv).some((path) => /[AaCcQqSsTt]/v.test(path));

describe.each([...pages])("%s", (_, text) => {
  test("names only tokens that exist", () => {
    expect(unknownTokens(text)).toEqual([]);
  });

  test("names only media queries the tokens use", () => {
    expect(captures(text, /\bwhen="([^"]+)"/gv).filter((when) => !queries.has(when))).toEqual([]);
  });

  test("links only to pages that exist", () => {
    expect(captures(text, /\?path=\/docs\/([\w\-]+)/gv).filter((id) => !docsIds.has(id))).toEqual(
      [],
    );
  });

  test("imports only what the package exports", () => {
    expect(brokenImports(text)).toEqual([]);
  });
});

describe("claims the docs make about the code", () => {
  test("only Spinner, Progress and Skeleton loop (Accessibility)", () => {
    const looping = files("src/*/*.css").filter((file) => /\binfinite\b/v.test(read(file)));

    expect(sorted(looping.map((file) => stem(file)))).toEqual(["progress", "skeleton", "spinner"]);
  });

  test("only the selections and the toast use springs (Motion)", () => {
    const springy = catalog.filter(({ value, conditions }) =>
      [value, ...conditions.map((condition) => condition.value)].some((each) =>
        each.includes("--ab-motion-easing-spring"),
      ),
    );

    expect(sorted(springy.map(({ group }) => group))).toEqual([
      "radio-group",
      "segmented-control",
      "switch",
      "tabs",
      "toast",
    ]);
  });

  test("every font size is in rem (Accessibility, Typography)", () => {
    const sizes = catalog.filter(({ name }) => name.startsWith("ab-font-size-"));
    const remOnly = /^(?:[\d.]+rem|clamp\([\d.]+rem, .+, [\d.]+rem\))$/v;

    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.filter(({ value }) => !remOnly.test(value))).toEqual([]);
  });

  test("the base styles ring every :focus-visible element (Accessibility)", () => {
    expect(read("src/ui-provider/base.css")).toMatch(
      /:focus-visible \{\s*outline: var\(--ab-focus-ring-width\) solid var\(--ab-color-border-focused\);/v,
    );
  });

  test("the smallest control is the minimum target size (Accessibility)", () => {
    expect(byName.get("ab-size-control-xs")?.value).toBe(byName.get("ab-size-target-min")?.value);
  });

  test("icons are straight strokes, with no curves or circles (Iconography)", () => {
    const icons = files("src/icon/icons/*.tsx");

    expect(icons.length).toBeGreaterThan(0);
    expect(icons.filter((file) => curved(read(file)))).toEqual([]);
  });
});
