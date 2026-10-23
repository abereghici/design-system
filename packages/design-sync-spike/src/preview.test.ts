import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, expect, test } from "vitest";

import { buildPreview, type Runtime } from "./build.ts";
import { framePreview } from "./frame.ts";

let browser: Browser;
const dirs: string[] = [];

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser.close();
  await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

async function renderProbe(runtime: Runtime) {
  const outDir = await mkdtemp(path.join(tmpdir(), "design-sync-spike-"));
  dirs.push(outDir);
  const { libraries } = await buildPreview({ outDir, runtime });

  const page = await browser.newPage();
  const errors: string[] = [];
  page.on("pageerror", ({ message }: Readonly<Error>) => errors.push(message));
  await page.setContent(await framePreview(outDir, "Probe", libraries), { waitUntil: "load" });
  const output = page.locator("output");
  const text = (await output.count()) > 0 ? await output.textContent() : null;
  await page.close();
  return { outDir, errors, text };
}

test("a preview renders on React 19 shipped under components/lib/", async () => {
  const { errors, text } = await renderProbe("react-19");

  expect(errors).toEqual([]);
  expect(text).toBe("Probe on React 19.3.1, ref as a prop reached <button>");
});

test("the same bundle fails on the type's default React 18, so the check above can fail", async () => {
  const { errors, text } = await renderProbe("react-18");

  expect(text).toBeNull();
  expect(errors.join("\n")).toMatch(/is not a function/v);
});

test("no script the artifact inlines holds a sequence format.md forbids", async () => {
  const { outDir } = await renderProbe("react-19");
  const files = [
    "project/components/lib/react.js",
    "project/components/lib/react-dom.js",
    "project/components/bundle.js",
  ];
  const sources = await Promise.all(files.map((file) => readFile(path.join(outDir, file), "utf8")));

  expect(sources.map((source) => /<\/script|<!--/iv.test(source))).toEqual([false, false, false]);
});

test("the index libraries entry lists React 19 with its global and file", async () => {
  const { outDir } = await renderProbe("react-19");
  const libraries: unknown = JSON.parse(
    await readFile(path.join(outDir, "libraries.json"), "utf8"),
  );

  expect(libraries).toEqual([
    {
      name: "react",
      version: "19.3.1",
      global: "React",
      file: "components/lib/react.js",
    },
    {
      name: "react-dom",
      version: "19.3.1",
      global: "ReactDOM",
      file: "components/lib/react-dom.js",
    },
  ]);
});
