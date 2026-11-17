import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // "all_errors" fails the transform for any component or hook the compiler can't optimize, instead of skipping it.
  plugins: [
    react(),
    babel({
      presets: [
        reactCompilerPreset({
          panicThreshold: "all_errors",
          // Pinned to the compiler's default: Next.js documents that defaults can differ between compiler implementations.
          environment: { enablePreserveExistingMemoizationGuarantees: true },
        }),
      ],
    }),
  ],
  // Vite's default target makes Lightning CSS lower light-dark(), which breaks data-theme subtrees.
  build: { target: "esnext" },
});
