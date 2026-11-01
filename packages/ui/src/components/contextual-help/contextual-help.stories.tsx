import { expect, fn, waitFor } from "storybook/test";

import { Field } from "@abereghici/ui/field";
import { Inline } from "@abereghici/ui/inline";

import preview from "#.storybook/preview.tsx";
import { parkPointer, trusted } from "#.storybook/test/trusted.ts";

import { ContextualHelp } from "./contextual-help.tsx";
import type { ContextualHelpChangeEventDetails } from "./contextual-help.tsx";

const help = { title: "Billing cycle", children: "Invoices are sent on the first of each month." };

const meta = preview.meta({
  title: "Components/ContextualHelp",
  component: ContextualHelp,
  args: {
    "aria-label": "About billing cycles",
    ...help,
    onOpenChange: fn<(open: boolean, details: ContextualHelpChangeEventDetails) => void>(),
  },
  beforeEach: parkPointer,
});

export const Default = meta.story({});

Default.test(
  "opens a dialog named by its title from its button, and closes on Escape",
  async ({ canvas, args }) => {
    const user = await trusted();
    const button = canvas.getByRole("button", { name: "About billing cycles" });

    await user.keyboard("{Tab}{Enter}");

    const dialog = await canvas.findByRole("dialog", { name: "Billing cycle" });

    await expect(dialog).toHaveTextContent(help.children);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(button).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenNthCalledWith(
      1,
      true,
      expect.objectContaining({ reason: "trigger-press" }),
    );
    await expect(args.onOpenChange).toHaveBeenNthCalledWith(
      2,
      false,
      expect.objectContaining({ reason: "escape-key" }),
    );
  },
);

Default.test("closes on a press outside", async ({ canvas, args }) => {
  const user = await trusted();

  await user.click(canvas.getByRole("button", { name: "About billing cycles" }));
  await canvas.findByRole("dialog", { name: "Billing cycle" });
  await user.click(document.body, { position: { x: 400, y: 5 } });
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(args.onOpenChange).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ reason: "outside-press" }),
  );
});

export const NextToALabel = meta.story({
  render: (args) => (
    <Field.Root name="cycle">
      <Inline gap="inline-xs">
        <Field.Label>Billing cycle</Field.Label>
        <ContextualHelp {...args} />
      </Inline>
      <Field.Control defaultValue="Monthly" />
    </Field.Root>
  ),
  parameters: {
    docs: {
      description: {
        story: "Beside a Field's label, outside it, so the field's name stays the label alone.",
      },
    },
  },
});
