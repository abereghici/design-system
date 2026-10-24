import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

/**
 * Emits `uiDir`'s declarations into `outDir` with the pinned TypeScript (`tsc --declaration
 * --emitDeclarationOnly`). JSDoc comments are kept, so the declarations carry each component's
 * summary and its props' docs.
 */
export function emitDeclarations(uiDir: string, outDir: string): void {
  const tsc = path.join(path.dirname(require.resolve("typescript/package.json")), "bin", "tsc");
  execFileSync(
    process.execPath,
    [
      tsc,
      "-p",
      path.join(uiDir, "tsconfig.json"),
      "--noEmit",
      "false",
      "--declaration",
      "--emitDeclarationOnly",
      "--outDir",
      outDir,
    ],
    { cwd: uiDir },
  );
}

const RE_EXPORT =
  /^export (?:type )?(?:\{[^\}]*\}|\* as (?<namespace>\w+)) from "(?<from>\.[^"]+)";$/gmv;
const IMPORT_LINE = /^import [^;]+;\n/gmv;
const RELATIVE_IMPORT = /from "\.{1,2}\//v;

/**
 * One public entry's declarations as a single block: the modules its `index.d.ts` re-exports,
 * inlined. `export * as X from "./parts"` becomes `export declare namespace X { … }`. Package
 * imports are returned apart, so the caller can hoist them once. Documentation only: format.md
 * says `index.d.ts` is "documentation, not type-checked".
 */
export async function entryDeclarations(entryDts: string) {
  const index = await readFile(entryDts, "utf8");
  const imports = new Set<string>();
  const seen = new Set<string>();
  const blocks: string[] = [];
  for (const match of index.matchAll(RE_EXPORT)) {
    const from = match.groups?.["from"] ?? "";
    const file = path.join(path.dirname(entryDts), from.replace(/\.tsx?$/v, "") + ".d.ts");
    const namespace = match.groups?.["namespace"];
    if (namespace === undefined && seen.has(file)) continue;
    seen.add(file);
    const source = await readFile(file, "utf8");
    for (const line of source.match(IMPORT_LINE) ?? []) {
      if (!RELATIVE_IMPORT.test(line)) imports.add(line.trim());
    }
    const body = source
      .replaceAll(IMPORT_LINE, "")
      .replaceAll(/^export \{\};\n/gmv, "")
      .trim();
    blocks.push(
      namespace === undefined
        ? body
        : `export declare namespace ${namespace} {\n${body.replaceAll(/^export declare /gmv, "export ")}\n}`,
    );
  }
  return { imports: [...imports], body: blocks.join("\n\n") };
}

/**
 * The first sentence of the JSDoc right above `export declare function <name>`: the component's
 * summary, which the artifact takes from its README's first sentence (format.md).
 */
export function summaryOf(declarations: string, name: string): string | undefined {
  const doc = new RegExp(
    String.raw`/\*\*(?<doc>(?:(?!\*/)[\s\S])*)\*/\s*export (?:declare )?(?:function|const) ${name}\b`,
    "v",
  ).exec(declarations)?.groups?.["doc"];
  if (doc === undefined) return undefined;
  const text = doc
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/v, "").trim())
    .filter((line) => !line.startsWith("@"))
    .join(" ")
    .trim();
  return text === "" ? undefined : text;
}
