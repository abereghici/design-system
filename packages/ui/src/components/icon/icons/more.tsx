import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function MoreIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        fill="currentColor"
        stroke="none"
        d="M12 3.5 13.5 5 12 6.5 10.5 5Zm0 7 1.5 1.5-1.5 1.5-1.5-1.5Zm0 7 1.5 1.5-1.5 1.5-1.5-1.5Z"
      />
    </Icon>
  );
}
