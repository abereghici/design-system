import { expect, fn } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Button } from "../button/button.tsx";
import { TextField } from "../text-field/text-field.tsx";

import { Form } from "./form.tsx";

const meta = preview.meta({
  title: "Components/Forms/Form",
  component: Form,
  args: {
    "aria-label": "Sign up",
    onSubmit: fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    }),
    children: (
      <>
        <TextField label="Email" name="email" type="email" required autoComplete="email" />
        <TextField label="Name" name="name" required autoComplete="name" />
        <Button type="submit" variant="primary">
          Create account
        </Button>
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test("is a form landmark named by its label", async ({ canvas }) => {
  await expect(canvas.getByRole("form", { name: "Sign up" })).toBeVisible();
});

Default.test(
  "blocks the submit and focuses the first invalid field",
  async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ana");
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));
    const email = canvas.getByRole("textbox", { name: "Email" });
    await expect(email).toHaveFocus();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("textbox", { name: "Name" })).not.toHaveAttribute("aria-invalid");
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
);

Default.test("submits once every field is valid", async ({ args, canvas, userEvent }) => {
  await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ana@example.com");
  await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ana");
  await userEvent.click(canvas.getByRole("button", { name: "Create account" }));
  await expect(args.onSubmit).toHaveBeenCalledTimes(1);
});

Default.test(
  "shows server errors on their fields and focuses the first",
  { args: { errors: { name: "Names can't contain digits." } } },
  async ({ canvas }) => {
    const name = canvas.getByRole("textbox", { name: "Name" });
    await expect(name).toHaveFocus();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription("Names can't contain digits.");
  },
);

Default.test(
  "clears a server error once its value changes",
  { args: { errors: { name: "Names can't contain digits." } } },
  async ({ canvas, userEvent }) => {
    const name = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.type(name, "Ana");
    await expect(name).not.toHaveAttribute("aria-invalid");
    await expect(canvas.queryByText("Names can't contain digits.")).toBeNull();
  },
);
