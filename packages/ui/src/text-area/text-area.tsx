"use client";

import type { ComponentProps } from "react";

import { Frame, splitFrame } from "../field/field-frame.tsx";
import type { FrameProps, Naming } from "../field/field-frame.tsx";
import * as Field from "../field/field.tsx";

import fieldStyles from "../field/field.module.css";
import styles from "./text-area.module.css";

declare module "react" {
  interface CSSProperties {
    "--min-rows"?: number;
    "--max-rows"?: number;
  }
}

export type TextAreaChangeEventDetails = Field.ChangeEventDetails<HTMLTextAreaElement>;

type ControlProps = Omit<ComponentProps<"textarea">, "rows" | "cols"> & {
  /** The height, in lines, it starts at. */
  minRows?: number;
  /**
   * The height, in lines, it grows to before the text scrolls. Equal to `minRows` for a fixed
   * height.
   */
  maxRows?: number;
  /** Called as the user types, with the new text. */
  onValueChange?: (value: string, details: TextAreaChangeEventDetails) => void;
  /**
   * Stops editing but keeps the text focusable and selectable, so it can still be read and copied.
   */
  disabled?: boolean;
};

export type TextAreaProps = Naming & FrameProps & ControlProps;

function Control({ minRows = 3, maxRows = 12, readOnly, ...props }: ControlProps) {
  const bindings = Field.useFieldControl<HTMLTextAreaElement, typeof props>(props);

  return (
    <textarea
      dir="auto"
      {...bindings}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={`${fieldStyles["control"]} ${styles["textarea"]}`}
      style={{ "--min-rows": minRows, "--max-rows": maxRows }}
    />
  );
}

/**
 * Text that may run over several lines, such as a comment. It grows with its content, then scrolls.
 * Use TextField for a single line.
 */
export function TextArea(props: TextAreaProps) {
  const [frame, control] = splitFrame(props);

  return (
    <Frame {...frame}>
      <Control {...control} />
    </Frame>
  );
}
