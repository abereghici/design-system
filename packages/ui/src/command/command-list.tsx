"use client";

import { use } from "react";
import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/command.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import { Listbox } from "../internal/listbox/listbox.tsx";
import { enabled, optionAt } from "../internal/listbox/options.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import { DialogContext, useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

interface Name {
  /** The list's name, such as "Commands". */
  "aria-label"?: string;
  /** The `id` of visible text that names the list. */
  "aria-labelledby"?: string;
}

type Naming = { "aria-label": string } | { "aria-labelledby": string };

export type ListProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby"> &
  Name &
  Naming;

/** The list of Groups and Items, filtered as people type. */
export function List(props: ListProps) {
  const command = useCommand();
  const press = use(DialogContext);

  return (
    <Listbox
      navigator={command.listbox}
      {...mergeProps(
        {
          className: styles["list"],
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
              dispatchFeedback(option, "ab-confirm", { component: "Command", userInitiated: true });
            }
          },
        },
        props,
      )}
      id={command.listId}
    />
  );
}
