import { expect } from "storybook/test";

import { Card } from "@abereghici/ui/card";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview from "#.storybook/preview.tsx";

import { Grid } from "./grid.tsx";

const card = (title: string, description: string) => (
  <Card.Root>
    <Card.Header>
      <Card.Title>{title}</Card.Title>
      <Card.Description>{description}</Card.Description>
    </Card.Header>
  </Card.Root>
);

const meta = preview.meta({
  title: "Components/Grid",
  component: Grid,
  args: {
    children: (
      <>
        {card("Revenue", "€48,200 this month")}
        {card("Orders", "1,284 this month")}
        {card("Refunds", "12 this month")}
        {card("Customers", "312 new this month")}
      </>
    ),
  },
});

export const Default = meta.story({});

const headings = (canvas: { getAllByRole: (role: "heading") => HTMLElement[] }) =>
  canvas.getAllByRole("heading").map((heading) => heading.getBoundingClientRect());

Default.test(
  "fills a wide container with columns side by side, from the right in right-to-left",
  { decorators: [withWidth("60rem")], globals: { dir: "rtl" } },
  async ({ canvas }) => {
    const [revenue, orders] = headings(canvas);

    await expect(orders?.top).toBe(revenue?.top);
    await expect(orders?.right).toBeLessThan(revenue?.left ?? -Infinity);
    // @ts-expect-error -- the minimum is a size token, never a length
    void (<Grid min="200px" />);
  },
);

Default.test(
  "reflows to one column, without overflowing, in a container narrower than its minimum",
  { decorators: [withWidth("160px")] },
  async ({ canvas, canvasElement }) => {
    const [revenue, orders] = headings(canvas);

    await expect(orders?.top).toBeGreaterThan(revenue?.bottom ?? Infinity);
    await expect(revenue?.right).toBeLessThanOrEqual(
      canvasElement.getBoundingClientRect().left + 160,
    );
  },
);
