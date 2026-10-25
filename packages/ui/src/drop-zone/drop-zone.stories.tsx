import { useState } from "react";
import { expect, fn } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import { Button } from "@platform/ui/button";
import { Field } from "@platform/ui/field";
import { FileTrigger } from "@platform/ui/file-trigger";
import { Form } from "@platform/ui/form";

import preview from "#.storybook/preview.tsx";

import { DropZone } from "./drop-zone.tsx";
import type { DropZoneDropEventDetails, DropZoneProps } from "./drop-zone.tsx";

const january = new File(["a,b"], "january.csv", { type: "text/csv" });
const february = new File(["a,b"], "february.csv", { type: "text/csv" });
const photo = new File(["png"], "photo.png", { type: "image/png" });

/** Drags files from the desktop over `target` and drops them, as the browser reports it. */
const drop = (target: Element, ...files: File[]) => {
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  for (const type of ["dragenter", "dragover", "drop"]) {
    target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
  }
};

const inAForm: Decorator = (Story) => (
  <form aria-label="Import">
    <Story />
  </form>
);

const submitted = (form: HTMLFormElement) =>
  new FormData(form).getAll("files").map((file) => (file instanceof File ? file.name : file));

const meta = preview.meta({
  title: "Components/DropZone",
  component: DropZone,
  argTypes: {
    multiple: {
      control: "boolean",
      description: "Accepts several files at once; otherwise only the first is kept.",
    },
  },
  args: {
    name: "files",
    accept: ".csv,text/csv",
    multiple: true,
    clearLabel: "Clear files",
    onDrop: fn<(files: File[], details: DropZoneDropEventDetails) => void>(),
    children: (
      <>
        <span>Drop CSV files here, or</span>
        <FileTrigger>
          <Button>Choose files</Button>
        </FileTrigger>
      </>
    ),
  },
});

export const Default = meta.story({});

export const WithFiles = meta.story({
  parameters: { docs: { description: { story: "After a drop: the names and Clear." } } },
  play: ({ canvas }) => {
    drop(canvas.getByText("Drop CSV files here, or"), january, february);
  },
});

Default.test(
  "calls onDrop with the accepted files and the rejected ones in details",
  async ({ canvas, args }) => {
    drop(canvas.getByText("Drop CSV files here, or"), january, photo);
    await expect(args.onDrop).toHaveBeenCalledOnce();
    await expect(args.onDrop).toHaveBeenCalledWith(
      [january],
      expect.objectContaining({ reason: "none", rejected: [photo] }),
    );
  },
);

Default.test(
  "submits the dropped files with the form",
  { decorators: [inAForm] },
  async ({ canvas }) => {
    drop(canvas.getByText("Drop CSV files here, or"), january, february);
    await expect(submitted(canvas.getByRole("form", { name: "Import" }))).toEqual([
      "january.csv",
      "february.csv",
    ]);
  },
);

Default.test(
  "shows and announces the dropped file names, and clears them",
  async ({ canvas, userEvent }) => {
    drop(canvas.getByText("Drop CSV files here, or"), january, february);
    await expect(canvas.getByRole("status")).toHaveTextContent("january.csv, february.csv");
    await userEvent.click(canvas.getByRole("button", { name: "Clear files" }));
    await expect(canvas.getByRole("status")).toBeEmptyDOMElement();
    await expect(canvas.getByRole("button", { name: "Choose files" })).toHaveFocus();
  },
);

Default.test(
  "keeps only the first file without multiple",
  { args: { multiple: false }, decorators: [inAForm] },
  async ({ canvas, args }) => {
    drop(canvas.getByText("Drop CSV files here, or"), january, february);
    await expect(args.onDrop).toHaveBeenCalledWith([january], expect.anything());
    await expect(submitted(canvas.getByRole("form", { name: "Import" }))).toEqual(["january.csv"]);
  },
);

Default.test(
  "keeps the previous files when the drop is cancelled",
  {
    args: {
      onDrop: (files, details) => {
        if (files[0]?.name === "february.csv") details.cancel();
      },
    },
    decorators: [inAForm],
  },
  async ({ canvas }) => {
    const zone = canvas.getByText("Drop CSV files here, or");
    drop(zone, january);
    drop(zone, february);
    await expect(submitted(canvas.getByRole("form", { name: "Import" }))).toEqual(["january.csv"]);
  },
);

Default.test(
  "submits files picked through its FileTrigger",
  { decorators: [inAForm] },
  async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Choose files" }));
    const input = canvasElement.querySelector<HTMLInputElement>("input[type=file]");
    const transfer = new DataTransfer();
    transfer.items.add(january);
    if (input !== null) {
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await expect(submitted(canvas.getByRole("form", { name: "Import" }))).toEqual(["january.csv"]);
  },
);

Default.test(
  "refuses drops and disables its FileTrigger when disabled",
  { args: { disabled: true } },
  async ({ canvas, args }) => {
    await expect(canvas.getByRole("button", { name: "Choose files" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    drop(canvas.getByText("Drop CSV files here, or"), january);
    await expect(args.onDrop).not.toHaveBeenCalled();
  },
);

const dropBeside = () => {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(january);
  const missed = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer });
  document.body.dispatchEvent(missed);
  return missed.defaultPrevented;
};

function TwoZones(props: DropZoneProps) {
  const [both, setBoth] = useState(true);
  return (
    <>
      <DropZone {...props} />
      {both && <DropZone {...props} />}
      <button
        type="button"
        onClick={() => {
          setBoth(false);
        }}
      >
        Remove one
      </button>
    </>
  );
}

Default.test(
  "stops a file dropped beside the zones from opening in the page while any zone remains",
  { render: (args) => <TwoZones {...args} /> },
  async ({ canvas, userEvent }) => {
    await expect(dropBeside()).toBe(true);
    await userEvent.click(canvas.getByRole("button", { name: "Remove one" }));
    await expect(dropBeside()).toBe(true);
  },
);

Default.test(
  "focuses its trigger and marks it invalid after a blocked submit when required",
  {
    args: { required: true },
    decorators: [
      (Story) => (
        <Form aria-label="Import">
          <Field.Root>
            <Field.Label>Statements</Field.Label>
            <Story />
            <Field.Error />
          </Field.Root>
          <Button type="submit">Import</Button>
        </Form>
      ),
    ],
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Import" }));
    const trigger = canvas.getByRole("button", { name: "Statements Choose files" });
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute("aria-invalid", "true");
  },
);
