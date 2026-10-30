import { expect } from "storybook/test";

import { Card } from "@abereghici/ui/card";
import { Heading } from "@abereghici/ui/heading";
import { Logo } from "@abereghici/ui/logo";
import { Navbar } from "@abereghici/ui/navbar";
import { Sidebar } from "@abereghici/ui/sidebar";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";

import * as PageLayout from "./page-layout.tsx";

const shell = (
  <>
    <PageLayout.Header>
      <Logo label="Bereghici" />
      <Navbar.Root aria-label="Main">
        <Navbar.Item>
          <Navbar.Link href="#orders" aria-current="page">
            Orders
          </Navbar.Link>
        </Navbar.Item>
        <Navbar.Item>
          <Navbar.Link href="#customers">Customers</Navbar.Link>
        </Navbar.Item>
      </Navbar.Root>
    </PageLayout.Header>
    <PageLayout.Navigation>
      <Sidebar.Root aria-label="Workspace">
        <Sidebar.Group label="Reports">
          <Sidebar.Item>
            <Sidebar.Link href="#revenue" aria-current="page">
              Revenue
            </Sidebar.Link>
          </Sidebar.Item>
          <Sidebar.Item>
            <Sidebar.Link href="#refunds">Refunds</Sidebar.Link>
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Root>
    </PageLayout.Navigation>
    <PageLayout.Content>
      <Heading as="h1">Revenue</Heading>
      <Card.Root>
        <Card.Header>
          <Card.Title asChild>
            <h2>This month</h2>
          </Card.Title>
          <Card.Description>€48,200</Card.Description>
        </Card.Header>
      </Card.Root>
    </PageLayout.Content>
    <PageLayout.Aside aria-label="Activity">
      <Heading as="h2">Activity</Heading>
    </PageLayout.Aside>
  </>
);

const meta = preview.meta({
  title: "Components/PageLayout",
  component: PageLayout.Root,
  subcomponents: partsOf(PageLayout),
  args: { children: shell },
});

export const Default = meta.story({});

const regions = (canvas: { getByRole: (role: string, options?: object) => HTMLElement }) => ({
  navigation: canvas.getByRole("navigation", { name: "Workspace" }).getBoundingClientRect(),
  main: canvas.getByRole("main").getBoundingClientRect(),
  banner: canvas.getByRole("banner").getBoundingClientRect(),
});

Default.test(
  "puts the navigation beside the main content, under the header, in a wide container",
  { decorators: [withWidth("64rem")] },
  async ({ canvas }) => {
    const { navigation, main, banner } = regions(canvas);

    await expect(navigation.right).toBeLessThanOrEqual(main.left);
    await expect(main.top).toBeGreaterThanOrEqual(banner.bottom);
  },
);

Default.test(
  "puts the navigation above the main content, in reading order, in a narrow container",
  { decorators: [withWidth("320px")] },
  async ({ canvas, canvasElement }) => {
    const { navigation, main } = regions(canvas);

    await expect(main.top).toBeGreaterThanOrEqual(navigation.bottom);
    await expect(canvasElement.scrollWidth).toBe(canvasElement.clientWidth);
  },
);

Default.test(
  "mirrors in right-to-left, so the navigation sits on the right of the main content",
  { decorators: [withWidth("64rem")], globals: { dir: "rtl" } },
  async ({ canvas }) => {
    const { navigation, main } = regions(canvas);

    await expect(navigation.left).toBeGreaterThanOrEqual(main.right);
  },
);
