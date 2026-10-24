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
 * A native `<form>` that keeps the browser's constraint validation but shows each error inline in
 * its Field instead of the browser's bubbles, focuses the first invalid control after a blocked
 * submit and routes server errors to their fields. Submission is the platform's: `action`,
 * `method`, `FormData` and React actions work unchanged.
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
