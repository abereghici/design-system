import { existsSync } from "node:fs";
import { glob, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";

import type { Plugin } from "vite";

import { buildIife } from "./iife.ts";
import { reactGlobals } from "./react-globals.ts";

const require = createRequire(import.meta.url);
const runtimeDir = path.join(import.meta.dirname, "runtime");

/** A story file and the public entry (`index.ts`) beside it, when its directory has one. */
export interface StorySource {
  readonly stories: string;
  readonly entry: string | undefined;
}

/** What the bundle tells about each card, read back by running it (see `readCatalog`). */
export interface CardInfo {
  readonly name: string;
  readonly group: string;
  readonly page: boolean;
  readonly stories: readonly string[];
}

export interface PreviewBundle {
  /** `components/bundle.js`, with the `@ds-bundle` header on line 1. */
  readonly js: string;
  /** `components/bundle.css`. */
  readonly css: string;
  /** Every card, components first, each group in name order. */
  readonly cards: readonly CardInfo[];
}

/**
 * Every story file under `uiDir/src`, in path order. A later phase's component is picked up
 * because it has a story file; nothing is listed by hand.
 */
export async function findStories(uiDir: string): Promise<StorySource[]> {
  const files: string[] = [];
  for await (const file of glob("src/**/*.stories.tsx", { cwd: uiDir })) files.push(file);
  return files.toSorted().map((file) => {
    const stories = path.join(uiDir, file);
    const entry = path.join(path.dirname(stories), "index.ts");
    return { stories, entry: existsSync(entry) ? entry : undefined };
  });
}

const EXPORT_CONST = /^export const (?<name>\w+)\b/gmv;

/** A story file's exported names in source order, which a module namespace object loses. */
export function exportOrder(source: string): string[] {
  const names: string[] = [];
  for (const match of source.matchAll(EXPORT_CONST)) names.push(match.groups?.["name"] ?? "");
  return names;
}

/** The entry module: imports each story file and public entry, and assigns `window.<namespace>`. */
export async function entrySource(
  uiDir: string,
  sources: readonly StorySource[],
  namespace: string,
) {
  const spec = JSON.stringify;
  const entries = sources.flatMap(({ entry }) => (entry === undefined ? [] : [entry]));
  const orders = await Promise.all(
    sources.map(async ({ stories }) => exportOrder(await readFile(stories, "utf8"))),
  );
  // Each story file with the public entry of its own directory (`{}` when it has none).
  const files = sources.map(({ entry }, index) => {
    const own = entry === undefined ? "{}" : `entry${String(entries.indexOf(entry))}`;
    return `{ module: stories${String(index)}, order: ${spec(orders[index])}, entry: ${own} }`;
  });
  return [
    // The stylesheet Storybook stories run under: the layer order and @platform/tokens.
    `import ${spec(path.join(uiDir, "src", "provider", "provider.css"))};`,
    `import { CardPreview, collectCards } from ${spec(path.join(runtimeDir, "cards.tsx"))};`,
    ...entries.map((file, index) => `import * as entry${index} from ${spec(file)};`),
    ...sources.map(({ stories }, index) => `import * as stories${index} from ${spec(stories)};`),
    `const components = Object.fromEntries([${entries.map((_, index) => `entry${index}`).join(", ")}]`,
    `  .flatMap((module) => Object.entries(module)).filter(([name]) => /^[A-Z]/v.test(name)));`,
    `const cards = collectCards([${files.join(", ")}]);`,
    `window[${spec(namespace)}] = { ...components, cards, renderCard: CardPreview };`,
  ].join("\n");
}

/** Story files import Storybook; the bundle gets the stub instead (src/runtime/storybook.ts). */
function storybookStub(): Plugin {
  const stub = path.join(runtimeDir, "storybook.ts");
  return {
    name: "design-sync:storybook-stub",
    enforce: "pre",
    resolveId: (source) =>
      source === "#.storybook/preview" || /^(?:@storybook\/|storybook(?:\/|$))/v.test(source)
        ? stub
        : undefined,
  };
}

/**
 * Leaves `@platform/tokens/fonts.css` out of bundle.css. The page's tokens.css already declares
 * the faces with `fonts/` URLs, and library mode inlined every woff2 as a data URI (700 kB of
 * bundle.css, observed). An alias, because a CSS `@import` is not resolved through plugin
 * `resolveId` hooks (a hook was tried and did not apply).
 */
function withoutFonts(): Plugin {
  const empty = path.join(runtimeDir, "no-fonts.css");
  return {
    name: "design-sync:without-fonts",
    config: () => ({
      resolve: { alias: [{ find: /^@platform\/tokens\/fonts\.css$/v, replacement: empty }] },
    }),
  };
}

/** Runs the bundle in a Node context with React, and reads the cards it registered. */
export function readCatalog(js: string, namespace: string): CardInfo[] {
  const context: Record<string, unknown> = { React: require("react"), console };
  context["window"] = context;
  context["globalThis"] = context;
  try {
    vm.runInNewContext(js, context);
  } catch (error) {
    // Rethrown without the bundle source, which Node would print as the failing line.
    throw new Error(`Running the preview bundle failed: ${String(error)}`, { cause: error });
  }
  const exported: unknown = context[namespace];
  const cards: unknown =
    typeof exported === "object" && exported !== null ? Reflect.get(exported, "cards") : undefined;
  if (typeof cards !== "object" || cards === null) {
    throw new Error(`The bundle assigned no window.${namespace}.cards`);
  }
  return Object.values(cards)
    .filter((value) => isCardInfo(value))
    .map(({ name, group, page, stories }): CardInfo => ({ name, group, page, stories }))
    .toSorted(byKindThenName);
}

const isCardInfo = (value: unknown): value is CardInfo =>
  typeof value === "object" &&
  value !== null &&
  typeof Reflect.get(value, "name") === "string" &&
  typeof Reflect.get(value, "group") === "string" &&
  typeof Reflect.get(value, "page") === "boolean" &&
  Array.isArray(Reflect.get(value, "stories"));

/** Components first, then pages, each in name order. */
const byKindThenName = (a: CardInfo, b: CardInfo) =>
  Number(a.page) - Number(b.page) || a.name.localeCompare(b.name);

const FORBIDDEN = /<\/script|<!--/iv;

/** Throws when a script the artifact inlines holds `</script` or `<!--` (format.md forbids both). */
export function assertInlinable(file: string, text: string) {
  if (FORBIDDEN.test(text)) throw new Error(`${file} holds a literal "</script" or "<!--"`);
}

/** Builds `components/bundle.js` and `bundle.css` from every story file of `uiDir`. */
export async function buildPreviewBundle({
  uiDir,
  namespace,
}: Readonly<{ uiDir: string; namespace: string }>): Promise<PreviewBundle> {
  const sources = await findStories(uiDir);
  const { js, css } = await buildIife({
    root: uiDir,
    source: await entrySource(uiDir, sources, namespace),
    plugins: [storybookStub(), withoutFonts(), reactGlobals()],
    shimMissingExports: true,
  });
  const cards = readCatalog(js, namespace);
  const components = cards.filter(({ page }) => !page).map(({ name }) => ({ name }));
  const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace, components })} */\n`;
  assertInlinable("components/bundle.js", js);
  return { js: header + js, css, cards };
}
