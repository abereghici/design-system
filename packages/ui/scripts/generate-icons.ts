import { readdir, readFile } from "node:fs/promises";

import { format } from "oxfmt";
import { optimize, type XastElement, type XastRoot } from "svgo";

import formatConfig from "../../../oxfmt.config.ts";

const root = new URL("../", import.meta.url);
const iconSources = new URL("assets/icons/", root);

// A source that strokes differently from Icon would be redrawn wrong, so generation stops.
const iconRoot = {
  fill: "none",
  stroke: "currentColor",
  "stroke-linecap": "square",
  "stroke-width": "1.75",
  viewBox: "0 0 24 24",
};
const mirrored = new Set(["arrow-right", "arrow-up-right", "chevron-right", "log-out"]);
// Icon children may only fill a dot (`fill="currentColor" stroke="none"`) on top of the stroke.
const iconPathAttributes = new Set(["d", "fill", "stroke"]);

function optimise(svg: string, file: string): XastElement {
  const { data } = optimize(svg, {
    multipass: true,
    plugins: ["preset-default", "convertStyleToAttrs", "removeDimensions", "removeXMLNS"],
  });
  let element: XastElement | undefined;
  optimize(data, {
    plugins: [
      {
        name: "collect",
        fn: (tree: XastRoot) => {
          element = tree.children.find((node) => node.type === "element");
        },
      },
    ],
  });
  if (element?.name !== "svg") throw new Error(`${file}: no <svg> root`);
  return element;
}

function paths(svg: XastElement, file: string) {
  return svg.children.map((node) => {
    if (node.type !== "element" || node.name !== "path" || node.children.length > 0) {
      throw new Error(`${file}: only <path> children are supported`);
    }
    return node.attributes;
  });
}

function attributeText(attributes: object) {
  return JSON.stringify(Object.entries(attributes).toSorted(([a], [b]) => a.localeCompare(b)));
}

function expectAttributes(actual: Record<string, string>, expected: object, file: string) {
  if (attributeText(actual) !== attributeText(expected)) {
    throw new Error(`${file}: expected ${attributeText(expected)}, got ${attributeText(actual)}`);
  }
}

function componentName(name: string) {
  return `${name.replaceAll(/(?:^|-)([a-z0-9])/gv, (_, char: string) => char.toUpperCase())}Icon`;
}

export async function iconSourceNames() {
  return (await readdir(iconSources))
    .filter((file) => file.endsWith(".svg"))
    .map((file) => file.slice(0, -".svg".length))
    .toSorted();
}

async function iconModule(name: string) {
  const file = `assets/icons/${name}.svg`;
  const svg = optimise(await readFile(new URL(`${name}.svg`, iconSources), "utf8"), file);
  expectAttributes(svg.attributes, iconRoot, file);
  const children = paths(svg, file).map((attributes) => {
    const unknown = Object.keys(attributes).filter((key) => !iconPathAttributes.has(key));
    if (unknown.length > 0) throw new Error(`${file}: unsupported attributes ${unknown.join()}`);
    const jsx = Object.entries(attributes).map(([key, value]) => `${key}="${value}"`);
    return `<path ${jsx.join(" ")} />`;
  });
  const component = componentName(name);
  return `import { Icon, type IconProps } from "../icon.tsx";

export function ${component}(props: IconProps) {
  return <Icon {...props}${mirrored.has(name) ? " data-mirror" : ""}>${children.join("")}</Icon>;
}
`;
}

export async function generateGlyphs() {
  const modules = new Map<string, string>();
  for (const name of await iconSourceNames()) {
    modules.set(`src/icon/icons/${name}.tsx`, await iconModule(name));
  }
  for (const [path, text] of modules) {
    const result = await format(path, text, formatConfig);
    if (result.errors.length > 0) throw new Error(`${path}: ${JSON.stringify(result.errors)}`);
    modules.set(path, result.code);
  }
  return modules;
}
