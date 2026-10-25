import type { ComponentProps } from "react";

/** The row of ColumnHeaders. */
export function Header(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}
