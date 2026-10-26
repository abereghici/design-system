import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function PrinterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9V3h12v6M6 18H4V9h16v9h-2M6 14h12v7H6Z" />
    </Icon>
  );
}
