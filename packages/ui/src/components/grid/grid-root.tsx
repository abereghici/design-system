import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";

import styles from "./grid.module.css";

declare module "react" {
  interface CSSProperties {
    "--gap"?: string;
    "--min"?: string;
    [area: `--areas-${string}`]: string | undefined;
    [count: `--columns-${string}`]: number | undefined;
  }
}

const BREAKPOINTS = ["initial", "sm", "md", "lg"] as const;

type PerBreakpoint<Value> = Readonly<Partial<Record<(typeof BREAKPOINTS)[number], Value>>>;

/** One value for every width, or one per breakpoint, each holding from its width up. */
export type Responsive<Value> = Value | PerBreakpoint<Value>;

export interface RootProps extends ComponentProps<"div"> {
  /** The space between rows and between columns. */
  gap?:
    | `stack-${"xs" | "sm" | "md" | "lg" | "xl" | "2xl"}`
    | `inline-${"xs" | "sm" | "md" | "lg" | "xl"}`;
  /** The narrowest a column may get before the grid drops a column, when neither `columns` nor `areas` is set. */
  min?: `container-${"2xs" | "xs" | "sm" | "md" | "lg"}`;
  /** How many equal columns, for a layout designed column by column. */
  columns?: Responsive<number>;
  /** The rows of named areas that each Item takes its place in, one string per row. */
  areas?: Responsive<readonly string[]>;
  /** Makes its one child the grid, such as a list, so its semantics stay. */
  asChild?: boolean;
}

const perBreakpoint = <Value,>(value: Responsive<Value>): value is PerBreakpoint<Value> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Each breakpoint keeps the value below it until it sets its own, and every one is set, so a nested
// Grid never inherits its parent's.
const cascade = <Value,>(
  name: "areas" | "columns",
  value: Responsive<Value> | undefined,
  initial: Value,
  toCss: (value: Value) => string | number,
) => {
  if (value === undefined) return {};

  const set = perBreakpoint(value) ? value : { initial: value };
  let current = initial;

  return Object.fromEntries(
    BREAKPOINTS.map((breakpoint) => {
      current = set[breakpoint] ?? current;

      return [`--${name}-${breakpoint}`, toCss(current)];
    }),
  );
};

/**
 * Lays out its children in a grid. By default it fits as many equal columns as it can, each no
 * narrower than `min`, so a set of cards reflows at any container width with no breakpoints. With
 * `columns` or `areas` it follows a designed layout instead, each Item placed in a named area, and
 * either can change from the `sm` (35em), `md` (47.5em) and `lg` (56.25em) breakpoints up. Those
 * are container widths, so an ancestor must be an inline-size container, as PageLayout and Card
 * are; without one, the grid keeps its `initial` layout.
 *
 * Tier 1: works before hydration.
 */
export function Root({
  gap = "stack-md",
  min = "container-2xs",
  columns,
  areas,
  asChild = false,
  ...props
}: RootProps) {
  const Element = asChild ? Slot : "div";

  return (
    <Element
      {...mergeProps(
        {
          className: [
            styles["root"],
            areas !== undefined && styles["areas"],
            columns !== undefined && styles["columns"],
          ]
            .filter(Boolean)
            .join(" "),
          style: {
            "--gap": `var(--ab-space-${gap})`,
            "--min": `var(--ab-size-${min})`,
            ...cascade("columns", columns, 1, (count) => count),
            ...cascade("areas", areas, [], (rows) =>
              rows.length === 0 ? "none" : rows.map((row) => `"${row}"`).join(" "),
            ),
          },
        },
        props,
      )}
    />
  );
}
