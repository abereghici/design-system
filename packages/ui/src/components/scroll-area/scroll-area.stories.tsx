import { expect, waitFor } from "storybook/test";

import preview from "#.storybook/preview.tsx";
import { atCentre } from "#.storybook/test/pointer.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import { ScrollArea } from "./scroll-area.tsx";

const first = "These terms apply to every workspace on the plan.";
const terms = [
  first,
  "Invoices are issued on the first day of each month and are due within 14 days.",
  "Seats can be added at any time; the change is billed from the next invoice.",
  "Removing a seat keeps its history until the end of the billing period.",
  "Exports stay available for 30 days after a workspace is closed.",
  "Support answers within one business day on every plan.",
  "Data is stored in the region chosen when the workspace was created.",
  "Either party may end the agreement with 30 days' written notice.",
];

const meta = preview.meta({
  title: "Components/ScrollArea",
  component: ScrollArea,
  args: {
    style: { maxBlockSize: "10rem", maxInlineSize: "24rem" },
    children: terms.map((term) => <p key={term}>{term}</p>),
  },
});

export const Default = meta.story({});

Default.test("scrolls with the keyboard once Tab reaches it", async ({ canvas }) => {
  const user = await trusted();
  const last = canvas.getByText(terms.at(-1) ?? "");

  await expect(atCentre(last)).not.toBe(last);
  await user.keyboard("{Tab}{End}");
  await waitFor(() => expect(atCentre(last)).toBe(last));
});

Default.test(
  "renders a named section as a region through asChild",
  {
    args: {
      asChild: true,
      children: (
        <section aria-label="Terms">
          {terms.map((term) => (
            <p key={term}>{term}</p>
          ))}
        </section>
      ),
    },
  },
  async ({ canvas, userEvent }) => {
    const region = canvas.getByRole("region", { name: "Terms" });

    await userEvent.tab();
    await expect(region).toHaveFocus();
  },
);

Default.test(
  "leaves the tab order with tabIndex -1, so focusable content comes first",
  {
    args: {
      tabIndex: -1,
      children: terms.map((term) => (
        <p key={term}>
          <a href="#terms">{term}</a>
        </p>
      )),
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: first })).toHaveFocus();
  },
);
