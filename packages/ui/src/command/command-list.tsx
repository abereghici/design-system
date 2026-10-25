"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { Listbox, enabled, optionAt } from "../listbox/listbox.tsx";
import { composeRefs, join } from "../slot/slot.tsx";

import { DialogContext, useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

type Naming =
  | {
      /** The list's name, such as "Commands". */
      "aria-label": string;
    }
  | {
      /** The `id` of visible text that names the list. */
      "aria-labelledby": string;
    };

export type ListProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby"> & Naming;

export function List({
  className,
  ref,
  onMouseDown,
  onPointerMove,
  onClickCapture,
  onClick,
  ...props
}: ListProps) {
  const command = useCommand();
  const press = use(DialogContext);
  return (
    <Listbox
      ref={composeRefs(command.list, ref)}
      {...props}
      id={command.listId}
      className={join(styles["list"], className)}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        // A press would otherwise move focus to the list, and the Input would lose its caret and keys.
        event.preventDefault();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const option = optionAt(event.target);
        if (event.pointerType !== "touch" && option !== null && enabled(option))
          command.highlight(option.id);
      }}
      onClickCapture={(event) => {
        onClickCapture?.(event);
        const option = optionAt(event.target);
        if (option === null) return;
        if (!enabled(option)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        press?.(event.nativeEvent, option);
      }}
      onClick={(event) => {
        onClick?.(event);
        const option = optionAt(event.target);
        if (option !== null) {
          dispatchFeedback(option, "ab-confirm", { component: "Command", reason: "user" });
        }
      }}
    />
  );
}
