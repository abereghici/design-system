import type { ComponentProps } from "react";

/** One entry of the Sidebar, holding a Link or a Group. */
export function Item(props: ComponentProps<"li">) {
  return <li {...props} />;
}
