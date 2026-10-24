/// <reference types="node" />
import { globSync } from "node:fs";

import type { SizeLimitConfig } from "size-limit";

const budgets: Readonly<Record<string, string>> = {
  alert: "2.15 kB",
  avatar: "1.6 kB",
  badge: "690 B",
  button: "3.6 kB",
  card: "1.2 kB",
  "empty-state": "740 B",
  "icon-button": "3.2 kB",
  events: "20 B",
  heading: "340 B",
  icon: "520 B",
  kbd: "2.95 kB",
  link: "1.95 kB",
  logo: "470 B",
  meter: "1.1 kB",
  progress: "1.1 kB",
  provider: "5.4 kB",
  separator: "700 B",
  skeleton: "630 B",
  "skip-link": "680 B",
  spinner: "880 B",
  "status-dot": "490 B",
  tag: "600 B",
  text: "520 B",
  "visually-hidden": "1.75 kB",
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
  ...checks(
    "src/icon/icons/*.tsx",
    (path) => path.slice("src/icon/".length, -".tsx".length),
    "680 B",
  ),
  ...checks(
    "src/provider/locales/*.ts",
    (path) => path.slice("src/provider/".length, -".ts".length),
    "340 B",
  ),
] satisfies SizeLimitConfig;
