import path from "node:path";

const packageDir = path.dirname(import.meta.dirname);

/** The artifact this tree mirrors (ADR-0003). Only the maintainer step publishes to it. */
export const ARTIFACT_URL = "https://claude.ai/artifact/RRpamcv6rQnBhH2ArSpGbJ";

/** The system's name: the index `title` and line 1 of tokens.css. */
export const TITLE = "Bereghici Design System";

/** The bundle's global, `window.<namespace>`. Kept from the artifact's index. */
export const NAMESPACE = "BereghiciDesignSystem_3cd4fc";

export const PATHS = {
  root: packageDir,
  /** Hand-written files, each at its path under `project/`. */
  content: path.join(packageDir, "content"),
  out: path.join(packageDir, "dist"),
  tokens: path.resolve(packageDir, "../tokens"),
  ui: path.resolve(packageDir, "../ui"),
} as const;
