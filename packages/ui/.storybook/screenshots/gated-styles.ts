interface Rule {
  selector: string;
  style: CSSStyleDeclaration;
  gated: boolean;
}

const declaration = /([\w\-]+)\s*:\s*((?:[^;"']|"[^"]*"|'[^']*')*)/gv;
const reference = /var\(\s*(--[\w\-]+)/gv;
// The originating element stands in for its pseudo-elements, which selectors can't match.
const pseudoElement = /::?(?:before|after|first-line|first-letter)\b|::[\w\-]+(?:\([^\)]*\))?/gv;

const declarations = ({ style }: Rule) =>
  [...style.cssText.matchAll(declaration)].map(([, name = "", value = ""]) => ({
    custom: name.startsWith("--"),
    name,
    references: [...value.matchAll(reference)].map(([, variable = ""]) => variable),
  }));

/** The story's elements, its portals included, without Storybook's own. */
function renderedElements() {
  const roots = [...document.body.children].filter(
    (child) => !child.matches('[class*="sb-"], #storybook-docs, script'),
  );

  return [
    document.documentElement,
    document.body,
    ...roots.flatMap((root) => [root, ...root.querySelectorAll("*")]),
  ];
}

function collect(
  list: CSSRuleList,
  parent: string,
  gated: boolean,
  gates: string[],
  rules: Rule[],
) {
  for (const rule of list) {
    const condition =
      rule instanceof CSSConditionRule
        ? rule.conditionText
        : rule instanceof CSSImportRule
          ? rule.media.mediaText
          : "";
    const inGate = gated || gates.some((gate) => condition.includes(gate));

    if (rule instanceof CSSStyleRule) {
      const selector =
        parent === ""
          ? rule.selectorText
          : rule.selectorText.includes("&")
            ? rule.selectorText.replaceAll("&", `:is(${parent})`)
            : `:is(${parent}) :is(${rule.selectorText})`;

      rules.push({
        selector: selector.replaceAll(pseudoElement, ""),
        style: rule.style,
        gated: inGate,
      });
      collect(rule.cssRules, selector, inGate, gates, rules);
    } else if (rule instanceof CSSImportRule) {
      if (rule.styleSheet) collect(rule.styleSheet.cssRules, parent, inGate, gates, rules);
    } else if (rule instanceof CSSGroupingRule) {
      collect(rule.cssRules, parent, inGate, gates, rules);
    }
  }
}

/**
 * Whether a rule under a condition containing one of `gates` (a media feature, a style query)
 * styles what the story rendered, itself or through a custom property a styled element reads.
 * Without one, the variant draws the same pixels as the light screenshot.
 */
export function gatedStyles(gates: string[]) {
  const elements = renderedElements();
  const rules: Rule[] = [];

  for (const sheet of [...document.styleSheets, ...document.adoptedStyleSheets]) {
    collect(sheet.cssRules, "", false, gates, rules);
  }

  const live = [
    ...rules.filter(({ selector }) => {
      try {
        return elements.some((element) => element.matches(selector));
      } catch {
        // A selector this check can't rewrite might match: keep the screenshot.
        return true;
      }
    }),
    ...elements.flatMap((element) =>
      element instanceof HTMLElement || element instanceof SVGElement
        ? [{ selector: "", style: element.style, gated: false }]
        : [],
    ),
  ].map((rule) => ({ ...rule, declarations: declarations(rule) }));
  const flipped = new Set<string>();

  for (const rule of live.filter(({ gated }) => gated)) {
    for (const { custom, name } of rule.declarations) {
      if (!custom) return true;

      flipped.add(name);
    }
  }

  for (let grew = true; grew;) {
    grew = false;

    for (const { custom, name, references } of live.flatMap((rule) => rule.declarations)) {
      if (custom && !flipped.has(name) && references.some((variable) => flipped.has(variable))) {
        flipped.add(name);
        grew = true;
      }
    }
  }

  return live.some((rule) =>
    rule.declarations.some(
      ({ custom, references }) => !custom && references.some((variable) => flipped.has(variable)),
    ),
  );
}
