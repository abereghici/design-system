import { expect, fn } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import type { Locale } from "../provider/locale.tsx";
import { roRO } from "../provider/locales/ro-RO.ts";
import { Provider } from "../provider/provider.tsx";

import { PasswordField } from "./password-field.tsx";
import type { PasswordFieldVisibleChangeEventDetails } from "./password-field.tsx";

// @ts-expect-error -- a locale must name the password toggle
({ tag: "fr-FR", labels: { ...roRO.labels, passwordField: {} } }) satisfies Locale;

const inAForm: Decorator = (Story) => (
  <form
    aria-label="Sign in"
    onSubmit={(event) => {
      event.preventDefault();
    }}
  >
    <Story />
    <button type="submit">Sign in</button>
  </form>
);

const meta = preview.meta({
  title: "Components/Forms/PasswordField",
  component: PasswordField,
  args: {
    label: "Password",
    name: "password",
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
    await expect(toggled.events).toHaveLength(1);
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
  "hides the value again when the form is submitted",
  { args: { defaultVisible: true }, decorators: [inAForm] },
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(canvas.queryByRole("textbox", { name: "Password" })).toBeNull();
    await expect(args.onVisibleChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "form-submit" }),
    );
  },
);

Default.test(
  "names the toggle from the locale",
  {
    decorators: [
      (Story) => (
        <Provider locale={roRO}>
          <Story />
        </Provider>
      ),
    ],
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Afișează parola" })).toBeVisible();
  },
);

Default.test(
  "takes a per-instance label over the locale",
  { args: { labels: { show: "Reveal PIN" } } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Reveal PIN" })).toBeVisible();
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
