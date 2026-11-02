import { Icon } from "../icon.tsx";
import type { IconProps } from "../icon.tsx";

export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v11m-5-5 5 5 5-5M4 20h16" />
    </Icon>
  );
}
