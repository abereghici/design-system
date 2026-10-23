import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Shared by Storybook and Vitest.
// - @storybook/react-vite 10.6.3 adds only react-docgen plugins (dist/preset.js `viteFinal`), and
//   "When Storybook loads, it automatically merges the configuration into its own"
//   (https://storybook.js.org/docs/builders/vite), so the React plugin lives here.
// - `react()` is the documented default usage (@vitejs/plugin-react 6.1.2 README).
export default defineConfig({
  plugins: [react()],
});
