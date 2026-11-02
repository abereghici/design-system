import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function CapIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m2 9 10-5 10 5-10 5Zm4 2v5l6 3 6-3v-5m4-2v6" />
    </Icon>
  );
}
