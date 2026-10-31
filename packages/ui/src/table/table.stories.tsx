import type { ReactNode } from "react";
import { expect, waitFor } from "storybook/test";

import { EmptyState } from "@abereghici/ui/empty-state";

import { SortableInvoices } from "#.storybook/components/sortable-invoices.tsx";
import { withScroll } from "#.storybook/decorators/with-scroll.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";

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

const meta = preview.meta({
  title: "Components/Table",
  component: Table.Root,
  subcomponents: partsOf(Table),
  args: { children: captioned(body) },
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

InAScrollArea.test("keeps the header in view while the rows scroll", async ({ canvas }) => {
  const box = canvas.getByRole("region", { name: "Invoices, 2026" });
  const columnHeader = canvas.getByRole("columnheader", { name: "Invoice" });
  const offset = () => columnHeader.getBoundingClientRect().top - box.getBoundingClientRect().top;

  await expect(offset()).toBeGreaterThan(0);

  box.scrollTop = 48;

  await waitFor(() => expect(offset()).toBeCloseTo(0, 0));
});

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
