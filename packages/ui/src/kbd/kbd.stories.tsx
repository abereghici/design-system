import type { ComponentProps } from "react";
import { expect } from "storybook/test";

import type { StoryContext } from "@storybook/react-vite";

import { Button } from "@platform/ui/button";

import preview from "#.storybook/preview.tsx";

import { Kbd } from "./kbd.tsx";

type Context = StoryContext<ComponentProps<typeof Kbd>>;

function onPlatform(platform: string) {
  return () => {
    Object.defineProperty(navigator, "platform", { value: platform, configurable: true });

    return () => {
      Reflect.deleteProperty(navigator, "platform");
    };
  };
}

function reads(...texts: string[]) {
  return async ({ canvasElement }: Context) => {
    await expect(canvasElement).toHaveTextContent(texts.join(""));
  };
}

const meta = preview.meta({
  title: "Components/Kbd",
  component: Kbd,
  args: { keys: "mod+k" },
});

export const Default = meta.story({
  // Its text follows the viewer's platform (⌘ K or Ctrl K); the platform proofs below pin both.
  parameters: { ariaSnapshot: { disable: true } },
});

Default.test("shows ⌘ K on Apple platforms", { args: { platform: "apple" } }, reads("⌘", "K"));

Default.test("shows Ctrl K elsewhere", { args: { platform: "other" } }, reads("Ctrl", "K"));

Default.test("detects an Apple platform", { beforeEach: onPlatform("iPhone") }, reads("⌘", "K"));

Default.test("detects other platforms", { beforeEach: onPlatform("Win32") }, reads("Ctrl", "K"));

Default.test(
  "names the Apple modifiers and the glyph keys with keyLabels",
  {
    args: {
      keys: "ctrl+alt+shift+backspace+up",
      platform: "apple",
      keyLabels: {
        control: "Control",
        option: "Option",
        shift: "Shift",
        backspace: "Backspace",
        arrowUp: "Up arrow",
      },
    },
  },
  reads("⌃", "Control", "⌥", "Option", "⇧", "Shift", "⌫", "Backspace", "↑", "Up arrow"),
);

Default.test(
  "writes the modifiers as words elsewhere",
  { args: { keys: "Shift+Alt+Esc+plus", platform: "other" } },
  reads("Shift", "Alt", "Esc", "+"),
);

Default.test("shows one key from its children", { render: () => <Kbd>Esc</Kbd> }, reads("Esc"));

export const InAButton = meta.story({
  args: { keys: "mod+enter", "aria-hidden": true },
  decorators: [
    (Story) => (
      <Button variant="primary" aria-keyshortcuts="Meta+Enter Control+Enter">
        Publish <Story />
      </Button>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Inside a control the Kbd is `aria-hidden` and the control carries `aria-keyshortcuts`, so its name stays its label.",
      },
    },
  },
});

InAButton.test("leaves the button's name to its label", async ({ canvas }) => {
  await expect(canvas.getByRole("button", { name: "Publish" })).toHaveAttribute(
    "aria-keyshortcuts",
    "Meta+Enter Control+Enter",
  );
});
