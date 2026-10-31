import NextLink from "next/link";

import { Table } from "@abereghici/ui/table";

const invoices = [
  { id: "INV-001", amount: "€250.00" },
  { id: "INV-002", amount: "€1,180.40" },
];

const ids = invoices.map((invoice) => invoice.id);

export default function Page() {
  return (
    <main>
      <Table.Root selectionMode="multiple" defaultSelectedKeys={ids}>
        <Table.Caption>Invoices</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.SelectAll keys={ids} selectAllLabel="Select all invoices" />
            <Table.ColumnHeader sortDirection="ascending">
              <Table.SortLabel asChild>
                <NextLink href="?sort=invoice">Invoice</NextLink>
              </Table.SortLabel>
            </Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {invoices.map((invoice) => (
            <Table.Row key={invoice.id}>
              <Table.SelectRow value={invoice.id} selectRowLabel={`Select ${invoice.id}`} />
              <Table.RowHeader>{invoice.id}</Table.RowHeader>
              <Table.Cell>{invoice.amount}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </main>
  );
}
