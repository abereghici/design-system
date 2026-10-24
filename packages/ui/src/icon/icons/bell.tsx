import { Icon, type IconProps } from "../icon.tsx";

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 17v-6l2-5 4-2 4 2 2 5v6M4 17h16m-10 3.5h4" />
    </Icon>
  );
}
