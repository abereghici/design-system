import { Icon, type IconProps } from "../icon.tsx";

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14m-7-7h14" />
    </Icon>
  );
}
