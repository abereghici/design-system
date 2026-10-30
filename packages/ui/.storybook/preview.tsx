import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import { definePreview } from "@storybook/react-vite";

import { withGlobals } from "./decorators/with-globals.tsx";
import { meaningfulControls } from "./docs/arg-types.ts";
import { transform } from "./docs/source.ts";
import {
  densities,
  directions,
  DocsContainer,
  DocsPage,
  locales,
  mdx,
  themes,
} from "./globals.tsx";
import { snapshotStory } from "./test/snapshots.ts";

export { partsOf } from "./docs/arg-types.ts";

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  tags: ["autodocs", "screenshot"],
  afterEach: snapshotStory,
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
          ["Getting started", "Theming", "Styling", "Internationalization"],
          "Foundations",
          [
            "Design tokens",
            "Color",
            "Typography",
            "Space and shape",
            "Elevation",
            "Motion",
            "Iconography",
            "Accessibility",
          ],
          "Reference",
          ["Tokens", "Icons"],
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
    locale: {
      description: "Locale (lang on <html>, locale on UIProvider)",
      toolbar: { title: "Locale", icon: "globe", items: [...locales], dynamicTitle: true },
    },
    density: {
      description: "Density (data-density on <html>)",
      toolbar: { title: "Density", icon: "collapse", items: [...densities], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "system", dir: "ltr", locale: "en-US", density: "comfortable" },
  decorators: [withGlobals],
});
