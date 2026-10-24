import { useState } from "react";
import { expect, fn } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import preview from "#.storybook/preview.tsx";

import { SearchIcon } from "../icon/icons/search.tsx";
import { Kbd } from "../kbd/kbd.tsx";

import { TextField } from "./text-field.tsx";
import type { TextFieldChangeEventDetails, TextFieldProps } from "./text-field.tsx";

const inAForm: Decorator = (Story) => (
  <form
    aria-label="Profile"
    onSubmit={(event) => {
      event.preventDefault();
    }}
  >
    <Story />
    <button type="submit">Save</button>
  </form>
);

const meta = preview.meta({
  title: "Components/TextField",
  component: TextField,
  args: {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "name@domain.com",
    autoComplete: "email",
    onValueChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Single-line text entry with a visible label, an optional description and an inline error that appears only after interaction. Use TextArea for more than one line, PasswordField for secrets, NumberField for numbers and Select to choose from a short known list.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is a textbox named by its label", async ({ canvas }) => {
  await expect(canvas.getByRole("textbox", { name: "Email" })).toBeVisible();
});

Default.test(
  "calls onValueChange with each new value",
  async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "ab");
    await expect(input).toHaveValue("ab");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "ab",
      expect.objectContaining({ reason: "none" }),
    );
  },
);

Default.test(
  "keeps the previous value when the change is cancelled",
  {
    args: {
      defaultValue: "ana@example.com",
      onValueChange: (_value: string, details: TextFieldChangeEventDetails) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "x");
    await expect(input).toHaveValue("ana@example.com");
  },
);

Default.test(
  "focuses the input when its label is clicked",
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Email"));
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveFocus();
  },
);

Default.test(
  "describes itself with its description",
  { args: { description: "Used for sign-in only." } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription(
      "Used for sign-in only.",
    );
  },
);

Default.test(
  "stays focusable and keeps its value when disabled",
  { args: { disabled: true, defaultValue: "ana@example.com" } },
  async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("x");
    await expect(input).toHaveValue("ana@example.com");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

Default.test(
  "shows no error before the user interacts",
  { args: { required: true, description: "Used for sign-in only." } },
  async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).toHaveAccessibleDescription("Used for sign-in only.");
  },
);

Default.test(
  "shows no error while the user is still typing",
  { args: { errorMessage: "Enter a valid email address." }, decorators: [inAForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "ana");
    await expect(input).not.toHaveAttribute("aria-invalid");
  },
);

Default.test(
  "replaces the description with the error after a submit with an invalid value",
  {
    args: { description: "Used for sign-in only.", errorMessage: "Enter a valid email address." },
    decorators: [inAForm],
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "ana");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Enter a valid email address.");
    await expect(canvas.queryByText("Used for sign-in only.")).not.toBeVisible();
  },
);

Default.test(
  "clears the error as soon as the value is valid",
  { args: { errorMessage: "Enter a valid email address." }, decorators: [inAForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "ana");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await userEvent.type(input, "@example.com");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(canvas.queryByText("Enter a valid email address.")).toBeNull();
  },
);

Default.test(
  "shows the browser's message after a submit with nothing entered",
  { args: { required: true }, decorators: [inAForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole<HTMLInputElement>("textbox", { name: "Email" });
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input.validationMessage).not.toBe("");
    await expect(input).toHaveAccessibleDescription(input.validationMessage);
  },
);

Default.test(
  "picks the message for the failure when errorMessage is a function",
  {
    args: {
      required: true,
      errorMessage: (validity: ValidityState) =>
        validity.valueMissing ? "Enter your email." : "Enter a valid email address.",
    },
    decorators: [inAForm],
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription(
      "Enter your email.",
    );
  },
);

Default.test(
  "shows the message from validate after a submit",
  {
    args: {
      type: "text",
      label: "Handle",
      validate: (value: string) => (value.startsWith("@") ? null : "Start with @"),
    },
    decorators: [inAForm],
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Handle" });
    await userEvent.type(input, "ana");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(input).toHaveAccessibleDescription("Start with @");
  },
);

Default.test(
  "is invalid at once when invalid is set",
  { args: { invalid: true, errorMessage: "That name is taken." } },
  async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("That name is taken.");
  },
);

Default.test(
  "submits its value with its form",
  { args: { defaultValue: "ana@example.com" }, decorators: [inAForm] },
  async ({ canvas }) => {
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });
    await expect(new FormData(form).get("email")).toBe("ana@example.com");
  },
);

export const WithIconAndShortcut = meta.story({
  args: {
    label: undefined,
    "aria-label": "Search",
    type: "search",
    name: "q",
    placeholder: "Search",
    autoComplete: "off",
    "aria-keyshortcuts": "/",
    startElement: <SearchIcon size="sm" />,
    endElement: <Kbd keys="/" aria-hidden />,
  },
  parameters: {
    docs: {
      description: { story: "A decorative start icon and an `aria-hidden` Kbd hint at the end." },
    },
  },
});

WithIconAndShortcut.test(
  "is a searchbox that announces its shortcut, not the hint",
  async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: "Search" });
    await expect(input).toHaveAttribute("aria-keyshortcuts", "/");
    await expect(input).toHaveAccessibleDescription("");
  },
);

function ControlledTextField(args: TextFieldProps) {
  const [value, setValue] = useState(typeof args.value === "string" ? args.value : "Ana");
  return (
    <>
      <TextField
        {...args}
        value={value}
        onValueChange={(next, details) => {
          setValue(next);
          args.onValueChange?.(next, details);
        }}
      />
      <output>Hello, {value}</output>
    </>
  );
}

export const Controlled = meta.story({
  args: { label: "Name", name: "name", type: "text", autoComplete: "name", placeholder: undefined },
  render: ControlledTextField,
  parameters: {
    docs: {
      description: { story: "The app holds the value in state and updates it in `onValueChange`." },
    },
  },
});

Controlled.test("follows the value the app holds", async ({ canvas, userEvent }) => {
  await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "-Maria");
  await expect(canvas.getByRole("status")).toHaveTextContent("Hello, Ana-Maria");
});

