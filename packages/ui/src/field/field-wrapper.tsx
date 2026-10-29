import type { CSSProperties, ReactNode } from "react";

import { Description } from "./field-description.tsx";
import { Error } from "./field-error.tsx";
import type { ErrorProps } from "./field-error.tsx";
import { Label } from "./field-label.tsx";
import { Root } from "./field-root.tsx";
import type { RootProps } from "./field-root.tsx";

export type Naming =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

export interface WrapperProps {
  /**
   * Helper text under the field, such as a format hint; the error message takes its place while
   * invalid.
   */
  description?: ReactNode;
  /**
   * What to fix, shown once the user has interacted and the value is invalid. Without it the
   * browser's own message is shown.
   */
  errorMessage?: ErrorProps["children"];
  /** Marks the value invalid from outside, such as a server or validation library result. */
  invalid?: boolean;
  /** Your own rule: return a message to mark the value invalid, or nothing when it is valid. */
  validate?: RootProps["validate"];
}

export interface SizedWrapperProps extends WrapperProps {
  /** `lg` for prominent or spacious forms. Touch screens get larger targets on their own. */
  size?: "md" | "lg";
}

interface WrappedProps extends SizedWrapperProps {
  label?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
}

/** Splits a field's props into its Wrapper's and its control's. */
export function splitWrapperProps<Props extends WrappedProps>({
  label,
  description,
  errorMessage,
  invalid,
  validate,
  size,
  className,
  style,
  ...control
}: Props) {
  const { name, disabled } = control;

  return [
    { label, description, errorMessage, invalid, validate, size, className, style, name, disabled },
    control,
  ] as const;
}

type WrapperOwnProps = { [Key in keyof WrappedProps]?: WrappedProps[Key] | undefined } & {
  children: ReactNode;
  id?: string | undefined;
  labelId?: string | undefined;
  /** Content after the error, such as a popover or a status region. */
  after?: ReactNode;
};

/** A Field around one control: its label above, its description and error below. */
export function Wrapper({
  label,
  labelId,
  description,
  errorMessage,
  size = "md",
  children,
  after,
  ...root
}: WrapperOwnProps) {
  return (
    <Root {...root} data-size={size}>
      {label !== undefined && <Label id={labelId}>{label}</Label>}
      {children}
      {description !== undefined && <Description>{description}</Description>}
      <Error>{errorMessage}</Error>
      {after}
    </Root>
  );
}
