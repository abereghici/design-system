import { Card } from "@abereghici/ui/card";

import { withContainers } from "#.storybook/decorators/with-containers.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";

import * as Grid from "./grid.tsx";

const card = (title: string, description: string) => (
  <Card.Root>
    <Card.Header>
      <Card.Title>{title}</Card.Title>
      <Card.Description>{description}</Card.Description>
    </Card.Header>
  </Card.Root>
);

const bento = {
  initial: ["profile", "work", "links", "contact"],
  sm: ["profile profile", "work links", "contact contact"],
  lg: ["profile profile work links", "profile profile contact contact"],
} as const;

const meta = preview.meta({
  title: "Components/Grid",
  component: Grid.Root,
  subcomponents: partsOf(Grid),
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

export const NamedAreas = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "One column below `sm`, two from `sm` and four from `lg`, each tile in its named area.",
      },
    },
  },
  args: { columns: { initial: 1, sm: 2, lg: 4 }, areas: bento },
  decorators: [withContainers("20em", "45em", "60em")],
  render: (args) => (
    <Grid.Root {...args}>
      <Grid.Item<typeof bento> area="profile" asChild>
        {card("Alexandru Bereghici", "Software engineer building design systems")}
      </Grid.Item>
      <Grid.Item<typeof bento> area="work" asChild>
        {card("Work", "Twelve years on the web")}
      </Grid.Item>
      <Grid.Item<typeof bento> area="links" asChild>
        {card("Links", "GitHub, LinkedIn and the blog")}
      </Grid.Item>
      <Grid.Item<typeof bento> area="contact" asChild>
        {card("Contact", "Write to me about a project")}
      </Grid.Item>
    </Grid.Root>
  ),
});
