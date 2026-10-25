import { expect } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import preview, { partsOf } from "#.storybook/preview.tsx";

import { Checkbox } from "../checkbox/checkbox.tsx";

import * as Field from "./field.tsx";

const inAForm: Decorator = (Story) => (
  <form
    aria-label="Profile"
    onSubmit={(event) => {
      event.preventDefault();
    }}
  >
    <Story />
    <button type="submit">Save</button>
    <button type="reset">Reset</button>
  </form>
);

const meta = preview.meta({
  title: "Components/Field",
  component: Field.Root,
  subcomponents: partsOf(Field),
  args: {
    name: "handle",
    children: (
      <>
        <Field.Label>Handle</Field.Label>
        <Field.Control required pattern="@[a-z0-9_]+" placeholder="@ana" />
        <Field.Description>Letters, digits and underscores.</Field.Description>
        <Field.Error />
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test("names and describes its control", async ({ canvas }) => {
  const input = canvas.getByRole("textbox", { name: "Handle" });
  await expect(input).toHaveAccessibleDescription("Letters, digits and underscores.");
  await expect(input).toBeRequired();
  await expect(input).toHaveAttribute("name", "handle");
});

Default.test(
  "replaces the description with the browser's message after a failed submit",
  { decorators: [inAForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole<HTMLInputElement>("textbox", { name: "Handle" });
    await userEvent.type(input, "ana");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(input.validationMessage);
    await expect(canvas.queryByText("Letters, digits and underscores.")).not.toBeVisible();
  },
);

Default.test(
  "clears the error when the form is reset",
  { decorators: [inAForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Handle" });
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).toHaveAccessibleDescription("Letters, digits and underscores.");
  },
);

Default.test(
  "shows a message per failure",
  {
    decorators: [inAForm],
    args: {
      children: (
        <>
          <Field.Label>Handle</Field.Label>
          <Field.Control required pattern="@[a-z0-9_]+" />
          <Field.Error>
            {(validity) =>
              validity.patternMismatch ? "Use only letters, digits and underscores." : "Required."
            }
          </Field.Error>
        </>
      ),
    },
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Handle" });
    await userEvent.type(input, "a b");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(input).toHaveAccessibleDescription("Use only letters, digits and underscores.");
  },
);

Default.test(
  "runs validate on every change",
  {
    decorators: [inAForm],
    args: {
      validate: (value: string) => (value === "@admin" ? "That handle is reserved." : null),
    },
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Handle" });
    await userEvent.type(input, "@admin");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(input).toHaveAccessibleDescription("That handle is reserved.");
    await userEvent.type(input, "s");
    await expect(input).not.toHaveAttribute("aria-invalid");
  },
);

Default.test(
  "passes disabled to its control, which stays focusable",
  { args: { disabled: true } },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Handle" });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("x");
    await expect(input).toHaveValue("");
  },
);

Default.test(
  "forces the invalid state when invalid is set",
  {
    args: {
      invalid: true,
      children: (
        <>
          <Field.Label>Handle</Field.Label>
          <Field.Control />
          <Field.Error>That handle is taken.</Field.Error>
        </>
      ),
    },
  },
  async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Handle" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("That handle is taken.");
  },
);

Default.test(
  "adds a description and an error to a Checkbox",
  {
    decorators: [inAForm],
    args: {
      name: "terms",
      children: (
        <>
          <Checkbox required>I accept the terms</Checkbox>
          <Field.Description>You can read them in Settings.</Field.Description>
          <Field.Error>Accept the terms to continue.</Field.Error>
        </>
      ),
    },
  },
  async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "I accept the terms" });
    await expect(box).toHaveAccessibleDescription("You can read them in Settings.");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(box).toHaveAttribute("aria-invalid", "true");
    await expect(box).toHaveAccessibleDescription("Accept the terms to continue.");
    await userEvent.click(box);
    await expect(box).not.toHaveAttribute("aria-invalid");
  },
);
