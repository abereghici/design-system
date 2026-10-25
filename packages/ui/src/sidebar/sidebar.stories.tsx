import { expect } from "storybook/test";

import { FilesIcon } from "@platform/ui/icons/files";
import { LayersIcon } from "@platform/ui/icons/layers";
import { MailIcon } from "@platform/ui/icons/mail";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { trusted } from "#.storybook/test/trusted.ts";

import * as Sidebar from "./sidebar.tsx";

// @ts-expect-error -- a Sidebar without aria-label or aria-labelledby leaves its landmark unnamed
<Sidebar.Root>{null}</Sidebar.Root>;

const groups = (
  <>
    <Sidebar.Group>
      <Sidebar.Item>
        <Sidebar.Link href="#inbox">
          <MailIcon /> Inbox
        </Sidebar.Link>
      </Sidebar.Item>
    </Sidebar.Group>
    <Sidebar.Group label="Projects">
      <Sidebar.Item>
        <Sidebar.Link href="#tokens" aria-current="page">
          <LayersIcon /> Tokens
        </Sidebar.Link>
      </Sidebar.Item>
      <Sidebar.Item>
        <Sidebar.Link href="#ui">
          <FilesIcon /> UI
        </Sidebar.Link>
      </Sidebar.Item>
    </Sidebar.Group>
  </>
);

const meta = preview.meta({
  title: "Components/Sidebar",
  component: Sidebar.Root,
  subcomponents: partsOf(Sidebar),
  args: { "aria-label": "Workspace", children: groups },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 224 }}>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({});

Default.test("is a named navigation landmark", async ({ canvas }) => {
  await expect(canvas.getByRole("navigation", { name: "Workspace" })).toBeVisible();
});

Default.test("names a labelled group by its label and lists its links", async ({ canvas }) => {
  const projects = canvas.getByRole("group", { name: "Projects" });

  await expect(projects).toBeVisible();
  await expect(canvas.getAllByRole("group")).toEqual([projects]);
  await expect(canvas.getAllByRole("list")).toHaveLength(2);
});

Default.test("marks the current page", async ({ canvas }) => {
  await expect(canvas.getByRole("link", { name: "Tokens" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

Default.test(
  "makes every link a tab stop and skips group labels",
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Inbox" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Tokens" })).toHaveFocus();
  },
);

Default.test(
  "renders a router link with asChild",
  {
    args: {
      children: (
        <Sidebar.Group>
          <Sidebar.Item>
            <Sidebar.Link asChild>
              <a href="#settings">Settings</a>
            </Sidebar.Link>
          </Sidebar.Item>
        </Sidebar.Group>
      ),
    },
  },
  async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toEqual([
      canvas.getByRole("link", { name: "Settings" }),
    ]);
  },
);

export const Collapsible = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "A `collapsible` Group folds its links under its label, a native disclosure; `defaultOpen` starts it open.",
      },
    },
  },
  args: {
    children: (
      <>
        {groups}
        <Sidebar.Group label="Settings" collapsible>
          <Sidebar.Item>
            <Sidebar.Link href="#billing">Billing</Sidebar.Link>
          </Sidebar.Item>
        </Sidebar.Group>
      </>
    ),
  },
});

Collapsible.test(
  "shows a folded group's links once its label is pressed",
  async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("link", { name: "Billing" })).not.toBeVisible();
    await userEvent.click(canvas.getByText("Settings"));
    await expect(canvas.getByRole("group", { name: "Settings" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Billing" })).toBeVisible();
  },
);

Collapsible.test("opens and folds a group from the keyboard", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();
  await expect(canvas.getByText("Settings")).toHaveFocus();
  await (await trusted()).keyboard("{Enter}");
  await expect(canvas.getByRole("link", { name: "Billing" })).toBeVisible();
  await (await trusted()).keyboard("{Enter}");
  await expect(canvas.getByRole("link", { name: "Billing" })).not.toBeVisible();
});
