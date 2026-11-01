import { expect } from "storybook/test";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";

import * as Breadcrumbs from "./breadcrumbs.tsx";

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
  args: { "aria-label": "Breadcrumb", children: trail },
});

export const Default = meta.story({});

Default.test("marks the current page", async ({ canvas }) => {
  await expect(canvas.getByRole("link", { name: "Atlas" })).toHaveAttribute("aria-current", "page");
});

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
  decorators: [withWidth("20rem")],
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
