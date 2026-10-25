import type { ComponentProps } from "react";

/** One entry of the Navbar, holding a Link. */
export function Item(props: ComponentProps<"li">) {
  return <li {...props} />;
}
