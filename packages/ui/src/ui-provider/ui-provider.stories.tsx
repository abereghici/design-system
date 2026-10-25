import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { UIProvider } from "./ui-provider.tsx";

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
