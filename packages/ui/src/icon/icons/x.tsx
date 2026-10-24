import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function XIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12m0-12L6 18" />
    </Icon>
  );
}
