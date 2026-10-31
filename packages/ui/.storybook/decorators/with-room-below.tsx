import type { Decorator } from "@storybook/react-vite";

/** Leaves room under the story, so a list or popup that opens below it stays on the canvas. */
export const withRoomBelow = (paddingBlockEnd: string): Decorator =>
  function WithRoomBelow(Story) {
    return (
      <div style={{ paddingBlockEnd }}>
        <Story />
      </div>
    );
  };
