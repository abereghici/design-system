"use client";

import { createContext, use, useId, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

import { Controller } from "./dialog-controller.ts";
import type { ChangeEventDetails, Options, Reason } from "./dialog-controller.ts";

export interface RootProps<R extends Reason = Reason> {
  /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
  open?: boolean;
  /** Opens it on the first render when it holds its own state. */
  defaultOpen?: boolean;
  /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
  onOpenChange?(open: boolean, details: ChangeEventDetails<R>): void;
  /** The Trigger and Content. */
  children?: ReactNode;
}

interface ModalContext extends Omit<Options, "initialFocus"> {
  readonly id: string;
  readonly titleId: string | undefined;
  readonly descriptionId: string | undefined;
  readonly setTitle: (present: boolean) => void;
  readonly setDescription: (present: boolean) => void;
  readonly defaultOpen: boolean;
  readonly styles: Readonly<Record<string, string>>;
  readonly controller: Controller;
}

const Context = createContext<ModalContext | null>(null);

export function useModal(): ModalContext {
  const context = use(Context);
  if (context === null) throw new Error("Dialog parts must be inside their Root");
  return context;
}

export function ModalRoot(props: RootProps & Pick<ModalContext, "styles" | "component">) {
  const { open, defaultOpen = false, styles, component, children } = props;
  const id = useId();
  const [title, setTitle] = useState(false);
  const [description, setDescription] = useState(false);
  const [initial] = useState(defaultOpen);
  const [controller] = useState(() => new Controller());
  const context: ModalContext = {
    id,
    titleId: title ? `${id}-title` : undefined,
    descriptionId: description ? `${id}-description` : undefined,
    setTitle,
    setDescription,
    open,
    defaultOpen: initial,
    onOpenChange: (next, details) => {
      props.onOpenChange?.(next, details);
    },
    styles,
    component,
    controller,
  };
  return <Context value={context}>{children}</Context>;
}

export function usePresence(set: (present: boolean) => void) {
  useLayoutEffect(() => {
    set(true);
    return () => {
      set(false);
    };
  }, [set]);
}
