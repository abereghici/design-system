import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { ARTIFACT_URL, NAMESPACE, PATHS, TITLE } from "./config.ts";
import { readJsonObject } from "./json.ts";
import { INDEX, mergeIndex, parseListing, publishCalls, stalePaths } from "./plan.ts";
import { buildProject, isBuiltProject } from "./project.ts";

// Usage (see README.md, "Publishing"):
//   pnpm build                                          writes dist/project/ and dist/build.json
//   pnpm plan --index <live index> --listing <listing>  writes the index and dist/publish.json
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    index: { type: "string" },
    listing: { type: "string" },
    by: { type: "string" },
  },
});

const git = (...args: readonly string[]) =>
  execFileSync("git", [...args], { cwd: PATHS.root, encoding: "utf8" }).trim();
const buildFile = path.join(PATHS.out, "build.json");

async function build() {
  const built = await buildProject(PATHS.out);
  await writeFile(buildFile, `${JSON.stringify(built, undefined, 2)}\n`);
  console.log(
    `Wrote ${String(built.files.length)} files to ${path.join(PATHS.out, "project")} (components: ${built.components.join(", ")})`,
  );
}

async function plan() {
  if (values.index === undefined || values.listing === undefined) {
    throw new Error("plan needs --index <live design-system.json> and --listing <file listing>");
  }
  const built = await readJsonObject(buildFile);
  if (!isBuiltProject(built)) throw new Error(`${buildFile} is stale: run pnpm build again`);
  const live = await readJsonObject(values.index);
  const published = parseListing(await readFile(values.listing, "utf8"));
  if (!published.includes(INDEX)) throw new Error(`The listing has no ${INDEX}`);
  const stale = stalePaths(published, built.files);
  const finalPaths = [
    ...new Set([
      ...published.filter((file) => !stale.includes(file)),
      ...built.files.map((file) => `project/${file}`),
    ]),
  ];
  const index = mergeIndex({
    live,
    title: TITLE,
    namespace: NAMESPACE,
    libraries: built.libraries,
    finalPaths,
    lastChange: {
      by: values.by ?? git("config", "user.name"),
      at: new Date().toISOString(),
      via: `Claude Code · abereghici/platform@${git("rev-parse", "--short", "HEAD")}`,
      note: `Synced from the repo: tokens, fonts, icons, Logo and ${built.components.join(", ")}`,
    },
  });
  await writeFile(path.join(PATHS.out, INDEX), `${JSON.stringify(index, undefined, 2)}\n`);
  const calls = publishCalls({ root: PATHS.out, generated: built.files, stale });
  await writeFile(
    path.join(PATHS.out, "publish.json"),
    `${JSON.stringify({ url: ARTIFACT_URL, root: PATHS.out, calls }, undefined, 2)}\n`,
  );
  console.log(
    `Wrote ${INDEX} and publish.json: ${String(calls.length)} call(s), ${String(built.files.length)} files, ${String(stale.length)} removals`,
  );
}

const command = positionals[0];
if (command === "build") await build();
else if (command === "plan") await plan();
else throw new Error(`Unknown command "${String(command)}" (build or plan)`);
