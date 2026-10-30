import type { Decorator } from "@storybook/react-vite";

import { Toolbar } from "@abereghici/ui/toolbar";

/** Puts the story in a named Toolbar, which owns the arrow-key navigation of the controls inside. */
export const withToolbar = (label: string): Decorator =>
  function WithToolbar(Story) {
    return (
      <Toolbar aria-label={label}>
        <Story />
      </Toolbar>
    );
  };
