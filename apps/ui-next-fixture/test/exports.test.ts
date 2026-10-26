import { existsSync, globSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

// @ts-expect-error -- no root barrel
export type PackageRoot = typeof import("@platform/ui");

const uiDir = join(import.meta.dirname, "..", "..", "..", "packages", "ui");

// import.meta.resolve applies `exports` but doesn't check that the target exists.
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

  test("every src/icon/icons/<name>.tsx is the subpath @platform/ui/icons/<name>", () => {
    for (const entry of globSync("src/icon/icons/*.tsx", { cwd: uiDir })) {
      const name = entry.slice("src/icon/icons/".length, -".tsx".length);

      expect(resolve(`@platform/ui/icons/${name}`)).toBe(join(uiDir, entry));
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

  test("module files, glyph folders and the Storybook harness have no subpath", () => {
    expect(resolve("@platform/ui/button/button.tsx")).toBeUndefined();
    expect(resolve("@platform/ui/button/button.module.css")).toBeUndefined();
    expect(resolve("@platform/ui/src/button/button.tsx")).toBeUndefined();
    expect(resolve("@platform/ui/icon/icons/x")).toBeUndefined();
    expect(resolve("@platform/ui/.storybook/preview")).toBeUndefined();
  });
});
