import { mkdir, writeFile } from "node:fs/promises";

import { buildTokens, SOURCE_GLOB, TokenCheckError } from "../src/build.ts";
import { fontFaceCss } from "../src/fonts.ts";

const dist = new URL("../dist/", import.meta.url);

try {
  const { css, components, artifact } = await buildTokens({ source: [SOURCE_GLOB] });

  await mkdir(new URL("components/", dist), { recursive: true });
  await writeFile(new URL("tokens.css", dist), css);

  for (const [name, sheet] of Object.entries(components)) {
    await writeFile(new URL(`components/${name}.css`, dist), sheet);
  }

  await writeFile(new URL("tokens.json", dist), `${JSON.stringify(artifact, undefined, 2)}\n`);
  await writeFile(new URL("fonts.css", dist), fontFaceCss());
  console.log(
    "@abereghici/tokens: wrote dist/tokens.css, dist/components/*.css, dist/tokens.json and dist/fonts.css",
  );
} catch (error) {
  if (!(error instanceof TokenCheckError)) throw error;

  console.error(error.message);
  process.exitCode = 1;
}
