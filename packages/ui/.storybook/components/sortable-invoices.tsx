import { useState } from "react";

import { Table } from "@abereghici/ui/table";
import { VisuallyHidden } from "@abereghici/ui/visually-hidden";

const invoices = [
  { id: "INV-001", amount: "€250.00", total: 250 },
  { id: "INV-002", amount: "€1,180.40", total: 1180.4 },
  { id: "INV-003", amount: "€74.10", total: 74.1 },
];

export const invoiceIds = invoices.map((invoice) => invoice.id);

const end = { textAlign: "end" } as const;

type Sort = { column: "id" | "amount"; direction: "ascending" | "descending" };

const selectHeader = (mode: Table.RootProps["selectionMode"]) =>
  mode === "multiple" ? (
    <Table.SelectAll keys={invoiceIds} selectAllLabel="Select all invoices" />
  ) : (
    <Table.ColumnHeader>
      <VisuallyHidden>Chosen</VisuallyHidden>
    </Table.ColumnHeader>
  );

function useSort() {
  const [sort, setSort] = useState<Sort>({ column: "id", direction: "ascending" });
  const sorted = invoices.toSorted((a, b) => {
    const order = sort.column === "id" ? a.id.localeCompare(b.id) : a.total - b.total;

    return sort.direction === "ascending" ? order : -order;
  });
  const header = (column: Sort["column"], label: string, style?: typeof end) => (
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

  return { sorted, header };
}

/**
 * Invoices sorted by the pressed column header; with a `selectionMode`, their rows are selectable.
 * The Table's own `children` are ignored.
 */
export function SortableInvoices(props: Table.RootProps) {
  const { sorted, header } = useSort();
  const mode = props.selectionMode;

  return (
    <Table.Root {...props}>
      <Table.Caption>Invoices, 2026</Table.Caption>
      <Table.Header>
        <Table.Row>
          {mode === undefined ? null : selectHeader(mode)}
          {header("id", "Invoice")}
          {header("amount", "Amount", end)}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map(({ id, amount }) => (
          <Table.Row key={id}>
            {mode === undefined ? null : (
              <Table.SelectRow value={id} selectRowLabel={`Select ${id}`} />
            )}
            <Table.RowHeader>{id}</Table.RowHeader>
            <Table.Cell style={end}>{amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
