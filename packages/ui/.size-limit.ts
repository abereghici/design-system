/// <reference types="node" />
import { globSync } from "node:fs";

import type { SizeLimitConfig } from "size-limit";

const budgets: Readonly<Record<string, string>> = {
  button: "800 B",
  events: "20 B",
  icon: "520 B",
  logo: "470 B",
  provider: "5.4 kB",
};

const checks = (pattern: string, subpath: (path: string) => string, limit?: string) =>
  globSync(pattern, { cwd: import.meta.dirname }).map((path) => {
    const name = subpath(path);
    const budget = limit ?? budgets[name];
    if (budget === undefined) throw new Error(`No size budget for @platform/ui/${name}`);
    return {
      name: `@platform/ui/${name}`,
      path,
      import: "*",
      ignore: ["react", "react-dom", "*.woff2"],
      limit: budget,
    };
  });

export default [
  ...checks("src/*/index.ts", (path) => path.split("/")[1] ?? path),
  ...checks("src/icons/*.tsx", (path) => path.slice("src/".length, -".tsx".length), "680 B"),
  ...checks("src/locales/*.ts", (path) => path.slice("src/".length, -".ts".length), "120 B"),
] satisfies SizeLimitConfig;
