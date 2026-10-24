import { Provider } from "@platform/ui/provider";
import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import { definePreview } from "@storybook/react-vite";
import { useEffect } from "storybook/preview-api";

import { DocsPage } from "./docs-page.tsx";
import { rememberStoryCanvas } from "./screenshots/canvas.ts";

const themes = ["system", "light", "dark"] as const;
const directions = ["ltr", "rtl"] as const;

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  tags: ["autodocs", "screenshot"],
  beforeEach: rememberStoryCanvas,
  parameters: {
    a11y: {
      test: "error",
      // axe reads -webkit-text-fill-color, which forced colors leave unforced, so it compares the
      // authored text color with the forced background. The user's palette owns contrast there.
      config: {
        rules: [{ id: "color-contrast", enabled: !matchMedia("(forced-colors: active)").matches }],
      },
    },
    docs: { page: DocsPage, source: { type: "dynamic" } },
    options: {
      storySort: {
        order: [
          "Foundations",
          [
            "Principles",
            "Color",
            "Type",
            "Space",
            "Radius",
            "Elevation",
            "Material",
            "Motion",
            "Personality",
            "Logo",
            "Iconography",
            "Accessibility",
            "Base stylesheet",
          ],
          "Components",
        ],
      },
    },
  },
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
        const root = document.documentElement;
        if (theme === "system") delete root.dataset["theme"];
        else root.dataset["theme"] = theme;
        root.dir = dir;
      }, [theme, dir]);
      return (
        <Provider>
          <Story />
        </Provider>
      );
    },
  ],
});
