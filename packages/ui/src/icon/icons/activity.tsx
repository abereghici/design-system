import { Icon, type IconProps } from "../icon.tsx";

export function ActivityIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12h4l3-7 6 14 3-7h4" />
    </Icon>
  );
}
