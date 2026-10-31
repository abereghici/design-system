import { createContext, use, useRef } from "react";
import type {
  ChangeEvent,
  ChangeEventHandler,
  FocusEvent,
  FocusEventHandler,
  Ref,
  RefCallback,
} from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { composeRefs } from "../internal/slot/slot.tsx";

/** The native elements a Field validates. */
export type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type Validate = (value: string, formData: FormData) => string | null | undefined;

interface FieldState {
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
  readonly clearServerError: () => void;
  /** The first control's element, once it is mounted. */
  readonly control: FormControl | null;
  /** Each control's ref: the Field finds its elements, the first one's id and their form through it. */
  readonly register: RefCallback<FormControl>;
  /**
   * A composite control's own check, once it has written a new value to its native element: the
   * message, or `undefined` when the value passes.
   */
  readonly report: (control: FormControl, message: string | undefined) => void;
  /** A composite control's value, changed and committed by the user: its error shows from now on. */
  readonly commit: (control: FormControl) => void;
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
  ref?: Ref<Element> | undefined;
  onFocus?: FocusEventHandler<Element> | undefined;
  onChange?: ChangeEventHandler<Element> | undefined;
  onValueChange?: ((value: string, details: ChangeEventDetails<Element>) => void) | undefined;
}

/**
 * The enclosing Field for any control, a composite one included (segments, a trigger, a drop
 * area): its state, whether the control is blocked (its own `disabled` or the Field's), and its
 * `aria-invalid`.
 */
export function useField(disabled?: boolean) {
  const field = use(FieldContext);

  return {
    field,
    blocked: disabled === true || field?.disabled === true,
    invalid: field?.invalid === true || undefined,
  };
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
>({ id, name, disabled, ref, onFocus, onChange, onValueChange, ...props }: Props) {
  const { field, blocked, invalid } = useField(disabled);
  const previous = useRef("");

  return {
    ...props,
    ref: composeRefs<Element>(field?.register ?? null, ref),
    id: id ?? field?.controlId,
    name: field?.name ?? name,
    "aria-disabled": blocked || undefined,
    "aria-invalid": invalid,
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

      if (!requestChange(onValueChange, target.value, "none", event)) {
        target.value = previous.current;
      }

      previous.current = target.value;
    },
  };
}
