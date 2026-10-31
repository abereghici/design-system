import type { Page } from "@playwright/test";

// Each Tier 1 Field control route, and each Tier 2 one with a native fallback, what the user enters,
// and where its native GET form goes.
export const fieldRoutes = [
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
