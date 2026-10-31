import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../slot/slot.tsx";

declare module "react" {
  interface CSSProperties {
    "--gap"?: string;
    "--align"?: string;
    "--justify"?: string;
  }
}

export interface FlexProps extends ComponentProps<"div"> {
  /** A space token's name, such as `stack-md`. */
  gap: string;
  align: string;
  justify: string;
  asChild: boolean;
}

/** The body of Stack and Inline: their own class lays the children out; this passes the spacing. */
export function Flex({ gap, align, justify, asChild, ...props }: FlexProps) {
  const Element = asChild ? Slot : "div";

  return (
    <Element
      {...mergeProps(
        { style: { "--gap": `var(--ab-space-${gap})`, "--align": align, "--justify": justify } },
        props,
      )}
    />
  );
}
