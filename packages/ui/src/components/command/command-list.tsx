"use client";

import "@abereghici/tokens/components/command.css";

import { use } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { Listbox } from "../../internal/components/listbox/listbox.tsx";
import { enabled, optionAt } from "../../internal/components/listbox/options.ts";
import type { AccessibleName } from "../../internal/types/accessible-name.ts";
import { dispatchFeedback } from "../../internal/utils/dispatch-feedback.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";

import { DialogContext, useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

interface Name {
  /** The list's name, such as "Commands". */
  "aria-label"?: string;
  /** The `id` of visible text that names the list. */
  "aria-labelledby"?: string;
}

export type ListProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby"> &
  Name &
  AccessibleName;

/** The list of Groups and Items, filtered as people type. */
export function List(props: ListProps) {
  const command = useCommand("Command.List");
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
