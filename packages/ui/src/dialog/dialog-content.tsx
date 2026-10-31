"use client";

import { useLayoutEffect, useRef } from "react";
import type {
  ComponentProps,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  RefObject,
  SyntheticEvent,
  ToggleEvent,
} from "react";

import { composeRefs } from "../internal/compose-refs/compose-refs.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import type { Options } from "./dialog-controller.ts";
import { useModal } from "./dialog-modal.tsx";

export interface ContentProps extends Omit<ComponentProps<"dialog">, "open" | "id"> {
  /**
   * The element to focus on open instead of the first field, such as the safest button. Use it
   * instead of `autoFocus`, which runs while the dialog is still closed.
   */
  initialFocus?: RefObject<HTMLElement | null>;
}

/** The modal itself, named by its Title and described by its Description. */
export function Content({ initialFocus, ref, ...props }: ContentProps) {
  const { controller, open, onOpenChange, component, ...context } = useModal("Content");
  const dialog = useRef<HTMLDialogElement>(null);
  const options: Options = { open, onOpenChange, component, initialFocus };
  const wanted = open ?? context.defaultOpen;

  useLayoutEffect(() => {
    controller.sync(dialog.current, wanted);
  }, [controller, wanted]);

  return (
    <dialog
      // Server-rendered, so the dialog is named and described before hydration.
      aria-labelledby={props["aria-label"] === undefined ? `${context.id}-title` : undefined}
      aria-describedby={`${context.id}-description`}
      {...mergeProps(
        {
          className: context.styles["content"],
          onKeyDown: (event: KeyboardEvent<HTMLDialogElement>) => {
            controller.keyDown(event.currentTarget, event.nativeEvent);
          },
          onPointerDown: (event: PointerEvent<HTMLDialogElement>) => {
            controller.pointerDown(event.currentTarget, event.nativeEvent);
          },
          onClick: (event: MouseEvent<HTMLDialogElement>) => {
            controller.click(event.currentTarget, event.nativeEvent, options);
          },
          onBeforeToggle: (event: ToggleEvent<HTMLDialogElement>) => {
            controller.beforeToggle(event.currentTarget, event.nativeEvent, options);
          },
          onCancel: (event: SyntheticEvent<HTMLDialogElement>) => {
            controller.cancel(event.currentTarget, event.nativeEvent, options);
          },
          onClose: (event: SyntheticEvent<HTMLDialogElement>) => {
            controller.close(event.currentTarget, event.nativeEvent, options);
          },
        },
        props,
      )}
      // React forbids reading a ref object during render, so it composes here:
      // https://react.dev/reference/react/useRef#caveats
      ref={composeRefs(dialog, ref)}
      id={context.id}
    />
  );
}
