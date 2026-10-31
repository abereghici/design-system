import { expect, waitFor } from "storybook/test";

import { FilesIcon } from "@abereghici/ui/icons/files";
import { LayersIcon } from "@abereghici/ui/icons/layers";
import { MailIcon } from "@abereghici/ui/icons/mail";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import * as Sidebar from "./sidebar.tsx";

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

const billing = (
  <Sidebar.Item>
    <Sidebar.Link href="#billing">Billing</Sidebar.Link>
  </Sidebar.Item>
);

export const Collapsible = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "A CollapsibleGroup folds its links under its label, as a Disclosure does; `defaultOpen` starts it open.",
      },
    },
  },
  args: {
    children: (
      <>
        {groups}
        <Sidebar.CollapsibleGroup label="Settings">{billing}</Sidebar.CollapsibleGroup>
      </>
    ),
  },
});

Collapsible.test(
  "shows a folded group's links once its label is pressed, dispatching ab-toggle",
  async ({ canvas, userEvent }) => {
    const toggles = listen("ab-toggle");

    await expect(canvas.getByRole("link", { name: "Billing" })).not.toBeVisible();
    await userEvent.click(canvas.getByText("Settings"));
    toggles.stop();
    await expect(canvas.getByRole("group", { name: "Settings" })).toBeVisible();
    await waitFor(() => expect(canvas.getByRole("link", { name: "Billing" })).toBeVisible());
    await expect(toggles.events.map(({ detail }) => detail)).toEqual([
      { component: "Sidebar", reason: "user" },
    ]);
  },
);

Collapsible.test(
  "stays folded when the app cancels the change",
  {
    args: {
      children: (
        <Sidebar.CollapsibleGroup
          label="Settings"
          onOpenChange={(_open, details) => {
            details.cancel();
          }}
        >
          {billing}
        </Sidebar.CollapsibleGroup>
      ),
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Settings"));
    await expect(canvas.getByRole("link", { name: "Billing" })).not.toBeVisible();
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
