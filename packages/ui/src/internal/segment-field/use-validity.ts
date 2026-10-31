import { useRef } from "react";

import { useEvent } from "../../events/use-event.ts";
import { setValidity, useField } from "../../field/use-field.ts";
import type { Validate } from "../../field/use-field.ts";

import type { SegmentModel, Segments } from "./segments.ts";

export interface Validity {
  readonly invalid: boolean;
  readonly message: string;
}

interface Options<Value> {
  readonly validate?: Validate | undefined;
  readonly isUnavailable?: ((value: Value) => boolean) | undefined;
}

interface Wiring {
  readonly incomplete: string;
  readonly unavailable: string;
  readonly onValidity: (validity: Validity) => void;
  readonly reset: () => void;
}

function write(node: { value: string }, value: string) {
  node.value = value;
}

/** Writes the value and custom validity to the native input and reports its validity. */
export function useValidity<Part extends string, Value>(
  model: SegmentModel<Part, Value>,
  { validate, isUnavailable }: Options<Value>,
  { incomplete, unavailable, onValidity, reset }: Wiring,
) {
  const { field } = useField();
  const server = field?.serverError;
  const touched = useRef(false);
  const apply = (segments: Segments<Part>, value: Value | null) => {
    const node = field?.control ?? null;

    if (node === null) return;

    write(node, value === null ? "" : model.serialize(value));

    const partial = value === null && Object.values(segments).some((part) => part !== undefined);
    const rejected = value !== null && isUnavailable?.(value) === true;

    setValidity(node, partial ? incomplete : rejected ? unavailable : undefined, server, validate);
  };

  const report = (commit = false) => {
    const node = field?.control ?? null;

    if (commit) touched.current = true;

    if (node === null || !touched.current) return;

    onValidity({ invalid: !node.validity.valid, message: node.validationMessage });
  };

  useEvent(
    "reset",
    () => {
      reset();
      touched.current = false;
      onValidity({ invalid: false, message: "" });
    },
    field?.control?.form ?? null,
  );

  const submit = () => {
    field?.control?.form?.requestSubmit();
  };

  return { apply, report, submit, clearServerError: field?.clearServerError };
}
