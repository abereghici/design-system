import { expect, fn, screen, waitFor } from "storybook/test";
import { Temporal } from "temporal-polyfill";

import type { Decorator } from "@storybook/react-vite";

import { Button } from "@platform/ui/button";

import preview from "#.storybook/preview.tsx";
import { confirmComposition } from "#.storybook/test/trusted.ts";

import { DateField } from "./date-field.tsx";
import type { DateFieldChangeEventDetails, DateFieldProps } from "./date-field.tsx";

// @ts-expect-error -- a date typed in part is invalid, so it needs its error
({ label: "Date of birth" }) satisfies DateFieldProps;

const submitted = fn<(data: FormData) => void>();
const date = (iso: string) => Temporal.PlainDate.from(iso);
const names = () =>
  screen.getAllByRole("spinbutton").map((segment) => segment.getAttribute("aria-label"));

const inAForm: Decorator = (Story) => (
  <form
    aria-label="Profile"
    noValidate={false}
    onSubmit={(event) => {
      event.preventDefault();
      submitted(new FormData(event.currentTarget));
    }}
  >
    <Story />
    <Button type="submit">Save</Button>
  </form>
);

const meta = preview.meta({
  title: "Components/DateField",
  component: DateField,
  args: {
    label: "Date of birth",
    name: "birthDate",
    locale: "en-US",
    incompleteMessage: "Enter a complete date",
    placeholders: { day: "dd", month: "mm", year: "yyyy" },
    onValueChange:
      fn<(value: Temporal.PlainDate | null, details: DateFieldChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test(
  "is a group named by its label with month, day and year spinbuttons in en-US order",
  async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Date of birth" })).toBeVisible();
    await expect(names()).toEqual(["month", "day", "year"]);
  },
);

Default.test(
  "orders and names the segments for ro-RO, with the author's placeholders",
  { args: { locale: "ro-RO", placeholders: { day: "zz", month: "ll", year: "aaaa" } } },
  async ({ canvas }) => {
    await expect(names()).toEqual(["zi", "lună", "an"]);
    await expect(canvas.getByRole("spinbutton", { name: "zi" })).toHaveAttribute(
      "placeholder",
      "zz",
    );
  },
);

Default.test(
  "types a date segment by segment and reports it",
  async ({ args, canvas, userEvent }) => {
    const month = canvas.getByRole("spinbutton", { name: "month" });

    await userEvent.click(month);
    await userEvent.keyboard("1");
    await expect(month).toHaveFocus();
    await userEvent.keyboard("0");
    await expect(canvas.getByRole("spinbutton", { name: "day" })).toHaveFocus();
    await userEvent.keyboard("4");
    await expect(canvas.getByRole("spinbutton", { name: "year" })).toHaveFocus();
    await userEvent.keyboard("2026");
    await expect(month).toHaveAttribute("aria-valuetext", "October");
    await expect(canvas.getByRole("spinbutton", { name: "day" })).toHaveValue("04");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      date("2026-10-04"),
      expect.objectContaining({ reason: "input-change" }),
    );
  },
);

Default.test("moves on with the separator key", async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole("spinbutton", { name: "month" }));
  await userEvent.keyboard("1/");
  await expect(canvas.getByRole("spinbutton", { name: "day" })).toHaveFocus();
  await expect(canvas.getByRole("spinbutton", { name: "month" })).toHaveValue("01");
});

Default.test(
  "fixes an impossible day once the date is complete",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("spinbutton", { name: "month" }));
    await userEvent.keyboard("02312026");
    await expect(canvas.getByRole("spinbutton", { name: "day" })).toHaveValue("28");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      date("2026-02-28"),
      expect.anything(),
    );
  },
);

Default.test(
  "steps with the arrow keys, wraps, and jumps with Home and End",
  { args: { defaultValue: date("2026-12-24") } },
  async ({ args, canvas, userEvent }) => {
    const month = canvas.getByRole("spinbutton", { name: "month" });

    await userEvent.click(month);
    await userEvent.keyboard("{ArrowUp}");
    await expect(month).toHaveAttribute("aria-valuenow", "1");
    await userEvent.keyboard("{ArrowDown}");
    await expect(month).toHaveAttribute("aria-valuenow", "12");
    await userEvent.keyboard("{Home}");
    await expect(month).toHaveAttribute("aria-valuenow", "1");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      date("2026-01-24"),
      expect.objectContaining({ reason: "keyboard" }),
    );
    await userEvent.keyboard("{ArrowRight}{End}");
    await expect(canvas.getByRole("spinbutton", { name: "day" })).toHaveAttribute(
      "aria-valuenow",
      "31",
    );
  },
);

Default.test("starts an empty segment at today's part", async ({ canvas, userEvent }) => {
  const year = canvas.getByRole("spinbutton", { name: "year" });

  await userEvent.click(year);
  await userEvent.keyboard("{ArrowUp}");
  await expect(year).toHaveAttribute("aria-valuenow", String(new Date().getFullYear()));
});

Default.test(
  "erases with Backspace and Delete, and Backspace on an empty segment goes back",
  { args: { defaultValue: date("2026-10-24") } },
  async ({ args, canvas, userEvent }) => {
    const day = canvas.getByRole("spinbutton", { name: "day" });

    await userEvent.click(day);
    await userEvent.keyboard("{Backspace}");
    await expect(day).toHaveValue("2");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      date("2026-10-02"),
      expect.anything(),
    );
    await userEvent.keyboard("{Delete}");
    await expect(day).toHaveValue("");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null, expect.anything());
    await userEvent.keyboard("{Backspace}");
    await expect(canvas.getByRole("spinbutton", { name: "month" })).toHaveFocus();
  },
);

Default.test(
  "moves between segments with Left and Right, swapped in RTL",
  { globals: { dir: "rtl" } },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("spinbutton", { name: "day" }));
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("spinbutton", { name: "year" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(canvas.getByRole("spinbutton", { name: "month" })).toHaveFocus();
  },
);

Default.test("focuses the first empty segment from the label", async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByText("Date of birth"));
  await expect(canvas.getByRole("spinbutton", { name: "month" })).toHaveFocus();
});

Default.test(
  "keeps the previous segments when the change is cancelled",
  {
    args: {
      defaultValue: date("2026-10-24"),
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const day = canvas.getByRole("spinbutton", { name: "day" });

    await userEvent.click(day);
    await userEvent.keyboard("{ArrowUp}");
    await expect(day).toHaveValue("24");
  },
);

Default.test(
  "changes nothing while disabled",
  { args: { disabled: true, defaultValue: date("2026-10-24") } },
  async ({ canvas, userEvent }) => {
    const day = canvas.getByRole("spinbutton", { name: "day" });

    await expect(day).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(day);
    await userEvent.keyboard("{ArrowUp}5");
    await expect(day).toHaveValue("24");
  },
);

export const Editing = meta.story({
  parameters: { docs: { description: { story: "Month typed, focus moved on to the day." } } },
  play: ({ canvas, userEvent }) =>
    userEvent.type(canvas.getByRole("spinbutton", { name: "month" }), "4"),
});

export const InAForm = meta.story({ decorators: [inAForm], args: { required: true } });

InAForm.test(
  "submits the ISO date",
  { args: { defaultValue: date("2026-10-24") } },
  async ({ canvas, userEvent }) => {
    submitted.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(submitted.mock.calls[0]?.[0].get("birthDate")).toBe("2026-10-24");
  },
);

InAForm.test(
  "submits on Enter in a segment, not on one confirming an IME composition",
  { args: { defaultValue: date("2026-10-24") } },
  async ({ canvas, userEvent }) => {
    submitted.mockClear();

    const day = canvas.getByRole("spinbutton", { name: "day" });

    confirmComposition(day);
    await expect(submitted).not.toHaveBeenCalled();
    await userEvent.type(day, "{Enter}");
    await expect(submitted).toHaveBeenCalledOnce();
  },
);

InAForm.test(
  "shows the error after a failed submit and focuses the first segment",
  async ({ canvas, userEvent }) => {
    const month = canvas.getByRole("spinbutton", { name: "month" });

    await expect(month).not.toBeInvalid();
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(month).toHaveFocus());
    await expect(month).toBeInvalid();
  },
);

InAForm.test(
  "shows the error after leaving an edited empty field, not before",
  async ({ canvas, userEvent }) => {
    const month = canvas.getByRole("spinbutton", { name: "month" });

    await userEvent.click(month);
    await userEvent.keyboard("1{Backspace}");
    await userEvent.tab();
    await expect(month).not.toBeInvalid();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Save" })).toHaveFocus();
    await expect(month).toBeInvalid();
  },
);

InAForm.test(
  "restores its default value and clears its error when the form resets",
  { args: { defaultValue: date("2026-10-24") } },
  async ({ canvas, userEvent }) => {
    const day = canvas.getByRole("spinbutton", { name: "day" });

    await userEvent.type(day, "{Backspace}{Backspace}");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(day).toBeInvalid();
    canvas.getByRole<HTMLFormElement>("form", { name: "Profile" }).reset();
    await waitFor(() => expect(day).toHaveValue("24"));
    await expect(day).not.toBeInvalid();
  },
);

InAForm.test("reports a partial date as incomplete", async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole("spinbutton", { name: "month" }));
  await userEvent.keyboard("1");
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();
  await expect(canvas.getByText("Enter a complete date")).toBeVisible();
});

InAForm.test(
  "rejects a date before min",
  { args: { min: date("2026-01-01"), defaultValue: date("2025-12-31") } },
  async ({ canvas, userEvent }) => {
    submitted.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.getByRole("spinbutton", { name: "month" })).toBeInvalid();
    await expect(submitted).not.toHaveBeenCalled();
  },
);
