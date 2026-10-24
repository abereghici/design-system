/// <reference types="node" />
import { globSync } from "node:fs";

import type { SizeLimitConfig } from "size-limit";

const budgets: Readonly<Record<string, string>> = {
  alert: "2.5 kB",
  avatar: "1.6 kB",
  badge: "690 B",
  breadcrumbs: "2 kB",
  button: "2.75 kB",
  calendar: "24.6 kB",
  card: "1.3 kB",
  checkbox: "2.55 kB",
  "date-field": "25.6 kB",
  "date-picker": "30.6 kB",
  "drop-zone": "2.4 kB",
  combobox: "8.7 kB",
  "context-menu": "6.3 kB",
  "dropdown-menu": "5.9 kB",
  "empty-state": "880 B",
  "icon-button": "2.3 kB",
  events: "20 B",
  field: "2.3 kB",
  "file-trigger": "1.5 kB",
  fieldset: "380 B",
  form: "250 B",
  heading: "340 B",
  icon: "560 B",
  kbd: "2.95 kB",
  link: "760 B",
  logo: "470 B",
  "number-field": "7.4 kB",
  meter: "1.1 kB",
  navbar: "1.2 kB",
  pagination: "3.55 kB",
  progress: "1.1 kB",
  "scroll-area": "775 B",
  "password-field": "6.5 kB",
  popover: "4.7 kB",
  "radio-group": "2.9 kB",
  provider: "5.4 kB",
  select: "4.1 kB",
  separator: "700 B",
  skeleton: "630 B",
  sidebar: "1.45 kB",
  slider: "4 kB",
  "skip-link": "900 B",
  spinner: "1.1 kB",
  switch: "2.3 kB",
  "status-dot": "490 B",
  table: "700 B",
  tabs: "1.8 kB",
  "segmented-control": "2 kB",
  accordion: "2.05 kB",
  tag: "600 B",
  text: "520 B",
  toast: "275 B",
  toaster: "7.6 kB",
  toolbar: "830 B",
  tooltip: "2.5 kB",
  "text-area": "2.7 kB",
  "text-field": "2.7 kB",
  "visually-hidden": "580 B",
  dialog: "4.35 kB",
  "alert-dialog": "4.2 kB",
  sheet: "4.6 kB",
  command: "7.8 kB",
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
    "730 B",
  ),
] satisfies SizeLimitConfig;
