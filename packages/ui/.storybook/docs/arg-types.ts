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
  children: "What it shows.",
  name: "The form field name its value submits under.",
  placeholder: "An example of what to type, not a label: it disappears once the user types.",
  type: "The native type, as on the HTML element.",
  autoComplete: "Tells the browser and password managers what to fill in.",
  accept: "The file types the picker offers, as on a file input: `image/*`, `.csv`.",
  href: "Where the link goes.",
  onClick: "Called when it is pressed, by pointer, keyboard or assistive technology.",
  onSubmit: "Called when the form submits; call `event.preventDefault()` to handle it yourself.",
  style: "Inline styles for the outer element.",
  tabIndex: "Makes it focusable (`0`), so keyboard users can reach and scroll it.",
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

/** Rows for the DateField props DatePicker takes through `Omit<>`, which react-docgen skips. */
export const dateFieldArgTypes = {
  incompleteMessage: {
    control: "text",
    description: "The error for a date typed only in part, such as “Enter a complete date”.",
  },
} satisfies Record<string, InputType>;
