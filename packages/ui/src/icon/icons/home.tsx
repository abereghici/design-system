import { Icon, type IconProps } from "../icon.tsx";

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20V10l8-6 8 6v10Zm6 0v-6h4v6" />
    </Icon>
  );
}
