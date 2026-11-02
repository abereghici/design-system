import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16v14H4Zm0 4h16M8 3v4m8-4v4" />
    </Icon>
  );
}
