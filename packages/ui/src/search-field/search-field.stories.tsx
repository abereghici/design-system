import { useState } from "react";
import { expect, fn } from "storybook/test";

import { SearchIcon } from "@abereghici/ui/icons/search";

import { submitted, withForm } from "#.storybook/decorators/with-form.tsx";
import { withSearch } from "#.storybook/decorators/with-search.tsx";
import preview from "#.storybook/preview.tsx";
import { trusted } from "#.storybook/test/trusted.ts";

import { SearchField } from "./search-field.tsx";
import type { SearchFieldChangeEventDetails, SearchFieldProps } from "./search-field.tsx";

// @ts-expect-error -- the clear button shows only an icon, so it needs a name
({ label: "Search invoices" }) satisfies SearchFieldProps;
// @ts-expect-error -- the text lives in the app's state or the field's, not both
({ label: "Q", clearLabel: "Clear", value: "a", defaultValue: "b" }) satisfies SearchFieldProps;

const meta = preview.meta({
  title: "Components/SearchField",
  component: SearchField,
  args: {
    label: "Search invoices",
    name: "q",
    clearLabel: "Clear search",
    onValueChange: fn(),
  },
});

export const Default = meta.story({});

Default.test("is a searchbox with a Search Enter key", async ({ canvas }) => {
  await expect(canvas.getByRole("searchbox", { name: "Search invoices" })).toHaveAttribute(
    "enterkeyhint",
    "search",
  );
});

Default.test(
  "clears the text with its button and keeps focus in the input",
  async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("searchbox", { name: "Search invoices" });

    await expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();
    await userEvent.type(input, "march");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "",
      expect.objectContaining({ reason: "clear-press" }),
    );
  },
);

Default.test("clears the text on Escape", async ({ args, canvas, userEvent }) => {
  const input = canvas.getByRole("searchbox", { name: "Search invoices" });

  await userEvent.type(input, "march{Escape}");
  await expect(input).toHaveValue("");
  await expect(input).toHaveFocus();
  await expect(args.onValueChange).toHaveBeenLastCalledWith(
    "",
    expect.objectContaining({ reason: "escape-key" }),
  );
});

Default.test(
  "keeps the text when the app cancels the clear",
  {
    args: {
      defaultValue: "march",
      onValueChange: (_value: string, details: SearchFieldChangeEventDetails) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("searchbox", { name: "Search invoices" });

    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await userEvent.type(input, "{Escape}");
    await expect(input).toHaveValue("march");
  },
);

Default.test(
  "submits its text, and shows its default text again when its form resets",
  { args: { defaultValue: "march" }, decorators: [withForm] },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("searchbox", { name: "Search invoices" });

    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await userEvent.type(input, "april");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(submitted.mock.lastCall?.[0].get("q")).toBe("april");
    await userEvent.clear(input);
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(input).toHaveValue("march");
    await expect(canvas.getByRole("button", { name: "Clear search" })).toBeVisible();
  },
);

Default.test(
  "replaces its description with the error after a submit with nothing entered",
  {
    args: {
      required: true,
      description: "By number or customer.",
      errorMessage: "Enter a search term.",
    },
    decorators: [withForm],
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("searchbox", { name: "Search invoices" });

    await expect(input).toHaveAccessibleDescription("By number or customer.");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Enter a search term.");
    await expect(submitted).not.toHaveBeenCalled();
  },
);

Default.test(
  "keeps its text while disabled",
  { args: { disabled: true, defaultValue: "march" } },
  async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("searchbox", { name: "Search invoices" });

    await expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();
    await userEvent.type(input, "{Escape}");
    await expect(input).toHaveValue("march");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

function ControlledSearchField({ defaultValue = "march", ...args }: SearchFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <>
      <SearchField
        {...args}
        value={value}
        onValueChange={(next, details) => {
          setValue(next);
          args.onValueChange?.(next, details);
        }}
      />
      <output>{value === "" ? "All invoices" : `Invoices matching ${value}`}</output>
    </>
  );
}

export const Controlled = meta.story({
  render: ControlledSearchField,
  parameters: {
    docs: {
      description: {
        story: "The app holds the text in state, to filter as the user types or clears it.",
      },
    },
  },
});

Controlled.test("follows the text the app holds", async ({ canvas, userEvent }) => {
  await userEvent.type(canvas.getByRole("searchbox", { name: "Search invoices" }), " 2026");
  await expect(canvas.getByRole("status")).toHaveTextContent("Invoices matching march 2026");
  await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
  await expect(canvas.getByRole("status")).toHaveTextContent("All invoices");
});

export const InASearchLandmark = meta.story({
  args: { label: undefined, "aria-label": "Search invoices", startElement: <SearchIcon /> },
  decorators: [withSearch],
  parameters: {
    docs: {
      description: {
        story:
          "The app puts its search form in a `<search>` element, so screen readers list it as a search landmark.",
      },
    },
  },
});

InASearchLandmark.test("submits its form on Enter", async ({ canvas }) => {
  const user = await trusted();

  await user.type(canvas.getByRole("searchbox", { name: "Search invoices" }), "march{Enter}");
  await expect(submitted.mock.lastCall?.[0].get("q")).toBe("march");
});
