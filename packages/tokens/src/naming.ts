import type { Tier } from "./tiers.ts";

// Departs from the source validator on purpose: spec #1's component renames, and stroke-width-2xl is allowed.

const PRIMITIVE =
  /^(palette-[a-z]+-(0|50|[1-9]00|950)(-a\d{2})?|palette-transparent|blur-\d+|saturate-\d+|opacity-\d+|dimension-\d+|stroke-width-\d+|scale-\d+|z-index-\d+|font-family-[a-z]+(-[a-z]+)*|font-size-\d+(-\d+)?|font-weight-[1-9]00|line-height-\d+|letter-spacing-(minus-)?\d+|font-variant-numeric-[a-z\-]+|text-transform-[a-z]+|duration-\d+|easing-[a-z]+(-[a-z]+)*)$/v;

const SEMANTIC = [
  /^color-(surface|background|text|icon|border|brand|material|shadow)(-[a-z]+)+$/v,
  /^color-backdrop$/v,
  /^elevation-(raised|overlay|modal|toast)$/v,
  /^elevation-ring$/v,
  /^elevation-highlight$/v,
  /^material-(blur|saturate)-(thin|regular|thick)$/v,
  /^opacity-(disabled|scrim|subtle|bold)$/v,
  /^type-(heading|display|body|label|data|code|overline|kbd)-(xs|sm|md|lg)(-(font-family|font-size|font-weight|line-height|letter-spacing|font-variant-numeric|text-transform))?$/v,
  /^space-(inline|inset|stack)-(2xs|xs|sm|md|lg|xl|2xl)$/v,
  /^space-section$/v,
  /^size-(icon|control)-(xs|sm|md|lg|xl)$/v,
  /^size-control-compact-(sm|md|lg)$/v,
  /^size-target-(min|recommended)$/v,
  /^size-container-(2xs|xs|sm|md|lg)$/v,
  /^size-(toggle|indicator)$/v,
  /^size-logo-min$/v,
  /^radius-(xs|sm|md|lg|xl|full)$/v,
  /^border-width-(default|thick)$/v,
  /^stroke-width-(sm|md|lg|xl|2xl)$/v,
  /^focus-ring-(width|offset)$/v,
  /^underline-(thickness|offset)$/v,
  /^z-index-(base|raised|sticky|dropdown|backdrop|modal|toast|tooltip)$/v,
  /^motion-(duration|delay|easing|scale|distance|blur)-[a-z]+(-[a-z]+)?$/v,
  /^layout-(column-width|gutter|label-column-width)$/v,
  /^breakpoint-(sm|md|lg)$/v,
];

const COLOR_WORDS = new Set([
  "default",
  "raised",
  "nested",
  "overlay",
  "neutral",
  "accent",
  "selected",
  "success",
  "warning",
  "danger",
  "highlight",
  "disabled",
  "subtlest",
  "subtle",
  "bold",
  "on",
  "hovered",
  "pressed",
  "focused",
  "material",
  "thin",
  "regular",
  "thick",
  "shadow",
  "ring",
  "ambient",
  "key",
  "deep",
  "inverse",
  "moss",
  "lichen",
  "sage",
  "peach",
  "ember",
]);

const COMPONENTS = [
  "status-dot",
  "code-block",
  "toggle-button-group",
  "toggle-button",
  "icon-button",
  "button",
  "field",
  "link",
  "tag-group",
  "tag",
  "separator",
  "icon",
  "logo",
  "kbd",
  "checkbox",
  "radio-group",
  "switch",
  "select",
  "combobox",
  "segmented-control",
  "tabs",
  "accordion",
  "disclosure",
  "dropdown-menu",
  "context-menu",
  "popover",
  "tooltip",
  "dialog",
  "sheet",
  "toast",
  "badge",
  "card",
  "command",
  "spinner",
  "skip-link",
  "empty-state",
  "avatar",
  "skeleton",
  "progress",
  "meter",
  "alert",
  "fieldset",
  "slider",
  "drop-zone",
  "breadcrumbs",
  "pagination",
  "toolbar",
  "navbar",
  "sidebar",
  "table",
  "date-field",
  "time-field",
  "date-range-picker",
  "range-calendar",
  "calendar",
  "description-list",
  "stepper",
  "splitter",
  "tree",
];

const PROPERTIES = [
  "background-color",
  "text-color",
  "icon-color",
  "border-color",
  "border-width",
  "border-radius",
  "underline-color",
  "underline-thickness",
  "underline-offset",
  "placeholder-color",
  "padding-inline",
  "padding-block",
  "padding",
  "font-variant-numeric",
  "stroke-width",
  "min-width",
  "max-width",
  "width",
  "max-height",
  "min-height",
  "height",
  "gap",
  "size",
  "font",
  "scale",
  "shadow",
  "blur",
  "saturate",
  "duration",
  "delay",
  "easing",
  "offset",
  "color",
];

const STATES = [
  "hovered",
  "pressed",
  "focused",
  "selected",
  "checked",
  "invalid",
  "disabled",
  "current",
  "complete",
];

const MODIFIERS = new Set([
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "success",
  "warning",
  "danger",
  "accent",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "min",
  "helper",
  "error",
  "icon",
  "label",
  "item",
  "indicator",
  "thumb",
  "track",
  "panel",
  "header",
  "footer",
  "list",
  "trigger",
  "option",
  "group",
  "separator",
  "shortcut",
  "body",
  "title",
  "description",
  "input",
  "enter",
  "exit",
  "action",
  "close",
  "dot",
  "picker",
  "backdrop",
  "stack",
  "pulse",
  "value",
  "legend",
  "range",
  "caption",
  "segment",
  "cell",
  "today",
  "row",
  "sort",
  "term",
  "details",
  "connector",
  "handle",
  "remove",
]);

const outsideDictionary = (words: readonly string[]) =>
  words.length > 0 ? `uses words outside the Dictionary: ${words.join(", ")}` : undefined;

export const componentOf = (name: string): string | undefined =>
  COMPONENTS.find((c) => name.startsWith(`${c}-`));

const checkComponentName = (name: string): string | undefined => {
  const component = componentOf(name);

  if (component === undefined) {
    return `names no component in the Dictionary (${COMPONENTS.join(", ")})`;
  }

  let rest = name.slice(component.length + 1);
  const state = STATES.find((s) => rest.endsWith(`-${s}`));

  if (state !== undefined) rest = rest.slice(0, -state.length - 1);

  const property = PROPERTIES.find((p) => rest === p || rest.endsWith(`-${p}`));

  if (property === undefined) {
    return "does not match the component grammar ({component}-{variant}-{element}-{property}-{state}): no known property";
  }

  const modifiers = rest === property ? [] : rest.slice(0, -property.length - 1).split("-");

  return outsideDictionary(modifiers.filter((m) => !MODIFIERS.has(m)));
};

const checkPrimitiveName = (name: string): string | undefined =>
  PRIMITIVE.test(name)
    ? undefined
    : "does not match the primitive grammar ({category}-{scale}, e.g. palette-moss-900)";

const checkSemanticName = (name: string): string | undefined => {
  if (!SEMANTIC.some((pattern) => pattern.test(name))) {
    return "does not match the semantic grammar (e.g. color-{property}-{role}-{emphasis}-{state})";
  }

  if (!name.startsWith("color-")) return undefined;

  const words = name.split("-").slice(2);

  return outsideDictionary(words.filter((word) => !COLOR_WORDS.has(word)));
};

const CHECKS: Record<Tier, (name: string) => string | undefined> = {
  primitive: checkPrimitiveName,
  semantic: checkSemanticName,
  component: checkComponentName,
};

export const checkName = (name: string, tier: Tier): string | undefined => CHECKS[tier](name);
