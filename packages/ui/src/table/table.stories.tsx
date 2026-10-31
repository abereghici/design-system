import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { EmptyState } from "@abereghici/ui/empty-state";
import { VisuallyHidden } from "@abereghici/ui/visually-hidden";

import { withScroll } from "#.storybook/decorators/with-scroll.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import * as Table from "./table.tsx";

const invoices = [
  { id: "INV-001", status: "Paid", date: "2026-01-05", amount: "€250.00", total: 250 },
  { id: "INV-002", status: "Pending", date: "2026-02-05", amount: "€1,180.40", total: 1180.4 },
  { id: "INV-003", status: "Overdue", date: "2026-03-05", amount: "€74.10", total: 74.1 },
];

const ids = invoices.map((invoice) => invoice.id);

const end = { textAlign: "end" } as const;

const header = (
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeader>Invoice</Table.ColumnHeader>
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

const captioned = (rows: ReactNode, captionId?: string, head: ReactNode = header) => (
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
  args: { children: captioned(body), onSelectionChange: fn() },
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
          "A wide or long table scrolls inside a ScrollArea named by the caption, so the page never scrolls in two axes; `stickyHeader` keeps the column headers in view meanwhile.",
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
  "keeps a sticky header in view while the rows scroll",
  { args: { stickyHeader: true } },
  async ({ canvas }) => {
    const box = canvas.getByRole("region", { name: "Invoices, 2026" });
    const columnHeader = canvas.getByRole("columnheader", { name: "Invoice" });
    const offset = () => columnHeader.getBoundingClientRect().top - box.getBoundingClientRect().top;

    await expect(offset()).toBeGreaterThan(0);

    box.scrollTop = 48;

    await waitFor(() => expect(offset()).toBeCloseTo(0, 0));
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
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader sortDirection="ascending">
            <Table.SortLabel asChild>
              <a href="?sort=invoice">Invoice</a>
            </Table.SortLabel>
          </Table.ColumnHeader>
          <Table.ColumnHeader>Status</Table.ColumnHeader>
          <Table.ColumnHeader>Issued</Table.ColumnHeader>
          <Table.ColumnHeader style={end}>Amount</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>,
    ),
  },
});

type Sort = { column: "id" | "amount"; direction: "ascending" | "descending" };

const selectionHeader = (mode: Table.RootProps["selectionMode"]) =>
  mode === "multiple" ? (
    <Table.SelectAll keys={ids} selectAllLabel="Select all invoices" />
  ) : (
    <Table.ColumnHeader>
      <VisuallyHidden>Chosen</VisuallyHidden>
    </Table.ColumnHeader>
  );

function SortableInvoices(props: Table.RootProps) {
  const [sort, setSort] = useState<Sort>({ column: "id", direction: "ascending" });
  const sorted = invoices.toSorted((a, b) => {
    const order = sort.column === "id" ? a.id.localeCompare(b.id) : a.total - b.total;

    return sort.direction === "ascending" ? order : -order;
  });
  const sortable = (column: typeof sort.column, label: string, style?: CSSProperties) => (
    <Table.ColumnHeader
      style={style}
      sortDirection={sort.column === column ? sort.direction : undefined}
    >
      <Table.SortLabel
        onClick={() => {
          const flip = sort.column === column && sort.direction === "ascending";

          setSort({ column, direction: flip ? "descending" : "ascending" });
        }}
      >
        {label}
      </Table.SortLabel>
    </Table.ColumnHeader>
  );

  return (
    <Table.Root {...props}>
      <Table.Caption>Invoices, 2026</Table.Caption>
      <Table.Header>
        <Table.Row>
          {selectionHeader(props.selectionMode)}
          {sortable("id", "Invoice")}
          {sortable("amount", "Amount", end)}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map((invoice) => (
          <Table.Row key={invoice.id} id={invoice.id}>
            <Table.SelectRow />
            <Table.RowHeader>{invoice.id}</Table.RowHeader>
            <Table.Cell style={end}>{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export const SortingAndSelecting = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          '`selectionMode` adds a `SelectRow` cell to each `Row`, keyed by its `id` and named by its `RowHeader`, and `"multiple"` a `SelectAll` header cell; a `SortLabel` in each sortable `ColumnHeader` lets your handler reorder the rows, and the selection follows them.',
      },
    },
  },
  args: { selectionMode: "multiple", defaultSelectedKeys: new Set(["INV-002"]) },
  render: SortableInvoices,
});

SortingAndSelecting.test(
  "sorts by a pressed column, announced on its header",
  async ({ canvas, userEvent }) => {
    const sortOf = (name: string) =>
      canvas.getByRole("columnheader", { name }).getAttribute("aria-sort");
    const order = () => canvas.getAllByRole("rowheader").map((cell) => cell.textContent);

    await expect([sortOf("Invoice"), sortOf("Amount")]).toEqual(["ascending", null]);
    await userEvent.click(canvas.getByRole("button", { name: "Amount" }));
    await expect([sortOf("Invoice"), sortOf("Amount")]).toEqual([null, "ascending"]);
    await expect(order()).toEqual(["INV-003", "INV-001", "INV-002"]);
  },
);

SortingAndSelecting.test(
  "selects a row with the checkbox its row header names, and keeps it selected through a sort",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("checkbox", { name: "INV-003" }));
    await expect(args.onSelectionChange).toHaveBeenCalledWith(
      new Set(["INV-002", "INV-003"]),
      expect.objectContaining({ reason: "row-press" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Amount" }));
    await expect(canvas.getAllByRole("rowheader")[0]).toHaveTextContent("INV-003");
    await expect(canvas.getByRole("checkbox", { name: "INV-003" })).toBeChecked();
  },
);

SortingAndSelecting.test(
  "selects and clears every row from the header checkbox, which reports mixed meanwhile",
  async ({ canvas, userEvent }) => {
    const selectAll = canvas.getByRole("checkbox", { name: "Select all invoices" });
    const checked = () => canvas.queryAllByRole("checkbox", { checked: true });

    await expect(selectAll).toBePartiallyChecked();
    await userEvent.click(selectAll);
    await expect(checked()).toHaveLength(ids.length + 1);
    await userEvent.click(selectAll);
    await expect(checked()).toEqual([]);
    await expect(selectAll).not.toBePartiallyChecked();
  },
);

SortingAndSelecting.test(
  "keeps the selection, and reports no toggle, when the app cancels the change",
  {
    args: {
      onSelectionChange: (_keys, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const toggles = listen("ab-toggle");

    await userEvent.click(canvas.getByRole("checkbox", { name: "INV-001" }));
    toggles.stop();
    await expect(canvas.getByRole("checkbox", { name: "INV-001" })).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "INV-002" })).toBeChecked();
    await expect(toggles.events).toEqual([]);
  },
);

SortingAndSelecting.test(
  "chooses one row at a time in single selection, and reports the chosen one",
  { args: { selectionMode: "single" } },
  async ({ args, canvas, userEvent }) => {
    const radio = (id: string) => canvas.getByRole("radio", { name: id });

    await userEvent.click(radio("INV-003"));
    await expect(radio("INV-003")).toBeChecked();
    await expect(radio("INV-002")).not.toBeChecked();
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(
      new Set(["INV-003"]),
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
