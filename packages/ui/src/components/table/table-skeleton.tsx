import "@abereghici/tokens/components/table.css";

import { Skeleton as Placeholder } from "../skeleton/skeleton.tsx";

import { Cell } from "./table-cell.tsx";
import { Row } from "./table-row.tsx";

export interface SkeletonProps {
  /** How many rows to hold the place of; stay close to the number you expect. */
  rows?: number;
  /** How many columns the Table has. */
  columns: number;
}

/**
 * Rows that hold the place of data still loading, so the Table keeps its height; mark the Root
 * `loading` with them, which announces it as busy.
 */
export function Skeleton({ rows = 3, columns }: SkeletonProps) {
  return Array.from({ length: rows }, (_, row) => (
    <Row key={row}>
      {Array.from({ length: columns }, (_cell, column) => (
        <Cell key={column}>
          <Placeholder />
        </Cell>
      ))}
    </Row>
  ));
}
