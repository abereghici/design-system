import { expect, fn } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import { Provider } from "@platform/ui/provider";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import type { Locale } from "../provider/locale.tsx";
import { roRO } from "../provider/locales/ro-RO.ts";

import { NumberField } from "./number-field.tsx";
import type { NumberFieldChangeEventDetails } from "./number-field.tsx";

// @ts-expect-error -- a locale must name the step buttons
({ tag: "fr-FR", labels: { ...roRO.labels, numberField: {} } }) satisfies Locale;

const inAForm: Decorator = (Story) => (
  <form
    aria-label="Order"
    onSubmit={(event) => {
      event.preventDefault();
    }}
  >
    <Story />
    <button type="submit">Order</button>
  </form>
);

const meta = preview.meta({
  title: "Components/NumberField",
  component: NumberField,
  args: {
    label: "Seats",
    name: "seats",
    defaultValue: 5,
    min: 1,
    max: 50,
    onValueChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Entry of a real quantity, formatted for the user's locale with `Intl`, with step buttons and arrow-key stepping. For digits that are not a number (postal codes, card numbers) use TextField with `inputMode=\"numeric\"`; to pick a value by feel, use Slider.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is a textbox named by its label, with named step buttons", async ({ canvas }) => {
  await expect(canvas.getByRole("textbox", { name: "Seats" })).toHaveValue("5");
  await expect(canvas.getByRole("button", { name: "Increase" })).toBeVisible();
  await expect(canvas.getByRole("button", { name: "Decrease" })).toBeVisible();
});

Default.test("steps with the arrow, page, home and end keys", async ({ args, canvas, userEvent }) => {
  const input = canvas.getByRole("textbox", { name: "Seats" });
  await userEvent.click(input);
  await userEvent.keyboard("{ArrowUp}");
  await expect(input).toHaveValue("6");
  await userEvent.keyboard("{PageUp}");
  await expect(input).toHaveValue("16");
  await userEvent.keyboard("{ArrowDown}");
  await expect(input).toHaveValue("15");
  await userEvent.keyboard("{End}");
  await expect(input).toHaveValue("50");
  await userEvent.keyboard("{Home}");
  await expect(input).toHaveValue("1");
  await expect(args.onValueChange).toHaveBeenLastCalledWith(
    1,
    expect.objectContaining({ reason: "keyboard" }),
  );
});

Default.test(
  "steps with the buttons, keeps focus in the input and stops at the bound",
  { args: { defaultValue: 49 } },
  async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Seats" });
    const increase = canvas.getByRole("button", { name: "Increase" });
    const presses = listen("ab-press");
    await userEvent.click(input);
    await userEvent.click(increase);
    await expect(input).toHaveValue("50");
    await expect(input).toHaveFocus();
    await expect(increase).toHaveAttribute("aria-disabled", "true");
    await expect(presses.events).toHaveLength(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      50,
      expect.objectContaining({ reason: "increment-press" }),
    );
  },
);

Default.test("keeps the step buttons out of the tab order", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("textbox", { name: "Seats" })).toHaveFocus();
  await userEvent.tab();
  await expect(document.body).toHaveFocus();
});

Default.test("clamps a typed value when it commits", async ({ args, canvas, userEvent }) => {
  const input = canvas.getByRole("textbox", { name: "Seats" });
  await userEvent.clear(input);
  await userEvent.type(input, "120{Enter}");
  await expect(input).toHaveValue("50");
  await expect(args.onValueChange).toHaveBeenCalledWith(
    50,
    expect.objectContaining({ reason: "input-commit" }),
  );
});

Default.test("keeps the last number when the typed text is not one", async ({ canvas, userEvent }) => {
  const input = canvas.getByRole("textbox", { name: "Seats" });
  await userEvent.tripleClick(input);
  await userEvent.keyboard("abc");
  await userEvent.tab();
  await expect(input).toHaveValue("5");
});

Default.test(
  "keeps the previous value when the change is cancelled",
  {
    args: {
      onValueChange: (_value: number | null, details: NumberFieldChangeEventDetails) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await expect(canvas.getByRole("textbox", { name: "Seats" })).toHaveValue("5");
  },
);

Default.test(
  "submits the raw number",
  {
    args: {
      label: "Price",
      name: "price",
      defaultValue: 1234.5,
      min: 0,
      max: 1e6,
      step: 0.5,
      formatOptions: { style: "currency", currency: "EUR" },
    },
    decorators: [inAForm],
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Price" })).toHaveValue("€1,234.50");
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Order" });
    await expect(new FormData(form).getAll("price")).toEqual(["1234.5"]);
  },
);

Default.test(
  "formats and parses in the Provider's locale",
  {
    args: { label: "Preț", name: "price", defaultValue: 1234.5, min: 0, max: 1e6, step: 0.1 },
    decorators: [
      (Story) => (
        <Provider locale={roRO}>
          <Story />
        </Provider>
      ),
    ],
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Preț" });
    await expect(input).toHaveValue("1.234,5");
    await expect(canvas.getByRole("button", { name: "Mărește" })).toBeVisible();
    await userEvent.clear(input);
    await userEvent.type(input, "2.000,7{Enter}");
    await expect(input).toHaveValue("2.000,7");
  },
);

Default.test(
  "fails valueMissing only when required and empty",
  { args: { required: true, defaultValue: null, errorMessage: "Enter a number of seats." }, decorators: [inAForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Seats" });
    await userEvent.click(canvas.getByRole("button", { name: "Order" }));
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Enter a number of seats.");
  },
);

Default.test(
  "stays focusable and blocks every change when disabled",
  { args: { disabled: true } },
  async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Seats" });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}7");
    await expect(input).toHaveValue("5");
    await expect(canvas.getByRole("button", { name: "Increase" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);
