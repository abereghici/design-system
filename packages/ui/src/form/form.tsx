"use client";

import { createContext } from "react";
import type { ComponentProps } from "react";

type Errors = Readonly<Record<string, string | undefined>>;

export const FormErrorsContext = createContext<Errors | undefined>(undefined);

export interface FormProps extends ComponentProps<"form"> {
  /**
   * Errors returned after submission (a server, a form action), keyed by field `name`. Each Field
   * shows its message at once and clears it when the user changes the value.
   */
  errors?: Errors;
}

/**
 * A native form that shows constraint-validation errors inline in each Field instead of the
 * browser's bubbles, and focuses the first invalid control after a blocked submit.
 */
export function Form({ errors, onInvalidCapture, ...props }: FormProps) {
  return (
    <FormErrorsContext value={errors}>
      <form
        {...props}
        onInvalidCapture={(event) => {
          onInvalidCapture?.(event);
          event.preventDefault();
          const first = Array.from(event.currentTarget.elements).find(
            (element) => !(element instanceof HTMLFieldSetElement) && element.matches(":invalid"),
          );
          if (event.target === first && first instanceof HTMLElement) first.focus();
        }}
      />
    </FormErrorsContext>
  );
}
