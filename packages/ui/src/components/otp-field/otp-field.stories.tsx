import { expect, fn } from "storybook/test";

import { submitted, withForm } from "#.storybook/decorators/with-form.tsx";
import preview from "#.storybook/preview.tsx";

import { OTPField } from "./otp-field.tsx";

const meta = preview.meta({
  title: "Components/OTPField",
  component: OTPField,
  args: {
    label: "Verification code",
    name: "code",
    onValueChange: fn(),
  },
});

export const Default = meta.story({});

Default.test(
  "is one field that offers the code from a text message on a numeric keypad",
  async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Verification code" });

    await expect(input).toHaveAttribute("autocomplete", "one-time-code");
    await expect(input).toHaveAttribute("inputmode", "numeric");
    await expect(canvas.getAllByRole("textbox")).toHaveLength(1);
  },
);

Default.test("takes a pasted code whole, up to its length", async ({ args, canvas, userEvent }) => {
  const input = canvas.getByRole("textbox", { name: "Verification code" });

  await userEvent.click(input);
  await userEvent.paste("4827193");
  await expect(input).toHaveValue("482719");
  await expect(args.onValueChange).toHaveBeenLastCalledWith("482719", expect.anything());
});

export const PartlyEntered = meta.story({
  args: { defaultValue: "48" },
  parameters: { docs: { description: { story: "A code entered in part, one digit to a box." } } },
});

PartlyEntered.test(
  "takes as many digits as its length",
  { args: { length: 4 } },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Verification code" });

    await userEvent.type(input, "271");
    await expect(input).toHaveValue("4827");
  },
);

export const Entered = meta.story({
  parameters: {
    docs: { description: { story: "The whole code typed, the caret in the last box." } },
  },
  play: ({ canvas, userEvent }) =>
    userEvent.type(canvas.getByRole("textbox", { name: "Verification code" }), "482719"),
});

Default.test(
  "replaces its description with the error after a submit with too few digits",
  {
    args: {
      description: "Sent to your phone.",
      errorMessage: "Enter the 6-digit code.",
    },
    decorators: [withForm],
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Verification code" });

    await expect(input).toHaveAccessibleDescription("Sent to your phone.");
    await userEvent.type(input, "4827");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Enter the 6-digit code.");
    await expect(submitted).not.toHaveBeenCalled();
  },
);

Default.test(
  "submits its code, and returns to its default code when its form resets",
  { args: { defaultValue: "482719" }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Verification code" });

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(submitted.mock.lastCall?.[0].get("code")).toBe("482719");
    await userEvent.clear(input);
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(input).toHaveValue("482719");
  },
);
