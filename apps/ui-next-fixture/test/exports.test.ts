import { existsSync, globSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const uiDir = join(import.meta.dirname, "..", "..", "..", "packages", "ui");
const subpaths = ["src/*/index.ts", "src/components/*/index.ts"];
const icons = "src/components/icon/icons/*.tsx";

// import.meta.resolve applies `exports` but doesn't check that the target exists.
function resolve(specifier: string): string | undefined {
  const path = fileURLToPath(import.meta.resolve(specifier));

  return existsSync(path) ? realpathSync(path) : undefined;
}

async function exportsOf(path: string): Promise<[string, unknown][]> {
  const namespace: unknown = await import(path);

  return typeof namespace === "object" && namespace !== null ? Object.entries(namespace) : [];
}

describe("@abereghici/ui exports", () => {
  test("a component subpath resolves to its directory's index.ts", () => {
    expect(resolve("@abereghici/ui/button")).toBe(join(uiDir, "src/components/button/index.ts"));
  });

  test("every <name>/index.ts in src/ or src/components/ is the subpath @abereghici/ui/<name>", () => {
    for (const entry of globSync(subpaths, { cwd: uiDir })) {
      const name = basename(dirname(entry));

      expect(resolve(`@abereghici/ui/${name}`)).toBe(join(uiDir, entry));
    }
  });

  test("every src/components/icon/icons/<name>.tsx is the subpath @abereghici/ui/icons/<name>", () => {
    for (const entry of globSync(icons, { cwd: uiDir })) {
      const name = entry.slice("src/components/icon/icons/".length, -".tsx".length);

      expect(resolve(`@abereghici/ui/icons/${name}`)).toBe(join(uiDir, entry));
    }
  });

  test("the package root resolves to src/index.ts", () => {
    expect(resolve("@abereghici/ui")).toBe(join(uiDir, "src/index.ts"));
  });

  test("the shared internals are not exported", () => {
    expect(resolve("@abereghici/ui/internal/utils")).toBeUndefined();
    expect(resolve("@abereghici/ui/internal/utils/slot.tsx")).toBeUndefined();
  });

  test("the package root exports every subpath's exports, as the same values", async () => {
    const root: Record<string, unknown> = await import("@abereghici/ui");
    const entries = globSync([...subpaths, icons], { cwd: uiDir });
    const modules = await Promise.all(entries.map((entry) => exportsOf(join(uiDir, entry))));

    for (const [name, value] of modules.flat()) expect(root[name]).toBe(value);
  });

  test("module files, glyph folders and the Storybook harness have no subpath", () => {
    expect(resolve("@abereghici/ui/button/button.tsx")).toBeUndefined();
    expect(resolve("@abereghici/ui/button/button.module.css")).toBeUndefined();
    expect(resolve("@abereghici/ui/src/components/button/button.tsx")).toBeUndefined();
    expect(resolve("@abereghici/ui/icon/icons/x")).toBeUndefined();
    expect(resolve("@abereghici/ui/.storybook/preview")).toBeUndefined();
  });
});
