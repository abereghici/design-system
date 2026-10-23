import "./preview.css";

import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import { definePreview } from "@storybook/react-vite";
import { useEffect } from "storybook/preview-api";

// Toolbar globals for the Theme contract (packages/tokens/README.md) and text direction.
// "system" leaves `data-theme` off, which means the System theme.
const themes = ["system", "light", "dark"] as const;
const directions = ["ltr", "rtl"] as const;

type Theme = (typeof themes)[number];
type Direction = (typeof directions)[number];

// The app sets `dir` (and `data-theme`, for a forced Theme) on <html> (spec #1, "The app sets
// `lang` and `dir` on <html>"), so the decorator writes them there, like @storybook/addon-themes'
// `withThemeByDataAttribute` (DEFAULT_ELEMENT_SELECTOR = 'html', set inside `useEffect` from
// 'storybook/preview-api'; code/addons/themes/src/decorators/data-attribute.decorator.tsx @ v10.6.3).
function applyDocumentGlobals(theme: Theme, dir: Direction) {
  const root = document.documentElement;
  if (theme === "system") {
    delete root.dataset["theme"];
  } else {
    root.dataset["theme"] = theme;
  }
  root.dir = dir;
}

// CSF Next preview (https://storybook.js.org/docs/api/csf/csf-next): addons listed here make
// their annotation types available to every story.
export default definePreview({
  addons: [addonDocs(), addonA11y()],
  // "If a CSF file contains at least one story tagged with `autodocs`, then a documentation page
  // will be generated" (https://storybook.js.org/docs/writing-docs/autodocs).
  tags: ["autodocs"],
  parameters: {
    // The addon's own default is 'todo' (code/addons/a11y/src/preview.tsx @ v10.6.3); 'error':
    // "violations return a failing test in the Storybook UI and CLI/CI"
    // (https://storybook.js.org/docs/writing-tests/accessibility-testing).
    a11y: { test: "error" },
  },
  // https://storybook.js.org/docs/essentials/toolbars-and-globals
  globalTypes: {
    theme: {
      description: "Theme (data-theme on <html>)",
      toolbar: { title: "Theme", icon: "contrast", items: [...themes], dynamicTitle: true },
    },
    dir: {
      description: "Text direction (dir on <html>)",
      toolbar: { title: "Direction", icon: "transfer", items: [...directions], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "system", dir: "ltr" },
  decorators: [
    (Story, { globals }) => {
      const theme = themes.find((value) => value === globals["theme"]) ?? "system";
      const dir = directions.find((value) => value === globals["dir"]) ?? "ltr";
      useEffect(() => {
        applyDocumentGlobals(theme, dir);
      }, [theme, dir]);
      return <Story />;
    },
  ],
});
