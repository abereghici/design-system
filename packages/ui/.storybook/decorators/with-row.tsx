import type { Decorator } from "@storybook/react-vite";

import { Inline } from "@abereghici/ui/inline";

/** Lays the story's elements out side by side, wrapping when they run out of room. */
export const withRow: Decorator = function WithRow(Story) {
  return (
    <Inline align="start">
      <Story />
    </Inline>
  );
};
