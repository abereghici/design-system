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
 * A form that shows each error inside its Field instead of the browser's bubbles, moves focus to the
 * first invalid field after a blocked submit, and puts server errors on their fields. Submitting
 * works as with any form: `action`, `method`, `FormData` and React actions are unchanged.
 *
 * Tier 1: works before hydration.
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
