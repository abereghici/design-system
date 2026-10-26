import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // A request costs nothing here, so each route loads exactly the CSS it imports: the split routes measure the library, not Next's merging.
  experimental: { cssChunking: { type: "graph", requestCost: 0 } },
};

export default nextConfig;
