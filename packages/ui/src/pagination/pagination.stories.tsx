import type { ComponentProps } from "react";
import { expect, within } from "storybook/test";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import type { Locale } from "../provider/locale.tsx";
import { roRO } from "../provider/locales/ro-RO.ts";

import { Pagination } from "./pagination.tsx";

// @ts-expect-error -- a locale must name the pagination landmark and its steps
({ tag: "fr-FR", labels: { ...roRO.labels, pagination: { root: "Pagination" } } }) satisfies Locale;

const controls = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByRole("listitem")
    .map((item) => {
      const control = within(item).queryByRole("link") ?? within(item).getByRole("button");
      return control.getAttribute("aria-label");
    });

const meta = preview.meta({
  title: "Components/Pagination",
  component: Pagination,
  args: { page: 5, count: 10, getPageUrl: (page: number) => `#page-${page}` },
  parameters: {
    docs: {
      description: {
        component:
          "A named navigation landmark of links to the pages of a long, ordered result set: Previous, up to seven page slots with ellipses, Next. Each page is a URL, so it works without client JavaScript and opens in a new tab; pass `linkComponent` for a router link. For a short list show everything; for a feed, load more on demand.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is a navigation landmark named Pagination", async ({ canvas }) => {
  await expect(canvas.getByRole("navigation", { name: "Pagination" })).toBeVisible();
});

Default.test(
  "shows the first, last and neighbouring pages around the current one",
  async ({ canvas, canvasElement }) => {
    await expect(controls(canvasElement)).toEqual([
      "Previous page",
      "Page 1",
      "Page 4",
      "Page 5",
      "Page 6",
      "Page 10",
      "Next page",
    ]);
    const current = canvas.getByRole("link", { name: "Page 5" });
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(current).toHaveTextContent("5");
    await expect(canvas.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "#page-6",
    );
    await expect(canvas.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "#page-4",
    );
  },
);

Default.test("moves through every link with Tab", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Previous page" })).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Page 1" })).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Page 4" })).toHaveFocus();
});

Default.test(
  "on the first page, Previous is a disabled button that stays focusable and does nothing",
  { args: { page: 1 } },
  async ({ canvas, canvasElement, userEvent }) => {
    await expect(controls(canvasElement)).toEqual([
      "Previous page",
      "Page 1",
      "Page 2",
      "Page 3",
      "Page 4",
      "Page 5",
      "Page 10",
      "Next page",
    ]);
    const previous = canvas.getByRole("button", { name: "Previous page" });
    await expect(previous).toHaveAttribute("aria-disabled", "true");
    await userEvent.tab();
    await expect(previous).toHaveFocus();
    const presses = listen("ab-press");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(previous);
    presses.stop();
    await expect(presses.events).toEqual([]);
    await expect(window.location.hash).not.toMatch(/page/v);
  },
);

Default.test(
  "on the last page, Next is disabled",
  { args: { page: 10 } },
  async ({ canvas, canvasElement }) => {
    await expect(controls(canvasElement)).toEqual([
      "Previous page",
      "Page 1",
      "Page 6",
      "Page 7",
      "Page 8",
      "Page 9",
      "Page 10",
      "Next page",
    ]);
    await expect(canvas.getByRole("button", { name: "Next page" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  },
);

Default.test(
  "shows every page when there are seven or fewer",
  { args: { page: 4, count: 7 } },
  async ({ canvasElement }) => {
    await expect(controls(canvasElement)).toEqual([
      "Previous page",
      ...[1, 2, 3, 4, 5, 6, 7].map((page) => `Page ${page}`),
      "Next page",
    ]);
  },
);

Default.test(
  "formats numbers and labels with a locale, and labels override it",
  {
    args: {
      page: 1200,
      count: 1500,
      locale: roRO,
      labels: { page: (page: string) => `Pagina ${page}` },
    },
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("navigation", { name: "Paginare" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Pagina 1.200" })).toHaveTextContent("1.200");
    await expect(canvas.getByRole("link", { name: "Pagina următoare" })).toBeVisible();
  },
);

Default.test(
  "renders its links with linkComponent",
  {
    args: {
      linkComponent: ({ children, ...props }: ComponentProps<"a">) => (
        <a {...props} data-router="">
          {children}
        </a>
      ),
    },
  },
  async ({ canvas }) => {
    for (const link of canvas.getAllByRole("link")) {
      await expect(link).toHaveAttribute("data-router");
    }
  },
);
