import StyleDictionary from "style-dictionary";
import type { DesignTokens } from "style-dictionary/types";

import { toArtifactTokens, type ArtifactTokens } from "./artifact-format.ts";
import { checkTokens, TokenCheckError } from "./checks.ts";
import { stylesheets } from "./css-format.ts";

export { TokenCheckError };
export type { ArtifactTokens };

const isDurationObject = (value: unknown): value is { value: unknown; unit: unknown } =>
  typeof value === "object" && value !== null && "value" in value && "unit" in value;

/** The package's DTCG source: one file per tier, each a top-level group named after it. */
export const SOURCE_GLOB = `${import.meta.dirname}/tokens/*.tokens.json`;

export interface BuildInput {
  /** A DTCG token tree, as one object. */
  readonly tokens?: DesignTokens;
  /** Or DTCG token files (globs), merged by Style Dictionary. */
  readonly source?: readonly string[];
}

export interface BuildOutput {
  /** `tokens.css`: the primitive and semantic `--ab-` custom properties, themed with `light-dark()`. */
  readonly css: string;
  /** `components/<name>.css`: each component's tokens, keyed by component name. */
  readonly components: Readonly<Record<string, string>>;
  /** `tokens.json`: the artifact-shaped tokens for `/design-sync`. */
  readonly artifact: ArtifactTokens;
}

/**
 * Compiles a DTCG token set into the package outputs, without writing files.
 * Rejects with a `TokenCheckError` listing every rule the set breaks.
 */
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
          // The top-level group is the tier; the rest of the path is the token's name.
          transform: (token) => `ab-${token.path.slice(1).join("-")}`,
        },
        "ab/duration": {
          type: "value",
          // DTCG durations are `{ value, unit }` objects; CSS takes them as written (`70ms`).
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
