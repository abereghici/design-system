import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function HelpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15.52 3.5 4.98 4.98v7.04l-4.98 4.98H8.48L3.5 15.52V8.48L8.48 3.5ZM9.5 9V8L11 6.5h2L14.5 8v1.5l-2.5 2v1" />
      <path fill="currentColor" stroke="none" d="m12 14.5 1.25 1.25L12 17l-1.25-1.25Z" />
    </Icon>
  );
}
