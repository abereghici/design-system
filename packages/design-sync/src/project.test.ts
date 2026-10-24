import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, expect, test } from "vitest";

// Playwright hands `evaluate` callbacks live DOM elements, which are mutable by nature.
/* oxlint-disable typescript/prefer-readonly-parameter-types */

import { findStories } from "./bundle.ts";
import { NAMESPACE, PATHS } from "./config.ts";
import { writeFrame } from "./frame.ts";
import { isObject, readJsonObject, type JsonObject } from "./json.ts";
import { buildProject, type BuiltProject } from "./project.ts";

let outDir: string;
let project: string;
let built: BuiltProject;
let browser: Browser;

beforeAll(async () => {
  outDir = await mkdtemp(path.join(tmpdir(), "design-sync-"));
  project = path.join(outDir, "project");
  [built, browser] = await Promise.all([buildProject(outDir), chromium.launch()]);
}, 120_000);

afterAll(async () => {
  await browser.close();
  await rm(outDir, { recursive: true, force: true });
});

const read = (file: string) => readFile(path.join(project, file), "utf8");

/** Opens a card in the frame and reports page errors and what rendered. */
async function render(card: string, theme = "light") {
  const frame = await writeFrame({ project, card, libraries: built.libraries, theme });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on("pageerror", ({ message }: Readonly<Error>) => errors.push(message));
  await page.goto(`file://${frame}`);
  await page
    .waitForFunction(() => document.querySelector("#root")?.childElementCount !== 0, undefined, {
      timeout: 5000,
    })
    .catch(() => null);
  return { page, errors };
}

const cardNames = () =>
  built.files.flatMap(
    (file) => /^components\/(?<card>[^\/]+)\/preview\.html$/v.exec(file)?.groups?.["card"] ?? [],
  );

test("every story file in @platform/ui becomes a card, with no list kept by hand", async () => {
  const stories = await findStories(PATHS.ui);
  // The Cover is the one hand-written preview.
  expect(cardNames().filter((name) => name !== "Cover")).toHaveLength(stories.length);
  expect(built.components).toEqual(["Button", "Icon", "Logo", "Provider"]);
  expect(cardNames()).toEqual(
    expect.arrayContaining(["FoundationsIcons", "FoundationsLogo", "Logo"]),
  );
});

test("every card renders on the bundled React 19 with no page error", async () => {
  const results = [];
  for (const card of cardNames()) {
    const { page, errors } = await render(card);
    const text = await page.locator("#root").innerText();
    const height = await page
      .locator("#root")
      .evaluate((root) => root.getBoundingClientRect().height);
    // A string is evaluated as an expression in the page.
    const version: unknown = await page.evaluate("window.React.version");
    await page.close();
    results.push({ card, errors, hasText: text.length > 0, hasHeight: height > 0, version });
  }
  expect(results).toEqual(
    cardNames().map((card) => ({
      card,
      errors: [],
      hasText: true,
      hasHeight: true,
      version: "19.3.1",
    })),
  );
});

// Expected colours are the token source's literals (as in button.stories.tsx): light
// accent-bold = palette-moss-900 #263316, dark accent-bold = palette-lichen-200 #eceac9.
test("previews take their colours from the tokens and follow the page's Theme", async () => {
  const colours = [];
  for (const theme of ["light", "dark"]) {
    const { page } = await render("Button", theme);
    const button = page.getByRole("button", { name: "Save changes" }).first();
    colours.push(await button.evaluate((element) => getComputedStyle(element).backgroundColor));
    await page.close();
  }
  expect(colours).toEqual(["rgb(38, 51, 22)", "rgb(236, 234, 201)"]);
});

test("a story's dir global applies to its canvas; the page's Theme applies to every story", async () => {
  const { page } = await render("Button", "light");
  // The last Button story is DarkRightToLeft (globals: { theme: "dark", dir: "rtl" }).
  const last = page.getByRole("button", { name: "Save changes" }).last();
  const [colour, rtl] = await last.evaluate((element) => [
    getComputedStyle(element).backgroundColor,
    element.matches(":dir(rtl)"),
  ]);
  await page.close();
  expect([colour, rtl]).toEqual(["rgb(38, 51, 22)", true]);
});

test("the bundle header names the namespace and the components", async () => {
  const [line] = (await read("components/bundle.js")).split("\n");
  expect(line).toBe(
    `/* @ds-bundle: {"format":4,"namespace":"${NAMESPACE}","components":[{"name":"Button"},{"name":"Icon"},{"name":"Logo"},{"name":"Provider"}]} */`,
  );
});

test("previews and READMEs follow the format: marker on line 1, summary first", async () => {
  expect((await read("components/Button/preview.html")).split("\n")[0]).toBe(
    '<!-- @dsCard group="Components" height=312 -->',
  );
  expect((await read("components/FoundationsIcons/preview.html")).split("\n")[0]).toMatch(
    /^<!-- @dsCard group="Foundations" height=\d+ page -->$/v,
  );
  const readme = await read("components/Logo/README.md");
  expect(readme).toMatch(/^# Logo\n\nStâlpul cerului, the Bereghici Logo/v);
  expect(readme).toContain('import { Logo } from "@platform/ui/logo";');
  expect(await read("components/index.d.ts")).toContain("export interface ButtonProps");
});

test("tokens, fonts, icons and the Logo are in the tree", async () => {
  const tokens = await readJsonObject(path.join(project, "tokens.json"));
  expect(colorCount(tokens)).toBeGreaterThan(100);
  expect((await read("tokens.css")).split("\n")[0]).toBe(
    "/* Bereghici Design System — generated from tokens.json */",
  );
  const files = new Set(built.files);
  expect(
    [
      "fonts/Figtree-latin.woff2",
      "fonts/NotoSerif-latin-ext.woff2",
      "assets/fonts/Figtree-OFL.txt",
      "assets/icons/search.svg",
      "assets/icons/README.md",
      "assets/logo/stalpul-cerului-moss.svg",
      "components/Cover/preview.html",
      "README.md",
    ].filter((file) => !files.has(file)),
  ).toEqual([]);
  expect(built.files.filter((file) => /^assets\/icons\/.+\.svg$/v.test(file))).toHaveLength(42);
});

const colorCount = (tokens: JsonObject) => {
  const color = tokens["color"];
  const list = isObject(color) ? color["tokens"] : undefined;
  return Array.isArray(list) ? list.length : 0;
};

// format.md's caps.
const CAPS: readonly (readonly [RegExp, number])[] = [
  [/^components\/bundle\.js$/v, 6 * 1024 ** 2],
  [/^components\/lib\/.+\.js$/v, 2 * 1024 ** 2],
  [/^components\/bundle\.css$/v, 2 * 1024 ** 2],
  [/^components\/index\.d\.ts$/v, 1.5 * 1024 ** 2],
  [/^components\/[^\/]+\/preview\.html$/v, 256 * 1024],
  [/^components\/[^\/]+\/README\.md$/v, 64 * 1024],
  [/^tokens\.json$/v, 512 * 1024],
  [/^README\.md$/v, 200 * 1024],
  [/^fonts\//v, 1024 ** 2],
];

/** The files over their cap. */
async function overCap(files: readonly string[]): Promise<string[]> {
  const over: string[] = [];
  for (const file of files) {
    const cap = CAPS.find(([pattern]) => pattern.test(file))?.[1] ?? Infinity;
    if ((await stat(path.join(project, file))).size > cap) over.push(file);
  }
  return over;
}

test("every file keeps within the type's caps, and none is a refused path", async () => {
  expect(await overCap(built.files)).toEqual([]);
  // format.md, Refused: "dot-prefixed segments … toolchain/agent manifests at any depth".
  const refused = /(?:^|\/)(?:\.|package\.json$|tsconfig\.json$|CLAUDE\.md$|AGENTS\.md$)/v;
  expect(built.files.filter((file) => refused.test(file))).toEqual([]);
});

/** The scripts holding `</script` or `<!--`. */
async function uninlinable(files: readonly string[]): Promise<string[]> {
  const bad: string[] = [];
  for (const file of files) if (/<\/script|<!--/iv.test(await read(file))) bad.push(file);
  return bad;
}

test("no script the artifact inlines holds a sequence format.md forbids", async () => {
  const scripts = built.files.filter((file) => file.endsWith(".js"));
  expect([scripts.length, await uninlinable(scripts)]).toEqual([3, []]);
});
