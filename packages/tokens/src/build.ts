import StyleDictionary from "style-dictionary";
import type { DesignTokens } from "style-dictionary/types";

import { toArtifactTokens, type ArtifactTokens } from "./artifact-format.ts";
import { checkTokens, TokenCheckError } from "./checks.ts";
import { stylesheets } from "./css-format.ts";

export { TokenCheckError };
export type { ArtifactTokens };

const isDurationObject = (value: unknown): value is { value: unknown; unit: unknown } =>
  typeof value === "object" && value !== null && "value" in value && "unit" in value;

export const SOURCE_GLOB = `${import.meta.dirname}/tokens/*.tokens.json`;

export interface BuildInput {
  readonly tokens?: DesignTokens;
  readonly source?: readonly string[];
}

export interface BuildOutput {
  readonly css: string;
  readonly components: Readonly<Record<string, string>>;
  readonly artifact: ArtifactTokens;
}

export async function buildTokens(input: BuildInput): Promise<BuildOutput> {
  const sd = new StyleDictionary({
    ...(input.tokens === undefined ? {} : { tokens: input.tokens }),
    ...(input.source === undefined ? {} : { source: [...input.source] }),
    usesDtcg: true,
    log: { verbosity: "silent", errors: { brokenReferences: "throw" } },
    hooks: {
      transforms: {
        "ab/name": {
          type: "name",
          transform: (token) => `ab-${token.path.slice(1).join("-")}`,
        },
        "ab/duration": {
          type: "value",
          filter: (token) => token.$type === "duration" && isDurationObject(token.$value),
          transform: (token) => {
            const duration: unknown = token.$value;
            return isDurationObject(duration)
              ? `${String(duration.value)}${String(duration.unit)}`
              : String(duration);
          },
        },
      },
    },
    platforms: {
      web: {
        transforms: [
          "ab/name",
          "color/css",
          "size/rem",
          "ab/duration",
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
