// Size budgets per public subpath, run by `pnpm size` (size-limit 14.3.0 with the esbuild and file
// plugins). The checks are generated from the same convention as `exports` in package.json, so a
// new component or icon is measured without editing this file; only its budget is added below.
//
// size-limit README (https://github.com/ai/size-limit, 14.3.0):
// - "`.size-limit.ts`" is a supported config file; "**path**: relative paths to files".
// - "**import**: partial import to test tree-shaking. It could be … `*` to test all exports".
// - "**ignore**: an array of files and dependencies to exclude from the project size calculation."
// - "**limit**: size or time limit … Format: `100 B`, `10 kB`".
// - "`@size-limit/file` checks the size of files with Brotli (default)".
// - "`@size-limit/esbuild` is like `webpack` plugin, but uses `esbuild`". The rolldown plugin of
//   preset-small-lib "does not bundle CSS", so esbuild is used: it bundles each CSS Module into the
//   measured output, and the file plugin sums every output file (JS + CSS).
/// <reference types="node" />
import { globSync } from "node:fs";

import type { SizeLimitConfig } from "size-limit";

/**
 * Brotli budget of each component subpath, React excluded. Set to the measured size plus about
 * 10%, rounded up, so a real regression fails `pnpm size`. Raise one only on purpose, in the same
 * change that grows the component.
 */
const budgets: Readonly<Record<string, `${number} B` | `${number} kB`>> = {
  button: "800 B",
  events: "20 B",
  icon: "520 B",
  logo: "470 B",
  provider: "5.4 kB",
};

/** Brotli budget of any one icon (`src/icons/<name>.tsx`), Icon itself included. Icons are
 * generated, so one value: the largest measured (`sun`, 612 B) plus about 10%. */
const iconBudget = "680 B";

const localeBudget = "120 B";

// React is a peer dependency: apps pay for it once, so it is not part of any subpath's cost.
const ignore = ["react", "react-dom", "*.woff2"];

const cwd = import.meta.dirname;

const components = globSync("src/*/index.ts", { cwd }).map((path) => {
  const name = path.split("/")[1] ?? path;
  const limit = budgets[name];
  if (limit === undefined) {
    throw new Error(`No size budget for @platform/ui/${name}: add one to .size-limit.ts`);
  }
  return { name: `@platform/ui/${name}`, path, import: "*", ignore, limit };
});

const icons = globSync("src/icons/*.tsx", { cwd }).map((path) => ({
  name: `@platform/ui/icons/${path.slice("src/icons/".length, -".tsx".length)}`,
  path,
  import: "*",
  ignore,
  limit: iconBudget,
}));

const locales = globSync("src/locales/*.ts", { cwd }).map((path) => ({
  name: `@platform/ui/locales/${path.slice("src/locales/".length, -".ts".length)}`,
  path,
  import: "*",
  ignore,
  limit: localeBudget,
}));

export default [...components, ...icons, ...locales] satisfies SizeLimitConfig;
