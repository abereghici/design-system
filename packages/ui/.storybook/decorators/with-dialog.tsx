import type { Decorator } from "@storybook/react-vite";

import { Dialog } from "@platform/ui/dialog";

/** Puts the story in an open modal Dialog named "Edit". */
export const withDialog: Decorator = (Story) => (
  <Dialog.Root defaultOpen>
    <Dialog.Content aria-label="Edit">
      <Story />
    </Dialog.Content>
  </Dialog.Root>
);
