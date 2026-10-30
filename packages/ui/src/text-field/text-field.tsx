import type { ComponentProps, ReactNode } from "react";

import { Wrapper, splitWrapperProps } from "../field/field-wrapper.tsx";
import type { Naming, SizedWrapperProps } from "../field/field-wrapper.tsx";
import * as Field from "../field/field.tsx";

import { InputGroup } from "./text-field-input-group.tsx";
import { Input } from "./text-field-input.tsx";

export type TextFieldChangeEventDetails = Field.ChangeEventDetails;

export type TextFieldProps = Naming &
  SizedWrapperProps &
  Omit<ComponentProps<"input">, "size"> & {
    /** Content before the input, such as a decorative search icon. */
    startElement?: ReactNode;
    /** Content after the input, such as a Clear IconButton or a shortcut hint. */
    endElement?: ReactNode;
    /** Called as the user types, with the new text. */
    onValueChange?: (value: string, details: TextFieldChangeEventDetails) => void;
    /**
     * Stops editing but keeps the text focusable and selectable, so it can still be read and
     * copied.
     */
    disabled?: boolean;
  };

/**
 * One line of text, with a visible label, an optional description and an error that appears only
 * after the user has interacted. Use TextArea for more than one line, PasswordField for secrets,
 * NumberField for numbers and Select to choose from a short known list.
 */
export function TextField({ startElement, endElement, ...props }: TextFieldProps) {
  const [wrapper, control] = splitWrapperProps(props);

  return (
    <Wrapper {...wrapper}>
      <InputGroup start={startElement} end={endElement}>
        <Input {...control} />
      </InputGroup>
    </Wrapper>
  );
}
