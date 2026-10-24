import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/manager-api";

import type { Globals } from "storybook/internal/types";

import { themes } from "./theme.ts";

const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const resolve = (theme?: unknown) =>
  theme === "light" || theme === "dark" ? theme : prefersDark.matches ? "dark" : "light";

addons.setConfig({ theme: themes[resolve()] });

addons.register("platform/theme", (api) => {
  let theme: unknown;
  const apply = () => {
    document.documentElement.style.colorScheme =
      theme === "light" || theme === "dark" ? theme : "light dark";
    api.setOptions({ theme: themes[resolve(theme)] });
  };
  const follow = ({ globals }: { globals: Globals }) => {
    theme = globals["theme"];
    apply();
  };
  api.on(SET_GLOBALS, follow);
  api.on(GLOBALS_UPDATED, follow);
  prefersDark.addEventListener("change", apply);
});
