import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

import { routes, serve } from "./static-export.ts";

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

test.describe("with JavaScript off, ContextualHelp opens from its button", () => {
  test("Escape and a press outside close it", async ({ page }) => {
    await page.goto("/contextual-help");

    const button = page.getByRole("button", { name: "About billing cycles" });
    const dialog = page.getByRole("dialog", { name: "Billing cycle" });

    await button.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await button.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(400, 5);
    await expect(dialog).toBeHidden();
  });
});

test.describe("with JavaScript off, a <details> section opens and closes", () => {
  for (const [route, summary, content] of [
    ["accordion", "Billing", "Invoices are sent monthly."],
    ["disclosure", "Advanced settings", "Retries stop after five attempts."],
  ] as const) {
    test(route, async ({ page }) => {
      await page.goto(`/${route}`);
      await page.getByText(summary).click();

      await expect(page.getByText(content)).toBeHidden();

      await page.getByText(summary).click();

      await expect(page.getByText(content)).toBeVisible();
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

// Each Tier 1 Field control route, and each Tier 2 one with a native fallback, what the user enters,
// and where its native GET form goes.
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
    "search-field",
    (page: Page) => page.getByRole("searchbox", { name: "Search invoices" }).fill("april"),
    "/search-field?q=april",
  ],
  [
    "otp-field",
    (page: Page) => page.getByRole("textbox", { name: "Verification code" }).fill("482719"),
    "/otp-field?code=482719",
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
  [
    "date-field",
    (page: Page) => page.getByRole("textbox", { name: "Date of birth" }).fill("2026-10-24"),
    "/date-field?birthDate=2026-10-24",
  ],
  [
    "time-field",
    (page: Page) => page.getByRole("textbox", { name: "Start time" }).fill("14:30"),
    "/time-field?start=14%3A30",
  ],
  [
    "date-range-picker",
    async (page: Page) => {
      await page.getByRole("textbox", { name: "Start date" }).fill("2026-10-12");
      await page.getByRole("textbox", { name: "End date" }).fill("2026-10-16");
    },
    "/date-range-picker?checkIn=2026-10-12&checkOut=2026-10-16",
  ],
] as const;

test.describe("with JavaScript off, a Field control submits its form", () => {
  for (const [route, fill, url] of fields) {
    test(route, async ({ page }) => {
      await page.goto(`/${route}`);
      await fill(page);
      await page.getByRole("button", { name: "Submit" }).click();

      await expect(page).toHaveURL(url);
    });
  }

  // With JavaScript off, the native file input stands in for the trigger, named by its text.
  test("file-trigger", async ({ page }) => {
    await page.goto("/file-trigger");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Choose image" })).toBeFocused();

    const chooser = page.waitForEvent("filechooser", { timeout: 1000 });

    await page.getByRole("button", { name: "Choose image" }).click();
    await (
      await chooser
    ).setFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("png") });
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL("/file-trigger?avatar=photo.png");
  });
});

// Each Tier 2 Field control route, what the user types, and the starting values its form submits.
const startingValues = [
  [
    "combobox",
    (page: Page) => page.getByRole("combobox", { name: "Assignee" }).fill("Erik"),
    "/combobox?assignee=ab&reviewers=ab&reviewers=eh",
  ],
] as const;

test.describe("with JavaScript off, a Tier 2 Field control submits its starting value", () => {
  for (const [route, fill, url] of startingValues) {
    test(route, async ({ page }) => {
      await page.goto(`/${route}`);
      await fill(page);
      await page.getByRole("button", { name: "Submit" }).click();

      await expect(page).toHaveURL(url);
    });
  }
});

test.describe("with JavaScript off, a Slider", () => {
  test("moves where it is pressed", async ({ page }) => {
    await page.goto("/slider");

    const slider = page.getByRole("slider", { name: "Volume" });
    const { width, height } = (await slider.boundingBox()) ?? { width: 0, height: 0 };

    await slider.click({ position: { x: width - 1, y: height / 2 } });
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL("/slider?volume=100");
  });

  test("shows no value it can't keep up with", async ({ page }) => {
    await page.goto("/slider");
    await page.getByRole("slider", { name: "Volume" }).press("ArrowRight");

    expect(await page.getByRole("main").ariaSnapshot()).toBe(
      '- main:\n  - slider "Volume": "41"\n  - button "Submit"',
    );
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
  "date-range-picker",
  "drop-zone",
  "dropdown-menu",
  "number-field",
  "password-field",
  "range-calendar",
  "search-field",
  "splitter",
  "table",
  "tabs",
  "tag-group",
  "time-field",
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
    ["combobox", "button", "Remove Erik Halvorsen"],
    ["calendar", "button", "Next month"],
    ["date-field", "spinbutton", "lună"],
    ["date-picker", "button", "Choose date"],
    ["date-range-picker", "button", "Choose dates"],
    ["number-field", "button", "Decrease"],
    ["number-field", "button", "Increase"],
    ["password-field", "button", "Show password"],
    ["range-calendar", "button", "Previous month"],
    ["search-field", "button", "Clear search"],
    ["table", "checkbox", "Select all invoices"],
    ["table", "checkbox", "INV-001"],
    ["tabs", "tab", "Settings"],
    ["tag-group", "button", "Remove Draft"],
    ["time-field", "spinbutton", "oră"],
    ["copy-button", "button", "Copy invoice number"],
    ["toggle-button", "button", "Bold"],
    ["toggle-button-group", "button", "Italic"],
    ["splitter", "separator", "Resize folders"],
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
