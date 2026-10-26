import type { Decorator } from "@storybook/react-vite";

import { Field } from "@platform/ui/field";

/** Puts the story in an invalid Field that shows `error`, as after a blocked submit. */
export const withInvalidField = (error: string): Decorator =>
  function WithInvalidField(Story) {
    return (
      <Field.Root invalid>
        <Story />
        <Field.Error>{error}</Field.Error>
      </Field.Root>
    );
  };
