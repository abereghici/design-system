import { expect } from "storybook/test";

import { Link } from "@platform/ui/link";
import { ScrollArea } from "@platform/ui/scroll-area";

import preview from "#.storybook/preview.tsx";

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
  title: "Components/Containers/Table",
  component: Table.Root,
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
