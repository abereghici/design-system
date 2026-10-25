import { expect, fn, waitFor } from "storybook/test";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { Accordion } from "./index.ts";

const tokens = "Semantic Versioning. Renames are major; additions are minor.";
const browsers = "The latest Chromium and Safari.";

const meta = preview.meta({
  title: "Components/Accordion",
  component: Accordion.Root,
  subcomponents: partsOf(Accordion),
  args: {
    defaultValue: ["tokens"],
    children: (
      <>
        <Accordion.Item value="tokens">
          <Accordion.Trigger>How are tokens versioned?</Accordion.Trigger>
          <Accordion.Content>{tokens}</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="browsers">
          <Accordion.Trigger>Which browsers are supported?</Accordion.Trigger>
          <Accordion.Content>{browsers}</Accordion.Content>
        </Accordion.Item>
      </>
    ),
    onValueChange: fn<(value: string[], details: Accordion.ChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test("shows the open item's content only", async ({ canvas }) => {
  await expect(canvas.getByText(tokens)).toBeVisible();
  await expect(canvas.getByText(browsers)).not.toBeVisible();
});

Default.test(
  "opens an item on click, closes the open one and dispatches one ab-toggle",
  async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByText("Which browsers are supported?");
    const toggles = listen("ab-toggle");

    await userEvent.click(trigger);
    toggles.stop();
    await waitFor(() => expect(canvas.getByText(browsers)).toBeVisible());
    await expect(canvas.getByText(tokens)).not.toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      ["browsers"],
      expect.objectContaining({ reason: "trigger-press" }),
    );
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: trigger, detail: { component: "Accordion", reason: "user" } },
    ]);
  },
);

Default.test("puts every trigger in the tab sequence", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByText("How are tokens versioned?")).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByText("Which browsers are supported?")).toHaveFocus();
});

Default.test(
  "opens only the first of several values without multiple",
  { args: { value: ["tokens", "browsers"] } },
  async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText(tokens)).toBeVisible();
    await expect(canvas.getByText(browsers)).not.toBeVisible();
    await userEvent.click(canvas.getByText("How are tokens versioned?"));
    await expect(args.onValueChange).toHaveBeenLastCalledWith([], expect.anything());
    await expect(canvas.getByText(browsers)).not.toBeVisible();
  },
);

Default.test(
  "keeps several items open when multiple",
  { args: { multiple: true } },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByText("Which browsers are supported?"));
    await waitFor(() => expect(canvas.getByText(browsers)).toBeVisible());
    await expect(canvas.getByText(tokens)).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      ["tokens", "browsers"],
      expect.anything(),
    );
  },
);

Default.test(
  "keeps the items as they were when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const toggles = listen("ab-toggle");

    await userEvent.click(canvas.getByText("How are tokens versioned?"));
    toggles.stop();
    await expect(canvas.getByText(tokens)).toBeVisible();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "stays closed and reports no change when its click is default-prevented",
  async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByText("Which browsers are supported?");

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
    });

    const toggles = listen("ab-toggle");

    await userEvent.click(trigger);
    toggles.stop();
    await expect(canvas.getByText(browsers)).not.toBeVisible();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "follows a controlled value",
  { args: { value: [] } },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByText("Which browsers are supported?"));
    await expect(args.onValueChange).toHaveBeenCalledWith(["browsers"], expect.anything());
    await expect(canvas.getByText(browsers)).not.toBeVisible();
  },
);

export const LongTrigger = meta.story({
  args: {
    defaultValue: ["limits"],
    children: (
      <Accordion.Item value="limits">
        <Accordion.Trigger>
          Why does https://platform.example.com/settings/organization/billing/limits say 0?
        </Accordion.Trigger>
        <Accordion.Content>{browsers}</Accordion.Content>
      </Accordion.Item>
    ),
  },
  parameters: {
    docs: { description: { story: "A long trigger wraps, with the chevron kept in view." } },
  },
});
