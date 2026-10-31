import { existsSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import type { BrowserContext, Page } from "@playwright/test";

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
    ["table", "Invoice", "/table?sort=invoice"],
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

test.describe("with JavaScript off, a Field control is described by its description", () => {
  for (const [route, name, description] of [
    ["text-field", "Email", "We reply within a day."],
    ["text-area", "Message", "Grows with your text."],
    ["field", "Handle", "Letters and digits."],
  ] as const) {
    test(route, async ({ page }) => {
      await page.goto(`/${route}`);

      await expect(page.getByRole("textbox", { name })).toHaveAccessibleDescription(description);
    });
  }
});

// Each Tier 1 Field control route, what the user enters, and where its native GET form goes.
const fields = [
  [
    "text-field",
    (page: Page) => page.getByRole("textbox", { name: "Email" }).fill("ana@example.com"),
    "/text-field?email=ana%40example.com",
  ],
  [
    "text-area",
    (page: Page) => page.getByRole("textbox", { name: "Message" }).fill("Hi"),
    "/text-area?message=Hi",
  ],
  [
    "password-field",
    (page: Page) => page.getByLabel("Password", { exact: true }).fill("hunter2"),
    "/password-field?password=hunter2",
  ],
  [
    "checkbox",
    (page: Page) => page.getByRole("checkbox", { name: "Email me updates" }).check(),
    "/checkbox?updates=on",
  ],
  [
    "switch",
    (page: Page) => page.getByRole("switch", { name: "Sound" }).check(),
    "/switch?sound=on",
  ],
  [
    "radio-group",
    (page: Page) => page.getByRole("radio", { name: "Monthly" }).check(),
    "/radio-group?plan=monthly",
  ],
  [
    "segmented-control",
    (page: Page) => page.getByRole("radio", { name: "Board" }).check(),
    "/segmented-control?view=board",
  ],
  [
    "slider",
    (page: Page) => page.getByRole("slider", { name: "Volume" }).press("ArrowRight"),
    "/slider?volume=41",
  ],
  [
    "select",
    (page: Page) => page.getByRole("combobox", { name: "Region" }).selectOption("jp"),
    "/select?region=jp",
  ],
  [
    "field",
    (page: Page) => page.getByRole("textbox", { name: "Handle" }).fill("ana"),
    "/field?handle=ana",
  ],
  [
    "form",
    (page: Page) => page.getByRole("textbox", { name: "Query" }).fill("shoes"),
    "/search?q=shoes",
  ],
] as const;

test.describe("with JavaScript off, a Tier 1 Field control submits its form", () => {
  for (const [route, fill, url] of fields) {
    test(route, async ({ page }) => {
      await page.goto(`/${route}`);
      await fill(page);
      await page.getByRole("button", { name: "Submit" }).click();

      await expect(page).toHaveURL(url);
    });
  }

  // A Tier 1 bug, kept failing until fixed: the trigger opens the file picker only through script.
  test("file-trigger", async ({ page }) => {
    test.fail();
    await page.goto("/file-trigger");

    const chooser = page.waitForEvent("filechooser", { timeout: 1000 });

    await page.getByRole("button", { name: "Choose image" }).click();
    await (
      await chooser
    ).setFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("png") });
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL("/file-trigger?avatar=photo.png");
  });
});

const tier2 = [
  "calendar",
  "code-block",
  "combobox",
  "command",
  "context-menu",
  "copy-button",
  "date-field",
  "date-picker",
  "drop-zone",
  "dropdown-menu",
  "number-field",
  "password-field",
  "splitter",
  "table",
  "tabs",
  "tag-group",
  "toast",
  "toaster",
  "toggle-button",
  "toggle-button-group",
  "toolbar",
  "tooltip",
  "tree",
];

test.describe("Tier 2 before hydration", () => {
  test.use({ javaScriptEnabled: true });

  for (const route of tier2) {
    test(`${route}: renders what hydration renders, and passes axe`, async ({ page, context }) => {
      // A Tier 2 bug, kept failing until fixed: once hydrated, Tabs sets hidden="until-found" on its
      // inactive panels, and Chrome then exposes them in the accessibility tree.
      test.fail(route === "tabs");
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

// Tier 2 bugs, kept failing until fixed: these controls show with JavaScript off and do nothing.
const shownWithoutScript = new Set([
  "copy-button",
  "splitter",
  "toggle-button",
  "toggle-button-group",
]);

test.describe("with JavaScript off, a control only script can run is hidden", () => {
  for (const [route, role, name] of [
    ["alert", "button", "Dismiss"],
    ["calendar", "button", "Previous month"],
    ["calendar", "button", "Next month"],
    ["date-picker", "button", "Choose date"],
    ["number-field", "button", "Decrease"],
    ["number-field", "button", "Increase"],
    ["password-field", "button", "Show password"],
    ["table", "checkbox", "Select all invoices"],
    ["table", "checkbox", "INV-001"],
    ["tabs", "tab", "Settings"],
    ["tag-group", "button", "Remove Draft"],
    ["copy-button", "button", "Copy invoice number"],
    ["toggle-button", "button", "Bold"],
    ["toggle-button-group", "button", "Italic"],
    ["splitter", "separator", "Resize folders"],
  ] as const) {
    test(`${route}: ${name}`, async ({ page }) => {
      test.fail(shownWithoutScript.has(route));
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
