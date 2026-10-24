import { build, type InlineConfig, type Plugin } from "vite";

// Vite's and Rolldown's hook parameters (plugins, logs, outputs) are their own mutable types.
/* oxlint-disable typescript/prefer-readonly-parameter-types */

export interface IifeOutput {
  readonly js: string;
  /** The extracted stylesheet, empty when the entry imports no CSS. */
  readonly css: string;
}

export interface IifeInput {
  /** The entry module's source, resolved from `root`. */
  readonly source: string;
  readonly root: string;
  readonly plugins?: readonly Plugin[];
  /** Rolldown's `shimMissingExports`: an import of a name the module lacks becomes `undefined`. */
  readonly shimMissingExports?: boolean;
}

const ENTRY = "virtual:design-sync-entry";

/** Warnings that are expected here: `'use client'` means nothing inside one classic script, and
 * test-only Storybook imports are shimmed on purpose. */
const EXPECTED = new Set(["MODULE_LEVEL_DIRECTIVE", "SHIMMED_EXPORT"]);

function entryPlugin(source: string): Plugin {
  return {
    name: "design-sync:entry",
    enforce: "pre",
    resolveId: (id) => (id.endsWith(ENTRY) ? `\0${ENTRY}` : undefined),
    load: (id) => (id === `\0${ENTRY}` ? source : undefined),
  };
}

function config({
  source,
  root,
  plugins = [],
  shimMissingExports = false,
}: IifeInput): InlineConfig {
  return {
    configFile: false,
    root,
    logLevel: "warn",
    plugins: [entryPlugin(source), ...plugins],
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      write: false,
      // No lowering. Vite's default target is "baseline-widely-available" (Chrome 111 and
      // peers), and its CSS minifier (Lightning CSS) then rewrote `light-dark()` into
      // `--lightningcss-light` fallbacks and cut the `@layer` order statement down to its first
      // name (both observed). ADR-0002: newly available features ship "without a fallback". The
      // CSS is left unminified, so bundle.css is the CSS the apps get, concatenated.
      target: "esnext",
      cssMinify: false,
      minify: true,
      sourcemap: false,
      copyPublicDir: false,
      // Assets a stylesheet references stay files: the frame loads fonts from tokens.css.
      assetsInlineLimit: 0,
      rolldownOptions: {
        shimMissingExports,
        onLog(level, log, handler) {
          if (level === "warn" && EXPECTED.has(log.code ?? "")) return;
          handler(level, log);
        },
      },
      lib: { entry: ENTRY, formats: ["iife"], name: "DesignSyncBundle", fileName: "bundle" },
    },
  };
}

/**
 * Bundles an entry into ONE minified classic script, the shape the artifact's
 * `components/lib/*.js` and `components/bundle.js` take ("Classic scripts"; "ONE classic script",
 * format.md). Vite library mode with the `iife` format.
 *
 * - `process.env.NODE_ENV` is defined, because library mode leaves `process.env.*` alone "so
 *   that consumers of your library can dynamically change it" (vite.dev/guide/build, Library Mode).
 * - The script has no `import`: everything not resolved by `plugins` is bundled in.
 */
export async function buildIife(input: IifeInput): Promise<IifeOutput> {
  const result = await build(config(input));
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) =>
    "output" in item ? item.output : [],
  );
  const js = outputs.find((item) => item.type === "chunk");
  if (js?.type !== "chunk") throw new Error("Vite produced no script");
  const css = outputs.flatMap((item) =>
    item.type === "asset" && item.fileName.endsWith(".css") ? [String(item.source)] : [],
  );
  return { js: js.code, css: css.join("\n") };
}
