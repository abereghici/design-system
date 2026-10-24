import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import { enUS } from "../locales/en-US.ts";
import { roRO } from "../locales/ro-RO.ts";
import { useLocale, type Locale } from "./locale.tsx";
import { Provider } from "./provider.tsx";

function Tag() {
  return <output>{useLocale().tag}</output>;
}

const meta = preview.meta({
  title: "Components/Provider",
  component: Provider,
  args: { children: <Tag /> },
});

const withDocumentLang = (lang: string) => () => {
  const previous = document.documentElement.lang;
  document.documentElement.lang = lang;
  return () => {
    document.documentElement.lang = previous;
  };
};

export const Default = meta.story({ beforeEach: withDocumentLang("") });

Default.test(
  "without a locale or a document language, components use en-US",
  async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("en-US");
  },
);

export const DocumentLanguage = meta.story({ beforeEach: withDocumentLang("fr-FR") });

DocumentLanguage.test(
  "without a locale, components format in the document language",
  async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("fr-FR");
  },
);

export const Romanian = meta.story({ args: { locale: roRO } });

Romanian.test("passes its locale to client components", async ({ canvas }) => {
  await expect(canvas.getByRole("status")).toHaveTextContent("ro-RO");
});

const custom: Locale = { ...enUS, tag: "en-GB", labels: { ...enUS.labels } };

export const Customised = meta.story({ args: { locale: custom } });

Customised.test("takes a locale spread from a shipped one", async ({ canvas }) => {
  await expect(canvas.getByRole("status")).toHaveTextContent("en-GB");
});
