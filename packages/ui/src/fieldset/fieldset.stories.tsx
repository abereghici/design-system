import { expect } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import preview from "#.storybook/preview.tsx";

import { TextField } from "../text-field/text-field.tsx";

import * as Fieldset from "./fieldset.tsx";

const inAForm: Decorator = (Story) => (
  <form aria-label="Billing">
    <Story />
  </form>
);

const meta = preview.meta({
  title: "Components/Fieldset",
  component: Fieldset.Root,
  args: {
    children: (
      <>
        <Fieldset.Legend>Billing address</Fieldset.Legend>
        <TextField label="Street" name="street" autoComplete="street-address" defaultValue="Main 1" />
        <TextField label="City" name="city" autoComplete="address-level2" />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Groups related controls under one caption, its Legend, and can disable them all at once. It is the native `<fieldset>` with its `<legend>`. For a single choice among options use RadioGroup.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is a group named by its legend", async ({ canvas }) => {
  await expect(canvas.getByRole("group", { name: "Billing address" })).toContainElement(
    canvas.getByRole("textbox", { name: "City" }),
  );
});

Default.test(
  "disables every control inside: skipped by Tab and left out of the submission",
  { args: { disabled: true }, decorators: [inAForm] },
  async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("textbox", { name: "Street" })).toBeDisabled();
    await userEvent.tab();
    await expect(document.body).toHaveFocus();
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Billing" });
    await expect(new FormData(form).has("street")).toBe(false);
  },
);
