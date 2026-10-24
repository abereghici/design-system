import { expect } from "storybook/test";

import { FilesIcon } from "@platform/ui/icons/files";
import { LayersIcon } from "@platform/ui/icons/layers";
import { MailIcon } from "@platform/ui/icons/mail";

import preview from "#.storybook/preview.tsx";

import * as Sidebar from "./sidebar.tsx";

// @ts-expect-error A Sidebar without aria-label or aria-labelledby leaves its landmark unnamed.
<Sidebar.Root>{null}</Sidebar.Root>;

const groups = (
  <>
    <Sidebar.Group>
      <Sidebar.Item>
        <Sidebar.Link href="#inbox">
          <MailIcon data-icon="inline-start" /> Inbox
        </Sidebar.Link>
      </Sidebar.Item>
    </Sidebar.Group>
    <Sidebar.Group label="Projects">
      <Sidebar.Item>
        <Sidebar.Link href="#tokens" aria-current="page">
          <LayersIcon data-icon="inline-start" /> Tokens
        </Sidebar.Link>
      </Sidebar.Item>
      <Sidebar.Item>
        <Sidebar.Link href="#ui">
          <FilesIcon data-icon="inline-start" /> UI
        </Sidebar.Link>
      </Sidebar.Item>
    </Sidebar.Group>
  </>
);

const meta = preview.meta({
  title: "Components/Sidebar",
  component: Sidebar.Root,
  args: { "aria-label": "Workspace", children: groups },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 224 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The app's vertical navigation: a named landmark of links to its sections, optionally in labelled groups, placed in a column the app's layout owns (width, scrolling, stacking under 760 px). The link to the page on screen carries `aria-current=\"page\"`, a fill and the indicator bar. For a few top-level destinations use a Navbar; for the path to this page, Breadcrumbs.",
      },
    },
  },
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
