import type { Decorator } from "@storybook/react-vite";

import { Stack } from "@abereghici/ui/stack";

/**
 * Renders the story once in each inline-size container, so a container query shows every layout
 * at once; each container still shrinks with the viewport.
 */
export const withContainers = (...inlineSizes: string[]): Decorator =>
  function WithContainers(Story) {
    return (
      <Stack gap="stack-xl">
        {inlineSizes.map((inlineSize) => (
          <div
            key={inlineSize}
            style={{ containerType: "inline-size", inlineSize, maxInlineSize: "100%" }}
          >
            <Story />
          </div>
        ))}
      </Stack>
    );
  };
