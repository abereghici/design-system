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
  parameters: {
    docs: {
      description: {
        component:
          'A native `<button type="button">` for an action: one primary per view, secondary for the rest, tertiary in toolbars and dense rows, danger only to confirm a destructive action. Every press dispatches a bubbling `ab-press` event after `onClick`. For an icon-only action, use IconButton; to navigate, use Link.',
      },
    },
  },
});

export const Default = meta.story({});

Default.test("calls onClick when pressed", async ({ canvas, userEvent, args }) => {
  await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
  await expect(args.onClick).toHaveBeenCalledOnce();
});

Default.test("activates with Enter and Space", async ({ canvas, userEvent, args }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  await expect(args.onClick).toHaveBeenCalledTimes(2);
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

Default.test("keeps its name at the primary variant", { args: { variant: "primary" } }, isNamed);

Default.test("keeps its name at the tertiary variant", { args: { variant: "tertiary" } }, isNamed);

Default.test("keeps its name at the danger variant", { args: { variant: "danger" } }, isNamed);

Default.test("keeps its name at the sm size", { args: { size: "sm" } }, isNamed);

Default.test("keeps its name at the lg size", { args: { size: "lg" } }, isNamed);

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
  "is announced as busy while loading",
  { args: { loading: true } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveAttribute(
      "aria-busy",
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
          <PlusIcon data-icon="inline-start" /> New
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

async function backgroundUnder(css: string, button: HTMLElement) {
  const appStyles = document.createElement("style");
  appStyles.textContent = css;
  document.head.prepend(appStyles);
  try {
    await Promise.all(button.getAnimations().map(({ finished }) => finished));
    return getComputedStyle(button).backgroundColor;
  } finally {
    appStyles.remove();
  }
}

Default.test("yields to unlayered app CSS", async ({ canvas }) => {
  const button = canvas.getByRole("button", { name: "Save changes" });
  await expect(await backgroundUnder("button { background-color: rgb(1, 2, 3); }", button)).toBe(
    "rgb(1, 2, 3)",
  );
});

Default.test(
  "takes its component tokens from unlayered app CSS",
  { args: { variant: "primary" } },
  async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });
    await expect(
      await backgroundUnder(
        ":root { --ab-button-primary-background-color: rgb(1, 2, 3); }",
        button,
      ),
    ).toBe("rgb(1, 2, 3)");
  },
);
