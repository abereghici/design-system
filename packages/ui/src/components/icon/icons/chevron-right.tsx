import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props} data-mirror>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}
