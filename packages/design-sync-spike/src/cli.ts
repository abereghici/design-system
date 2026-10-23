import path from "node:path";
import { parseArgs } from "node:util";

import { buildPreview, type Runtime } from "./build.ts";

// Usage: pnpm build [--runtime react-19|react-18] [--out dist]
const { values } = parseArgs({
  options: {
    runtime: { type: "string", default: "react-19" },
    out: { type: "string", default: "dist" },
  },
});

if (values.runtime !== "react-19" && values.runtime !== "react-18") {
  throw new Error(`--runtime must be react-19 or react-18, not ${values.runtime}`);
}
const runtime: Runtime = values.runtime;
const outDir = path.resolve(values.out);
const { libraries } = await buildPreview({ outDir, runtime });
const names = libraries.map(({ name, version }) => `${name}@${version}`);
console.log(`Wrote ${outDir}/project with ${names.join(", ")}`);
