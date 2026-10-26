import { defineMain } from "@storybook/react-vite/node";
import remarkGfm from "remark-gfm";

import { fontFaceCss } from "@platform/tokens/font-faces";

export default defineMain({
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.tsx", "./docs/**/*.mdx"],
  staticDirs: ["./static", { from: "../../tokens/fonts", to: "/fonts" }],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-mcp",
    "storybook-addon-pseudo-states",
  ],
  tags: { _test: { defaultFilterSelection: "exclude" } },
  managerHead: (head) => `${head}<style>${fontFaceCss("./fonts/")}</style>`,
  core: { disableTelemetry: true },
  features: { experimentalTestSyntax: true, componentsManifest: true, backgrounds: false },
});
