"use client";

import type { ComponentProps, RefObject } from "react";

import { useField, useFieldControl } from "../field/use-field.ts";
import { composeRefs } from "../internal/compose-refs/compose-refs.ts";
import { useHydrated } from "../internal/hydration/use-hydrated.ts";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import { Selection } from "./file-trigger-selection.tsx";
import type { useFiles } from "./use-files.ts";
import styles from "./file-trigger.module.css";

export type NativeProps = Pick<
  ComponentProps<"input">,
  "accept" | "multiple" | "name" | "required" | "form"
>;

interface InputProps extends NativeProps {
  readonly triggerRef: RefObject<HTMLElement | null>;
  readonly triggerId: string;
  readonly disabled: boolean;
  readonly directory?: boolean;
  readonly clearLabel: string | undefined;
  readonly files: ReturnType<typeof useFiles>;
}

/**
 * The native file input that holds the selection for the form and joins the Field, followed by the
 * chosen file names and a Clear button. Without script it stands in for the trigger, named by it.
 */
export function Input({
  triggerRef,
  triggerId,
  directory = false,
  clearLabel,
  files,
  ...props
}: InputProps) {
  const { field } = useField();
  const bindings = useFieldControl<HTMLInputElement, NativeProps & { disabled: boolean }>(props);
  // The server HTML keeps the input in the tab order and the accessibility tree for when script
  // never runs; once hydrated, the trigger takes over both.
  const hydrated = useHydrated();

  return (
    <>
      <VisuallyHidden asChild>
        <input
          {...bindings}
          {...{ webkitdirectory: directory ? "" : undefined }}
          ref={composeRefs(files.inputRef, bindings.ref)}
          className={styles["input"]}
          type="file"
          tabIndex={hydrated ? -1 : undefined}
          aria-hidden={hydrated || undefined}
          aria-labelledby={field === undefined ? triggerId : `${field.labelId} ${triggerId}`}
          // The input is focusable only so a blocked submit can focus it; focus moves on to the visible trigger.
          onFocus={() => triggerRef.current?.focus()}
          onChange={undefined}
          onInput={(event) => {
            files.show(event.currentTarget.files);
          }}
          onClick={(event) => {
            if (bindings["aria-disabled"] === true) event.preventDefault();
          }}
        />
      </VisuallyHidden>
      <Selection
        names={files.names}
        clearLabel={clearLabel}
        disabled={props.disabled}
        onClear={() => {
          files.assign([]);
          triggerRef.current?.focus();
        }}
      />
    </>
  );
}
