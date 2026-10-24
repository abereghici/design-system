import { expect, test } from "vitest";

import {
  INDEX,
  mergeIndex,
  parseListing,
  publishCalls,
  stalePaths,
  type DesignSystemIndex,
} from "./plan.ts";

// Rows as the Artifact tool's file listing prints them (read of the real artifact, 2026-10-24).
const LISTING = `Published files of https://claude.ai/artifact/… (version 1792790791-a4da), 310 files by path:
- "SKILL.md"  text/markdown  16044 bytes
- "artifact-type/app.js"  text/javascript  1853945 bytes
- "project/README.md"  text/markdown  17618 bytes
- "project/archived/README.md"  text/markdown  30375 bytes
- "project/assets/marks/stalpul-cerului-moss.svg"  image/svg+xml  8053 bytes
- "project/assets/notes/COMPONENTS.md"  text/markdown  4634 bytes
- "project/components/Button/preview.html"  text/plain  1463 bytes
- "project/components/Toaster/preview.html"  text/plain  1009 bytes
- "project/components/actions/Button.jsx"  text/plain  1349 bytes
- "project/design-system.json"  application/json  1028 bytes
- "project/explorations/Logo Vinca Ie.html"  text/plain  7202 bytes
- "project/guidelines/radius.html"  text/plain  3034 bytes
- "project/tokens/dtcg/primitive.json"  application/json  19934 bytes
- "project/tokens.json"  application/json  72455 bytes`;

const ICONS = { files: {}, name: "icons", order: [] };
const NOTES = { files: {}, name: "notes", order: [] };

// The live index's shape (project/design-system.json, version 1792790791-a4da).
const LIVE: DesignSystemIndex = {
  v: 3,
  assetGroups: {
    icons: ICONS,
    marks: { files: {}, name: "marks", order: [] },
    notes: NOTES,
  },
  blobs: {},
  createdOnFiles: { at: "2026-10-23T18:48:02.745Z", v: 1 },
  docs: { readme: "project/README.md", sections: ["project/github.md"] },
  groups: ["icons", "marks", "notes"],
  layout: "files",
  libraries: [{ name: "react", version: "18.3.1" }],
  namespace: "BereghiciDesignSystem_3cd4fc",
  sections: {},
  title: "Bereghici Design System",
  lastChange: {
    by: "Alexandru Bereghici",
    at: "2026-10-23T20:02:01Z",
    via: "claude.ai",
    note: "…",
  },
};

const LAST_CHANGE = { by: "A", at: "2026-10-24T00:00:00Z", via: "Claude Code · x@1", note: "n" };
const LIBRARIES = [
  { name: "react", version: "19.3.1", global: "React", file: "components/lib/react.js" },
];

test("reads the project/ paths of a file listing, and nothing of the type's", () => {
  expect(parseListing(LISTING)).toContain("project/explorations/Logo Vinca Ie.html");
  expect(parseListing(LISTING).filter((file) => !file.startsWith("project/"))).toEqual([]);
  expect(parseListing(LISTING)).toHaveLength(12);
});

test("removes the managed paths the tree no longer has, and keeps the rest", () => {
  const generated = ["README.md", "tokens.json", "components/Button/preview.html"];
  expect(stalePaths(parseListing(LISTING), generated)).toEqual([
    "project/assets/marks/stalpul-cerului-moss.svg",
    "project/components/Toaster/preview.html",
    "project/components/actions/Button.jsx",
    "project/tokens/dtcg/primitive.json",
  ]);
});

test("the merged index keeps the marker and other keys, and sets the synced ones", () => {
  const index = mergeIndex({
    live: LIVE,
    title: "Bereghici Design System",
    namespace: "BereghiciDesignSystem_3cd4fc",
    libraries: LIBRARIES,
    finalPaths: [
      "project/assets/icons/x.svg",
      "project/assets/logo/a.svg",
      "project/assets/notes/README.md",
    ],
    lastChange: LAST_CHANGE,
  });
  expect(index).toEqual({
    ...LIVE,
    editing: "code",
    libraries: LIBRARIES,
    groups: ["logo", "icons", "notes"],
    assetGroups: {
      logo: { name: "logo", order: [], files: {} },
      icons: ICONS,
      notes: NOTES,
    },
    lastChange: LAST_CHANGE,
  });
});

test("an index without its marker is refused", () => {
  const { createdOnFiles: _marker, ...unmarked } = LIVE;
  expect(() =>
    mergeIndex({
      live: unmarked,
      title: "t",
      namespace: "n",
      libraries: [],
      finalPaths: [],
      lastChange: LAST_CHANGE,
    }),
  ).toThrow("not an index");
});

test("publishes in calls of at most 255 paths, the index alone in the last one", () => {
  const generated = Array.from({ length: 300 }, (_, index) => `assets/icons/${String(index)}.svg`);
  const calls = publishCalls({
    root: "/out",
    generated,
    stale: ["project/components/Old/preview.html"],
  });
  const paths = calls.map((call) => Object.keys(call.files).length + 1);
  expect(paths).toEqual([254, 48]);
  expect(calls.map(({ file_path }) => file_path)).toEqual([
    "/out/project/assets/icons/0.svg",
    `/out/${INDEX}`,
  ]);
  expect(calls.flatMap((call) => Object.keys(call.files)).filter((file) => file === INDEX)).toEqual(
    [],
  );
  expect(calls.at(-1)?.files["project/components/Old/preview.html"]).toBeNull();
  const sent = new Set(
    calls.flatMap((call) => [call.file_path.replace("/out/", ""), ...Object.keys(call.files)]),
  );
  expect(sent.size).toBe(302);
});
