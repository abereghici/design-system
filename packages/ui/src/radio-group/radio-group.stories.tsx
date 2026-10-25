import { expect, fn } from "storybook/test";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import * as RadioGroup from "./radio-group.tsx";

const options = (lifetimeDisabled = false) => (
  <>
    <RadioGroup.Label>Plan</RadioGroup.Label>
    <RadioGroup.Item value="monthly">Monthly</RadioGroup.Item>
    <RadioGroup.Item value="yearly">Yearly</RadioGroup.Item>
    <RadioGroup.Item value="lifetime" disabled={lifetimeDisabled}>
      Lifetime
    </RadioGroup.Item>
  </>
);

const meta = preview.meta({
  title: "Components/RadioGroup",
  component: RadioGroup.Root,
  subcomponents: partsOf(RadioGroup),
  args: {
    name: "plan",
    defaultValue: "monthly",
    children: options(),
    onValueChange: fn<(value: string, details: RadioGroup.ChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test("is a radio group named by its label", async ({ canvas }) => {
  const group = canvas.getByRole("radiogroup", { name: "Plan" });

  await expect(group).toHaveAttribute("aria-orientation", "vertical");
  await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
});

Default.test(
  "chooses an option on click and dispatches one ab-toggle",
  async ({ canvas, userEvent, args }) => {
    const yearly = canvas.getByRole("radio", { name: "Yearly" });
    const toggles = listen("ab-toggle");

    await userEvent.click(canvas.getByText("Yearly"));
    await userEvent.click(yearly);
    toggles.stop();
    await expect(yearly).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Monthly" })).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      "yearly",
      expect.objectContaining({ reason: "none" }),
    );
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: yearly, detail: { component: "RadioGroup", reason: "user" } },
    ]);
  },
);

Default.test(
  "moves focus to the chosen option and chooses with the arrow keys",
  async ({ canvas, userEvent, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Yearly" })).toBeChecked();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");

    const lifetime = canvas.getByRole("radio", { name: "Lifetime" });

    await expect(lifetime).toHaveFocus();
    await expect(lifetime).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("lifetime", expect.anything());
  },
);

Default.test(
  "follows the visual direction with Left and Right in RTL",
  { globals: { dir: "rtl" } },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("radio", { name: "Yearly" })).toBeChecked();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");

    const lifetime = canvas.getByRole("radio", { name: "Lifetime" });

    await expect(lifetime).toHaveFocus();
    await expect(lifetime).toBeChecked();
  },
);

Default.test(
  "keeps the previous choice when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const toggles = listen("ab-toggle");

    await userEvent.click(canvas.getByRole("radio", { name: "Yearly" }));
    toggles.stop();
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Yearly" })).not.toBeChecked();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "follows a controlled value",
  { args: { value: null } },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Yearly" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("yearly", expect.anything());

    for (const radio of canvas.getAllByRole("radio")) await expect(radio).not.toBeChecked();
  },
);

Default.test(
  "blocks every option when disabled, and stays focusable",
  { args: { disabled: true } },
  async ({ canvas, userEvent, args }) => {
    for (const radio of canvas.getAllByRole("radio")) {
      await expect(radio).toHaveAttribute("aria-disabled", "true");
    }

    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toHaveFocus();
    await userEvent.click(canvas.getByText("Yearly"));
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

Default.test(
  "lets arrow keys reach a disabled option without choosing it",
  { args: { children: options(true) } },
  async ({ canvas, userEvent, args }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("radio", { name: "Lifetime" })).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "Lifetime" })).not.toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

Default.test(
  "submits name=value for the chosen option",
  { decorators: [(Story) => <form aria-label="Billing">{Story()}</form>] },
  async ({ canvas }) => {
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Billing" });

    await expect([...new FormData(form)]).toEqual([["plan", "monthly"]]);
  },
);

Default.test(
  "lays out horizontally",
  { args: { orientation: "horizontal" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("radiogroup", { name: "Plan" })).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
  },
);

Default.test(
  "keeps its value and reports no change when a click is default-prevented",
  async ({ canvas, userEvent, args }) => {
    const yearly = canvas.getByRole("radio", { name: "Yearly" });

    yearly.addEventListener("click", (event) => {
      event.preventDefault();
    });

    const toggles = listen("ab-toggle");

    await userEvent.click(yearly);
    toggles.stop();
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(toggles.events).toEqual([]);
  },
);
