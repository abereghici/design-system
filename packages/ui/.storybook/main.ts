import { defineMain } from "@storybook/react-vite/node";
import remarkGfm from "remark-gfm";

import { fontFaceCss } from "@abereghici/tokens/font-faces";
import tokens from "@abereghici/tokens/tokens.json" with { type: "json" };

const color = (name: string) => {
  const value = tokens.color.tokens.find((token) => token.name === `ab-color-${name}`)?.value;

  if (typeof value !== "object") throw new Error(`No themed color token ab-color-${name}`);

  return `light-dark(${value.light}, ${value.dark})`;
};

// Storybook paints its story and docs loaders white, before the story's CSS arrives and the
// decorator sets data-theme, so the canvas flashes on every load and story change. These rules
// paint them with the tokens, in the Theme the iframe URL's globals carry.
const canvasCss = `
  :root { color-scheme: light dark; background-color: ${color("surface-default")}; }
  :root[data-theme="light"] { color-scheme: light; }
  :root[data-theme="dark"] { color-scheme: dark; }
  .sb-preparing-story, .sb-preparing-docs { background-color: ${color("surface-default")}; }
  .sb-previewBlock, .sb-argstableBlock-body td { background: ${color("surface-raised")}; }
  .sb-previewBlock, .sb-argstableBlock-body tr:not(:first-child) { border-color: ${color("border-subtle")}; }
  .sb-previewBlock_icon, .sb-argstableBlock span, .sb-argstableBlock-body button { background-color: ${color("border-subtle")}; }
`;

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
  ],
  tags: { _test: { defaultFilterSelection: "exclude" } },
  previewHead: (head) => `${head}<style>${canvasCss}</style>
    <script>{
      const theme = /(?:^|;)theme:(light|dark)/.exec(new URLSearchParams(location.search).get("globals"));
      if (theme) document.documentElement.dataset.theme = theme[1];
    }</script>`,
  managerHead: (head) => `${head}<style>${fontFaceCss("./fonts/")}</style>`,
  core: { disableTelemetry: true },
  features: { experimentalTestSyntax: true, componentsManifest: true, backgrounds: false },
});
