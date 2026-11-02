import { readFileSync } from "node:fs";

import babel from "@rolldown/plugin-babel";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import { parseSync, transformSync } from "rolldown/utils";
import { defineConfig } from "tsdown";

import type { Plugin } from "rolldown";

const compiler = reactCompilerPreset({ panicThreshold: "all_errors" });

// Server Components render once per request, so memoizing them only adds code: compile client modules only, as
// reactCompilerPreset does in Vite, where it applies to the client environment alone.
compiler.rolldown = { ...compiler.rolldown, filter: { code: /^["']use client["']/v } };

const isReexport = (node: { type: string; source?: unknown }) =>
  (node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") &&
  Boolean(node.source);

// Linking modules rewrites `export { Root } from` into an import plus an export and `export * as Dialog from` into an
// object holding every part, which a consumer's bundler then can't tree-shake per part. So every relative import stays
// external, keeping one output file per source file, and re-export-only modules are emitted as written, minus types.
const preserveModules: Plugin = {
  name: "preserve-modules",
  resolveId(source, importer) {
    if (/\.[jt]sx?$/v.test(importer ?? "") && /^\.\.?\/.*\.[jt]sx?$/v.test(source)) {
      return { id: source.replace(/\.tsx?$/v, ".js"), external: true };
    }

    return null;
  },
  renderChunk(_code, chunk) {
    const id = chunk.facadeModuleId;

    if (id === null || chunk.fileName.endsWith(".d.ts") || !/\.tsx?$/v.test(id)) return null;

    const source = readFileSync(id, "utf8");

    if (!parseSync(id, source).program.body.every(isReexport)) return null;

    return transformSync(id, source).code.replaceAll(/(?<=from "\.\.?\/[^"]*)\.tsx?(?=")/gv, ".js");
  },
};

export default defineConfig({
  entry: ["src/**/*.{ts,tsx,js}", "!src/**/*.{stories,test,test-d}.{ts,tsx}", "!src/**/*.d.ts"],
  unbundle: true,
  platform: "neutral",
  dts: true,
  css: { inject: true },
  // Every file is its own output, so a "use client" directive is never merged away as this check warns.
  checks: { moduleLevelDirective: false },
  plugins: [preserveModules, babel({ presets: [compiler] })],
});
