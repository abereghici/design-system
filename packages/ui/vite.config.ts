import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Vite's default target makes Lightning CSS lower light-dark(), which breaks data-theme subtrees.
  build: { target: "esnext" },
});
