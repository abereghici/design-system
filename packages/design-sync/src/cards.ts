import type { CardInfo } from "./bundle.ts";

/** Row height for the marker: "40–4000, else 120; grows to fit" (format.md). A first guess only. */
const heightOf = (card: CardInfo) => Math.min(4000, Math.max(40, 48 + card.stories.length * 88));

const attribute = (value: string) =>
  value.replaceAll(/[\u0022\u0026\u003C\u003E]/gv, (char) => `&#${char.codePointAt(0)};`);

/**
 * A card's `components/<name>/preview.html`. Line 1 is the marker
 * (`<!-- @dsCard group="…" height=N -->`, plus `page` for a showcase that is not a bundle export).
 * The frame "has preloaded tokens.css, bundle.css, the libraries, bundle.js
 * (`window.<namespace>`)", so the document is "a root element plus one `<script>`" (format.md).
 */
export function previewHtml(card: CardInfo, namespace: string): string {
  const marker = [
    "@dsCard",
    ...(card.group === "" ? [] : [`group="${attribute(card.group)}"`]),
    `height=${String(heightOf(card))}`,
    ...(card.page ? ["page"] : []),
  ].join(" ");
  const ns = `window[${JSON.stringify(namespace)}]`;
  const preview = `${ns}.renderCard, { card: ${ns}.cards[${JSON.stringify(card.name)}] }`;
  return `<!-- ${marker} -->
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${attribute(card.name)}</title></head>
<body>
<div id="root"></div>
<script>
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(${preview}));
</script>
</body>
</html>
`;
}

/**
 * A component's `components/<name>/README.md`: its JSDoc (the first sentence is the summary the
 * page shows), how to import it, and what the preview shows. Props come from `index.d.ts`.
 */
export function componentReadme({
  card,
  doc,
  importPath,
}: Readonly<{ card: CardInfo; doc: string; importPath: string }>): string {
  return `# ${card.name}

${doc}

\`\`\`tsx
import { ${card.name} } from "${importPath}";
\`\`\`

Props: \`${card.name}Props\` in \`components/index.d.ts\`. The preview renders the component's Storybook stories: ${card.stories.join(", ")}.
`;
}
