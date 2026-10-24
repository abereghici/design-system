import type { ComponentProps } from "react";

export { Root } from "./select-root.tsx";
export type { ChangeEventDetails, RootProps } from "./select-root.tsx";

export interface ItemProps extends ComponentProps<"option"> {
  value: string;
}

/** Text, optionally after a decorative Icon, which only engines with customizable select show. */
export function Item(props: ItemProps) {
  return <option {...props} />;
}

export interface GroupProps extends ComponentProps<"optgroup"> {
  label: string;
}

export function Group(props: GroupProps) {
  return <optgroup {...props} />;
}
