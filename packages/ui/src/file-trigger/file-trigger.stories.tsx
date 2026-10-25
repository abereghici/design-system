import { expect, fn } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import { Button } from "@platform/ui/button";
import { Field } from "@platform/ui/field";
import { Form } from "@platform/ui/form";
import { PlusIcon } from "@platform/ui/icons/plus";
import { roRO } from "@platform/ui/locales/ro-RO";
import { UIProvider } from "@platform/ui/ui-provider";

import preview from "#.storybook/preview.tsx";

import { FileTrigger } from "./file-trigger.tsx";
import type { FileTriggerSelectEventDetails } from "./file-trigger.tsx";

const photo = new File(["png"], "photo.png", { type: "image/png" });

/** Stands in for the system picker, which no test can reach: sets the files on the native input. */
const pick = (root: HTMLElement, ...files: File[]) => {
  const input = root.querySelector<HTMLInputElement>("input[type=file]");
  if (input === null) throw new Error("No file input");
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const inAForm: Decorator = (Story) => (
  <Form
    aria-label="Profile"
    onSubmit={(event) => {
      event.preventDefault();
    }}
  >
    <Story />
    <Button type="submit">Save</Button>
  </Form>
);

const meta = preview.meta({
  title: "Components/FileTrigger",
  component: FileTrigger,
  args: {
    accept: "image/png,image/jpeg",
    children: <Button>Choose image</Button>,
    onSelect: fn<(files: File[], details: FileTriggerSelectEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test(
  "calls onSelect with the picked files after its trigger opens the picker",
  async ({ canvas, canvasElement, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Choose image" }));
    pick(canvasElement, photo);
    await expect(args.onSelect).toHaveBeenCalledOnce();
    await expect(args.onSelect).toHaveBeenCalledWith(
      [photo],
      expect.objectContaining({ reason: "none" }),
    );
  },
);

Default.test(
  "shows and announces the chosen file names, and clears them",
  { args: { name: "avatar" }, decorators: [inAForm] },
  async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.queryByRole("button", { name: "Clear files" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Choose image" }));
    pick(canvasElement, photo, new File(["jpg"], "cover.jpg", { type: "image/jpeg" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("photo.png, cover.jpg");
    await userEvent.click(canvas.getByRole("button", { name: "Clear files" }));
    await expect(canvas.getByRole("status")).toBeEmptyDOMElement();
    await expect(canvas.getByRole("button", { name: "Choose image" })).toHaveFocus();
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });
    await expect(new FormData(form).get("avatar")).toHaveProperty("size", 0);
  },
);

Default.test(
  "names Clear in the UIProvider's locale",
  { decorators: [(Story) => <UIProvider locale={roRO}>{Story()}</UIProvider>] },
  async ({ canvas, canvasElement }) => {
    pick(canvasElement, photo);
    await expect(canvas.getByRole("button", { name: "Golește fișierele" })).toBeVisible();
    // @ts-expect-error -- a locale must carry the FileTrigger labels
    void ({ tag: "fr-FR", labels: { ...roRO.labels, fileTrigger: {} } } satisfies typeof roRO);
  },
);

Default.test("adds one tab stop, its trigger", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "Choose image" })).toHaveFocus();
  await userEvent.tab();
  await expect(document.body).toHaveFocus();
});

Default.test(
  "submits the picked files under its name",
  { args: { name: "avatar" }, decorators: [inAForm] },
  async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Choose image" }));
    pick(canvasElement, photo);
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });
    await expect(new FormData(form).get("avatar")).toHaveProperty("name", "photo.png");
  },
);

Default.test(
  "clears the selection when onSelect cancels it",
  {
    args: {
      name: "avatar",
      onSelect: (_files, details) => {
        details.cancel();
      },
    },
    decorators: [inAForm],
  },
  async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Choose image" }));
    pick(canvasElement, photo);
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });
    await expect(new FormData(form).get("avatar")).toHaveProperty("name", "");
  },
);

Default.test(
  "keeps its trigger focusable and never selects when disabled",
  { args: { disabled: true } },
  async ({ canvas, canvasElement, userEvent, args }) => {
    const trigger = canvas.getByRole("button", { name: "Choose image" });
    await expect(trigger).toHaveAttribute("aria-disabled", "true");
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    pick(canvasElement, photo);
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
);

export const WithFiles = meta.story({
  parameters: { docs: { description: { story: "After a pick: the names and Clear." } } },
  play: ({ canvasElement }) => {
    pick(canvasElement, photo);
  },
});

export const InAField = meta.story({
  args: {
    multiple: true,
    required: true,
    accept: undefined,
    children: (
      <Button>
        <PlusIcon /> Add files
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <Field.Root name="attachments">
        <Field.Label>Attachments</Field.Label>
        <Story />
        <Field.Description>PDF or images, up to 10 MB each.</Field.Description>
        <Field.Error />
      </Field.Root>
    ),
    inAForm,
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Inside a Field the trigger is named by the label and its own text, described by the description, and marked invalid after a blocked submit, which focuses it.",
      },
    },
  },
});

InAField.test("is named by the label and its text, and described", async ({ canvas }) => {
  await expect(
    canvas.getByRole("button", { name: "Attachments Add files" }),
  ).toHaveAccessibleDescription("PDF or images, up to 10 MB each.");
});

InAField.test(
  "takes focus and shows the error after a blocked submit",
  async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Attachments Add files" });
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute("aria-invalid", "true");
    await expect(trigger).not.toHaveAccessibleDescription("PDF or images, up to 10 MB each.");
  },
);

InAField.test(
  "clears the error once files are picked",
  async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Attachments Add files" });
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await userEvent.click(trigger);
    pick(canvasElement, photo);
    await expect(trigger).not.toHaveAttribute("aria-invalid");
  },
);
