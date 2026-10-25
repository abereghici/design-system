import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { useLocale } from "./locale.tsx";
import { enUS } from "./locales/en-US.ts";
import { roRO } from "./locales/ro-RO.ts";
import { UIProvider } from "./ui-provider.tsx";

function Tag() {
  return <output>{useLocale().tag}</output>;
}

const meta = preview.meta({
  title: "Components/UIProvider",
  component: UIProvider,
  args: { children: <Tag /> },
});

export const Default = meta.story({});

Default.test("without a locale, components use en-US", async ({ canvas }) => {
  await expect(canvas.getByRole("status")).toHaveTextContent("en-US");
});

Default.test(
  "passes its locale to client components",
  { args: { locale: roRO } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("ro-RO");
  },
);

Default.test(
  "its base stylesheet yields to unlayered app CSS",
  { args: { children: <button type="button">Save changes</button> } },
  async ({ canvas, userEvent }) => {
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
  },
);

Default.test(
  "takes a locale spread from a shipped one",
  { args: { locale: { ...enUS, tag: "en-GB", labels: { ...enUS.labels } } } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("en-GB");
  },
);
