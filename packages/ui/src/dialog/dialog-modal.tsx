"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";

import { Controller } from "./dialog-controller.ts";
import type { ChangeEventDetails, Options, Reason } from "./dialog-controller.ts";

export interface RootProps<R extends Reason = Reason> {
  /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
  open?: boolean;
  /** Opens it on the first render when it holds its own state. */
  defaultOpen?: boolean;
  /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
  onOpenChange?: (open: boolean, details: ChangeEventDetails<R>) => void;
  /** The Trigger and Content. */
  children?: ReactNode;
}

interface ModalContextValue extends Omit<Options, "initialFocus"> {
  readonly id: string;
  readonly defaultOpen: boolean;
  readonly styles: Readonly<Record<string, string>>;
  readonly controller: Controller;
}

export const [ModalContext, useModal] = createSafeContext<ModalContextValue>(
  "Dialog.Root, AlertDialog.Root or Sheet.Root",
);

type ModalProps = Omit<RootProps, "onOpenChange"> &
  Pick<ModalContextValue, "styles" | "component"> & {
    // Method syntax stays bivariant, so a narrower reason set fits:
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#strict-function-types
    onOpenChange?(open: boolean, details: ChangeEventDetails): void;
  };

export function Modal(props: ModalProps) {
  const { open, defaultOpen = false, styles, component, children } = props;
  const id = useId();
  const [initial] = useState(defaultOpen);
  const [controller] = useState(() => new Controller());
  const context: ModalContextValue = {
    id,
    open,
    defaultOpen: initial,
    onOpenChange: (next, details) => {
      props.onOpenChange?.(next, details);
    },
    styles,
    component,
    controller,
  };

  return <ModalContext value={context}>{children}</ModalContext>;
}
