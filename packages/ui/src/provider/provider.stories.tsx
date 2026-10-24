import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import { enUS } from "./locales/en-US.ts";
import { roRO } from "./locales/ro-RO.ts";
import { useLocale } from "./locale.tsx";
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
  title: "Components/Provider",
  component: Provider,
  args: { children: <Tag /> },
  parameters: {
    docs: {
      description: {
        component:
          "The app root: mount it once in the root layout. It brings the layer order, the shared tokens, the fonts (preloading Figtree latin) and the base stylesheet, so apps import no CSS, and it passes the `locale` to client components.",
      },
    },
  },
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
  "takes a locale spread from a shipped one",
  { args: { locale: { ...enUS, tag: "en-GB", labels: { ...enUS.labels } } } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("en-GB");
  },
);
