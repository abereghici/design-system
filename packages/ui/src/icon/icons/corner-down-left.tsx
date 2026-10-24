import { Icon, type IconProps } from "../icon.tsx";

export function CornerDownLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 5v9H5m5-5-5 5 5 5" />
    </Icon>
  );
}
