"use client";

import { useLayoutEffect, useRef } from "react";
import type { ComponentProps, RefObject } from "react";

import { composeRefs, join } from "../slot/slot.tsx";

import type { Options } from "./dialog-controller.ts";
import { useModal } from "./dialog-modal.tsx";

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
