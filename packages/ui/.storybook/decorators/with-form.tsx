import { fn } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import { Button } from "@abereghici/ui/button";
import { Form } from "@abereghici/ui/form";

/** Receives the data of every submission the browser lets through. */
export const submitted = fn<(data: FormData) => void>();

/** Puts the story in a Form named "Profile" with Save and Reset buttons. */
export const withForm: Decorator = (Story) => (
  <Form
    aria-label="Profile"
    onSubmit={(event) => {
      event.preventDefault();
      submitted(new FormData(event.currentTarget));
    }}
  >
    <Story />
    <Button type="submit">Save</Button>
    <Button type="reset">Reset</Button>
  </Form>
);
