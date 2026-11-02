/// <reference types="node" />
import { globSync } from "node:fs";
import { basename, dirname } from "node:path";

import type { SizeLimitConfig } from "size-limit";

const budgets: Readonly<Record<string, string>> = {
  alert: "3.3 kB",
  avatar: "1.8 kB",
  badge: "1.15 kB",
  breadcrumbs: "1.7 kB",
  button: "2.65 kB",
  calendar: "24.5 kB",
  card: "1.55 kB",
  checkbox: "2.15 kB",
  "date-field": "25.6 kB",
  "date-picker": "30.4 kB",
  "date-range-picker": "30.7 kB",
  "description-list": "850 B",
  disclosure: "2.25 kB",
  "drop-zone": "4.4 kB",
  combobox: "10.2 kB",
  "context-menu": "6.35 kB",
  "dropdown-menu": "5.9 kB",
  "empty-state": "1.1 kB",
  "icon-button": "2.05 kB",
  "feedback-event": "20 B",
  "text-direction": "160 B",
  field: "3.05 kB",
  "file-trigger": "3.75 kB",
  fieldset: "670 B",
  form: "250 B",
  grid: "850 B",
  heading: "650 B",
  icon: "860 B",
  inline: "850 B",
  kbd: "1.75 kB",
  link: "950 B",
  logo: "770 B",
  "number-field": "6.35 kB",
  meter: "1.45 kB",
  navbar: "1.35 kB",
  pagination: "3.4 kB",
  "otp-field": "3.95 kB",
  "page-layout": "1.3 kB",
  progress: "1.55 kB",
  "scroll-area": "950 B",
  "password-field": "5.25 kB",
  popover: "4.9 kB",
  "radio-group": "2.75 kB",
  "ui-provider": "5.4 kB",
  "search-field": "5.45 kB",
  select: "4.95 kB",
  separator: "1 kB",
  skeleton: "950 B",
  sidebar: "3.15 kB",
  slider: "3.7 kB",
  "skip-link": "810 B",
  spinner: "1.25 kB",
  stack: "900 B",
  switch: "1.95 kB",
  "status-dot": "790 B",
  stepper: "2.15 kB",
  splitter: "2.4 kB",
  table: "4.55 kB",
  tabs: "2.7 kB",
  "segmented-control": "2.5 kB",
  accordion: "2.7 kB",
  tag: "1.15 kB",
  "tag-group": "2.65 kB",
  text: "1.05 kB",
  toast: "275 B",
  toaster: "7.4 kB",
  "code-block": "1.15 kB",
  "copy-button": "2.95 kB",
  "contextual-help": "4.95 kB",
  "toggle-button": "1.9 kB",
  "toggle-button-group": "1.1 kB",
  toolbar: "1 kB",
  tooltip: "2.65 kB",
  tree: "4 kB",
  "time-field": "25.5 kB",
  "range-calendar": "24.5 kB",
  "text-area": "3.35 kB",
  "text-field": "3.5 kB",
  "visually-hidden": "800 B",
  dialog: "4.5 kB",
  "alert-dialog": "4.8 kB",
  sheet: "4.7 kB",
  command: "7.6 kB",
};

const checks = (pattern: string | string[], subpath: (path: string) => string, limit?: string) =>
  globSync(pattern, { cwd: import.meta.dirname }).map((path) => {
    const name = subpath(path);
    const budget = limit ?? budgets[name];

    if (budget === undefined) throw new Error(`No size budget for @abereghici/ui/${name}`);

    return {
      name: `@abereghici/ui/${name}`,
      path,
      import: "*",
      ignore: ["react", "react-dom", "*.woff2"],
      limit: budget,
    };
  });

export default [
  ...checks(["src/*/index.ts", "src/components/*/index.ts"], (path) => basename(dirname(path))),
  ...checks(
    "src/components/icon/icons/*.tsx",
    (path) => path.slice("src/components/icon/".length, -".tsx".length),
    "1.05 kB",
  ),
] satisfies SizeLimitConfig;
