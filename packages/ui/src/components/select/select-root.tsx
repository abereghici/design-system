"use client";

import "@abereghici/tokens/components/select.css";

import type { ComponentProps, KeyboardEvent } from "react";

import { InputBase } from "../../internal/components/input-base/input-base.tsx";
import { pointerMarker } from "../../internal/interactions/pointer-marker.ts";
import { isTypeaheadKey } from "../../internal/selection/typeahead.ts";
import { chain } from "../../internal/utils/chain.ts";
import { composeEventHandlers } from "../../internal/utils/compose-event-handlers.ts";
import { Wrapper, splitWrapperProps } from "../field/field-wrapper.tsx";
import type { Naming, SizedWrapperProps } from "../field/field-wrapper.tsx";
import * as Field from "../field/field.tsx";
import { ChevronDownIcon } from "../icon/icons/chevron-down.tsx";

import styles from "./select.module.css";

export type ChangeEventDetails = Field.ChangeEventDetails<HTMLSelectElement>;

type ControlProps = Omit<
  ComponentProps<"select">,
  "multiple" | "size" | "value" | "defaultValue" | "placeholder"
> & {
  /** The chosen value, when your state holds it; pair it with `onValueChange`. */
  value?: string;
  /** The starting value when it holds its own state. */
  defaultValue?: string;
  /** Called when the user chooses an option. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /** The prompt shown until the user chooses, such as "Choose a region". */
  placeholder?: string | undefined;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
};

export type RootProps = Naming & SizedWrapperProps & ControlProps;

const blocked = (event: KeyboardEvent) =>
  /^(?:Arrow|Page|Home|End|Enter)/v.test(event.key) || isTypeaheadKey(event);

function Control({ placeholder, defaultValue, children, ...props }: ControlProps) {
  const bindings = Field.useFieldControl<HTMLSelectElement, typeof props>(props);
  const disabled = bindings["aria-disabled"] === true;

  return (
    <div className={styles["control"]}>
      <InputBase>
        <select
          {...bindings}
          defaultValue={
            props.value === undefined
              ? (defaultValue ?? (placeholder === undefined ? undefined : ""))
              : undefined
          }
          className={styles["select"]}
          onPointerDown={composeEventHandlers(props.onPointerDown, pointerMarker.onPointerDown)}
          onKeyDown={chain(
            pointerMarker.onKeyDown,
            (event) => {
              if (disabled && blocked(event)) event.preventDefault();
            },
            props.onKeyDown,
          )}
          onMouseDown={chain((event) => {
            if (disabled) event.preventDefault();
          }, props.onMouseDown)}
        >
          {placeholder !== undefined && (
            <option value="" disabled hidden className={styles["placeholder"]}>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      </InputBase>
      <ChevronDownIcon size="sm" className={styles["icon"]} />
    </div>
  );
}

/**
 * Chooses one value from a short, known list (up to about 15 options). Keyboard, typing to jump,
 * autofill and phone pickers work as people expect from any select; browsers that can't style the
 * list show the system one. For a long or searchable list use Combobox; for 2–6 options that should
 * stay visible, RadioGroup.
 *
 * Tier 1: works before hydration.
 */
export function Root(props: RootProps) {
  const [wrapper, control] = splitWrapperProps(props);

  return (
    <Wrapper {...wrapper}>
      <Control {...control} />
    </Wrapper>
  );
}
