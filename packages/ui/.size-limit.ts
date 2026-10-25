/// <reference types="node" />
import { globSync } from "node:fs";

import type { SizeLimitConfig } from "size-limit";

const budgets: Readonly<Record<string, string>> = {
  alert: "2.5 kB",
  avatar: "1.7 kB",
  badge: "920 B",
  breadcrumbs: "1.7 kB",
  button: "2.5 kB",
  calendar: "24.5 kB",
  card: "1.35 kB",
  checkbox: "2.1 kB",
  "date-field": "25.6 kB",
  "date-picker": "30.4 kB",
  direction: "160 B",
  "drop-zone": "3.8 kB",
  combobox: "8.25 kB",
  "context-menu": "6.3 kB",
  "dropdown-menu": "5.9 kB",
  "empty-state": "890 B",
  "icon-button": "2.05 kB",
  events: "20 B",
  field: "2.65 kB",
  "file-trigger": "3 kB",
  fieldset: "610 B",
  form: "250 B",
  heading: "580 B",
  icon: "770 B",
  kbd: "1.75 kB",
  link: "760 B",
  logo: "700 B",
  "number-field": "6.25 kB",
  meter: "1.25 kB",
  navbar: "1.2 kB",
  pagination: "3.4 kB",
  progress: "1.35 kB",
  "scroll-area": "775 B",
  "password-field": "5.3 kB",
  popover: "4.45 kB",
  "radio-group": "2.45 kB",
  "ui-provider": "5.4 kB",
  select: "4.3 kB",
  separator: "930 B",
  skeleton: "840 B",
  sidebar: "1.8 kB",
  slider: "3.25 kB",
  "skip-link": "740 B",
  spinner: "930 B",
  switch: "1.9 kB",
  "status-dot": "720 B",
  table: "1.4 kB",
  tabs: "2.2 kB",
  "segmented-control": "2.2 kB",
  accordion: "2.15 kB",
  tag: "830 B",
  text: "740 B",
  toast: "275 B",
  toaster: "7.4 kB",
  toolbar: "930 B",
  tooltip: "2.5 kB",
  "text-area": "2.85 kB",
  "text-field": "3 kB",
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
    "910 B",
  ),
  ...checks(
    "src/ui-provider/locales/*.ts",
    (path) => path.slice("src/ui-provider/".length, -".ts".length),
    "730 B",
  ),
] satisfies SizeLimitConfig;
