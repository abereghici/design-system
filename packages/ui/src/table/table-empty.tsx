import type { ComponentProps } from "react";

export interface EmptyProps extends ComponentProps<"td"> {
  /** How many columns the Table has, so the cell spans all of them. */
  colSpan: number;
}

/** The cell that stands in for the rows when there are none: put an EmptyState in it. */
export function Empty(props: EmptyProps) {
  return (
    <tr>
      <td {...props} />
    </tr>
  );
}
