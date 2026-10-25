import { expect } from "storybook/test";

import { HomeIcon } from "@platform/ui/icons/home";

import preview from "#.storybook/preview.tsx";

import * as Navbar from "./navbar.tsx";

// @ts-expect-error -- a Navbar without aria-label or aria-labelledby leaves its landmark unnamed
<Navbar.Root>{null}</Navbar.Root>;

const links = (
  <>
    <Navbar.Item>
      <Navbar.Link href="#home">
        <HomeIcon data-icon="inline-start" /> Home
      </Navbar.Link>
    </Navbar.Item>
    <Navbar.Item>
      <Navbar.Link href="#work" aria-current="page">
        Work
      </Navbar.Link>
    </Navbar.Item>
    <Navbar.Item>
      <Navbar.Link href="#writing">Writing</Navbar.Link>
    </Navbar.Item>
    <Navbar.Item>
      <Navbar.Link href="#about">About</Navbar.Link>
    </Navbar.Item>
  </>
);

const meta = preview.meta({
  title: "Components/Navbar",
  component: Navbar.Root,
  args: { "aria-label": "Main", children: links },
});

export const Default = meta.story({});

Default.test("is a named navigation landmark with a list of links", async ({ canvas }) => {
  await expect(canvas.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
});

Default.test("names a link by its text and marks the current page", async ({ canvas }) => {
  await expect(canvas.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(canvas.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
});

Default.test("makes every link a tab stop", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Home" })).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Work" })).toHaveFocus();
});

Default.test(
  "renders a router link with asChild",
  {
    args: {
      children: (
        <Navbar.Item>
          <Navbar.Link asChild>
            <a href="#settings">Settings</a>
          </Navbar.Link>
        </Navbar.Item>
      ),
    },
  },
  async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toEqual([
      canvas.getByRole("link", { name: "Settings" }),
    ]);
  },
);
