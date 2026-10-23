import { mkdir, writeFile } from "node:fs/promises";

import { buildTokens, SOURCE_GLOB, TokenCheckError } from "../src/build.ts";
import { fontFaceCss } from "../src/fonts.ts";

const dist = new URL("../dist/", import.meta.url);

try {
  const { css, artifact } = await buildTokens({ source: [SOURCE_GLOB] });
  await mkdir(dist, { recursive: true });
  await writeFile(new URL("tokens.css", dist), css);
  await writeFile(new URL("tokens.json", dist), `${JSON.stringify(artifact, undefined, 2)}\n`);
  await writeFile(new URL("fonts.css", dist), fontFaceCss());
  console.log("@platform/tokens: wrote dist/tokens.css, dist/tokens.json and dist/fonts.css");
} catch (error) {
  if (!(error instanceof TokenCheckError)) throw error;
  console.error(error.message);
  process.exitCode = 1;
}
