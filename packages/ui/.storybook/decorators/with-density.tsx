import type { Decorator } from "@storybook/react-vite";

/** Sets a density on the story, as `data-density` on a region of an app would. */
export const withDensity = (density: "compact" | "comfortable"): Decorator =>
  function WithDensity(Story) {
    return (
      <div data-density={density}>
        <Story />
      </div>
    );
  };
