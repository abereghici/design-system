import type { MouseEvent } from "react";
import { expect, fn } from "storybook/test";

import { PlusIcon } from "@platform/ui/icons/plus";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { Button } from "./button.tsx";

type Context = Parameters<Parameters<typeof Default.test>[2]>[0];

async function isNamed({ canvas }: Context) {
  await expect(canvas.getByRole("button", { name: "Save changes" })).toBeVisible();
}

async function blocksActivation({ canvas, userEvent, args }: Context) {
  const button = canvas.getByRole("button", { name: "Save changes" });
  const presses = listen("ab-press");

  await userEvent.tab();
  await expect(button).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  await userEvent.click(button);
  presses.stop();
  await expect(args.onClick).not.toHaveBeenCalled();
  await expect(presses.events).toEqual([]);
}

const meta = preview.meta({
  title: "Components/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
});

export const Default = meta.story({});

Default.test("activates with a press, Enter and Space", async ({ canvas, userEvent, args }) => {
  const button = canvas.getByRole("button", { name: "Save changes" });

  await userEvent.click(button);
  await expect(button).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  await expect(args.onClick).toHaveBeenCalledTimes(3);
});

Default.test("dispatches a bubbling ab-press after a press", async ({ canvas, userEvent }) => {
  const button = canvas.getByRole("button", { name: "Save changes" });
  const presses = listen("ab-press");

  await userEvent.click(button);
  presses.stop();
  await expect(
    presses.events.map(({ target, bubbles, detail }) => ({ target, bubbles, detail })),
  ).toEqual([{ target: button, bubbles: true, detail: { component: "Button", reason: "user" } }]);
});

Default.test("reads at AA contrast as primary", { args: { variant: "primary" } }, isNamed);

Default.test("reads at AA contrast as tertiary", { args: { variant: "tertiary" } }, isNamed);

Default.test("reads at AA contrast as danger", { args: { variant: "danger" } }, isNamed);

Default.test("passes the accessibility checks at the sm size", { args: { size: "sm" } }, isNamed);

Default.test(
  "stays focusable and blocks activation when disabled",
  { args: { disabled: true } },
  blocksActivation,
);

Default.test(
  "stays focusable and blocks activation when loading",
  { args: { loading: true } },
  blocksActivation,
);

Default.test("is announced as disabled", { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});

Default.test(
  "is announced as busy and unavailable while loading",
  { args: { loading: true } },
  async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });

    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveAttribute("aria-disabled", "true");
  },
);

Default.test(
  "keeps a consumer's aria-disabled",
  { args: { "aria-disabled": true } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  },
);

Default.test(
  "does not submit its form",
  {
    decorators: [
      (Story) => (
        <form
          aria-label="Profile"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <Story />
        </form>
      ),
    ],
  },
  async ({ canvas, userEvent }) => {
    const submits = listen("submit");

    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    submits.stop();
    await expect(submits.events).toEqual([]);
  },
);

Default.test(
  "names itself from its label, not its icon",
  {
    args: {
      children: (
        <>
          <PlusIcon /> New
        </>
      ),
    },
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "New" })).toBeVisible();
  },
);

Default.test(
  "renders its child with asChild",
  {
    args: {
      asChild: true,
      children: <a href="#settings">Settings</a>,
      onClick: fn((event: MouseEvent) => {
        event.preventDefault();
      }),
    },
  },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Settings" }));
    await expect(canvas.queryByRole("button")).toBeNull();
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
);

const childClick = fn((event: MouseEvent) => {
  event.preventDefault();
});
const childRef = fn<(node: HTMLElement | null) => void>();
const buttonRef = fn<(node: HTMLElement | null) => void>();

Default.test(
  "keeps its child's own click handler and ref with asChild",
  {
    args: {
      asChild: true,
      ref: buttonRef,
      children: (
        <a href="#settings" ref={childRef} onClick={childClick}>
          Settings
        </a>
      ),
      onClick: fn<(event: MouseEvent) => void>(),
    },
  },
  async ({ canvas, userEvent, args }) => {
    const link = canvas.getByRole("link", { name: "Settings" });
    const presses = listen("ab-press");

    await userEvent.click(link);
    await expect(childClick).toHaveBeenCalledOnce();
    await expect(args.onClick).toHaveBeenCalledOnce();
    presses.stop();
    await expect(presses.events).toHaveLength(1);
    await expect(childRef).toHaveBeenCalledWith(link);
    await expect(buttonRef).toHaveBeenCalledWith(link);
  },
);

const busyChildClick = fn<(event: MouseEvent) => void>();

Default.test(
  "ignores presses on its child's own click handler while loading with asChild",
  {
    args: {
      asChild: true,
      loading: true,
      children: (
        <a href="#settings" onClick={busyChildClick}>
          Settings
        </a>
      ),
    },
  },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Settings" }));
    await expect(busyChildClick).not.toHaveBeenCalled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
);

function backgroundUnder(css: string, button: HTMLElement) {
  const appStyles = document.createElement("style");

  appStyles.textContent = css;
  document.head.prepend(appStyles);

  try {
    // Finishing jumps to the settled colour; awaiting `finished` rejects when a busy engine cancels the transition.
    for (const animation of button.getAnimations()) animation.finish();

    return getComputedStyle(button).backgroundColor;
  } finally {
    appStyles.remove();
  }
}

Default.test("yields to unlayered app CSS", async ({ canvas }) => {
  const button = canvas.getByRole("button", { name: "Save changes" });

  await expect(backgroundUnder("button { background-color: rgb(1, 2, 3); }", button)).toBe(
    "rgb(1, 2, 3)",
  );
});

Default.test(
  "takes its component tokens from unlayered app CSS",
  { args: { variant: "primary" } },
  async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });

    await expect(
      backgroundUnder(":root { --ab-button-primary-background-color: rgb(1, 2, 3); }", button),
    ).toBe("rgb(1, 2, 3)");
  },
);

export const Loading = meta.story({
  args: { loading: true, variant: "primary" },
  parameters: {
    docs: { description: { story: "Busy: a spinner covers the label, also through `asChild`." } },
  },
  render: (args) => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Button {...args} />
      <Button {...args} asChild>
        <a href="#report">Open report</a>
      </Button>
    </div>
  ),
});

Loading.test("keeps its child busy and named with asChild", async ({ canvas, userEvent, args }) => {
  const link = canvas.getByRole("link", { name: "Open report" });

  await expect(link).toHaveAttribute("aria-busy", "true");
  await userEvent.click(link);
  await expect(args.onClick).not.toHaveBeenCalled();
});

export const InADisabledFieldset = meta.story({
  parameters: {
    docs: { description: { story: "A disabled fieldset disables the Button and its look." } },
  },
  decorators: [
    (Story) => (
      <fieldset disabled>
        <legend>Billing</legend>
        <Story />
      </fieldset>
    ),
  ],
});

InADisabledFieldset.test("is disabled", async ({ canvas }) => {
  await expect(canvas.getByRole("button", { name: "Save changes" })).toBeDisabled();
});

export const LongLabel = meta.story({
  args: { children: "Save changes and notify everyone who follows this project" },
  parameters: {
    docs: { description: { story: "A long or translated label wraps on narrow screens." } },
  },
});
