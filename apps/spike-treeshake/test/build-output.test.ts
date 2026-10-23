// Spike #5: reads the output of `next build` and `next analyze export` (run by the `test` script)
// and checks what actually shipped. See docs/research/turbopack-tree-shaking-react-compiler.md.
import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

const distDir = join(import.meta.dirname, "..", ".next");
const pkgPrefix = "[project]/packages/spike-ui-pkg/";

interface GraphModule {
  readonly type: "module";
  readonly ident: string;
  readonly path: string;
  readonly dependencies: { readonly sync: readonly string[] };
}

function isGraphModule(record: unknown): record is GraphModule {
  return (
    typeof record === "object" && record !== null && "type" in record && record.type === "module"
  );
}

const graph: readonly GraphModule[] = readFileSync(join(distDir, "bundle-graph.jsonl"), "utf8")
  .split("\n")
  .filter((line) => line !== "")
  .map((line): unknown => JSON.parse(line))
  .filter((record) => isGraphModule(record));

/** Package-relative paths of every spike-ui-pkg module in the given Turbopack layer. */
function shippedPackageModules(layer: "app-client" | "app-ssr" | "app-rsc"): Set<string> {
  return new Set(
    graph
      .filter((m) => m.path.startsWith(pkgPrefix) && m.ident.includes(`[${layer}]`))
      .map((m) => m.path.slice(pkgPrefix.length)),
  );
}

/** Text of the given emitted files (relative to `.next`), e.g. `static/**\/*.js`. */
function emitted(...patterns: readonly string[]): readonly string[] {
  return globSync(patterns, { cwd: distDir }).map((file) =>
    readFileSync(join(distDir, file), "utf8"),
  );
}

describe("tree-shaking of a just-in-time workspace package", () => {
  test("the module graph holds only the imported components and what they use", () => {
    const shipped = shippedPackageModules("app-client")
      .union(shippedPackageModules("app-ssr"))
      .union(shippedPackageModules("app-rsc"));

    expect([...shipped].toSorted()).toEqual([
      "src/base.css",
      "src/button/button.module.css",
      "src/button/button.tsx",
      "src/icons/check.tsx",
      "src/internal/cx.ts",
    ]);
  });

  test("no emitted file contains code or CSS from unused components and icons", () => {
    // JS, CSS, source maps (which embed every bundled source), prerendered HTML and RSC payloads.
    const text = emitted("{static,server}/**/*.{js,css,map,html,rsc}").join("\n");

    // Booleans, not toContain: a failure message would otherwise print megabytes of chunk text.
    for (const used of [
      "SPIKE_MARKER_BUTTON",
      "SPIKE_MARKER_ICON_CHECK",
      "spike-marker-button-css",
      // Side-effect-only CSS import (`import "…/base.css"`) must survive tree-shaking.
      "spike-marker-base-css",
    ]) {
      expect(text.includes(used), `${used} shipped`).toBe(true);
    }
    for (const unused of [
      "SPIKE_MARKER_CARD",
      "SPIKE_MARKER_DIALOG",
      "SPIKE_MARKER_ICON_CLOSE",
      "SPIKE_MARKER_ICON_STAR",
      "SPIKE_MARKER_INTERNAL_UNUSED",
      "SPIKE_MARKER_INTERNAL_CONTEXT",
      "spike-marker-card-css",
    ]) {
      expect(text.includes(unused), `${unused} shipped`).toBe(false);
    }
  });
});

describe("React Compiler on workspace source", () => {
  test("the client build of Button imports the compiler runtime", () => {
    const button = graph.find(
      (m) => m.ident === `${pkgPrefix}src/button/button.tsx [app-client] (ecmascript)`,
    );

    expect(
      button?.dependencies.sync.some((dep) => dep.includes("/react/compiler-runtime.js")),
    ).toBe(true);
  });

  test("the emitted Button code is memoized with the compiler's cache sentinel", () => {
    const [chunk = ""] = emitted("static/chunks/*.js").filter((text) =>
      text.includes("SPIKE_MARKER_BUTTON"),
    );
    // The Button export starts at its `t.s(["Button", …` registration and ends at its marker.
    const buttonCode = chunk.slice(chunk.indexOf('"Button"'), chunk.indexOf("SPIKE_MARKER_BUTTON"));

    expect(buttonCode).toContain('Symbol.for("react.memo_cache_sentinel")');
  });
});
