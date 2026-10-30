import { expect, fn } from "storybook/test";

import { withForm } from "#.storybook/decorators/with-form.tsx";
import preview from "#.storybook/preview.tsx";

import { TextArea } from "./text-area.tsx";

const meta = preview.meta({
  title: "Components/TextArea",
  component: TextArea,
  args: {
    label: "Message",
    name: "message",
    placeholder: "Write something…",
    description: "Grows with your text.",
    onValueChange: fn(),
  },
});

export const Default = meta.story({});

Default.test(
  "submits its value, and returns to its default value when its form resets",
  { args: { defaultValue: "Hello" }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Message" });
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });

    await userEvent.type(input, " there");
    await expect(new FormData(form).get("message")).toBe("Hello there");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(input).toHaveValue("Hello");
  },
);

Default.test(
  "inserts a line break on Enter and reports each value",
  { decorators: [withForm] },
  async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Message" });

    await userEvent.type(textarea, "Hi{Enter}there");
    await expect(textarea).toHaveValue("Hi\nthere");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "Hi\nthere",
      expect.objectContaining({ reason: "none" }),
    );
  },
);

Default.test(
  "replaces the description with the error after a failed submit",
  { args: { required: true, errorMessage: "Write a message." }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Message" });

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(textarea).toHaveAccessibleDescription("Write a message.");
  },
);

Default.test(
  "stays focusable and keeps its value when disabled",
  { args: { disabled: true, defaultValue: "Draft" } },
  async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Message" });

    await userEvent.tab();
    await expect(textarea).toHaveFocus();
    await expect(textarea).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("x");
    await expect(textarea).toHaveValue("Draft");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

Default.test(
  "lets a read-only value be focused but not changed, and submits it",
  { args: { readOnly: true, defaultValue: "Draft" }, decorators: [withForm] },
  async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Message" });

    await userEvent.tab();
    await expect(textarea).toHaveFocus();
    await userEvent.keyboard("x");
    await expect(textarea).toHaveValue("Draft");
    await expect(args.onValueChange).not.toHaveBeenCalled();

    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });

    await expect(new FormData(form).get("message")).toBe("Draft");
  },
);
