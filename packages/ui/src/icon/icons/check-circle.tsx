import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15.52 3.5 4.98 4.98v7.04l-4.98 4.98H8.48L3.5 15.52V8.48L8.48 3.5ZM8 12l3 3 5-6" />
    </Icon>
  );
}
