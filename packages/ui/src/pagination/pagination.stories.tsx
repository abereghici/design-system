import type { ComponentProps } from "react";
import { expect, within } from "storybook/test";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { Pagination } from "./pagination.tsx";
import type { PaginationProps } from "./pagination.tsx";

// @ts-expect-error -- the landmark and the Previous and Next buttons need names
({ page: 1, count: 2, getPageUrl: String }) satisfies PaginationProps;

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
  args: {
    "aria-label": "Pagination",
    previousLabel: "Previous page",
    nextLabel: "Next page",
    getPageLabel: (page: string) => `Page ${page}`,
    page: 5,
    count: 10,
    getPageUrl: (page: number) => `#page-${page}`,
    locale: "en-US",
  },
});

export const Default = meta.story({});

// The aria snapshot holds the pages shown, their names and URLs; it doesn't record aria-current.
Default.test("marks the current page", async ({ canvas }) => {
  await expect(canvas.getByRole("link", { name: "Page 5" })).toHaveAttribute(
    "aria-current",
    "page",
  );
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
  "formats page numbers in its locale, and names page links with getPageLabel",
  {
    args: {
      page: 1200,
      count: 1500,
      locale: "ro-RO",
      getPageLabel: (page: string) => `Pagina ${page}`,
    },
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Pagina 1.200" })).toHaveTextContent("1.200");
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
