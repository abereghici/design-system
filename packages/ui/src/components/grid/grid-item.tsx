import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";

import type { Responsive } from "./grid-root.tsx";

type Names<Row extends string> = Row extends `${infer Head} ${infer Tail}`
  ? Names<Head> | Names<Tail>
  : Row extends "" | `.${string}`
    ? never
    : Row;

type RowsOf<Areas> = Areas extends readonly (infer Row extends string)[]
  ? Row
  : { [Key in keyof Areas]: RowsOf<Areas[Key]> }[keyof Areas];

export interface ItemProps<
  Areas extends Responsive<readonly string[]> = readonly string[],
> extends ComponentProps<"div"> {
  /** The named area it takes, from the Root's `areas`. */
  area: Names<RowsOf<Areas>>;
  /** Makes its one child the Item, such as a Card, so its semantics stay. */
  asChild?: boolean;
}

/**
 * One child of a Grid placed in a named area. Pass the type of the Root's `areas`, declared
 * `as const`, as `Grid.Item<typeof areas>`, and an area the layout doesn't declare fails to compile.
 */
export function Item<Areas extends Responsive<readonly string[]> = readonly string[]>({
  area,
  asChild = false,
  ...props
}: ItemProps<Areas>) {
  const Element = asChild ? Slot : "div";

  return <Element {...mergeProps({ style: { gridArea: area } }, props)} />;
}
