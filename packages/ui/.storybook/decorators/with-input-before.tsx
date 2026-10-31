import type { Decorator } from "@storybook/react-vite";

/** Puts a text input named `label` before the story, somewhere for a proof to send focus. */
export const withInputBefore = (label: string): Decorator =>
  function WithInputBefore(Story) {
    return (
      <>
        <input aria-label={label} />
        <Story />
      </>
    );
  };
