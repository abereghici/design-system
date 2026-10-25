import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import { definePreview } from "@storybook/react-vite";
import addonPseudoStates from "storybook-addon-pseudo-states";
import { useEffect } from "storybook/preview-api";

import { Provider } from "@platform/ui/provider";

import { meaningfulControls } from "./docs/arg-types.ts";
import { transform } from "./docs/source.ts";
import { applyGlobals, directions, DocsContainer, DocsPage, mdx, themes } from "./globals.tsx";
import { rememberStoryCanvas } from "./screenshots/canvas.ts";

export { partsOf } from "./docs/arg-types.ts";

export default definePreview({
  addons: [addonDocs(), addonA11y(), addonPseudoStates()],
  tags: ["autodocs", "screenshot"],
  beforeEach: rememberStoryCanvas,
  argTypesEnhancers: [meaningfulControls],
  parameters: {
    a11y: {
      test: "error",
      // axe reads -webkit-text-fill-color, which forced colors leave unforced, so it compares the
      // authored text color with the forced background. The user's palette owns contrast there.
      config: {
        rules: [{ id: "color-contrast", enabled: !matchMedia("(forced-colors: active)").matches }],
      },
    },
    docs: {
      container: DocsContainer,
      page: DocsPage,
      source: { type: "dynamic", transform },
      toc: true,
      ...mdx,
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Guides",
          [
            "Getting started",
            "Theming",
            "Styling and overrides",
            "Internationalization",
            "Right-to-left",
            "Contributing",
          ],
          "Foundations",
          [
            "Principles",
            "Tokens",
            "Color",
            "Typography",
            "Space and shape",
            "Elevation",
            "Motion",
            "Iconography",
            "Accessibility",
            "Brand",
          ],
          "Components",
        ],
        method: "alphabetical",
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
      useEffect(() => {
        applyGlobals(globals);
      }, [globals]);
      return (
        <Provider>
          <Story />
        </Provider>
      );
    },
  ],
});
