import { expect } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import { Button } from "@platform/ui/button";

import preview from "#.storybook/preview.tsx";

import * as Card from "./card.tsx";

const header = (
  <Card.Header>
    <Card.Title>API keys</Card.Title>
    <Card.Description>2 active</Card.Description>
  </Card.Header>
);

const withWidth = (inlineSize: string): Decorator =>
  function WithWidth(Story) {
    return (
      <div style={{ inlineSize }}>
        <Story />
      </div>
    );
  };

const center = (element: Element) => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return document.elementFromPoint(x + width / 2, y + height / 2);
};

const meta = preview.meta({
  title: "Components/Card",
  component: Card.Root,
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

Default.test("names itself with a level-3 heading", async ({ canvas }) => {
  await expect(canvas.getByRole("heading", { level: 3, name: "API keys" })).toBeVisible();
});

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

Default.test(
  "puts the footer beside the header in row layout when 480 px or wider",
  { args: { layout: "row" }, decorators: [withWidth("36rem")] },
  async ({ canvas }) => {
    const title = canvas.getByRole("heading", { name: "API keys" }).getBoundingClientRect();
    const action = canvas.getByRole("button", { name: "Manage" }).getBoundingClientRect();
    await expect(action.left).toBeGreaterThan(title.right);
  },
);

Default.test(
  "stacks in row layout when narrower than 480 px",
  { args: { layout: "row" }, decorators: [withWidth("20rem")] },
  async ({ canvas }) => {
    const title = canvas.getByRole("heading", { name: "API keys" }).getBoundingClientRect();
    const action = canvas.getByRole("button", { name: "Manage" }).getBoundingClientRect();
    await expect(action.top).toBeGreaterThan(title.bottom);
  },
);

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
    await expect(center(canvas.getByText("Updated 2 hours ago"))).toBe(
      canvas.getByRole("link", { name: "Quarterly report" }),
    );
  },
);

Linked.test("keeps its footer actions clickable", async ({ canvas }) => {
  const share = canvas.getByRole("button", { name: "Share" });
  await expect(center(share)).toBe(share);
});
