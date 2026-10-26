import type { StoryContext } from "@storybook/react-vite";

const kebab = (name: string) => name.replaceAll(/(?<!^)[A-Z]/gv, "-$&").toLowerCase();

function importOf(name: string) {
  const icon = /^(?<glyph>\w+)Icon$/v.exec(name)?.groups?.["glyph"];
  const path = icon === undefined ? kebab(name) : `icons/${kebab(icon)}`;
  return `import { ${name} } from "@platform/ui/${path}";`;
}

/**
 * Turns the generated snippet into code a consumer can paste: the namespace on compound parts
 * (`<Dialog.Trigger>`), no keyed fragments from `React.Children.toArray`, Temporal dates and refs as
 * code, and the public imports.
 */
export function transform(code: string, { title, subcomponents }: StoryContext) {
  // Storybook runs the transform twice on a dynamic snippet: when the story emits it, and again in
  // the Source block. Dropping the header added the first time keeps the output stable.
  const jsx = code.replace(/^(?:import .*\n)+\n(?:const ref = .*\n\n)?/v, "");
  const parts = ["Root", ...Object.keys(subcomponents ?? {})].join("|");
  const namespace = subcomponents === undefined ? "" : `${title.split("/").at(-1)}.`;
  let depth = 0;
  const body = jsx
    .replaceAll(new RegExp(String.raw`(?<=</?)(?:${parts})\b`, "gv"), `${namespace}$&`)
    .replaceAll(/=\{(\d{4}-\d{2}-\d{2})\}/gv, '={Temporal.PlainDate.from("$1")}')
    .replaceAll(/=\{\{\s+current: '\[Circular\]'\s+\}\}/gv, "={ref}")
    .split("\n")
    .flatMap((line) => {
      if (/^\s*<React\.Fragment key=".*">$/v.test(line)) depth += 1;
      else if (depth > 0 && /^\s*<\/React\.Fragment>$/v.test(line)) depth -= 1;
      else return [line.slice(depth * 2)];
      return [];
    })
    .join("\n");
  const names = new Set(body.matchAll(/<(?<name>[A-Z]\w*)/gv).map((match) => match[1] ?? ""));
  const imports = [...names].map((name) => importOf(name)).toSorted();
  const ref = body.includes("={ref}");
  if (body.includes("Temporal.")) imports.unshift('import { Temporal } from "temporal-polyfill";');
  if (ref) imports.unshift('import { useRef } from "react";');
  return `${imports.join("\n")}\n\n${ref ? "const ref = useRef(null);\n\n" : ""}${body}`;
}
