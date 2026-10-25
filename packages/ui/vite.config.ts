import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // "all_errors" fails the transform for any component or hook the compiler can't optimize, instead of skipping it.
  plugins: [react(), babel({ presets: [reactCompilerPreset({ panicThreshold: "all_errors" })] })],
  // Vite's default target makes Lightning CSS lower light-dark(), which breaks data-theme subtrees.
  build: { target: "esnext" },
});
