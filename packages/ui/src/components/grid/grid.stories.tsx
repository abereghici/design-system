import { Card } from "@abereghici/ui/card";

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
