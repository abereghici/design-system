import type { CSSProperties } from "react";

import type { Decorator } from "@storybook/react-vite";

import { ScrollArea } from "@abereghici/ui/scroll-area";

/**
 * Puts the story in a ScrollArea named by the element `labelledBy` and sized by `style`, as a
 * table too wide or too tall for its place would be.
 */
export const withScroll = (style: CSSProperties, labelledBy: string): Decorator =>
  function WithScroll(Story) {
    return (
      <ScrollArea asChild style={style}>
        <section aria-labelledby={labelledBy}>
          <Story />
        </section>
      </ScrollArea>
    );
  };
