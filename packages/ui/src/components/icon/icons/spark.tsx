import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function SparkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z" />
    </Icon>
  );
}
