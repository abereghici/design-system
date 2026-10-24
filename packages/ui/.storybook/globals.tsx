import { useSyncExternalStore } from "react";
import { DocsContainer as BaseDocsContainer } from "@storybook/addon-docs/blocks";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

import type { DocsContainerProps } from "@storybook/addon-docs/blocks";
import type { Globals } from "storybook/internal/types";

import { themes as storybookThemes } from "./theme.ts";

export const themes = ["system", "light", "dark"] as const;
export const directions = ["ltr", "rtl"] as const;

const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set<() => void>();
let theme: (typeof themes)[number] = "system";

/** Applies the Theme and Direction globals to `<html>`, for the canvas and every docs page. */
export function applyGlobals(globals: Globals) {
  theme = themes.find((value) => value === globals["theme"]) ?? "system";
  const root = document.documentElement;
  if (theme === "system") delete root.dataset["theme"];
  else root.dataset["theme"] = theme;
  root.dir = directions.find((value) => value === globals["dir"]) ?? "ltr";
  for (const listener of listeners) listener();
}

const follow = ({ globals }: { globals: Globals }) => {
  applyGlobals(globals);
};
addons.getChannel().on(SET_GLOBALS, follow);
addons.getChannel().on(GLOBALS_UPDATED, follow);

function subscribe(listener: () => void) {
  listeners.add(listener);
  prefersDark.addEventListener("change", listener);
  return () => {
    listeners.delete(listener);
    prefersDark.removeEventListener("change", listener);
  };
}

const scheme = () => (theme === "system" ? (prefersDark.matches ? "dark" : "light") : theme);

export function DocsContainer(props: DocsContainerProps) {
  return (
    <BaseDocsContainer
      {...props}
      theme={storybookThemes[useSyncExternalStore(subscribe, scheme)]}
    />
  );
}
