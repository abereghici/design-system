import { existsSync, globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const ui = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(ui, path), "utf8");
const files = (pattern: string) => globSync(pattern, { cwd: ui });
const captures = (text: string, regex: RegExp) =>
  [...text.matchAll(regex)].map(([, match = ""]) => match);

const pages = files(".storybook/docs/**/*.mdx");
const tokensCss = read("../tokens/dist/tokens.css");
const sheets = [tokensCss, ...files("../tokens/dist/components/*.css").map((file) => read(file))];
const tokens = sheets.flatMap((css) => captures(css, /--(ab-[\w\-]+):/gv));
const conditions = new Set(sheets.flatMap((css) => captures(css, /@media (.+) \{/gv)));

// Words that begin a token name after `ab-`, and so mark a code span as a token reference.
const families =
  /^(?:color|palette|surface|background|text|icon|border|backdrop|material|brand|space|size|radius|type|motion|elevation|z-index|layout|dimension|font|line|stroke|opacity|focus|breakpoint|shadow)-/v;

// CSS properties the pages name, which share a first word with token families.
const cssProperties = new Set(["font-size", "line-height", "color-scheme"]);

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
  const text = read(page);
  const prose = text.replaceAll(/```[\s\S]*?```/gv, "");

  return [
    ...captures(prose, /`([^`\s]+)`/gv),
    ...[...text.matchAll(/--ab-[\w\-]*\w(?:-\*)?/gv)].map(([match]) => match),
    ...captures(text, /\bof="([^"]+)"/gv),
  ]
    .filter((name) => !name.includes("${") && !cssProperties.has(name))
    .filter((name) => families.test(name.replace(/^--ab-|^ab-/v, "")));
}

const unknownTokens = (page: string) =>
  referencesIn(page).filter((name) => !tokens.some((token) => referencePattern(name).test(token)));

const docsIds = [
  ...pages.map((page) => captures(read(page), /<Meta title="([^"]+)"/gv)[0] ?? page),
  ...files("src/*/*.stories.tsx").map(
    (story) => captures(read(story), /title: "([^"]+)"/gv)[0] ?? story,
  ),
].map((title) => `${title.toLowerCase().replaceAll(/[^a-z0-9]+/gv, "-")}--docs`);

/** Named imports from `@abereghici/ui/*` that no module exports. */
function brokenImports(page: string) {
  return [
    ...read(page).matchAll(/import \{([^\}]+)\} from "@abereghici\/ui\/([\w\/\-]+)"/gv),
  ].flatMap(([, names = "", path = ""]) => {
    const file = path.startsWith("icons/") ? `src/icon/${path}.tsx` : `src/${path}/index.ts`;
    const source = existsSync(resolve(ui, file)) ? read(file) : "";

    return names
      .split(",")
      .map((name) => name.trim())
      .filter((name) => !new RegExp(String.raw`\b${name}\b`, "v").test(source))
      .map((name) => `${name} from ${path}`);
  });
}

/** The components whose stylesheets match, by file name. */
const usingCss = (pattern: string, regex: RegExp) =>
  [
    ...new Set(
      files(pattern)
        .filter((file) => regex.test(read(file)))
        .map(
          (file) =>
            file
              .split("/")
              .at(-1)
              ?.replace(/(?:\.module)?\.css$/v, "") ?? file,
        ),
    ),
  ].toSorted((a, b) => a.localeCompare(b));

const tokenValue = (name: string) => new RegExp(`--${name}: ([^;]+);`, "v").exec(tokensCss)?.[1];

const curved = (file: string) => {
  const source = read(file);

  return (
    /<(?:circle|ellipse|rect)\b/v.test(source) ||
    captures(source, /\bd="([^"]+)"/gv).some((path) => /[AaCcQqSsTt]/v.test(path))
  );
};

const unknownQueries = (page: string) =>
  captures(read(page), /\bwhen="([^"]+)"/gv).filter((when) => !conditions.has(when));

const deadLinks = (page: string) =>
  captures(read(page), /\?path=\/docs\/([\w\-]+)/gv).filter((id) => !docsIds.includes(id));

describe.each(pages)("%s", (page) => {
  test("names only tokens that exist", () => {
    expect(unknownTokens(page)).toEqual([]);
  });

  test("names only media queries the tokens use", () => {
    expect(unknownQueries(page)).toEqual([]);
  });

  test("links only to pages that exist", () => {
    expect(deadLinks(page)).toEqual([]);
  });

  test("imports only what the package exports", () => {
    expect(brokenImports(page)).toEqual([]);
  });
});

describe("claims the docs make about the code", () => {
  test("only Spinner, Progress and Skeleton loop (Accessibility)", () => {
    expect(usingCss("src/*/*.css", /\binfinite\b/v)).toEqual(["progress", "skeleton", "spinner"]);
  });

  test("only the selections and the toast use springs (Motion)", () => {
    expect(usingCss("../tokens/dist/components/*.css", /--ab-motion-easing-spring/v)).toEqual([
      "radio-group",
      "segmented-control",
      "switch",
      "tabs",
      "toast",
    ]);
  });

  test("every font size is in rem (Accessibility, Typography)", () => {
    const sizes = captures(tokensCss, /--ab-font-size-[\w\-]+: ([^;]+);/gv);
    const remOnly = /^(?:[\d.]+rem|clamp\([\d.]+rem, .+, [\d.]+rem\))$/v;

    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.filter((value) => !remOnly.test(value))).toEqual([]);
  });

  test("the base styles ring every :focus-visible element (Accessibility)", () => {
    expect(read("src/ui-provider/base.css")).toMatch(
      /:focus-visible \{\s*outline: var\(--ab-focus-ring-width\) solid var\(--ab-color-border-focused\);/v,
    );
  });

  test("the smallest control is the minimum target size (Accessibility)", () => {
    expect(tokenValue("ab-size-control-xs")).toBe(tokenValue("ab-size-target-min"));
  });

  test("icons are straight strokes, with no curves or circles (Iconography)", () => {
    const icons = files("src/icon/icons/*.tsx");

    expect(icons.length).toBeGreaterThan(0);
    expect(icons.filter((file) => curved(file))).toEqual([]);
  });
});
