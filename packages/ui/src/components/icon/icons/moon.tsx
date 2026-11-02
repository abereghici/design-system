import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15 3-5 1.5L6.5 8 5 12l1.5 4 3.5 3.5 5 1.5 4-1.5-4-2-2.5-3L12 12l.5-2.5 2.5-3 4-2Z" />
    </Icon>
  );
}
