import { Icon, type IconProps } from "../icon.tsx";

export function CodeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 5l-4 14" />
    </Icon>
  );
}
