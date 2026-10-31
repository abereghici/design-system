import { Table } from "@abereghici/ui/table";
import { TableSelection } from "@abereghici/ui/table-selection";

const invoices = [
  { id: "INV-001", amount: "€250.00" },
  { id: "INV-002", amount: "€1,180.40" },
];

export default function Page() {
  return (
    <main>
      <TableSelection.Root
        selectionMode="multiple"
        defaultSelectedKeys={invoices.map((invoice) => invoice.id)}
      >
        <Table.Root>
          <Table.Caption>Invoices</Table.Caption>
          <Table.Header>
            <Table.Row>
              <TableSelection.SelectAll
                keys={invoices.map((invoice) => invoice.id)}
                selectAllLabel="Select all invoices"
              />
              <Table.ColumnHeader>Invoice</Table.ColumnHeader>
              <Table.ColumnHeader>Amount</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {invoices.map((invoice) => (
              <Table.Row key={invoice.id}>
                <TableSelection.SelectRow
                  value={invoice.id}
                  selectRowLabel={`Select ${invoice.id}`}
                />
                <Table.RowHeader>{invoice.id}</Table.RowHeader>
                <Table.Cell>{invoice.amount}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </TableSelection.Root>
    </main>
  );
}
