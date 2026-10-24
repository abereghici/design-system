import { Icon, type IconProps } from "../icon.tsx";

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 8V4h10l2 2v10h-4M4 8h10l2 2v10H4Z" />
    </Icon>
  );
}
