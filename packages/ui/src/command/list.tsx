"use client";

import { use, useId } from "react";
import type { ComponentProps } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { Listbox, Option, enabled, optionAt } from "../listbox/listbox.tsx";
import { composeRefs, join } from "../slot/slot.tsx";

import { DialogContext, useCommand } from "./root.tsx";
import styles from "./command.module.css";

export function List({
  className,
  ref,
  onMouseDown,
  onPointerMove,
  onClickCapture,
  ...props
}: ComponentProps<"div">) {
  const command = useCommand();
  const press = use(DialogContext);
  return (
    <Listbox
      {...props}
      ref={composeRefs(command.list, ref)}
      id={command.listId}
      className={join(styles["list"], className)}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        // Keeps DOM focus, and the caret, in the Input.
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
        dispatchFeedback(option, "ab-confirm", { component: "Command", reason: "user" });
      }}
    />
  );
}

export interface GroupProps extends ComponentProps<"fieldset"> {
  /** The visible heading, and the group's accessible name. */
  heading: string;
}

export function Group({ heading, className, children, ...props }: GroupProps) {
  const id = useId();
  return (
    <fieldset aria-labelledby={id} {...props} className={join(styles["group"], className)}>
      <div id={id} aria-hidden="true" className={styles["heading"]}>
        {heading}
      </div>
      {children}
    </fieldset>
  );
}

export interface ItemProps extends ComponentProps<"div"> {
  /** The text the query is ranked against. Defaults to the Item's text without its Kbd. */
  value?: string;
  /** Extra words that match the query; not displayed. */
  keywords?: readonly string[];
  /** Shown, but never highlighted or run. */
  disabled?: boolean;
}

export function Item({ value, keywords = [], disabled = false, className, ...props }: ItemProps) {
  const { highlighted } = useCommand();
  const id = useId();
  return (
    <Option
      {...props}
      id={id}
      aria-selected={highlighted === id || undefined}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted === id || undefined}
      data-label={value}
      data-keywords={keywords.length === 0 ? undefined : keywords.join("\n")}
      className={join(styles["item"], className)}
    />
  );
}
