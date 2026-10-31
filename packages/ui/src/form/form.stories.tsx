import { expect, fn } from "storybook/test";

import { Button } from "@abereghici/ui/button";
import { DateField } from "@abereghici/ui/date-field";
import { TextField } from "@abereghici/ui/text-field";

import preview from "#.storybook/preview.tsx";

import { Form } from "./form.tsx";

const meta = preview.meta({
  title: "Components/Form",
  component: Form,
  args: {
    "aria-label": "Sign up",
    style: { display: "grid", gap: "var(--ab-space-stack-md)", maxInlineSize: "20rem" },
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

Default.test(
  "focuses a DateField with a server error, and clears the error once a segment is edited",
  {
    args: {
      errors: { birthDate: "You must be 18 or older." },
      children: (
        <DateField
          label="Date of birth"
          name="birthDate"
          incompleteMessage="Enter a complete date"
        />
      ),
    },
  },
  async ({ canvas, userEvent }) => {
    const month = canvas.getByRole("spinbutton", { name: "month" });

    await expect(month).toHaveFocus();
    await expect(month).toBeInvalid();
    await expect(canvas.getByText("You must be 18 or older.")).toBeVisible();
    await userEvent.click(month);
    await userEvent.keyboard("1");
    await expect(month).not.toBeInvalid();
    await expect(canvas.queryByText("You must be 18 or older.")).toBeNull();
  },
);
