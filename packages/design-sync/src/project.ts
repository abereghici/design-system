import { cp, glob, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { assertInlinable, buildPreviewBundle, findStories, type CardInfo } from "./bundle.ts";
import { componentReadme, previewHtml } from "./cards.ts";
import { NAMESPACE, PATHS } from "./config.ts";
import { emitDeclarations, entryDeclarations, summaryOf } from "./declarations.ts";
import { isObject, readJsonObject } from "./json.ts";
import { buildLibraries, type Library } from "./libraries.ts";
import { compileTokensCss, type TokensJson } from "./tokens-css.ts";

export interface BuiltProject {
  /** Every file written, as its path under `project/`, sorted. */
  readonly files: readonly string[];
  /** The index's `libraries`. */
  readonly libraries: readonly Library[];
  /** The bundle's components, in header order. */
  readonly components: readonly string[];
}

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isLibrary = (value: unknown): value is Library =>
  isObject(value) &&
  ["name", "version", "global", "file"].every((key) => typeof value[key] === "string");

/** Whether a parsed `dist/build.json` is a `BuiltProject`. */
export const isBuiltProject = (value: unknown): value is BuiltProject =>
  isObject(value) &&
  isStringArray(value["files"]) &&
  isStringArray(value["components"]) &&
  Array.isArray(value["libraries"]) &&
  value["libraries"].every((library) => isLibrary(library));

interface Declared {
  readonly importPath: string;
  readonly imports: readonly string[];
  readonly body: string;
  readonly names: readonly string[];
}

/** Every file under `dir` matching `pattern`, as paths relative to `dir`. */
async function filesIn(dir: string, pattern: string): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of glob(pattern, { cwd: dir, withFileTypes: true })) {
    if (entry.isFile()) files.push(path.relative(dir, path.join(entry.parentPath, entry.name)));
  }
  return files.toSorted();
}

/** Copies every file matching `pattern` under `from` to `to`, keeping relative paths. */
async function copyFiles(from: string, pattern: string, to: string): Promise<void> {
  for (const file of await filesIn(from, pattern)) {
    await mkdir(path.dirname(path.join(to, file)), { recursive: true });
    await cp(path.join(from, file), path.join(to, file));
  }
}

async function writeIn(project: string, file: string, text: string): Promise<void> {
  await mkdir(path.dirname(path.join(project, file)), { recursive: true });
  await writeFile(path.join(project, file), text);
}

const isTokensJson = (value: unknown): value is TokensJson =>
  isObject(value) &&
  typeof value["name"] === "string" &&
  isObject(value["color"]) &&
  Array.isArray(value["color"]["themes"]) &&
  Array.isArray(value["color"]["tokens"]) &&
  isObject(value["type"]) &&
  Array.isArray(value["type"]["groups"]);

/** Hand-written files, tokens, fonts, icons and the Logo. */
async function writeFoundations(project: string): Promise<void> {
  // Hand-written files (brand book, cover, asset group READMEs), at their project paths.
  await copyFiles(PATHS.content, "**/*", project);
  const tokens = await readJsonObject(path.join(PATHS.tokens, "dist", "tokens.json"));
  if (!isTokensJson(tokens))
    throw new Error("@platform/tokens dist/tokens.json is not artifact-shaped");
  await writeIn(project, "tokens.json", `${JSON.stringify(tokens, undefined, 2)}\n`);
  const fontsCss = await readFile(path.join(PATHS.tokens, "dist", "fonts.css"), "utf8");
  // fonts.css sits in dist/ beside ../fonts/; tokens.css sits in project/ beside fonts/.
  await writeIn(
    project,
    "tokens.css",
    compileTokensCss(tokens, fontsCss.replaceAll('url("../fonts/', 'url("fonts/')),
  );
  await copyFiles(path.join(PATHS.tokens, "fonts"), "*.woff2", path.join(project, "fonts"));
  await copyFiles(
    path.join(PATHS.tokens, "fonts"),
    "*-OFL.txt",
    path.join(project, "assets", "fonts"),
  );
  await copyFiles(
    path.join(PATHS.ui, "assets", "icons"),
    "*.svg",
    path.join(project, "assets", "icons"),
  );
  await copyFiles(
    path.join(PATHS.ui, "assets", "logo"),
    "*.svg",
    path.join(project, "assets", "logo"),
  );
}

/** `components/lib/*.js`, `bundle.js` and `bundle.css`. */
async function writeScripts(project: string) {
  const [libraries, bundle] = await Promise.all([
    buildLibraries(PATHS.root),
    buildPreviewBundle({ uiDir: PATHS.ui, namespace: NAMESPACE }),
  ]);
  for (const library of libraries) {
    assertInlinable(library.file, library.code);
    await writeIn(project, library.file, library.code);
  }
  await writeIn(project, "components/bundle.js", bundle.js);
  await writeIn(project, "components/bundle.css", bundle.css);
  return {
    libraries: libraries.map(({ name, version, global, file }): Library => ({
      name,
      version,
      global,
      file,
    })),
    cards: bundle.cards,
  };
}

const EXPORTED = /^export (?:declare )?(?:function|const|namespace) (?<name>[A-Z]\w*)/gmv;

/** Each public entry with a story file, as declarations (from `tsc` output in `dts`). */
async function declaredEntries(dts: string): Promise<Declared[]> {
  const declared: Declared[] = [];
  for (const { entry } of await findStories(PATHS.ui)) {
    if (entry === undefined) continue;
    const relative = path.relative(PATHS.ui, entry).replace(/\.ts$/v, ".d.ts");
    const { imports, body } = await entryDeclarations(path.join(dts, relative));
    const names: string[] = [];
    for (const match of body.matchAll(EXPORTED)) names.push(match.groups?.["name"] ?? "");
    declared.push({
      importPath: `@platform/ui/${path.basename(path.dirname(entry))}`,
      imports,
      body,
      names,
    });
  }
  return declared;
}

/** `components/index.d.ts`, and each card's `preview.html` and (for components) `README.md`. */
async function writeCards(project: string, cards: readonly CardInfo[]): Promise<void> {
  const dts = await mkdtemp(path.join(tmpdir(), "design-sync-dts-"));
  try {
    emitDeclarations(PATHS.ui, dts);
    const declared = await declaredEntries(dts);
    const imports = [...new Set(declared.flatMap(({ imports: lines }) => lines))];
    const bodies = declared.map(({ importPath, body }) => `// ${importPath}\n${body}`);
    await writeIn(project, "components/index.d.ts", `${[...imports, "", ...bodies].join("\n")}\n`);
    for (const card of cards) {
      await writeIn(project, `components/${card.name}/preview.html`, previewHtml(card, NAMESPACE));
      if (card.page) continue;
      const source = declared.find(({ names }) => names.includes(card.name));
      const doc = source === undefined ? undefined : summaryOf(source.body, card.name);
      if (source === undefined || doc === undefined) {
        throw new Error(
          `${card.name}: add a JSDoc comment to its exported function; it becomes the artifact's summary`,
        );
      }
      const readme = componentReadme({ card, doc, importPath: source.importPath });
      await writeIn(project, `components/${card.name}/README.md`, readme);
    }
  } finally {
    await rm(dts, { recursive: true, force: true });
  }
}

/**
 * Writes the Design System artifact's `project/` tree to `<outDir>/project/`, from the built
 * `@platform/tokens` and the `@platform/ui` sources. Everything is derived: a component appears
 * because its directory has a story file and an `index.ts`. The index
 * (`project/design-system.json`) is not written here; `plan` merges it into the live one.
 */
export async function buildProject(outDir: string): Promise<BuiltProject> {
  const project = path.join(outDir, "project");
  await rm(outDir, { recursive: true, force: true });
  await mkdir(project, { recursive: true });
  await writeFoundations(project);
  const { libraries, cards } = await writeScripts(project);
  await writeCards(project, cards);
  return {
    files: await filesIn(project, "**/*"),
    libraries,
    components: cards.filter(({ page }) => !page).map(({ name }) => name),
  };
}
