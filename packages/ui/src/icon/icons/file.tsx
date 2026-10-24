import { Icon, type IconProps } from "../icon.tsx";

export function FileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3h8l5 5v13H6Zm8 0v5h5M9 13h6m-6 4h4" />
    </Icon>
  );
}
