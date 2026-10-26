"use client";

import { createContext, use, useId, useLayoutEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode, RefObject } from "react";

import { Slot, composeRefs, join } from "../slot/slot.tsx";

import { Controller } from "./controller.ts";
import type { ChangeEventDetails, Options, Reason } from "./controller.ts";

export type { ChangeEventDetails, Reason } from "./controller.ts";

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

export interface TriggerProps extends Omit<ComponentProps<"button">, "command" | "commandfor"> {
  /** Makes its one child (a Button or IconButton) the Trigger. */
  asChild?: boolean;
}

export function Trigger({ asChild = false, type = "button", ...props }: TriggerProps) {
  const { id } = useModal();
  const Root = asChild ? Slot : "button";
  return <Root {...props} type={asChild ? undefined : type} commandfor={id} command="show-modal" />;
}

export interface ContentProps extends Omit<ComponentProps<"dialog">, "open" | "id"> {
  /**
   * The element to focus on open instead of the first field, such as the safest button. Use it
   * instead of `autoFocus`, which runs while the dialog is still closed.
   */
  initialFocus?: RefObject<HTMLElement | null>;
}

export function Content({
  initialFocus,
  className,
  ref,
  onBeforeToggle,
  onCancel,
  onClose,
  ...props
}: ContentProps) {
  const { controller, open, onOpenChange, component, ...context } = useModal();
  const dialog = useRef<HTMLDialogElement>(null);
  const options: Options = { open, onOpenChange, component, initialFocus };
  const wanted = open ?? context.defaultOpen;

  useLayoutEffect(() => controller.listen(dialog.current, component), [controller, component]);
  useLayoutEffect(() => {
    controller.sync(dialog.current, wanted);
  }, [controller, wanted]);

  return (
    <dialog
      aria-labelledby={context.titleId}
      aria-describedby={context.descriptionId}
      {...props}
      ref={composeRefs(dialog, ref)}
      id={context.id}
      className={join(context.styles["content"], className)}
      onBeforeToggle={(event) => {
        onBeforeToggle?.(event);
        controller.beforeToggle(event.currentTarget, event.nativeEvent, options);
      }}
      onCancel={(event) => {
        onCancel?.(event);
        controller.cancel(event.currentTarget, event.nativeEvent, options);
      }}
      onClose={(event) => {
        onClose?.(event);
        controller.close(event.currentTarget, event.nativeEvent, options);
      }}
    />
  );
}

function usePresence(set: (present: boolean) => void) {
  useLayoutEffect(() => {
    set(true);
    return () => {
      set(false);
    };
  }, [set]);
}

export interface TitleProps extends ComponentProps<"h2"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

export function Title({ asChild = false, className, ...props }: TitleProps) {
  const { id, setTitle, styles } = useModal();
  usePresence(setTitle);
  const Root = asChild ? Slot : "h2";
  return <Root {...props} id={`${id}-title`} className={join(styles["title"], className)} />;
}

export function Description({ className, ...props }: ComponentProps<"p">) {
  const { id, setDescription, styles } = useModal();
  usePresence(setDescription);
  return (
    <p {...props} id={`${id}-description`} className={join(styles["description"], className)} />
  );
}
