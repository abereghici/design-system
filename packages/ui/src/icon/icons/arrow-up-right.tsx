import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Icon {...props} data-mirror>
      <path d="M7 17 17 7M9 7h8v8" />
    </Icon>
  );
}
