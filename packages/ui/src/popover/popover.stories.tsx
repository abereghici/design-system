import { useRef, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@platform/ui/button";
import { roRO } from "@platform/ui/locales/ro-RO";
import { Provider } from "@platform/ui/provider";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { parkPointer, trusted } from "#.storybook/test/trusted.ts";

import type { Locale } from "../provider/locale.tsx";

import * as Popover from "./popover.tsx";

const onOpenChange = fn<NonNullable<Popover.RootProps["onOpenChange"]>>();

const reasons = () => onOpenChange.mock.calls.map(([open, { reason }]) => [open, reason]);

const filters = (
  <>
    <Popover.Trigger asChild>
      <Button variant="secondary">Filters</Button>
    </Popover.Trigger>
    <Popover.Content>
      <Popover.Title>Filters</Popover.Title>
      <Popover.Description>Show only the rows that match.</Popover.Description>
      <label>
        <input type="checkbox" name="mine" /> Assigned to me
      </label>
      <Popover.Close />
    </Popover.Content>
  </>
);

function Controlled(props: Popover.RootProps) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  return (
    <>
      <Popover.Root
        {...props}
        open={open}
        onOpenChange={(next, details) => {
          props.onOpenChange?.(next, details);
          setOpen(next);
        }}
      />
      <output>{open ? "Open" : "Closed"}</output>
    </>
  );
}

function WithInitialFocus(props: Popover.RootProps) {
  const field = useRef<HTMLInputElement>(null);
  return (
    <Popover.Root {...props}>
      <Popover.Trigger>Rename</Popover.Trigger>
      <Popover.Content aria-label="Rename" initialFocus={field}>
        <input ref={field} aria-label="Name" defaultValue="Report" />
      </Popover.Content>
    </Popover.Root>
  );
}

const meta = preview.meta({
  title: "Components/Popover",
  component: Popover.Root,
  subcomponents: partsOf(Popover),
  args: { onOpenChange, children: filters },
  beforeEach: parkPointer,
  decorators: [
    (Story) => (
      <div style={{ display: "flex", gap: "0.5rem", paddingBlockEnd: "14rem" }}>
        <Story />
        <Button variant="tertiary">After</Button>
      </div>
    ),
  ],
});

export const Default = meta.story({});

Default.test(
  "opens from its Trigger as a named dialog and moves focus into it",
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await user.keyboard("{Tab}{Enter}");
    await waitFor(() => expect(canvas.getByRole("dialog", { name: "Filters" })).toBeVisible());
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("checkbox", { name: "Assigned to me" })).toHaveFocus();
    await user.click(trigger);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(reasons()).toEqual([
      [true, "trigger-press"],
      [false, "trigger-press"],
    ]);
  },
);

Default.test(
  "closes on Escape, returns focus to the Trigger and dispatches ab-dismiss",
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await user.click(trigger);
    await user.click(canvas.getByRole("checkbox", { name: "Assigned to me" }));
    const dismissals = listen("ab-dismiss");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    dismissals.stop();
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(dismissals.events.map(({ detail }) => detail)).toEqual([
      { component: "Popover", reason: "user" },
    ]);
    await expect(reasons().at(-1)).toEqual([false, "escape-key"]);
  },
);

Default.test("closes on a press outside", async ({ canvas }) => {
  const user = await trusted();
  await user.click(canvas.getByRole("button", { name: "Filters" }));
  const dismissals = listen("ab-dismiss");
  await user.click(document.body, { position: { x: 400, y: 5 } });
  await waitFor(() => expect(dismissals.events).toHaveLength(1));
  dismissals.stop();
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(reasons().at(-1)).toEqual([false, "outside-press"]);
});

Default.test("closes from Close and returns focus to the Trigger", async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Filters" });
  await user.click(trigger);
  const close = canvas.getByRole("button", { name: "Close" });
  const dismissals = listen("ab-dismiss");
  await user.click(close);
  dismissals.stop();
  await waitFor(() => expect(trigger).toHaveFocus());
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(dismissals.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
    { target: close, detail: { component: "Popover", reason: "user" } },
  ]);
  await expect(reasons().at(-1)).toEqual([false, "close-press"]);
});

Default.test("closes once Tab moves focus past its Content", async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Filters" });
  await user.click(trigger);
  await expect(canvas.getByRole("checkbox", { name: "Assigned to me" })).toHaveFocus();
  await user.keyboard("{Tab}{Tab}");
  await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(reasons().at(-1)).toEqual([false, "focus-out"]);
});

Default.test(
  "stays closed when onOpenChange cancels the open",
  {
    args: {
      onOpenChange: (_open: boolean, details: Popover.ChangeEventDetails) => {
        details.cancel();
      },
    },
  },
  async ({ canvas }) => {
    const user = await trusted();
    await user.click(canvas.getByRole("button", { name: "Filters" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
);

Default.test(
  "names Close in the Provider's locale",
  {
    decorators: [
      (Story) => (
        <Provider locale={roRO}>
          <Story />
        </Provider>
      ),
    ],
  },
  async ({ canvas }) => {
    const user = await trusted();
    await user.click(canvas.getByRole("button", { name: "Filters" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Închide" })).toBeVisible());
  },
);

// @ts-expect-error -- a locale must name the Popover's Close
void ({ ...roRO, labels: { ...roRO.labels, popover: {} } } satisfies Locale);

export const ControlledOpen = meta.story({
  parameters: {
    docs: { description: { story: "The app holds `open` and hears every change." } },
  },
  render: Controlled,
});

ControlledOpen.test("follows the state its parent holds", async ({ canvas }) => {
  const user = await trusted();
  await user.click(canvas.getByRole("button", { name: "Filters" }));
  await waitFor(() => expect(canvas.getByRole("dialog", { name: "Filters" })).toBeVisible());
  await expect(canvas.getByRole("status")).toHaveTextContent("Open");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Closed"));
});

export const InitialFocus = meta.story({
  parameters: {
    docs: {
      description: { story: "`initialFocus` moves focus to a field when the Popover opens." },
    },
  },
  render: WithInitialFocus,
});

InitialFocus.test("focuses the field it names", async ({ canvas }) => {
  const user = await trusted();
  await user.click(canvas.getByRole("button", { name: "Rename" }));
  await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveFocus();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(canvas.getByRole("button", { name: "Rename" })).toHaveFocus());
});
