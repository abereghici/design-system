import { expect, waitFor } from "storybook/test";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview from "#.storybook/preview.tsx";
import { trusted } from "#.storybook/test/trusted.ts";

import { CodeBlock } from "./code-block.tsx";

const meta = preview.meta({
  title: "Components/CodeBlock",
  component: CodeBlock,
  args: { children: 'import { Button } from "@abereghici/ui/button";' },
});

export const Default = meta.story({});

Default.test("shows the code as written, and takes no Tab stop", async ({ canvas, userEvent }) => {
  await expect(canvas.getByText('import { Button } from "@abereghici/ui/button";')).toBeVisible();
  await userEvent.tab();
  await expect(document.body).toHaveFocus();
});

export const Scrolling = meta.story({
  args: {
    children: `const invoice = await client.invoices.create({ customer, currency: "EUR", lines });`,
  },
  decorators: [withWidth("18rem")],
  parameters: {
    docs: {
      description: {
        story: "Code too wide for its container scrolls, and keyboard users can Tab to it.",
      },
    },
  },
});

Scrolling.test("becomes a Tab stop so keyboard users can scroll it", async () => {
  // Only trusted keys scroll a container; user-event's are synthetic.
  const user = await trusted();

  await user.tab();

  const focused = document.activeElement;

  await expect(focused).toHaveTextContent(/const invoice/v);
  await user.keyboard("{ArrowRight}");
  await waitFor(() => expect(focused?.scrollLeft).toBeGreaterThan(0));
});
