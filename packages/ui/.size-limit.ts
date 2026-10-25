/// <reference types="node" />
import { globSync } from "node:fs";

import type { SizeLimitConfig } from "size-limit";

const budgets: Readonly<Record<string, string>> = {
  alert: "2.25 kB",
  avatar: "1.6 kB",
  badge: "690 B",
  breadcrumbs: "1.7 kB",
  button: "2.5 kB",
  calendar: "24.5 kB",
  card: "1.3 kB",
  checkbox: "1.95 kB",
  "date-field": "25.6 kB",
  "date-picker": "30.4 kB",
  direction: "160 B",
  "drop-zone": "3.8 kB",
  combobox: "8.25 kB",
  "context-menu": "6.3 kB",
  "dropdown-menu": "5.9 kB",
  "empty-state": "880 B",
  "icon-button": "2.05 kB",
  events: "20 B",
  field: "2.5 kB",
  "file-trigger": "3 kB",
  fieldset: "380 B",
  form: "250 B",
  heading: "340 B",
  icon: "560 B",
  kbd: "1.75 kB",
  link: "760 B",
  logo: "470 B",
  "number-field": "6.25 kB",
  meter: "1.1 kB",
  navbar: "1.2 kB",
  pagination: "3.4 kB",
  progress: "1.1 kB",
  "scroll-area": "775 B",
  "password-field": "5.3 kB",
  popover: "4.45 kB",
  "radio-group": "2.35 kB",
  provider: "5.4 kB",
  select: "4.1 kB",
  separator: "700 B",
  skeleton: "630 B",
  sidebar: "1.8 kB",
  slider: "3.2 kB",
  "skip-link": "560 B",
  spinner: "740 B",
  switch: "1.75 kB",
  "status-dot": "490 B",
  table: "1.2 kB",
  tabs: "2.1 kB",
  "segmented-control": "2 kB",
  accordion: "2.05 kB",
  tag: "600 B",
  text: "520 B",
  toast: "275 B",
  toaster: "7.4 kB",
  toolbar: "830 B",
  tooltip: "2.5 kB",
  "text-area": "2.7 kB",
  "text-field": "2.7 kB",
  "visually-hidden": "580 B",
  dialog: "4.15 kB",
  "alert-dialog": "4.2 kB",
  sheet: "4.35 kB",
  command: "7.6 kB",
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
