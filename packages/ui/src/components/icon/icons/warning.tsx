import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function WarningIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3.5 9 16H3Zm0 6v4" />
      <path fill="currentColor" stroke="none" d="m12 15 1.25 1.25L12 17.5l-1.25-1.25Z" />
    </Icon>
  );
}
