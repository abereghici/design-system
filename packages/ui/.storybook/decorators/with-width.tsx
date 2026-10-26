import type { Decorator } from "@storybook/react-vite";

/** Caps the story's width, as a narrow container would; it still shrinks with the viewport. */
export const withWidth = (maxInlineSize: string): Decorator =>
  function WithWidth(Story) {
    return (
      <div style={{ maxInlineSize }}>
        <Story />
      </div>
    );
  };
