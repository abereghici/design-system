import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Shared by Storybook and Vitest.
// - @storybook/react-vite 10.6.3 adds only react-docgen plugins (dist/preset.js `viteFinal`), and
//   "When Storybook loads, it automatically merges the configuration into its own"
//   (https://storybook.js.org/docs/builders/vite), so the React plugin lives here.
// - `react()` is the documented default usage (@vitejs/plugin-react 6.1.2 README).
// - `build.target: "esnext"`: Vite's default target is Baseline widely available
//   (['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'], vite.dev/config/build-options),
//   and `build.cssTarget` defaults to it, so the CSS minifier (Lightning CSS) lowers `light-dark()`
//   into `--lightningcss-light/-dark` toggles. Those resolve on `:root`, which breaks the Theme
//   contract for `data-theme` subtrees (observed in storybook-static, all three engines). ADR-0002
//   allows no fallbacks, so nothing is lowered: "'esnext' … will only perform minimal transpiling".
export default defineConfig({
  plugins: [react()],
  build: { target: "esnext" },
});
