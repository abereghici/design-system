import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15m-8 4v7m4-7v7" />
    </Icon>
  );
}
