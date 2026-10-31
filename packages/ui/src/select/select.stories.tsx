import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { withDensity } from "#.storybook/decorators/with-density.tsx";
import { withForm } from "#.storybook/decorators/with-form.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { parkPointer, trusted } from "#.storybook/test/trusted.ts";

import * as Select from "./select.tsx";

const regions = (
  <>
    <Select.Item value="eu">Europe</Select.Item>
    <Select.Item value="na">North America</Select.Item>
    <Select.Group label="Asia Pacific">
      <Select.Item value="jp">Japan</Select.Item>
      <Select.Item value="sg">Singapore</Select.Item>
    </Select.Group>
  </>
);

const meta = preview.meta({
  title: "Components/Select",
  component: Select.Root,
  subcomponents: partsOf(Select),
  args: {
    label: "Region",
    name: "region",
    placeholder: "Choose a region",
    children: regions,
    onValueChange: fn(),
  },
  beforeEach: parkPointer,
});

// Engines without base-select draw the OS picker, which the page can't see or drive.
const basePicker = () => CSS.supports("appearance: base-select");

export const Default = meta.story({});

Default.test("shows the placeholder until the user chooses", async ({ canvas }) => {
  await expect(canvas.getByRole("combobox", { name: "Region" })).toHaveDisplayValue(
    "Choose a region",
  );
});

Default.test("groups options under a named group", async ({ canvas }) => {
  await expect(canvas.getByRole("group", { name: "Asia Pacific" })).toContainElement(
    canvas.getByRole("option", { name: "Japan" }),
  );
});

Default.test("reports the chosen value and shows its text", async ({ args, canvas, userEvent }) => {
  const select = canvas.getByRole("combobox", { name: "Region" });

  await userEvent.selectOptions(select, "jp");
  await expect(select).toHaveDisplayValue("Japan");
  await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  await expect(args.onValueChange).toHaveBeenCalledWith(
    "jp",
    expect.objectContaining({ reason: "none" }),
  );
});

Default.test(
  "keeps the previous value when the change is cancelled",
  {
    args: {
      onValueChange: (_value: string, details: Select.ChangeEventDetails) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", { name: "Region" });

    await userEvent.selectOptions(select, "jp");
    await expect(select).toHaveDisplayValue("Choose a region");
  },
);

Default.test(
  "starts on the first option without a placeholder or default value",
  { args: { placeholder: undefined } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("combobox", { name: "Region" })).toHaveDisplayValue("Europe");
  },
);

Default.test(
  "describes itself with its description",
  { args: { description: "Where your data is stored." } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("combobox", { name: "Region" })).toHaveAccessibleDescription(
      "Where your data is stored.",
    );
  },
);

Default.test(
  "stays focusable and keeps its value when disabled",
  { args: { disabled: true, placeholder: undefined } },
  async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", { name: "Region" });

    await userEvent.tab();
    await expect(select).toHaveFocus();
    await expect(select).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{ArrowDown}s{Enter} ");
    await userEvent.click(select);
    await userEvent.selectOptions(select, "jp");
    await expect(select).toHaveDisplayValue("Europe");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

Default.test(
  "shows no error before the user interacts",
  { args: { required: true, description: "Where your data is stored." } },
  async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Region" });

    await expect(select).not.toHaveAttribute("aria-invalid");
    await expect(select).toHaveAccessibleDescription("Where your data is stored.");
  },
);

Default.test(
  "replaces the description with the error after a submit with nothing chosen",
  {
    args: {
      required: true,
      description: "Where your data is stored.",
      errorMessage: "Choose a region.",
    },
    decorators: [withForm],
  },
  async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", { name: "Region" });

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(select).toHaveAttribute("aria-invalid", "true");
    await expect(select).toHaveAccessibleDescription("Choose a region.");
    await expect(canvas.queryByText("Where your data is stored.")).not.toBeVisible();
  },
);

Default.test(
  "shows the browser's message when no error message is given",
  { args: { required: true }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    const select = canvas.getByRole<HTMLSelectElement>("combobox", { name: "Region" });

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(select).toHaveAccessibleDescription(select.validationMessage);
    await expect(select.validationMessage).not.toBe("");
  },
);

Default.test(
  "clears the error once a valid option is chosen",
  { args: { required: true, errorMessage: "Choose a region." }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", { name: "Region" });

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await userEvent.selectOptions(select, "eu");
    await expect(select).not.toHaveAttribute("aria-invalid");
    await expect(canvas.queryByText("Choose a region.")).toBeNull();
  },
);

Default.test(
  "shows the message from validate once the form is submitted",
  {
    args: { validate: (value) => (value === "na" ? "North America is full." : null) },
    decorators: [withForm],
  },
  async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", { name: "Region" });

    await userEvent.selectOptions(select, "na");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(select).toHaveAttribute("aria-invalid", "true");
    await expect(select).toHaveAccessibleDescription("North America is full.");
  },
);

Default.test(
  "is invalid at once when invalid is set",
  { args: { invalid: true, errorMessage: "Region is unavailable." } },
  async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Region" });

    await expect(select).toHaveAttribute("aria-invalid", "true");
    await expect(select).toHaveAccessibleDescription("Region is unavailable.");
  },
);

Default.test(
  "submits the chosen value with its form",
  { args: { defaultValue: "sg" }, decorators: [withForm] },
  async ({ canvas }) => {
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });

    await expect(new FormData(form).get("region")).toBe("sg");
  },
);

Default.test(
  "returns to its default value when its form resets",
  { args: { defaultValue: "sg" }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", { name: "Region" });

    await userEvent.selectOptions(select, "jp");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(select).toHaveDisplayValue("Singapore");
  },
);

function ControlledSelect(args: Select.RootProps) {
  const [value, setValue] = useState(args.value ?? "recent");

  return (
    <Select.Root
      {...args}
      value={value}
      onValueChange={(next, details) => {
        setValue(next);
        args.onValueChange?.(next, details);
      }}
    />
  );
}

Default.test("opens its picker on click and chooses an option", async ({ args, canvas }) => {
  if (!basePicker()) return;

  const user = await trusted();
  const select = canvas.getByRole("combobox", { name: "Region" });
  const japan = canvas.getByRole("option", { name: "Japan" });

  await expect(japan.checkVisibility()).toBe(false);
  await user.click(select);
  await waitFor(() => expect(japan.checkVisibility()).toBe(true));
  await user.click(canvas.getByRole("option", { name: "Japan" }));
  await expect(select).toHaveDisplayValue("Japan");
  await expect(args.onValueChange).toHaveBeenCalledWith("jp", expect.anything());
});

Default.test(
  "stays closed on click when disabled",
  { args: { disabled: true } },
  async ({ canvas }) => {
    if (!basePicker()) return;

    const user = await trusted();

    await user.click(canvas.getByRole("combobox", { name: "Region" }), { force: true });
    await expect(canvas.getByRole("option", { name: "Japan" }).checkVisibility()).toBe(false);
  },
);

export const Open = meta.story({
  args: { defaultValue: "eu" },
  parameters: {
    docs: {
      description: { story: "Open, with focus on the chosen option and the pointer over another." },
    },
  },
  play: async ({ canvas }) => {
    const user = await trusted().catch(() => null);

    if (user === null || !basePicker()) return;

    await user.tab();
    await user.keyboard(" ");
    await user.hover(canvas.getByRole("option", { name: "Japan" }));
  },
});

export const Controlled = meta.story({
  args: {
    label: "Sort by",
    name: "sort",
    placeholder: undefined,
    children: (
      <>
        <Select.Item value="recent">Most recent</Select.Item>
        <Select.Item value="name">Name</Select.Item>
      </>
    ),
  },
  render: ControlledSelect,
  parameters: {
    docs: {
      description: { story: "The app holds the value in state and updates it in `onValueChange`." },
    },
  },
});

Controlled.test("follows the value the app holds", async ({ canvas, userEvent }) => {
  const select = canvas.getByRole("combobox", { name: "Sort by" });

  await expect(select).toHaveDisplayValue("Most recent");
  await userEvent.selectOptions(select, "name");
  await expect(select).toHaveDisplayValue("Name");
});

export const Compact = Open.extend({ decorators: [withDensity("compact")] });
