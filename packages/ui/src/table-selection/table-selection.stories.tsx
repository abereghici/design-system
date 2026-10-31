import { expect, fn } from "storybook/test";

import { invoiceIds, SortableInvoices } from "#.storybook/components/sortable-invoices.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import * as TableSelection from "./table-selection.tsx";

const cancel = (_keys: unknown, details: { cancel: () => void }) => {
  details.cancel();
};

const meta = preview.meta({
  title: "Components/TableSelection",
  component: TableSelection.Root,
  subcomponents: partsOf(TableSelection),
  args: {
    children: null,
    selectionMode: "multiple" as const,
    onSelectionChange: fn<(keys: string[], details: TableSelection.ChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({
  args: { defaultSelectedKeys: ["INV-002"] },
  render: SortableInvoices,
});

Default.test(
  "selects a row with its checkbox, and keeps it selected through a sort",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select INV-003" }));
    await expect(args.onSelectionChange).toHaveBeenCalledWith(
      ["INV-002", "INV-003"],
      expect.objectContaining({ reason: "row-press" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Amount" }));
    await expect(canvas.getAllByRole("rowheader")[0]).toHaveTextContent("INV-003");
    await expect(canvas.getByRole("checkbox", { name: "Select INV-003" })).toBeChecked();
  },
);

Default.test(
  "selects and clears every row from the header checkbox, which reports mixed meanwhile",
  async ({ canvas, userEvent }) => {
    const selectAll = canvas.getByRole("checkbox", { name: "Select all invoices" });
    const checked = () => canvas.queryAllByRole("checkbox", { checked: true });

    await expect(selectAll).toBePartiallyChecked();
    await userEvent.click(selectAll);
    await expect(checked()).toHaveLength(invoiceIds.length + 1);
    await userEvent.click(selectAll);
    await expect(checked()).toEqual([]);
    await expect(selectAll).not.toBePartiallyChecked();
  },
);

Default.test(
  "keeps the selection, and reports no toggle, when the app cancels the change",
  { args: { onSelectionChange: cancel } },
  async ({ canvas, userEvent }) => {
    const toggles = listen("ab-toggle");

    await userEvent.click(canvas.getByRole("checkbox", { name: "Select INV-001" }));
    toggles.stop();
    await expect(canvas.getByRole("checkbox", { name: "Select INV-001" })).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Select INV-002" })).toBeChecked();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "chooses one row at a time in single selection, and reports the chosen one",
  { args: { selectionMode: "single" } },
  async ({ args, canvas, userEvent }) => {
    const radio = (id: string) => canvas.getByRole("radio", { name: `Select ${id}` });

    await userEvent.click(radio("INV-003"));
    await expect(radio("INV-003")).toBeChecked();
    await expect(radio("INV-002")).not.toBeChecked();
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(
      ["INV-003"],
      expect.objectContaining({ reason: "row-press" }),
    );
  },
);
