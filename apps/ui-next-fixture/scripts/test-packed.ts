import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Next.js compiles workspace packages from source, so the npm path is only exercised outside the workspace: this app
// and the packed packages are unpacked into a temporary directory and installed the way an npm consumer installs them.
const app = join(import.meta.dirname, "..");
const dir = mkdtempSync(join(tmpdir(), "ui-next-packed-"));
const run = (cwd: string, command: string, ...args: string[]) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });

for (const name of ["tokens", "ui"]) {
  run(join(app, "..", "..", "packages", name), "pnpm", "pack", "--out", join(dir, `${name}.tgz`));
}

run(app, "pnpm", "pack", "--out", join(dir, "app.tgz"));
run(dir, "tar", "-xzf", "app.tgz", "--strip-components=1");

// The workspace's private configs aren't on npm, and only lint and type checks use them.
run(
  dir,
  "npm",
  "pkg",
  "delete",
  "devDependencies.@repo/oxlint-config",
  "devDependencies.@repo/typescript-config",
);
writeFileSync(
  join(dir, "pnpm-workspace.yaml"),
  'overrides:\n  "@abereghici/tokens": "file:./tokens.tgz"\n  "@abereghici/ui": "file:./ui.tgz"\n',
);
run(dir, "pnpm", "install");
run(dir, "pnpm", "exec", "next", "build");
// exports.test.ts checks the workspace's source exports.
run(dir, "pnpm", "exec", "vitest", "run", "--exclude", "test/exports.test.ts");
// A failed run keeps the directory, to inspect its build.
rmSync(dir, { recursive: true });
