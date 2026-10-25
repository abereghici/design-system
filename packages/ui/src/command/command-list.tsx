"use client";

import { use } from "react";
import type { ComponentProps, MouseEvent, PointerEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { Listbox, enabled, optionAt } from "../listbox/listbox.tsx";
import { mergeProps } from "../slot/slot.tsx";

import { DialogContext, useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

export function List(props: ComponentProps<"div">) {
  const command = useCommand();
  const press = use(DialogContext);
  return (
    <Listbox
      {...mergeProps(
        {
          ref: command.list,
          className: styles["list"],
          onMouseDown: (event: MouseEvent) => {
            // A press would otherwise move focus to the list, and the Input would lose its caret and keys.
            event.preventDefault();
          },
          onPointerMove: (event: PointerEvent) => {
            const option = optionAt(event.target);
            if (event.pointerType !== "touch" && option !== null && enabled(option))
              command.highlight(option.id);
          },
          onClickCapture: (event: MouseEvent) => {
            const option = optionAt(event.target);
            if (option === null) return;
            if (!enabled(option)) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            press?.(event.nativeEvent, option);
          },
          onClick: (event: MouseEvent) => {
            const option = optionAt(event.target);
            if (option !== null) {
              dispatchFeedback(option, "ab-confirm", { component: "Command", reason: "user" });
            }
          },
        },
        props,
      )}
      id={command.listId}
    />
  );
}
