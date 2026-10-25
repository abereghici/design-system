import { useState } from "react";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";

import { Checkbox } from "@platform/ui/checkbox";
import { EmptyState } from "@platform/ui/empty-state";
import { Link } from "@platform/ui/link";
import { ScrollArea } from "@platform/ui/scroll-area";

import preview, { partsOf } from "#.storybook/preview.tsx";

import * as Table from "./table.tsx";

const invoices = [
  { id: "INV-001", status: "Paid", date: "2026-01-05", amount: "€250.00" },
  { id: "INV-002", status: "Pending", date: "2026-02-05", amount: "€1,180.40" },
  { id: "INV-003", status: "Overdue", date: "2026-03-05", amount: "€74.10" },
];

const end = { textAlign: "end" } as const;

const rows = (
  <>
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeader>Invoice</Table.ColumnHeader>
        <Table.ColumnHeader>Status</Table.ColumnHeader>
        <Table.ColumnHeader>Issued</Table.ColumnHeader>
        <Table.ColumnHeader style={end}>Amount</Table.ColumnHeader>
      </Table.Row>
    </Table.Header>
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
  </>
);

const meta = preview.meta({
  title: "Components/Table",
  component: Table.Root,
  subcomponents: partsOf(Table),
  args: {
    children: (
      <>
        <Table.Caption>Invoices, 2026</Table.Caption>
        {rows}
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test("is a table named by its caption", async ({ canvas }) => {
  await expect(canvas.getByRole("table", { name: "Invoices, 2026" })).toBeVisible();
});

Default.test("exposes column headers, row headers and cells", async ({ canvas }) => {
  const names = (role: string) => canvas.getAllByRole(role).map((cell) => cell.textContent);
  await expect(names("columnheader")).toEqual(["Invoice", "Status", "Issued", "Amount"]);
  await expect(names("rowheader")).toEqual(["INV-001", "INV-002", "INV-003"]);
  await expect(canvas.getAllByRole("row", { name: /INV-002/v })[0]).toHaveTextContent(
    "INV-002Pending2026-02-05€1,180.40",
  );
});

Default.test("adds no tab stops of its own", async ({ userEvent }) => {
  await userEvent.tab();
  await expect(document.body).toHaveFocus();
});

Default.test(
  "is named by aria-label without a caption",
  { args: { "aria-label": "Usage", children: rows } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("table", { name: "Usage" })).toBeVisible();
  },
);

Default.test(
  "keeps a link in a cell as its own tab stop",
  {
    args: {
      children: (
        <Table.Body>
          <Table.Row>
            <Table.RowHeader>
              <Link href="#inv-001">INV-001</Link>
            </Table.RowHeader>
            <Table.Cell>Paid</Table.Cell>
          </Table.Row>
        </Table.Body>
      ),
      "aria-label": "Invoices",
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "INV-001" })).toHaveFocus();
  },
);

export const Empty = meta.story({
  parameters: {
    docs: {
      description: {
        story: "With no rows, one cell spans every column and holds an EmptyState.",
      },
    },
  },
  args: {
    children: (
      <>
        <Table.Caption>Invoices, 2026</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Invoice</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Issued</Table.ColumnHeader>
            <Table.ColumnHeader style={end}>Amount</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan={4}>
              <EmptyState.Root>
                <EmptyState.Title>No invoices yet</EmptyState.Title>
                <EmptyState.Description>Invoices you issue show here.</EmptyState.Description>
              </EmptyState.Root>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </>
    ),
  },
});

Empty.test("keeps its column headers and says why it is empty", async ({ canvas }) => {
  await expect(canvas.getAllByRole("columnheader")).toHaveLength(4);
  await expect(canvas.getByRole("cell", { name: /No invoices yet/v })).toBeVisible();
});

export const InAScrollArea = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "A wide table scrolls inside a ScrollArea named by the caption, so the page never scrolls in two axes.",
      },
    },
  },
  args: {
    style: { minInlineSize: "32rem" },
    children: (
      <>
        <Table.Caption id="invoices-caption">Invoices, 2026</Table.Caption>
        {rows}
      </>
    ),
  },
  decorators: [
    (Story) => (
      <ScrollArea asChild style={{ maxInlineSize: "20rem" }}>
        <section aria-labelledby="invoices-caption">
          <Story />
        </section>
      </ScrollArea>
    ),
  ],
});

InAScrollArea.test(
  "is reached with Tab as a region named by the caption",
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("region", { name: "Invoices, 2026" })).toHaveFocus();
    await expect(canvas.getByRole("table", { name: "Invoices, 2026" })).toBeVisible();
  },
);

const amountOf = (invoice: (typeof invoices)[number]) =>
  Number(invoice.amount.replaceAll(/[€,]/gv, ""));

type Sort = { column: "id" | "amount"; direction: "ascending" | "descending" };

function SortableInvoices() {
  const [sort, setSort] = useState<Sort>({ column: "id", direction: "ascending" });
  const sorted = invoices.toSorted((a, b) => {
    const order = sort.column === "id" ? a.id.localeCompare(b.id) : amountOf(a) - amountOf(b);
    return sort.direction === "ascending" ? order : -order;
  });
  const header = (column: typeof sort.column, label: string, style?: CSSProperties) => (
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
    <Table.Root>
      <Table.Caption>Invoices, 2026</Table.Caption>
      <Table.Header>
        <Table.Row>
          {header("id", "Invoice")}
          <Table.ColumnHeader>Status</Table.ColumnHeader>
          {header("amount", "Amount", end)}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.RowHeader>{invoice.id}</Table.RowHeader>
            <Table.Cell>{invoice.status}</Table.Cell>
            <Table.Cell style={end}>{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export const Sortable = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "Put a `SortLabel` in each sortable `ColumnHeader` and give the sorted one `sortDirection`; your handler reorders the rows.",
      },
    },
  },
  render: SortableInvoices,
});

Sortable.test(
  "sorts by a pressed column, announced on its header",
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

function SelectableInvoices() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(["INV-002"]));
  const all = selected.size === invoices.length;
  return (
    <Table.Root aria-label="Invoices">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>
            <Checkbox
              aria-label="Select all invoices"
              checked={all}
              indeterminate={selected.size > 0 && !all}
              onCheckedChange={(checked) => {
                setSelected(new Set(checked ? invoices.map((invoice) => invoice.id) : []));
              }}
            />
          </Table.ColumnHeader>
          <Table.ColumnHeader>Invoice</Table.ColumnHeader>
          <Table.ColumnHeader style={end}>Amount</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {invoices.map((invoice) => (
          <Table.Row key={invoice.id} selected={selected.has(invoice.id)}>
            <Table.Cell>
              <Checkbox
                aria-label={`Select ${invoice.id}`}
                checked={selected.has(invoice.id)}
                onCheckedChange={(checked) => {
                  const one = new Set([invoice.id]);
                  setSelected((current) =>
                    checked ? current.union(one) : current.difference(one),
                  );
                }}
              />
            </Table.Cell>
            <Table.RowHeader>{invoice.id}</Table.RowHeader>
            <Table.Cell style={end}>{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export const Selectable = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "A first column of native checkboxes selects rows; mark each chosen `Row` `selected`. The header checkbox selects all and shows mixed while only some are chosen.",
      },
    },
  },
  render: SelectableInvoices,
});

Selectable.test("selects rows with their checkboxes", async ({ canvas, userEvent }) => {
  const selectAll = canvas.getByRole("checkbox", { name: "Select all invoices" });
  await expect(selectAll).toBePartiallyChecked();
  await userEvent.click(canvas.getByRole("checkbox", { name: "Select INV-001" }));
  await expect(canvas.getByRole("checkbox", { name: "Select INV-001" })).toBeChecked();
  await userEvent.click(canvas.getByRole("checkbox", { name: "Select INV-003" }));
  await expect(selectAll).toBeChecked();
});

Selectable.test("selects and clears every row from the header", async ({ canvas, userEvent }) => {
  const selectAll = canvas.getByRole("checkbox", { name: "Select all invoices" });
  await userEvent.click(selectAll);
  await userEvent.click(selectAll);
  for (const box of canvas.getAllByRole("checkbox")) await expect(box).not.toBeChecked();
});
