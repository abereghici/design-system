/// <reference types="node" />
import { globSync } from "node:fs";

import type { SizeLimitConfig } from "size-limit";

const budgets: Readonly<Record<string, string>> = {
  alert: "2.25 kB",
  avatar: "1.6 kB",
  badge: "690 B",
  breadcrumbs: "1.95 kB",
  button: "2.5 kB",
  card: "1.3 kB",
  checkbox: "2.55 kB",
  "empty-state": "880 B",
  "icon-button": "2.1 kB",
  events: "20 B",
  field: "2.3 kB",
  fieldset: "380 B",
  form: "250 B",
  heading: "340 B",
  icon: "560 B",
  kbd: "2.95 kB",
  link: "760 B",
  logo: "470 B",
  "number-field": "7.4 kB",
  meter: "1.1 kB",
  pagination: "3.55 kB",
  progress: "1.1 kB",
  "password-field": "6.5 kB",
  "radio-group": "2.9 kB",
  provider: "5.4 kB",
  select: "4.1 kB",
  separator: "700 B",
  skeleton: "630 B",
  slider: "4 kB",
  "skip-link": "770 B",
  spinner: "880 B",
  switch: "2.3 kB",
  "status-dot": "490 B",
  tag: "600 B",
  text: "520 B",
  "text-area": "2.7 kB",
  "text-field": "2.7 kB",
  "visually-hidden": "580 B",
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
    "440 B",
  ),
] satisfies SizeLimitConfig;
