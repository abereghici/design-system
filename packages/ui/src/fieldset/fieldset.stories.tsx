import { expect } from "storybook/test";

import { TextField } from "@platform/ui/text-field";

import { withForm } from "#.storybook/decorators/with-form.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";

import * as Fieldset from "./fieldset.tsx";

const meta = preview.meta({
  title: "Components/Fieldset",
  component: Fieldset.Root,
  subcomponents: partsOf(Fieldset),
  args: {
    children: (
      <>
        <Fieldset.Legend>Billing address</Fieldset.Legend>
        <TextField
          label="Street"
          name="street"
          autoComplete="street-address"
          defaultValue="Main 1"
        />
        <TextField label="City" name="city" autoComplete="address-level2" />
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test(
  "disables every control inside: skipped by Tab and left out of the submission",
  { args: { disabled: true }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("textbox", { name: "Street" })).toBeDisabled();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Save" })).toHaveFocus();

    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });

    await expect(new FormData(form).has("street")).toBe(false);
  },
);
