import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function BriefcaseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8h18v12H3Zm6 0V5h6v3M3 13h18" />
    </Icon>
  );
}
