import { Content as ModalContent } from "../dialog/dialog-content.tsx";
import type { ContentProps as ModalContentProps } from "../dialog/dialog-content.tsx";

export interface ContentProps extends ModalContentProps {
  /** The edge it slides from, following the reading direction: `"end"` is the right in English. */
  side?: "start" | "end";
}

export function Content({ side = "end", ...props }: ContentProps) {
  return <ModalContent {...props} data-side={side} />;
}
