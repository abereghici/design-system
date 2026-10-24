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

const specs = import.meta.glob<string>("../specs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

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
