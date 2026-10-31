import type { Decorator } from "@storybook/react-vite";

import { Button } from "@abereghici/ui/button";
import { Form } from "@abereghici/ui/form";

import { submitted } from "./with-form.tsx";

/** Puts the story in a search form inside a `<search>` landmark, with a Search button. */
export const withSearch: Decorator = (Story) => (
  <search>
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        submitted(new FormData(event.currentTarget));
      }}
    >
      <Story />
      <Button type="submit">Search</Button>
    </Form>
  </search>
);
