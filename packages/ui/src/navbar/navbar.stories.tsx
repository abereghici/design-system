import { expect } from "storybook/test";

import { HomeIcon } from "@platform/ui/icons/home";

import preview, { partsOf } from "#.storybook/preview.tsx";

import * as Navbar from "./navbar.tsx";

// @ts-expect-error -- a Navbar without aria-label or aria-labelledby leaves its landmark unnamed
<Navbar.Root>{null}</Navbar.Root>;

const links = (
  <>
    <Navbar.Item>
      <Navbar.Link href="#home">
        <HomeIcon /> Home
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
  subcomponents: partsOf(Navbar),
  args: { "aria-label": "Main", children: links },
});

export const Default = meta.story({});

Default.test("marks the current page", async ({ canvas }) => {
  await expect(canvas.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
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
