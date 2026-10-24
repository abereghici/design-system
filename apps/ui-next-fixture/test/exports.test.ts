// How a consumer resolves @platform/ui: per-component and per-icon subpaths only, no root barrel.
// Convention: packages/ui/package.json `exports` maps "./*" to "./src/*/index.ts" and
// "./icons/*" to "./src/icons/*.tsx".
import { existsSync, globSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

// TypeScript must not resolve the package root either: `check-types` fails if this line resolves.
// @ts-expect-error -- no root barrel
export type PackageRoot = typeof import("@platform/ui");

const uiDir = join(import.meta.dirname, "..", "..", "..", "packages", "ui");

/**
 * The file a consumer gets for `specifier`, through the ESM resolver run from this app (where
 * @platform/ui is a dependency), or `undefined` when the exports target is not a file.
 * `import.meta.resolve` applies `exports` but does not check that the target exists (observed with
 * Node 26.12.1), so existence is checked here. Throws when `exports` does not allow the subpath.
 */
function resolve(specifier: string): string | undefined {
  const path = fileURLToPath(import.meta.resolve(specifier));
  return existsSync(path) ? realpathSync(path) : undefined;
}

describe("@platform/ui exports", () => {
  test("a component subpath resolves to its directory's index.ts", () => {
    expect(resolve("@platform/ui/button")).toBe(join(uiDir, "src/button/index.ts"));
  });

  test("every src/<name>/index.ts is the subpath @platform/ui/<name>", () => {
    for (const entry of globSync("src/*/index.ts", { cwd: uiDir })) {
      const name = basename(dirname(entry));
      expect(resolve(`@platform/ui/${name}`)).toBe(join(uiDir, entry));
    }
  });

  test("every src/icons/<name>.tsx is the subpath @platform/ui/icons/<name>", () => {
    for (const entry of globSync("src/icons/*.tsx", { cwd: uiDir })) {
      const name = entry.slice("src/icons/".length, -".tsx".length);
      expect(resolve(`@platform/ui/icons/${name}`)).toBe(join(uiDir, entry));
    }
  });

  test("every src/locales/<tag>.ts is the subpath @platform/ui/locales/<tag>", () => {
    const entries = globSync("src/locales/*.ts", { cwd: uiDir });
    expect(entries.toSorted()).toEqual(["src/locales/en-US.ts", "src/locales/ro-RO.ts"]);
    for (const entry of entries) {
      const tag = entry.slice("src/locales/".length, -".ts".length);
      expect(resolve(`@platform/ui/locales/${tag}`)).toBe(join(uiDir, entry));
    }
  });

  test("the package root is not exported (Node)", () => {
    expect(() => resolve("@platform/ui")).toThrow(
      expect.objectContaining({ code: "ERR_PACKAGE_PATH_NOT_EXPORTED" }),
    );
  });

  test("the package root is not importable (Vite, through Vitest)", async () => {
    const root = "@platform/ui";
    await expect(import(root)).rejects.toThrow(/"\." is not exported/v);
  });

  test("module files and private directories have no subpath", () => {
    expect(resolve("@platform/ui/button/button.tsx")).toBeUndefined();
    expect(resolve("@platform/ui/button/button.module.css")).toBeUndefined();
    expect(resolve("@platform/ui/src/button/button.tsx")).toBeUndefined();
    expect(resolve("@platform/ui/testing")).toBeUndefined();
  });
});
