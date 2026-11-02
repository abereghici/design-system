import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 12 9 6.5h6l5.5 5.5-5.5 5.5H9Zm11-1.04v2.08l-1.46 1.46h-2.08L9.5 13.04v-2.08l1.46-1.46h2.08Z" />
    </Icon>
  );
}
