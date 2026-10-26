import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15.23 8.84-1.89 1.89h-2.68L8.77 8.84V6.16l1.89-1.89h2.68l1.89 1.89ZM5 21v-3l3-3h8l3 3v3" />
    </Icon>
  );
}
