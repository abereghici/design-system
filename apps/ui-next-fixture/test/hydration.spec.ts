import { expect, test } from "@playwright/test";

import { routes, serve } from "./static-export.ts";

test.use({ javaScriptEnabled: true });

test.beforeEach(async ({ context }) => {
  await serve(context);
});

for (const route of routes) {
  test(`${route} hydrates without errors`, async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (message) => {
      // Avatar's page loads a missing photo on purpose, to show its fallback. WebKit preconnects to
      // the page's origin past page.route, and no server answers this one.
      if (
        message.type() === "error" &&
        !message.location().url.endsWith("/missing.jpg") &&
        !message.text().startsWith("Failed to preconnect to http://fixture.test/")
      ) {
        errors.push(message.text());
      }
    });

    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`/${route}`);
    // Next mounts its route announcer once the page has hydrated.
    await expect(page.locator("next-route-announcer")).toBeAttached();

    expect(errors).toEqual([]);
  });
}
