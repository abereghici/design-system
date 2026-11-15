import { expect } from "storybook/test";

import type { screen } from "storybook/test";

import { Button } from "@abereghici/ui/button";
import { CopyButton } from "@abereghici/ui/copy-button";
import { Link } from "@abereghici/ui/link";
import { Text } from "@abereghici/ui/text";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { atCentre } from "#.storybook/test/pointer.ts";
import { trusted } from "#.storybook/test/trusted.ts";

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

export const Accent = meta.story({
  args: {
    variant: "accent",
    children: (
      <>
        <Card.Header>
          <Card.Title>Let’s work together</Card.Title>
          <Card.Description>Replies within two working days.</Card.Description>
        </Card.Header>
        <Card.Content>
          <Text>Open to design system and front-end roles.</Text>
          <Text color="subtle">Based in Chișinău, working remotely.</Text>
          <Text color="subtlest">Last updated in November.</Text>
          <Link href="#cv">Read the CV</Link>
        </Card.Content>
        <Card.Footer>
          <Button variant="primary">Email me</Button>
          <Button>Book a call</Button>
          <Button variant="tertiary">Later</Button>
          <Button variant="danger">Unsubscribe</Button>
          <CopyButton value="hello@example.com" copiedLabel="Copied" failedLabel="Copying failed">
            Copy email
          </CopyButton>
        </Card.Footer>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "An accent card is the one call to action on a page: its text, links and buttons take colours drawn for the accent fill.",
      },
    },
  },
  play: async ({ canvas }) => {
    const user = await trusted().catch(() => null);

    await user?.click(canvas.getByRole("button", { name: "Copy email" }));
  },
});

// WCAG 2.2 relative luminance of a computed `rgb()` colour.
const luminance = (color: string) => {
  const [r = 0, g = 0, b = 0] = (color.match(/[\d.]+/gv) ?? []).map((channel) => {
    const value = Number(channel) / 255;

    return value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [dark = 0, light = 0] = [luminance(a), luminance(b)].toSorted((x, y) => x - y);

  return (light + 0.05) / (dark + 0.05);
};

const ringStandsOut = async ({
  canvas,
}: {
  canvas: Pick<typeof screen, "getByRole" | "getByText">;
}) => {
  const user = await trusted();
  const button = canvas.getByRole("button", { name: "Email me" });

  // From the description, past the link: the story's play has pressed Copy email.
  await user.click(canvas.getByText("Replies within two working days."));
  await user.keyboard("{Tab}{Tab}");
  await expect(button).toHaveFocus();
  // The Theme switch between proofs restyles the mounted story, so the button's fill may still be
  // fading to the dark one: measure the colours it settles on.
  await Promise.all(button.getAnimations().map(({ finished }) => finished));

  const ring = getComputedStyle(button);
  const fill = getComputedStyle(button.closest("[data-variant='accent']") ?? document.body);

  await expect(ring.outlineStyle).toBe("solid");
  await expect(
    contrast(ring.outlineColor, fill.backgroundColor),
    `${ring.outlineColor} on ${fill.backgroundColor}`,
  ).toBeGreaterThanOrEqual(3);
  await expect(
    contrast(ring.outlineColor, ring.backgroundColor),
    `${ring.outlineColor} on ${ring.backgroundColor}`,
  ).toBeGreaterThanOrEqual(3);
};

Accent.test(
  "draws the focus ring at 3:1 against the accent fill and the button it surrounds",
  { globals: { theme: "light" } },
  ringStandsOut,
);

Accent.test(
  "draws the focus ring at 3:1 against the accent fill and the button it surrounds, dark",
  { globals: { theme: "dark" } },
  ringStandsOut,
);

export const WorstCase = meta.story({
  tags: ["!autodocs"],
  args: {
    children: (
      <>
        <Card.Header>
          <Card.Title>
            Northwind Industries Holdings — production API keys for the EU-West data residency
            region
          </Card.Title>
          <Card.Description>
            1 active · rotated by bartholomew.fitzgerald@northwind-industries-holdings.example.com
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button>Gérer les clés d’accès</Button>
        </Card.Footer>
      </>
    ),
  },
  decorators: [withWidth("18rem")],
});
