import { existsSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import type { BrowserContext } from "@playwright/test";

const out = join(import.meta.dirname, "..", "out");

/** Every page of the static export, by route. */
export const routes = readdirSync(out)
  .filter((file) => file.endsWith(".html") && !["404.html", "_not-found.html"].includes(file))
  .map((file) => file.slice(0, -".html".length));

/** Answers every request from the static export, as a static host does: `/name` is `name.html`. */
export async function serve(context: BrowserContext) {
  await context.route("**/*", async (route) => {
    const { pathname } = new URL(route.request().url());
    const page = pathname === "/" ? "/index" : pathname;
    const file = join(out, extname(page) === "" ? `${page}.html` : page);

    await (existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404 }));
  });
}
