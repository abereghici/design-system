import { existsSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import type { BrowserContext } from "@playwright/test";

const out = join(import.meta.dirname, "..", "out");
const routes = readdirSync(out)
  .filter((file) => file.endsWith(".html") && !["404.html", "_not-found.html"].includes(file))
  .map((file) => file.slice(0, -".html".length));

// The static export, answered as a static host answers it: `/name` is `name.html`.
async function serve(context: BrowserContext) {
  await context.route("**/*", async (route) => {
    const { pathname } = new URL(route.request().url());
    const page = pathname === "/" ? "/index" : pathname;
    const file = join(out, extname(page) === "" ? `${page}.html` : page);

    await (existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404 }));
  });
}

test.beforeEach(async ({ context }) => {
  await serve(context);
});

test.describe("Tier 1 works with JavaScript off", () => {
  for (const [route, name, url] of [
    ["link", "Home", "/"],
    ["breadcrumbs", "Home", "/"],
    ["pagination", "Next page", "/pagination?page=3"],
    ["navbar", "Home", "/"],
    ["sidebar", "Home", "/"],
  ] as const) {
    test(`${route}: a link navigates`, async ({ page }) => {
      await page.goto(`/${route}`);
      await page.getByRole("link", { name }).click();

      await expect(page).toHaveURL(url);
    });
  }

  test("a SkipLink appears on Tab and moves focus to the main content", async ({ page }) => {
    await page.goto("/skip-link");
    await page.keyboard.press("Tab");
    await page.getByRole("link", { name: "Skip to main content" }).press("Enter");

    await expect(page.getByRole("main")).toBeFocused();
  });

  test("accordion: an item opens and closes", async ({ page }) => {
    await page.goto("/accordion");
    await page.getByText("Billing").click();

    await expect(page.getByText("Invoices are sent monthly.")).toBeHidden();

    await page.getByText("Billing").click();

    await expect(page.getByText("Invoices are sent monthly.")).toBeVisible();
  });

  for (const [route, trigger, overlay, close] of [
    ["dialog", "Rename", "Rename project?", "Close"],
    ["alert-dialog", "Delete", "Delete project?", "Cancel"],
    ["sheet", "Open details", "Invoice 0142", "Close"],
    ["popover", "Filters", "Filters", "Close"],
  ] as const) {
    test(`${route}: its trigger opens it and its close button closes it`, async ({ page }) => {
      await page.goto(`/${route}`);
      await page.getByRole("button", { name: trigger }).click();

      const dialog = page
        .getByRole("dialog", { name: overlay })
        .or(page.getByRole("alertdialog", { name: overlay }));

      await expect(dialog).toBeVisible();

      await dialog.getByRole("button", { name: close }).click();

      await expect(dialog).toBeHidden();
    });
  }
});

const tier2 = [
  "calendar",
  "combobox",
  "command",
  "context-menu",
  "date-field",
  "date-picker",
  "drop-zone",
  "dropdown-menu",
  "number-field",
  "password-field",
  "tabs",
  "toast",
  "toaster",
  "toolbar",
  "tooltip",
];

test.describe("Tier 2 before hydration", () => {
  test.use({ javaScriptEnabled: true });

  for (const route of tier2) {
    test(`${route}: renders what hydration renders, and passes axe`, async ({ page, context }) => {
      await page.route("**/*.js", (request) => request.abort());
      await page.goto(`/${route}`);

      const hydrated = await context.newPage();

      await hydrated.goto(`/${route}`);
      // Next mounts its route announcer once the page has hydrated.
      await expect(hydrated.locator("next-route-announcer")).toBeAttached();

      expect(await hydrated.getByRole("main").ariaSnapshot()).toBe(
        await page.getByRole("main").ariaSnapshot(),
      );
      expect((await new AxeBuilder({ page }).include("body").analyze()).violations).toEqual([]);
    });
  }
});

test.describe("with JavaScript off, a control only script can run is hidden", () => {
  for (const [route, role, name] of [
    ["alert", "button", "Dismiss"],
    ["calendar", "button", "Previous month"],
    ["calendar", "button", "Next month"],
    ["date-picker", "button", "Choose date"],
    ["number-field", "button", "Decrease"],
    ["number-field", "button", "Increase"],
    ["password-field", "button", "Show password"],
    ["tabs", "tab", "Settings"],
  ] as const) {
    test(`${route}: ${name}`, async ({ page }) => {
      await page.goto(`/${route}`);

      const control = page.getByRole(role, { name, includeHidden: true });

      await expect(control).toBeAttached();
      await expect(control).toBeHidden();
    });
  }
});

test.describe("every route, with JavaScript off", () => {
  for (const route of routes) {
    test(route, { tag: "@screenshot" }, async ({ page }) => {
      await page.goto(`/${route}`);

      await expect(page).toHaveScreenshot(`${route}.png`);
    });
  }
});
