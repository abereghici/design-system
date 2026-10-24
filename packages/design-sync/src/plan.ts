import { isObject, type JsonObject } from "./json.ts";
import type { Library } from "./libraries.ts";

/** The index, `project/design-system.json`: a JSON object whose keys are read with checks. */
export type DesignSystemIndex = JsonObject;

export interface LastChange {
  readonly by: string;
  readonly at: string;
  readonly via: string;
  readonly note: string;
}

export const INDEX = "project/design-system.json";

/**
 * Published paths the generated tree owns. Under these, a published file the tree no longer has
 * is removed (`null` in the publish), so the mirror matches the repo: the prototype component
 * code, old previews and guides, the old Logo folder and the old token exports. Everything else
 * (guidelines, explorations, uploads, archived, notes) is left as it is.
 */
export const MANAGED = [
  "project/components/",
  "project/assets/icons/",
  "project/assets/logo/",
  "project/assets/marks/",
  "project/assets/fonts/",
  "project/fonts/",
  "project/tokens/",
  "project/scripts/",
  "project/tokens.json",
  "project/tokens.css",
  "project/README.md",
] as const;

/** Most paths one Artifact publish takes ("At most 255 paths a call", the type's SKILL.md). */
export const PATHS_PER_CALL = 255;

const QUOTED = /"(?<path>project\/[^"]+)"/gv;

/**
 * The `project/` paths in an Artifact file listing (`action: "list"`, `scope: "files"`), whose
 * rows read `- "project/README.md"  text/markdown  17618 bytes`. Bare `project/…` lines work too.
 */
export function parseListing(text: string): string[] {
  const quoted: string[] = [];
  for (const match of text.matchAll(QUOTED)) quoted.push(match.groups?.["path"] ?? "");
  const bare = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("project/") && !line.includes('"'));
  return [...new Set([...quoted, ...bare])].toSorted();
}

/** Published managed paths the generated tree doesn't have. `generated` is under `project/`. */
export function stalePaths(published: readonly string[], generated: readonly string[]): string[] {
  const kept = new Set([INDEX, ...generated.map((file) => `project/${file}`)]);
  return published.filter(
    (file) =>
      !kept.has(file) && MANAGED.some((prefix) => file === prefix || file.startsWith(prefix)),
  );
}

const groupOf = (file: string) =>
  /^project\/assets\/(?<group>[^\/]+)\//v.exec(file)?.groups?.["group"];

/** Our asset groups first, in this order; groups kept from the live index follow. */
const GROUP_ORDER = ["logo", "icons", "fonts"];

/**
 * The live index with the keys a sync owns rewritten (the type's SKILL.md: read it right before,
 * "change those …, keep every other key and the marker"). `"editing": "code"` makes the page
 * read-only ("synced from code").
 */
export function mergeIndex({
  live,
  title,
  namespace,
  libraries,
  finalPaths,
  lastChange,
}: Readonly<{
  live: DesignSystemIndex;
  title: string;
  namespace: string;
  libraries: readonly Library[];
  /** Every `project/` path the artifact holds after the publish. */
  finalPaths: readonly string[];
  lastChange: LastChange;
}>): DesignSystemIndex {
  if (live["createdOnFiles"] === undefined && live["convertedFrom"] === undefined) {
    throw new Error(
      `${INDEX} has no createdOnFiles or convertedFrom marker, so it is not an index; write nothing over it`,
    );
  }
  const present = new Set(finalPaths.flatMap((file) => groupOf(file) ?? []));
  const liveOrder: unknown = live["groups"];
  const kept = Array.isArray(liveOrder)
    ? liveOrder.filter((group): group is string => typeof group === "string")
    : [];
  const groups = [
    ...GROUP_ORDER.filter((group) => present.has(group)),
    ...kept.filter((group) => present.has(group) && !GROUP_ORDER.includes(group)),
  ];
  const liveGroups: unknown = live["assetGroups"];
  const recordOf = (group: string): unknown =>
    (isObject(liveGroups) ? liveGroups[group] : undefined) ?? { name: group, order: [], files: {} };
  const assetGroups = Object.fromEntries(groups.map((group) => [group, recordOf(group)]));
  return {
    ...live,
    title,
    namespace,
    libraries,
    editing: "code",
    groups,
    assetGroups,
    lastChange,
  };
}

export interface PublishCall {
  /** Absolute: one file of the call by its full path. */
  readonly file_path: string;
  /** `project/<path>` → its path under `root`, or `null` to remove it. */
  readonly files: Readonly<Record<string, string | null>>;
}

/**
 * The Artifact publishes that send the tree: every generated file, a `null` for every stale path,
 * at most `PATHS_PER_CALL` paths a call, and the index alone at the end of the last call ("The
 * index goes ONCE, in the LAST call of your work", SKILL.md).
 */
export function publishCalls({
  root,
  generated,
  stale,
}: Readonly<{
  root: string;
  generated: readonly string[];
  stale: readonly string[];
}>): PublishCall[] {
  const changes: (readonly [string, string | null])[] = [
    ...generated.map((file): readonly [string, string] => [`project/${file}`, `project/${file}`]),
    ...stale.map((file): readonly [string, null] => [file, null]),
  ];
  // A call is its `file_path` plus `files`, so `files` holds one path fewer than the cap.
  const size = PATHS_PER_CALL - 1;
  const count = Math.max(1, Math.ceil(changes.length / size));
  const calls: PublishCall[] = [];
  for (let index = 0; index < count; index += 1) {
    const chunk = changes.slice(index * size, (index + 1) * size);
    if (index === count - 1) {
      calls.push({ file_path: `${root}/${INDEX}`, files: Object.fromEntries(chunk) });
      continue;
    }
    const lead = chunk.findIndex(([, from]) => from !== null);
    const leadPath = chunk[lead]?.[0];
    if (leadPath === undefined) throw new Error("a call needs one file to send as file_path");
    calls.push({
      file_path: `${root}/${leadPath}`,
      files: Object.fromEntries(chunk.toSpliced(lead, 1)),
    });
  }
  return calls;
}
