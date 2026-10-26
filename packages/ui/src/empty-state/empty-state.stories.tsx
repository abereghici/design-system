import { expect } from "storybook/test";

import { Button } from "@platform/ui/button";
import { FilesIcon } from "@platform/ui/icons/files";
import { Table } from "@platform/ui/table";

import preview, { partsOf } from "#.storybook/preview.tsx";

import * as EmptyState from "./empty-state.tsx";

const meta = preview.meta({
  title: "Components/EmptyState",
  component: EmptyState.Root,
  subcomponents: partsOf(EmptyState),
  args: {
    children: (
      <>
        <EmptyState.Indicator>
          <FilesIcon />
        </EmptyState.Indicator>
        <EmptyState.Title>No files yet</EmptyState.Title>
        <EmptyState.Description>Upload a file or create one to get started.</EmptyState.Description>
        <Button>New file</Button>
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test("names the empty region with a level-3 heading", async ({ canvas }) => {
  await expect(canvas.getByRole("heading", { level: 3, name: "No files yet" })).toBeVisible();
  await expect(canvas.queryByRole("img")).toBeNull();
});

Default.test(
  "takes the heading level of the child it renders",
  {
    args: {
      children: (
        <EmptyState.Title asChild>
          <h2>No results for “moss”</h2>
        </EmptyState.Title>
      ),
    },
  },
  async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 2, name: "No results for “moss”" }),
    ).toBeVisible();
    await expect(canvas.queryByRole("heading", { level: 3 })).toBeNull();
  },
);

Default.test("leads straight to its action", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "New file" })).toHaveFocus();
});

export const InATable = meta.story({
  parameters: {
    docs: {
      description: {
        story: "A table with no rows: one cell spans every column, so the headers stay.",
      },
    },
  },
  render: (args) => (
    <Table.Root>
      <Table.Caption>Files</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Name</Table.ColumnHeader>
          <Table.ColumnHeader>Owner</Table.ColumnHeader>
          <Table.ColumnHeader>Modified</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell colSpan={3}>
            <EmptyState.Root {...args} />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  ),
});

InATable.test("keeps the column headers and says why it is empty", async ({ canvas }) => {
  await expect(canvas.getAllByRole("columnheader")).toHaveLength(3);
  await expect(canvas.getByRole("cell", { name: /No files yet/v })).toBeVisible();
});
