import { expect } from "storybook/test";

import preview, { partsOf } from "#.storybook/preview.tsx";

import type { Locale } from "../ui-provider/locale.tsx";
import { roRO } from "../ui-provider/locales/ro-RO.ts";

import * as Breadcrumbs from "./breadcrumbs.tsx";

// @ts-expect-error -- a locale must name the breadcrumb landmark
({ tag: "fr-FR", labels: { ...roRO.labels, breadcrumbs: {} } }) satisfies Locale;

const trail = (
  <>
    <Breadcrumbs.Item>
      <Breadcrumbs.Link href="#home">Home</Breadcrumbs.Link>
    </Breadcrumbs.Item>
    <Breadcrumbs.Item>
      <Breadcrumbs.Link href="#projects">Projects</Breadcrumbs.Link>
    </Breadcrumbs.Item>
    <Breadcrumbs.Item>
      <Breadcrumbs.Link href="#atlas" aria-current="page">
        Atlas
      </Breadcrumbs.Link>
    </Breadcrumbs.Item>
  </>
);

const meta = preview.meta({
  title: "Components/Breadcrumbs",
  component: Breadcrumbs.Root,
  subcomponents: partsOf(Breadcrumbs),
  args: { children: trail },
});

export const Default = meta.story({});

Default.test("is a navigation landmark named Breadcrumb", async ({ canvas }) => {
  const nav = canvas.getByRole("navigation", { name: "Breadcrumb" });
  await expect(nav).toBeVisible();
  await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
});

Default.test("marks the current page and orders the trail root first", async ({ canvas }) => {
  const links = canvas.getAllByRole("link");
  await expect(links.map((link) => link.textContent)).toEqual(["Home", "Projects", "Atlas"]);
  await expect(canvas.getByRole("link", { name: "Atlas" })).toHaveAttribute("aria-current", "page");
});

Default.test("moves through its links with Tab", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Home" })).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Projects" })).toHaveFocus();
});

Default.test(
  "takes its landmark name from labels",
  { args: { labels: roRO.labels.breadcrumbs } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("navigation", { name: "Cale de navigare" })).toBeVisible();
  },
);

Default.test(
  "renders a router link with asChild",
  {
    args: {
      children: (
        <Breadcrumbs.Item>
          <Breadcrumbs.Link asChild>
            <a href="#home">Home</a>
          </Breadcrumbs.Link>
        </Breadcrumbs.Item>
      ),
    },
  },
  async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toEqual([canvas.getByRole("link", { name: "Home" })]);
  },
);

export const LongTrail = meta.story({
  args: {
    children: (
      <>
        {["Home", "Workspaces", "Design system", "Components", "Navigation"].map((name) => (
          <Breadcrumbs.Item key={name}>
            <Breadcrumbs.Link href={`#${name}`}>{name}</Breadcrumbs.Link>
          </Breadcrumbs.Item>
        ))}
        <Breadcrumbs.Item>
          <Breadcrumbs.Link href="#current" aria-current="page">
            Breadcrumbs and pagination guidelines for dense data views
          </Breadcrumbs.Link>
        </Breadcrumbs.Item>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 320 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: { description: { story: "A long trail wraps between items; nothing is truncated." } },
  },
});

LongTrail.test("keeps every crumb's full name", async ({ canvas }) => {
  await expect(
    canvas.getByRole("link", {
      name: "Breadcrumbs and pagination guidelines for dense data views",
    }),
  ).toBeVisible();
});
