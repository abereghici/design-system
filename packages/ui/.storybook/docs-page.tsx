import type { ComponentProps } from "react";
import {
  Controls,
  Description,
  Markdown,
  Primary,
  Stories,
  Subtitle,
  Title,
  useOf,
} from "@storybook/addon-docs/blocks";

import { Heading } from "@platform/ui/heading";

const specs = import.meta.glob<string>("../specs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const heading = (as: "h1" | "h2" | "h3") =>
  function DocsHeading({ className, ...props }: ComponentProps<"h1">) {
    return <Heading {...props} as={as} className={`sb-unstyled ${className ?? ""}`} />;
  };

/** MDX headings in the serif heading type; `sb-unstyled` keeps the Storybook prose CSS off them. */
export const mdx = { components: { h1: heading("h1"), h2: heading("h2"), h3: heading("h3") } };

const sections = new Set(["Anatomy", "States", "Keyboard", "Accessibility"]);

function Spec() {
  const { preparedMeta } = useOf("meta", ["meta"]);
  const name = preparedMeta.title.split("/").at(-1) ?? "";
  const spec = specs[`../specs/${name.replaceAll(/(?<!^)[A-Z]/gv, "-$&").toLowerCase()}.md`];
  if (spec === undefined) return null;
  return (
    <Markdown>
      {spec
        .split(/^(?=## )/mv)
        .filter((section) => sections.has(section.slice(3, section.indexOf("\n"))))
        .join("\n")}
    </Markdown>
  );
}

export function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <Primary />
      <Controls />
      <Spec />
      <Stories includePrimary={false} />
    </>
  );
}
