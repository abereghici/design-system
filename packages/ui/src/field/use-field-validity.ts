import { use, useEffect, useLayoutEffect, useRef, useState } from "react";

import { FormErrorsContext } from "../form/form.tsx";
import { useEvent } from "../internal/dom-event/use-event.ts";

import type { FormControl, Validate } from "./use-field.ts";

type Failure = { readonly message: string; readonly validity: ValidityState } | null;

// A control's `validity` is the same object for its whole life, so equal failures keep the state.
const sameFailure = (a: Failure, b: Failure) =>
  a === b || (a !== null && b !== null && a.message === b.message && a.validity === b.validity);

/** The Field's controls in the order they mount: the first takes the label and a server error. */
function useControls() {
  const [controls, setControls] = useState<readonly FormControl[]>([]);
  const [register] = useState(() => (node: FormControl | null) => {
    if (node !== null) setControls((current) => [...current, node]);

    return () => {
      setControls((current) => current.filter((each) => each !== node));
    };
  });

  return [controls, register] as const;
}

function useServerError(name: string | undefined, control: FormControl | null) {
  const errors = use(FormErrorsContext);
  const [cleared, setCleared] = useState<typeof errors>();
  const server = errors === cleared || name === undefined ? undefined : errors?.[name];

  useEffect(() => {
    if (server === undefined || control === null || errors === undefined) return;

    const first = [...(control.form?.elements ?? [])].find(
      (element) => errors[element.getAttribute("name") ?? ""] !== undefined,
    );

    if (first !== control || document.activeElement === control) return;

    control.focus();

    // As a click on its label would: a control that can't take focus itself is pressed instead.
    if (document.activeElement !== control) control.click();
  }, [errors, server, control]);

  return {
    server,
    clear: () => {
      setCleared(errors);
    },
  };
}

/**
 * The only writer of the controls' custom validity: each control's own check (a composite
 * control's report), then the server's error (on the first control), then the app's rule. The error
 * shown is the first one the user has committed: by the browser's user validity for a native
 * control, by `commit` for a composite one, whose native element the user never edits.
 */
function useCustomValidity(controls: readonly FormControl[], validate: Validate | undefined) {
  const [failure, setFailure] = useState<Failure>(null);
  const reports = useRef(new WeakMap<FormControl, string | undefined>());
  const committed = useRef(new WeakSet<FormControl>());

  return {
    failure,
    revalidate: (serverError: string | null | undefined) => {
      for (const each of controls) {
        const rule = validate?.(each.value, new FormData(each.form ?? undefined));
        const server = each === controls[0] ? serverError : null;

        each.setCustomValidity(reports.current.get(each) ?? server ?? rule ?? "");
      }

      const shown = controls.find(
        (each) =>
          each.matches(":user-invalid") || (committed.current.has(each) && !each.validity.valid),
      );
      const next = shown && { message: shown.validationMessage, validity: shown.validity };

      setFailure((current) => (sameFailure(current, next ?? null) ? current : (next ?? null)));
    },
    report: (control: FormControl, message: string | undefined) => {
      reports.current.set(control, message);
    },
    commit: (control: FormControl) => {
      committed.current.add(control);
    },
    reset: () => {
      committed.current = new WeakSet();
      setFailure(null);
    },
  };
}

/**
 * The Field's validity: its controls, the server's error and the error to show, kept in step with
 * the controls' edits, changes, invalid events and renders, and with the form's reset.
 */
export function useFieldValidity(name: string | undefined, validate: Validate | undefined) {
  const [controls, register] = useControls();
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const control = controls[0] ?? null;
  const { server, clear } = useServerError(name, control);
  const { failure, revalidate, ...custom } = useCustomValidity(controls, validate);
  const edit = () => {
    clear();
    revalidate(null);
  };

  // Only the Field's own controls: a nested Field's are its own.
  const on = (handle: () => void) => (event: Pick<Event, "target">) => {
    if (controls.some((each) => each === event.target)) handle();
  };

  const reread = on(() => {
    revalidate(server);
  });

  // A composite control's value, and a render's server error or rule, change without an event.
  useLayoutEffect(() => {
    revalidate(server);
  });

  // React's onChange on a text input is the input event; user validity turns on at the native
  // change: https://react.dev/reference/react-dom/components/input#props
  useEvent("change", reread, root);
  useEvent(
    "reset",
    () => {
      clear();
      custom.reset();
    },
    control?.form ?? null,
  );

  return {
    /** For the Field's element: it hears its controls' edits and invalid events. */
    rootProps: { ref: setRoot, onChange: on(edit), onInvalidCapture: reread },
    control,
    register,
    serverError: server,
    failure,
    clearServerError: clear,
    report: (node: FormControl, message: string | undefined) => {
      custom.report(node, message);
      revalidate(server);
    },
    commit: (node: FormControl) => {
      custom.commit(node);
      edit();
    },
  };
}
