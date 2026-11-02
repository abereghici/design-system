interface Declaration {
  name: string;
  references: string[];
}

interface Rule {
  /** Empty for an element's inline style, which always applies. */
  selector: string;
  gated: boolean;
  declarations: Declaration[];
}

// cssText, not the declaration's items: a longhand set through a shorthand with var() reads "".
const declaration = /([\w\-]+)\s*:\s*((?:[^;"']|"[^"]*"|'[^']*')*)/gv;
const reference = /var\(\s*(--[\w\-]+)/gv;
// The originating element stands in for its pseudo-elements, which selectors can't match.
const pseudoElement = /::?(?:before|after|first-line|first-letter)\b|::[\w\-]+(?:\([^\)]*\))?/gv;

const custom = (name: string) => name.startsWith("--");

const parse = (style: CSSStyleDeclaration) =>
  [...style.cssText.matchAll(declaration)].map(([, name = "", value = ""]) => ({
    name,
    references: [...value.matchAll(reference)].map(([, variable = ""]) => variable),
  }));

const nest = (parent: string, selector: string) =>
  parent === ""
    ? selector
    : selector.includes("&")
      ? selector.replaceAll("&", `:is(${parent})`)
      : `:is(${parent}) :is(${selector})`;

function rulesOf(
  list: CSSRuleList,
  parent: string,
  gated: boolean,
  gates: readonly string[],
): Rule[] {
  const opens = (condition: string) => gated || gates.some((gate) => condition.includes(gate));

  return [...list].flatMap((rule): Rule[] => {
    if (rule instanceof CSSImportRule) {
      return rule.styleSheet === null
        ? []
        : rulesOf(rule.styleSheet.cssRules, parent, opens(rule.media.mediaText), gates);
    }

    const inGate = rule instanceof CSSConditionRule ? opens(rule.conditionText) : gated;

    if (rule instanceof CSSStyleRule) {
      const selector = nest(parent, rule.selectorText);

      return [
        {
          selector: selector.replaceAll(pseudoElement, ""),
          gated: inGate,
          declarations: parse(rule.style),
        },
        ...rulesOf(rule.cssRules, selector, inGate, gates),
      ];
    }

    return rule instanceof CSSGroupingRule ? rulesOf(rule.cssRules, parent, inGate, gates) : [];
  });
}

// A story file's stories share its sheets, and a page runs one variant, so its gates never change.
const parsed = new WeakMap<CSSStyleSheet, Rule[]>();

function sheetRules(sheet: CSSStyleSheet, gates: readonly string[]) {
  const rules = parsed.get(sheet) ?? rulesOf(sheet.cssRules, "", false, gates);

  parsed.set(sheet, rules);

  return rules;
}

/** The story's own elements under `<body>`, its portals included, without Storybook's. */
const renderedRoots = () =>
  [...document.body.children].filter(
    (child) => !child.matches('[class*="sb-"], #storybook-docs, script'),
  );

/** Whether a rule styles anything in `roots`, the document and its body included; remembered per rule. */
function rendersOn(roots: readonly Element[]) {
  const matched = new Map<Rule, boolean>();
  const matches = (selector: string) => {
    try {
      return (
        document.documentElement.matches(selector) ||
        document.body.matches(selector) ||
        roots.some((root) => root.matches(selector) || root.querySelector(selector) !== null)
      );
    } catch {
      // A selector this check can't rewrite might match: keep the screenshot.
      return true;
    }
  };

  return (rule: Rule) => {
    const hit = rule.selector === "" || (matched.get(rule) ?? matches(rule.selector));

    matched.set(rule, hit);

    return hit;
  };
}

const inlineStyles = (roots: readonly Element[]) =>
  roots
    .flatMap((root) => [root, ...root.querySelectorAll("[style]")])
    .flatMap((element) =>
      element instanceof HTMLElement || element instanceof SVGElement
        ? [{ selector: "", gated: false, declarations: parse(element.style) }]
        : [],
    );

/**
 * Whether a rule under a condition containing one of `gates` (a media feature, a style query)
 * styles what the story rendered, itself or through a custom property a styled element reads.
 * Without one, the variant draws the same pixels as the light screenshot.
 */
export function gatedStyles(gates: readonly string[]) {
  const roots = renderedRoots();
  const styles = rendersOn(roots);
  const rules = [...document.styleSheets, ...document.adoptedStyleSheets].flatMap((sheet) =>
    sheetRules(sheet, gates),
  );
  const flipped = new Set<string>();

  for (const rule of rules.filter((candidate) => candidate.gated && styles(candidate))) {
    for (const { name } of rule.declarations) {
      if (!custom(name)) return true;

      flipped.add(name);
    }
  }

  // Only a rule that reads a flipped property is matched against the page.
  const readers = [...rules.filter(({ gated }) => !gated), ...inlineStyles(roots)];

  for (let grew = flipped.size > 0; grew;) {
    grew = false;

    for (const rule of readers) {
      const reads = rule.declarations.filter(({ references }) =>
        references.some((variable) => flipped.has(variable)),
      );

      if (reads.length === 0 || !styles(rule)) continue;

      for (const { name } of reads) {
        if (!custom(name)) return true;

        if (flipped.has(name)) continue;

        flipped.add(name);
        grew = true;
      }
    }
  }

  return false;
}
