import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function InspectIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5" />
    </Icon>
  );
}
