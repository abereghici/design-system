import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </Icon>
  );
}
