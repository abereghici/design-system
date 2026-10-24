import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { useLocale } from "./locale.tsx";
import { enUS } from "./locales/en-US.ts";
import { roRO } from "./locales/ro-RO.ts";
import { Provider } from "./provider.tsx";

function Tag() {
  return <output>{useLocale().tag}</output>;
}

const withDocumentLang = (lang: string) => () => {
  const previous = document.documentElement.lang;
  document.documentElement.lang = lang;
  return () => {
    document.documentElement.lang = previous;
  };
};

const meta = preview.meta({
  title: "Components/Utilities/Provider",
  component: Provider,
  args: { children: <Tag /> },
});

export const Default = meta.story({});

Default.test(
  "without a locale or a document language, components use en-US",
  { beforeEach: withDocumentLang("") },
  async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("en-US");
  },
);

Default.test(
  "without a locale, components format in the document language",
  { beforeEach: withDocumentLang("fr-FR") },
  async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("fr-FR");
  },
);

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
