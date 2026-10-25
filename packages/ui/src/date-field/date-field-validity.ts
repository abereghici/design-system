import { useRef } from "react";

import type { Temporal } from "../date/date.ts";
import { setValidity, useField, useFormReset } from "../field/field-control.ts";
import type { Validate } from "../field/field-control.ts";

import type { Segments } from "./segments.ts";

export interface Validity {
  readonly invalid: boolean;
  readonly message: string;
}

interface Options {
  readonly validate?: Validate | undefined;
  readonly isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
}

interface Wiring {
  readonly incomplete: string;
  readonly unavailable: string;
  readonly onValidity: (validity: Validity) => void;
  readonly reset: () => void;
}

const hiddenInput = (id: string | undefined) => {
  const node = id === undefined ? null : document.querySelector(`#${CSS.escape(id)}`);
  return node instanceof HTMLInputElement ? node : null;
};

/** Writes the value and custom validity to the hidden date input and reports its validity. */
export function useValidity(
  { validate, isDateUnavailable }: Options,
  { incomplete, unavailable, onValidity, reset }: Wiring,
) {
  const { field } = useField();
  const id = field?.controlId;
  const server = field?.serverError;
  const touched = useRef(false);
  const apply = (segments: Segments, date: Temporal.PlainDate | null) => {
    const node = hiddenInput(id);
    if (node === null) return;
    node.value = date?.toString() ?? "";
    const partial = date === null && Object.values(segments).some((part) => part !== undefined);
    const rejected = date !== null && isDateUnavailable?.(date) === true;
    setValidity(node, partial ? incomplete : rejected ? unavailable : undefined, server, validate);
  };
  const report = (commit = false) => {
    const node = hiddenInput(id);
    if (commit) touched.current = true;
    if (node === null || !touched.current) return;
    onValidity({ invalid: !node.validity.valid, message: node.validationMessage });
  };
  useFormReset(
    () => hiddenInput(id),
    () => {
      reset();
      touched.current = false;
      onValidity({ invalid: false, message: "" });
    },
  );
  const submit = () => {
    hiddenInput(id)?.form?.requestSubmit();
  };
  return { apply, report, submit, clearServerError: field?.clearServerError };
}
