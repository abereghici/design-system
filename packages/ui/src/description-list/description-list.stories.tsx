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
