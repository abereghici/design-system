import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m20.31 15.44-4.87 4.87H8.56l-4.87-4.87V8.56l4.87-4.87h6.88l4.87 4.87ZM12 7.5V12l3 3" />
    </Icon>
  );
}
