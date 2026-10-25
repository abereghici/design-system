import { expect, fn } from "storybook/test";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { Checkbox } from "./checkbox.tsx";
import type { CheckboxChangeEventDetails } from "./checkbox.tsx";

const meta = preview.meta({
  title: "Components/Checkbox",
  component: Checkbox,
  args: {
    children: "Email me updates",
    onCheckedChange: fn<(checked: boolean, details: CheckboxChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test("checks when its label is clicked", async ({ canvas, userEvent, args }) => {
  const checkbox = canvas.getByRole("checkbox", { name: "Email me updates" });

  await userEvent.click(canvas.getByText("Email me updates"));
  await expect(checkbox).toBeChecked();
  await expect(args.onCheckedChange).toHaveBeenCalledOnce();
  await expect(args.onCheckedChange).toHaveBeenCalledWith(
    true,
    expect.objectContaining({ reason: "none" }),
  );
});

Default.test("toggles with Space", async ({ canvas, userEvent }) => {
  const checkbox = canvas.getByRole("checkbox", { name: "Email me updates" });

  await userEvent.tab();
  await expect(checkbox).toHaveFocus();
  await userEvent.keyboard(" ");
  await expect(checkbox).toBeChecked();
  await userEvent.keyboard(" ");
  await expect(checkbox).not.toBeChecked();
});

Default.test("dispatches a bubbling ab-toggle after a change", async ({ canvas, userEvent }) => {
  const checkbox = canvas.getByRole("checkbox", { name: "Email me updates" });
  const toggles = listen("ab-toggle");

  await userEvent.click(checkbox);
  toggles.stop();
  await expect(
    toggles.events.map(({ target, bubbles, detail }) => ({ target, bubbles, detail })),
  ).toEqual([
    { target: checkbox, bubbles: true, detail: { component: "Checkbox", reason: "user" } },
  ]);
});

Default.test(
  "keeps its state when the change is cancelled",
  {
    args: {
      onCheckedChange: (_checked, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Email me updates" });
    const toggles = listen("ab-toggle");

    await userEvent.click(checkbox);
    checkbox.focus();
    await userEvent.keyboard(" ");
    toggles.stop();
    await expect(checkbox).not.toBeChecked();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "follows a controlled checked value",
  { args: { checked: true } },
  async ({ canvas, userEvent, args }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Email me updates" });

    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false, expect.anything());
    await expect(checkbox).toBeChecked();
  },
);

Default.test(
  "is announced as mixed while indeterminate",
  { args: { indeterminate: true } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "Email me updates" })).toBePartiallyChecked();
  },
);

Default.test(
  "stays focusable and blocks the change when disabled",
  { args: { disabled: true } },
  async ({ canvas, userEvent, args }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Email me updates" });

    await expect(checkbox).toHaveAttribute("aria-disabled", "true");

    const toggles = listen("ab-toggle");

    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    await userEvent.click(canvas.getByText("Email me updates"));
    toggles.stop();
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "submits name=value when checked",
  {
    args: { name: "updates", value: "weekly", defaultChecked: true },
    decorators: [(Story) => <form aria-label="Preferences">{Story()}</form>],
  },
  async ({ canvas }) => {
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Preferences" });

    await expect([...new FormData(form)]).toEqual([["updates", "weekly"]]);
  },
);

Default.test(
  "is named by aria-label without visible text",
  { args: { children: undefined, "aria-label": "Select row" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "Select row" })).toBeInTheDocument();
    // @ts-expect-error -- a checkbox without visible text needs aria-label or aria-labelledby
    void (<Checkbox />);
  },
);

Default.test(
  "keeps its state and reports no change when its click is default-prevented",
  async ({ canvas, userEvent, args }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Email me updates" });

    checkbox.addEventListener("click", (event) => {
      event.preventDefault();
    });

    const toggles = listen("ab-toggle");

    await userEvent.click(checkbox);
    toggles.stop();
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
    await expect(toggles.events).toEqual([]);
  },
);

export const LongLabel = meta.story({
  args: {
    children: "Send a copy of every report to reports-archive@platform-production.example.com",
  },
  parameters: {
    docs: { description: { story: "A long label wraps, with the box on its first line." } },
  },
});
