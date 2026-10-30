import { expect } from "storybook/test";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";

import * as DescriptionList from "./description-list.tsx";

const details = (
  <>
    <DescriptionList.Item>
      <DescriptionList.Term>Order</DescriptionList.Term>
      <DescriptionList.Details>#4821</DescriptionList.Details>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Placed</DescriptionList.Term>
      <DescriptionList.Details>12 March 2026</DescriptionList.Details>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Shipping address</DescriptionList.Term>
      <DescriptionList.Details>Strada Lipscani 23, Bucharest</DescriptionList.Details>
    </DescriptionList.Item>
  </>
);

const meta = preview.meta({
  title: "Components/DescriptionList",
  component: DescriptionList.Root,
  subcomponents: partsOf(DescriptionList),
  args: { children: details },
});

export const Default = meta.story({});

const rects = (
  canvas: { getByText: (text: string) => HTMLElement },
  term: string,
  value: string,
) => [
  canvas.getByText(term).getBoundingClientRect(),
  canvas.getByText(value).getBoundingClientRect(),
];

Default.test(
  "lines every value up in one column, beside its term, when there is room",
  { decorators: [withWidth("40rem")] },
  async ({ canvas }) => {
    const [order, number] = rects(canvas, "Order", "#4821");
    const [address, street] = rects(canvas, "Shipping address", "Strada Lipscani 23, Bucharest");

    await expect(number?.left).toBeGreaterThanOrEqual(order?.right ?? Infinity);
    await expect(street?.left).toBe(number?.left);
    await expect(address?.left).toBe(order?.left);
  },
);

export const Narrow = meta.story({
  decorators: [withWidth("14rem")],
  parameters: {
    docs: {
      description: {
        story:
          "In a container too narrow for two columns, each value moves below its term, so long values stay readable.",
      },
    },
  },
});

Narrow.test("puts each value below its term", async ({ canvas }) => {
  const [order, number] = rects(canvas, "Order", "#4821");

  await expect(number?.top).toBeGreaterThanOrEqual(order?.bottom ?? Infinity);
  await expect(number?.left).toBe(order?.left);
});
