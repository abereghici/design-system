import type { ComponentProps } from "react";

export function Item(props: ComponentProps<"li">) {
  return <li {...props} />;
}
