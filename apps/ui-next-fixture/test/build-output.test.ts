import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

const graphFile = join(import.meta.dirname, "..", ".next", "bundle-graph.jsonl");
const uiPrefix = "[project]/packages/ui/";

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

const graph: readonly GraphModule[] = readFileSync(graphFile, "utf8")
  .split("\n")
  .filter((line) => line !== "")
  .map((line): unknown => JSON.parse(line))
  .filter((record) => isGraphModule(record));

const shipped = new Set(
  graph.filter((m) => m.path.startsWith(uiPrefix)).map((m) => m.path.slice(uiPrefix.length)),
);

describe("tree-shaking of @platform/ui", () => {
  test("the imported component ships with its CSS Module", () => {
    expect(shipped).toContain("src/button/button.tsx");
    expect(shipped).toContain("src/button/button.module.css");
  });

  test("nothing ships from outside what the app imports (provider, button, logo, ro-RO)", () => {
    const allowed = [
      "src/provider/",
      "src/base/",
      "src/locales/en-US.ts",
      "src/locales/ro-RO.ts",
      "src/button/",
      "src/events/",
      "src/logo/",
    ];
    const outside = [...shipped].filter((path) => !allowed.some((dir) => path.startsWith(dir)));
    const stories = [...shipped].filter((path) => path.includes(".stories."));

    expect(outside).toEqual([]);
    expect(stories).toEqual([]);
  });

  test("the subpath's index.ts re-export is pruned (needs `sideEffects` in package.json)", () => {
    expect(shipped).not.toContain("src/button/index.ts");
  });
});

describe("React Compiler on @platform/ui source", () => {
  test("the client build of Button imports the compiler runtime", () => {
    const button = graph.find(
      (m) => m.ident === `${uiPrefix}src/button/button.tsx [app-client] (ecmascript)`,
    );

    expect(button, "client Button module in the graph").toBeDefined();
    expect(
      button?.dependencies.sync.some((dep) => dep.includes("/react/compiler-runtime.js")),
    ).toBe(true);
  });
});
