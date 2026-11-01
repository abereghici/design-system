import { expect } from "storybook/test";

import { Button } from "@abereghici/ui/button";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { atCentre } from "#.storybook/test/pointer.ts";

import * as Card from "./card.tsx";

const header = (
  <Card.Header>
    <Card.Title>API keys</Card.Title>
    <Card.Description>2 active</Card.Description>
  </Card.Header>
);

const meta = preview.meta({
  title: "Components/Card",
  component: Card.Root,
  subcomponents: partsOf(Card),
  args: {
    children: (
      <>
        {header}
        <Card.Footer>
          <Button>Manage</Button>
        </Card.Footer>
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test(
  "takes the heading level of the child it renders",
  {
    args: {
      children: (
        <Card.Header>
          <Card.Title asChild>
            <h2>API keys</h2>
          </Card.Title>
        </Card.Header>
      ),
    },
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2, name: "API keys" })).toBeVisible();
    await expect(canvas.queryByRole("heading", { level: 3 })).toBeNull();
  },
);

Default.test(
  "renders as the list item it is given, so a list of cards stays a list",
  {
    args: { asChild: true, children: <li>{header}</li> },
    decorators: [
      (Story) => (
        <ul>
          <Story />
        </ul>
      ),
    ],
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent(/^API keys/v);
  },
);

export const Horizontal = meta.story({
  args: { orientation: "horizontal" },
  decorators: [withWidth("36rem")],
  parameters: {
    docs: {
      description: {
        story:
          "From 480 px wide, a horizontal card puts its footer beside the header; narrower, it stacks the footer below.",
      },
    },
  },
});

export const Linked = meta.story({
  args: {
    children: (
      <>
        <Card.Header>
          <Card.Title>
            <a href="#quarterly-report">Quarterly report</a>
          </Card.Title>
          <Card.Description>Updated 2 hours ago</Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button>Share</Button>
        </Card.Footer>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A link in the Title covers the card: the card is one tab stop and announces as its title. Footer actions stay clickable above it.",
      },
    },
  },
});

Linked.test(
  "is one tab stop named by its title, then its actions",
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Quarterly report" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Share" })).toHaveFocus();
  },
);

Linked.test(
  "takes a click anywhere on the card as a click on its title link",
  async ({ canvas }) => {
    await expect(atCentre(canvas.getByText("Updated 2 hours ago"))).toBe(
      canvas.getByRole("link", { name: "Quarterly report" }),
    );
  },
);

Linked.test(
  "takes a click beside its footer actions as a click on its title link",
  async ({ canvas }) => {
    const { right, y, height } = canvas
      .getByRole("button", { name: "Share" })
      .getBoundingClientRect();

    await expect(document.elementFromPoint(right + 40, y + height / 2)).toBe(
      canvas.getByRole("link", { name: "Quarterly report" }),
    );
  },
);

Linked.test("keeps its footer actions clickable", async ({ canvas }) => {
  const share = canvas.getByRole("button", { name: "Share" });

  await expect(atCentre(share)).toBe(share);
});
