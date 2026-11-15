import { writeFile } from "node:fs/promises";

import { generateEntry } from "./generate-entry.ts";

await writeFile(new URL("../src/index.ts", import.meta.url), await generateEntry());

console.log("@abereghici/ui: wrote src/index.ts");
