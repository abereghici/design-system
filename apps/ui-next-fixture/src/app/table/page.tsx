import { Table } from "@platform/ui/table";

export default function Page() {
  return (
    <main>
      <Table.Root>
        <Table.Caption>Invoices</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Invoice</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.RowHeader>INV-001</Table.RowHeader>
            <Table.Cell>€250.00</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </main>
  );
}
