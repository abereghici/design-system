import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15.52 3.5 4.98 4.98v7.04l-4.98 4.98H8.48L3.5 15.52V8.48L8.48 3.5ZM12 11v5.5" />
      <path fill="currentColor" stroke="none" d="m12 6.5 1.25 1.25L12 9l-1.25-1.25Z" />
    </Icon>
  );
}
