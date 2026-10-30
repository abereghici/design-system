import type { Decorator } from "@storybook/react-vite";

/** Gives the story a fixed height, as a page region or a sized container would. */
export const withHeight = (blockSize: string): Decorator =>
  function WithHeight(Story) {
    return (
      <div style={{ blockSize }}>
        <Story />
      </div>
    );
  };
