import type { Meta } from "@storybook/react-vite";
import type { ArgTypesEnhancer, InputType } from "storybook/internal/types";

const plumbing = /^(?:on[A-Z]\w*|default[A-Z]\w*|asChild|ref|className|style|name|form|htmlFor)$/v;

const controls = new Map<string, "boolean" | "number" | "text">([
  ["boolean", "boolean"],
  ["number", "number"],
  ["string", "text"],
]);

const names: Record<string, string> = {
  label: "The visible name of the control. Every field needs one, or an `aria-label`.",
  "aria-label": "The name screen readers announce, for a control without visible text.",
};

/**
 * Keeps a control only where a reader sees the change: variants, sizes, booleans and text. Props
 * that hold objects, elements, functions or wiring keep their row and TSDoc, without a control.
 * Naming props react-docgen can't read through a union type get their description here.
 */
export const meaningfulControls: ArgTypesEnhancer = Object.assign(
  ({ argTypes, initialArgs }: Parameters<ArgTypesEnhancer>[0]) => {
    const enhanced = { ...argTypes };
    for (const [name, argType] of Object.entries(argTypes)) {
      if (argType.control !== undefined) continue;
      const { type } = argType;
      const members =
        type?.name === "union"
          ? type.value.filter(
              (member) => !(member.name === "other" && member.value === "undefined"),
            )
          : [type];
      const [only] = members.length === 1 ? members : [];
      const control = controls.get(only?.name ?? "");
      if (only?.name === "enum" && !plumbing.test(name)) {
        if (only.value.length <= 5)
          enhanced[name] = { ...argType, control: { type: "inline-radio" } };
      } else if (plumbing.test(name) || control === undefined) {
        enhanced[name] = { ...argType, control: false };
      } else if (type?.name === "union") {
        enhanced[name] = { ...argType, control: { type: control } };
      }
    }
    for (const [name, value] of Object.entries(initialArgs)) {
      const description = names[name];
      if (description !== undefined && (enhanced[name]?.description ?? "") === "") {
        enhanced[name] = { name, ...enhanced[name], description };
      }
      if ((typeof value === "object" && value !== null) || plumbing.test(name)) {
        enhanced[name] = { name, ...enhanced[name], control: false };
      }
    }
    return enhanced;
  },
  { secondPass: true },
);

/** A compound component's parts besides Root, for `subcomponents`: one props tab per part. */
export const partsOf = (namespace: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(namespace).filter(
      (entry): entry is [string, NonNullable<Meta["subcomponents"]>[string]] =>
        entry[0] !== "Root" && /^[A-Z]/v.test(entry[0]) && typeof entry[1] === "function",
    ),
  );

/**
 * Rows for props react-docgen can't read: it skips props a component takes through `Pick<>` of
 * another component's props, so NumberField and PasswordField declare them here.
 */
export const textFieldArgTypes = {
  description: {
    control: "text",
    description:
      "Helper text under the field, such as a format hint; the error message takes its place while invalid.",
  },
  errorMessage: {
    control: "text",
    description:
      "What to fix, shown once the user has interacted and the value is invalid. Without it the browser's own message is shown.",
  },
  invalid: {
    control: "boolean",
    description:
      "Marks the value invalid from outside, such as a server or validation library result.",
  },
  validate: {
    control: false,
    description:
      "Your own rule: return a message to mark the value invalid, or nothing when it is valid.",
  },
  size: {
    control: "inline-radio",
    options: ["md", "lg"],
    description:
      "`lg` for prominent or spacious forms. Touch screens get larger targets on their own.",
  },
  disabled: {
    control: "boolean",
    description:
      "Blocks interaction but keeps it focusable and announced, so everyone can still find it; say nearby why it is unavailable.",
  },
} satisfies Record<string, InputType>;
