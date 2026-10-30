import StyleDictionary from "style-dictionary";

import type { DesignTokens } from "style-dictionary/types";

import { toArtifactTokens } from "./artifact-format.ts";
import type { ArtifactTokens } from "./artifact-format.ts";
import { checkTokens, TokenCheckError } from "./checks.ts";
import { stylesheets } from "./css-format.ts";

export { TokenCheckError };

export const SOURCE_GLOB = `${import.meta.dirname}/tokens/**/*.tokens.json`;

interface BuildInput {
  readonly tokens?: DesignTokens;
  readonly source?: readonly string[];
}

interface BuildOutput {
  readonly css: string;
  readonly components: Readonly<Record<string, string>>;
  readonly artifact: ArtifactTokens;
}

export async function buildTokens(input: BuildInput): Promise<BuildOutput> {
  const sd = new StyleDictionary({
    ...(input.tokens === undefined ? {} : { tokens: input.tokens }),
    ...(input.source === undefined ? {} : { source: [...input.source] }),
    log: { verbosity: "silent", warnings: "error" },
    hooks: {
      transforms: {
        "ab/name": {
          type: "name",
          transform: (token) => `ab-${token.path.slice(1).join("-")}`,
        },
      },
    },
    platforms: {
      web: {
        transforms: [
          "ab/name",
          "color/css",
          "size/rem",
          "time/seconds",
          "cubicBezier/css",
          "fontFamily/css",
        ],
      },
    },
  });

  const dictionary = await sd.getPlatformTokens("web");
  const problems = checkTokens(dictionary);

  if (problems.length > 0) throw new TokenCheckError(problems);

  return {
    ...stylesheets(dictionary),
    artifact: toArtifactTokens(dictionary),
  };
}
