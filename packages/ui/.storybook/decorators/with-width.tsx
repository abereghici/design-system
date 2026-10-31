import type { Decorator } from "@storybook/react-vite";

/**
 * Caps the story's width, as a narrow container would; it still shrinks with the viewport.
 * `roomBelow` leaves space under it, so a list or popup that opens below stays on the canvas.
 */
export const withWidth = (maxInlineSize: string, roomBelow?: string): Decorator =>
  function WithWidth(Story) {
    return (
      <div style={{ maxInlineSize, paddingBlockEnd: roomBelow }}>
        <Story />
      </div>
    );
  };
