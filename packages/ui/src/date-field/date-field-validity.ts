import { use, useEffect, useEffectEvent, useRef } from "react";

import type { Temporal } from "../date/date.ts";
import { FormErrorsContext } from "../form/form.tsx";

import type { Segments } from "./segments.ts";

export interface Validity {
  readonly invalid: boolean;
  readonly message: string;
}

interface Options {
  readonly name: string | undefined;
  readonly validate?:
    | ((value: string, formData: FormData) => string | null | undefined)
    | undefined;
  readonly isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
}

interface Wiring {
  readonly id: string | undefined;
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
  { validate, name, isDateUnavailable }: Options,
  { id, incomplete, unavailable, onValidity, reset }: Wiring,
) {
  const server = use(FormErrorsContext)?.[name ?? ""];
  const touched = useRef(false);
  const apply = (segments: Segments, date: Temporal.PlainDate | null) => {
    const node = hiddenInput(id);
    if (node === null) return;
    node.value = date?.toString() ?? "";
    const partial = date === null && Object.values(segments).some((part) => part !== undefined);
    const rule = validate?.(node.value, new FormData(node.form ?? undefined));
    const rejected = date !== null && isDateUnavailable?.(date) === true;
    node.setCustomValidity(partial ? incomplete : rejected ? unavailable : (rule ?? server ?? ""));
  };
  const report = (commit = false) => {
    const node = hiddenInput(id);
    if (commit) touched.current = true;
    if (node === null || !touched.current) return;
    onValidity({ invalid: !node.validity.valid, message: node.validationMessage });
  };
  const onReset = useEffectEvent(() => {
    reset();
    touched.current = false;
    onValidity({ invalid: false, message: "" });
  });
  useEffect(() => {
    const owner = hiddenInput(id)?.form;
    owner?.addEventListener("reset", onReset);
    return () => {
      owner?.removeEventListener("reset", onReset);
    };
  }, [id]);
  const submit = () => {
    hiddenInput(id)?.form?.requestSubmit();
  };
  return { apply, report, submit };
}
