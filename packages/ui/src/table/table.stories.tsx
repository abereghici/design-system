import type { ReactNode } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { EmptyState } from "@abereghici/ui/empty-state";

import { invoiceIds, SortableInvoices } from "#.storybook/components/sortable-invoices.tsx";
import { withScroll } from "#.storybook/decorators/with-scroll.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { atCentre } from "#.storybook/test/pointer.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import * as Table from "./table.tsx";

const invoices = [
  { id: "INV-001", status: "Paid", date: "2026-01-05", amount: "€250.00" },
  { id: "INV-002", status: "Pending", date: "2026-02-05", amount: "€1,180.40" },
  { id: "INV-003", status: "Overdue", date: "2026-03-05", amount: "€74.10" },
];

const end = { textAlign: "end" } as const;

const columns = (invoice: ReactNode = "Invoice", sort?: "ascending") => (
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeader sortDirection={sort}>{invoice}</Table.ColumnHeader>
      <Table.ColumnHeader>Status</Table.ColumnHeader>
      <Table.ColumnHeader>Issued</Table.ColumnHeader>
      <Table.ColumnHeader style={end}>Amount</Table.ColumnHeader>
    </Table.Row>
  </Table.Header>
);

const body = (
  <Table.Body>
    {invoices.map((invoice) => (
      <Table.Row key={invoice.id}>
        <Table.RowHeader>{invoice.id}</Table.RowHeader>
        <Table.Cell>{invoice.status}</Table.Cell>
        <Table.Cell>
          <time dateTime={invoice.date}>{invoice.date}</time>
        </Table.Cell>
        <Table.Cell style={end}>{invoice.amount}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
);

const captioned = (rows: ReactNode, captionId?: string, head: ReactNode = columns()) => (
  <>
    <Table.Caption id={captionId}>Invoices, 2026</Table.Caption>
    {head}
    {rows}
  </>
);

const cancel = (_keys: unknown, details: { cancel: () => void }) => {
  details.cancel();
};

const meta = preview.meta({
  title: "Components/Table",
  component: Table.Root,
  subcomponents: partsOf(Table),
  argTypes: {
    selectedKeys: {
      control: false,
      description: "The selected rows' keys, when your state holds them.",
    },
    defaultSelectedKeys: {
      control: false,
      description: "The rows selected on the first render when the Table holds its own state.",
    },
  },
  args: {
    children: captioned(body),
    onSelectionChange: fn<(keys: string[], details: Table.ChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test(
  "is named by aria-label without a caption",
  { args: { "aria-label": "Usage", children: body } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("table", { name: "Usage" })).toBeVisible();
  },
);

export const InAScrollArea = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "A wide or long table scrolls inside a ScrollArea named by the caption, so the page never scrolls in two axes; the column headers stay in view meanwhile.",
      },
    },
  },
  args: { style: { minInlineSize: "32rem" }, children: captioned(body, "invoices-caption") },
  decorators: [withScroll({ maxInlineSize: "20rem", maxBlockSize: "7rem" }, "invoices-caption")],
});

InAScrollArea.test(
  "is reached with Tab as a region named by the caption",
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("region", { name: "Invoices, 2026" })).toHaveFocus();
    await expect(canvas.getByRole("table", { name: "Invoices, 2026" })).toBeVisible();
  },
);

InAScrollArea.test(
  "keeps the header in view while the rows scroll",
  async ({ canvas, userEvent }) => {
    const columnHeader = canvas.getByRole("columnheader", { name: "Invoice" });
    const lastRow = canvas.getByRole("rowheader", { name: "INV-003" });
    const user = await trusted();

    await expect(atCentre(lastRow)).not.toBe(lastRow);
    await userEvent.tab();
    await user.keyboard("{End}");
    await waitFor(() => expect(atCentre(lastRow)).toBe(lastRow));
    await expect(atCentre(columnHeader)).toBe(columnHeader);
  },
);

export const SortedOnTheServer = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "A `SortLabel` with `asChild` gives the sort affordance to your own link, so the server sorts the rows and the Table works before its JavaScript loads.",
      },
    },
  },
  args: {
    children: captioned(
      body,
      undefined,
      columns(
        <Table.SortLabel asChild>
          <a href="?sort=invoice">Invoice</a>
        </Table.SortLabel>,
        "ascending",
      ),
    ),
  },
});

export const Sorting = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "A `SortLabel` in each sortable `ColumnHeader` is a button your handler answers by reordering the rows; the header announces the sort.",
      },
    },
  },
  render: SortableInvoices,
});

Sorting.test(
  "sorts by a pressed column, and reverses it on Enter, announced on its header",
  async ({ canvas, userEvent }) => {
    const sortOf = (name: string) =>
      canvas.getByRole("columnheader", { name }).getAttribute("aria-sort");
    const order = () => canvas.getAllByRole("rowheader").map((cell) => cell.textContent);

    await expect([sortOf("Invoice"), sortOf("Amount")]).toEqual(["ascending", null]);
    await userEvent.click(canvas.getByRole("button", { name: "Amount" }));
    await expect([sortOf("Invoice"), sortOf("Amount")]).toEqual([null, "ascending"]);
    await expect(order()).toEqual(["INV-003", "INV-001", "INV-002"]);
    await userEvent.keyboard("{Enter}");
    await expect(sortOf("Amount")).toBe("descending");
    await expect(order()).toEqual(["INV-002", "INV-001", "INV-003"]);
  },
);

export const RowSelection = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "A `selectionMode` with a `SelectRow` cell in each Row, and a `SelectAll` header cell for `multiple`, lets people select rows; the selection outlives a sort.",
      },
    },
  },
  args: { selectionMode: "multiple", defaultSelectedKeys: ["INV-002"] },
  render: SortableInvoices,
});

RowSelection.test(
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

RowSelection.test(
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

RowSelection.test(
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

RowSelection.test(
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

export const Loading = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "`loading` announces the Table as busy, and `Skeleton` holds the place of the rows, so the page keeps its height while they arrive.",
      },
    },
  },
  args: {
    loading: true,
    children: captioned(
      <Table.Body>
        <Table.Skeleton rows={3} columns={4} />
      </Table.Body>,
    ),
  },
});

Loading.test("announces the table as busy while its rows load", async ({ canvas }) => {
  await expect(canvas.getByRole("table")).toHaveAttribute("aria-busy", "true");
});

export const Empty = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "With no rows to show, an `Empty` cell spans every column, so an EmptyState can say what is missing and what to do next.",
      },
    },
  },
  args: {
    children: captioned(
      <Table.Body>
        <Table.Empty colSpan={4}>
          <EmptyState.Root>
            <EmptyState.Title>No invoices yet</EmptyState.Title>
            <EmptyState.Description>
              Invoices appear here as soon as you bill a customer.
            </EmptyState.Description>
          </EmptyState.Root>
        </Table.Empty>
      </Table.Body>,
    ),
  },
});
