import { expect, fn } from "storybook/test";

import { withForm } from "#.storybook/decorators/with-form.tsx";
import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { PasswordField } from "./password-field.tsx";
import type { PasswordFieldVisibleChangeEventDetails } from "./password-field.tsx";

const meta = preview.meta({
  title: "Components/PasswordField",
  component: PasswordField,
  argTypes: {
    disabled: {
      control: "boolean",
      description:
        "Blocks interaction but keeps it focusable and announced, so everyone can still find it; say nearby why it is unavailable.",
    },
    onValueChange: { control: false, description: "Called as the user types, with the new text." },
  },
  args: {
    label: "Password",
    name: "password",
    toggleLabel: "Show password",
    onVisibleChange: fn(),
    onValueChange: fn(),
  },
});

export const Default = meta.story({});

Default.test("hides the value behind a named toggle", async ({ canvas }) => {
  await expect(canvas.queryByRole("textbox", { name: "Password" })).toBeNull();
  await expect(canvas.getByLabelText("Password")).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await expect(canvas.getByRole("button", { name: "Show password" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

Default.test(
  "shows the value when the toggle is pressed and returns focus to the input",
  async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole("button", { name: "Show password" });
    const toggled = listen("ab-toggle");

    await userEvent.click(toggle);

    const input = canvas.getByRole("textbox", { name: "Password" });

    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(input).toHaveFocus();
    await expect(args.onVisibleChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: "toggle-press" }),
    );
    await expect(toggled.events.map(({ detail }) => detail)).toEqual([
      { component: "ToggleButton", userInitiated: true },
    ]);
  },
);

Default.test(
  "keeps focus on the toggle when pressed from the keyboard",
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: "Show password" })).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: "Password" })).toBeVisible();
  },
);

Default.test(
  "stays hidden when the change is cancelled",
  {
    args: {
      onVisibleChange: (_visible: boolean, details: PasswordFieldVisibleChangeEventDetails) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole("button", { name: "Show password" });

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.queryByRole("textbox", { name: "Password" })).toBeNull();
  },
);

Default.test(
  "submits its value, and returns to its default value when its form resets",
  { args: { defaultValue: "hunter2", defaultVisible: true }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Password" });
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });

    await userEvent.type(input, "!");
    await expect(new FormData(form).get("password")).toBe("hunter2!");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(input).toHaveValue("hunter2");
  },
);

Default.test(
  "hides the value again when the form is submitted",
  { args: { defaultVisible: true }, decorators: [withForm] },
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.queryByRole("textbox", { name: "Password" })).toBeNull();
    await expect(args.onVisibleChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "form-submit" }),
    );
  },
);

Default.test(
  "blocks the toggle and the value when disabled",
  { args: { disabled: true, defaultValue: "secret" } },
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show password" }));
    await expect(args.onVisibleChange).not.toHaveBeenCalled();
    await expect(canvas.getByLabelText("Password")).toHaveAttribute("aria-disabled", "true");
  },
);
