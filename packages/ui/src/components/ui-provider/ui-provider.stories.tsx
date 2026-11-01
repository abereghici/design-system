import { expect } from "storybook/test";

import { Button } from "@abereghici/ui/button";
import { IconButton } from "@abereghici/ui/icon-button";
import { SearchIcon } from "@abereghici/ui/icons/search";
import { TextField } from "@abereghici/ui/text-field";

import preview from "#.storybook/preview.tsx";

import { UIProvider } from "./ui-provider.tsx";

const Controls = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "end", gap: "0.5rem" }}>
    <TextField label={label} name="query" />
    <IconButton aria-label="Search">
      <SearchIcon />
    </IconButton>
    <Button>Apply</Button>
  </div>
);

const meta = preview.meta({
  title: "Components/UIProvider",
  component: UIProvider,
  args: { children: <button type="button">Save changes</button> },
});

export const Default = meta.story({});

Default.test("its base stylesheet yields to unlayered app CSS", async ({ canvas, userEvent }) => {
  const appStyles = document.createElement("style");

  appStyles.textContent = "button { outline-color: rgb(1, 2, 3); }";
  document.head.append(appStyles);

  try {
    const button = canvas.getByRole("button", { name: "Save changes" });

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).outlineColor).toBe("rgb(1, 2, 3)");
  } finally {
    appStyles.remove();
  }
});

export const Density = meta.story({
  parameters: {
    docs: {
      description: {
        story: "Compact, then comfortable inside it, then compact again: the nearest setting wins.",
      },
    },
  },
  render: () => (
    <div data-density="compact" style={{ display: "grid", gap: "1rem" }}>
      <Controls label="Compact" />
      <div data-density="comfortable" style={{ display: "grid", gap: "1rem" }}>
        <Controls label="Comfortable" />
        <div data-density="compact">
          <Controls label="Compact again" />
        </div>
      </div>
    </div>
  ),
});
