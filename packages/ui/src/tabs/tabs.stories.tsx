import { expect, fn, waitFor } from "storybook/test";

import { Badge } from "@abereghici/ui/badge";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { followLinkTo } from "#.storybook/test/follow-link.ts";
import { listen } from "#.storybook/test/listen.ts";
import { atCentre } from "#.storybook/test/pointer.ts";

import { Tabs } from "./index.ts";

const sections = (
  <>
    <Tabs.List aria-label="Project">
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="activity">
        Activity <Badge>{3}</Badge>
      </Tabs.Trigger>
      <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="overview">Selection glides on a spring.</Tabs.Content>
    <Tabs.Content value="activity">Three new comments.</Tabs.Content>
    <Tabs.Content value="settings">Project settings.</Tabs.Content>
  </>
);

const meta = preview.meta({
  title: "Components/Tabs",
  component: Tabs.Root,
  subcomponents: partsOf(Tabs),
  args: {
    defaultValue: "overview",
    children: sections,
    onValueChange: fn<(value: string, details: Tabs.ChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test("shows the selected tab's panel, named by its tab", async ({ canvas }) => {
  await expect(canvas.getByRole("tablist", { name: "Project" })).toBeVisible();
  await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(canvas.getByRole("tab", { name: "Activity 3" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
  await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toHaveTextContent(
    "Selection glides on a spring.",
  );
  await expect(canvas.queryByText("Three new comments.")).not.toBeVisible();
});

Default.test(
  "selects a tab on click and dispatches one ab-toggle",
  async ({ canvas, userEvent, args }) => {
    const activity = canvas.getByRole("tab", { name: "Activity 3" });
    const toggles = listen("ab-toggle");

    await userEvent.click(activity);
    await userEvent.click(activity);
    toggles.stop();
    await expect(activity).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Activity 3" })).toHaveTextContent(
      "Three new comments.",
    );
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      "activity",
      expect.objectContaining({ reason: "none" }),
    );
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: activity, detail: { component: "Tabs", userInitiated: true } },
    ]);
  },
);

Default.test(
  "moves focus and selection with the arrow keys, Home and End",
  async ({ canvas, userEvent }) => {
    const [overview, activity, settings] = canvas.getAllByRole("tab");

    await userEvent.tab();
    await expect(overview).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(activity).toHaveFocus();
    await expect(activity).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(overview).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(settings).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{End}");
    await expect(settings).toHaveAttribute("aria-selected", "true");
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toHaveFocus();
  },
);

Default.test(
  "skips a disabled tab with the arrow keys",
  {
    args: {
      children: (
        <>
          <Tabs.List aria-label="Project">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="activity" disabled>
              Activity
            </Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">Selection glides on a spring.</Tabs.Content>
          <Tabs.Content value="activity">Three new comments.</Tabs.Content>
          <Tabs.Content value="settings">Project settings.</Tabs.Content>
        </>
      ),
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Settings" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveFocus();
  },
);

Default.test(
  "follows the visual direction with Left and Right in RTL",
  { globals: { dir: "rtl" } },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("tab", { name: "Activity 3" })).toHaveFocus();
    await expect(canvas.getByRole("tabpanel", { name: "Activity 3" })).toBeInTheDocument();
  },
);

Default.test(
  "keeps the current tab and focus when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const toggles = listen("ab-toggle");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
    toggles.stop();
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toBeInTheDocument();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "opens the tab holding a match the browser reveals, without a feedback event",
  async ({ canvas, args }) => {
    const toggles = listen("ab-toggle");

    followLinkTo(canvas.getByText("Three new comments."));
    toggles.stop();
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      "activity",
      expect.objectContaining({ reason: "find" }),
    );
    await expect(canvas.getByRole("tab", { name: "Activity 3" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("tabpanel", { name: "Activity 3" })).toBeVisible();
    await expect(canvas.queryByText("Selection glides on a spring.")).not.toBeVisible();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "hides a revealed panel again when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas }) => {
    followLinkTo(canvas.getByText("Three new comments."));
    await waitFor(() => expect(canvas.queryByText("Three new comments.")).not.toBeVisible());
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
  },
);

Default.test("leaves the hidden panels out of the Tab order", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await userEvent.tab();
  await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toHaveFocus();
  await userEvent.tab();
  await expect(document.body).toHaveFocus();
});

Default.test("still changes when its click is default-prevented", async ({ canvas, userEvent }) => {
  const tab = canvas.getByRole("tab", { name: "Settings" });

  tab.addEventListener("click", (event) => {
    event.preventDefault();
  });
  await userEvent.click(tab);
  await expect(tab).toHaveAttribute("aria-selected", "true");
});

Default.test(
  "follows a controlled value",
  { args: { value: "settings" } },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("overview", expect.anything());
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeInTheDocument();
  },
);

export const Overflowing = meta.story({
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "10rem" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: { description: { story: "A tablist wider than its container scrolls inline." } },
  },
});

Overflowing.test("scrolls a partly hidden tab into view", async ({ canvas, userEvent }) => {
  const settings = canvas.getByRole("tab", { name: "Settings" });

  await expect(atCentre(settings)).not.toBe(settings);
  await userEvent.click(settings);
  await expect(atCentre(settings)).toBe(settings);
});
