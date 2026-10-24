import { createContext, use, useEffect, useRef } from "react";
import type { ChangeEvent, ChangeEventHandler, FocusEvent, FocusEventHandler } from "react";

import type { ChangeEventDetails as Details } from "../events/events.ts";

/** The native elements a Field validates. */
export type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export interface FieldState {
  readonly controlId: string;
  readonly labelId: string;
  readonly descriptionId: string;
  readonly errorId: string;
  readonly name: string | undefined;
  readonly disabled: boolean;
  readonly invalid: boolean;
  readonly describedBy: string | undefined;
  readonly message: string | undefined;
  readonly validity: ValidityState | undefined;
  readonly setControlId: (id: string) => void;
  readonly describe: (described: boolean) => void;
}

export const FieldContext = createContext<FieldState | undefined>(undefined);

export type ChangeEventDetails<Element extends FormControl = HTMLInputElement> = Details<
  "none",
  ChangeEvent<Element>
>;

export interface ControlBindings<Element extends FormControl> {
  id?: string | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
  "aria-describedby"?: string | undefined;
  onFocus?: FocusEventHandler<Element> | undefined;
  onChange?: ChangeEventHandler<Element> | undefined;
  onValueChange?: ((value: string, details: ChangeEventDetails<Element>) => void) | undefined;
}

function changeEventDetails<Element extends FormControl>(
  event: ChangeEvent<Element>,
): [ChangeEventDetails<Element>, () => boolean] {
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  return [{ reason: "none", event, cancel }, () => cancelled];
}

/**
 * The Field contract for a control: spread the result on the native element. It takes the id,
 * `name`, `disabled` and describedby list from the enclosing Root, sets `aria-invalid` and
 * `aria-disabled`, and calls `onValueChange` with `cancel()`. A disabled control keeps its value;
 * how it blocks input (`readOnly`, key handling) is the control's.
 */
export function useFieldControl<
  Element extends FormControl,
  Props extends ControlBindings<Element>,
>({ id, name, disabled, onFocus, onChange, onValueChange, ...props }: Props) {
  const field = use(FieldContext);
  const previous = useRef("");
  const blocked = disabled === true || field?.disabled === true;
  const setControlId = field?.setControlId;
  useEffect(() => {
    if (id !== undefined) setControlId?.(id);
  }, [id, setControlId]);
  return {
    ...props,
    id: id ?? field?.controlId,
    name: field?.name ?? name,
    "aria-disabled": blocked || undefined,
    "aria-invalid": field?.invalid === true || undefined,
    "aria-describedby": field?.describedBy ?? props["aria-describedby"],
    onFocus: (event: FocusEvent<Element>) => {
      previous.current = event.currentTarget.value;
      onFocus?.(event);
    },
    onChange: (event: ChangeEvent<Element>) => {
      const target = event.currentTarget;
      if (blocked) {
        target.value = previous.current;
        return;
      }
      onChange?.(event);
      const [details, cancelled] = changeEventDetails(event);
      onValueChange?.(target.value, details);
      if (cancelled()) target.value = previous.current;
      previous.current = target.value;
    },
  };
}
