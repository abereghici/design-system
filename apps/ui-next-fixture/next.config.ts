import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in out/ is the build output Next documents; the tests read it.
  output: "export",
  // The check-types task runs tsc before every build.
  typescript: { ignoreBuildErrors: true },
  // "all_errors" fails the build for any component or hook the compiler can't optimize, instead of skipping it.
  reactCompiler: { panicThreshold: "all_errors" },
  // A request costs nothing here, so each route loads exactly the CSS it imports: the split routes measure the library, not Next's merging.
  experimental: { cssChunking: { type: "graph", requestCost: 0 } },
};

export default nextConfig;
