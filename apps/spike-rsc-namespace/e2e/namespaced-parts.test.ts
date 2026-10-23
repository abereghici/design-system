import { expect, test } from "@playwright/test";

// Shapes a Server Component can use: the page renders on the server, hydrates, and the Parts share state.
for (const shape of ["namespace-import", "namespace-reexport"]) {
  test(`${shape}: Server Component renders dotted client Parts that hydrate and share state`, async ({
    page,
  }) => {
    const response = await page.goto(`/${shape}`);
    expect(response?.status()).toBe(200);

    const trigger = page.getByRole("button", { name: "Toggle details" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Details content")).toBeHidden();

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Details content")).toBeVisible();
  });
}

// The recommended shape can mix Parts: `Disclosure.Label` is a Server Component (it imports
// `server-only`, so `next build` fails if it ever lands in the client graph) next to client Parts.
test("namespace-reexport: one namespace mixes server and client Parts", async ({ page }) => {
  await page.goto("/namespace-reexport");
  await expect(page.getByRole("heading", { name: "Disclosure label" })).toBeVisible();
});

// Shapes a Server Component cannot use: the Parts hang off one client reference.
for (const shape of ["object-in-client", "static-props-in-client"]) {
  test(`${shape}: dotting into a single client export fails on the server`, async ({ request }) => {
    const response = await request.get(`/${shape}`);
    expect(response.status()).toBe(500);
  });
}
