import { expect } from "storybook/test";

import { Button } from "@platform/ui/button";
import { Provider } from "@platform/ui/provider";

import preview from "#.storybook/preview.tsx";

import type { Locale } from "../provider/locale.tsx";
import { enUS } from "../provider/locales/en-US.ts";
import { roRO } from "../provider/locales/ro-RO.ts";

import { Kbd } from "./kbd.tsx";

// @ts-expect-error -- a locale must name every Kbd key
({ tag: "fr-FR", labels: { ...enUS.labels, kbd: { command: "Commande" } } }) satisfies Locale;

type Context = Parameters<Parameters<typeof Default.test>[2]>[0];

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
  parameters: {
    docs: {
      description: {
        component:
          "Shows a keyboard shortcut, one keycap per key: `mod` is ⌘ on Apple platforms and Ctrl elsewhere. It shows the key and never binds it; inside a control, pass `aria-hidden` and set `aria-keyshortcuts` on the control.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test(
  "shows Command K on Apple platforms, with the glyph's spoken name",
  { args: { platform: "apple" } },
  reads("⌘", "Command", "K"),
);

Default.test("shows Ctrl K elsewhere", { args: { platform: "other" } }, reads("Ctrl", "K"));

Default.test(
  "detects an Apple platform",
  { beforeEach: onPlatform("iPhone") },
  reads("⌘", "Command", "K"),
);

Default.test("detects other platforms", { beforeEach: onPlatform("Win32") }, reads("Ctrl", "K"));

Default.test(
  "names the Apple modifiers and the glyph keys",
  { args: { keys: "ctrl+alt+shift+backspace+up", platform: "apple" } },
  reads("⌃", "Control", "⌥", "Option", "⇧", "Shift", "⌫", "Backspace", "↑", "Up arrow"),
);

Default.test(
  "writes the modifiers as words elsewhere",
  { args: { keys: "Shift+Alt+Esc+plus", platform: "other" } },
  reads("Shift", "Alt", "Esc", "+"),
);

Default.test("shows one key from its children", { render: () => <Kbd>Esc</Kbd> }, reads("Esc"));

Default.test(
  "takes spoken names from labels",
  { args: { keys: "mod+enter", platform: "apple", labels: { command: "Cmd" } } },
  reads("⌘", "Cmd", "↵", "Enter"),
);

Default.test(
  "takes spoken names from the Provider's locale",
  {
    args: { platform: "apple" },
    decorators: [
      (Story) => (
        <Provider locale={roRO}>
          <Story />
        </Provider>
      ),
    ],
  },
  reads("⌘", "Comandă", "K"),
);

export const InAButton = meta.story({
  args: { keys: "mod+enter", "aria-hidden": true },
  render: (args) => (
    <Button variant="primary" aria-keyshortcuts="Meta+Enter Control+Enter">
      Publish <Kbd {...args} />
    </Button>
  ),
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
