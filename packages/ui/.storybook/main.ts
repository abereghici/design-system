import { defineMain } from "@storybook/react-vite/node";

// CSF Next main config (https://storybook.js.org/docs/api/csf/csf-next, Storybook 10.6):
// "import { defineMain } from '@storybook/your-framework/node'".
export default defineMain({
  framework: "@storybook/react-vite",
  // MDX docs pages attach to a CSF file with `<Meta of={…} />`
  // (https://storybook.js.org/docs/writing-docs/mdx).
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  // Docs (autodocs), a11y (axe) and Vitest (stories as tests).
  // https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  // Opt out "by setting the `disableTelemetry` configuration element to `true`"
  // (https://storybook.js.org/docs/configure/telemetry).
  core: { disableTelemetry: true },
  features: {
    // `<Story>.test` is experimental and "must be enabled via the `experimentalTestSyntax` feature
    // flag" (https://storybook.js.org/docs/api/csf/csf-next).
    experimentalTestSyntax: true,
  },
});
