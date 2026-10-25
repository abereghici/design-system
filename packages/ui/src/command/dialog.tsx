"use client";

import { useState } from "react";
import type { ComponentProps, RefObject, SyntheticEvent } from "react";

import { Content, ModalRoot } from "../dialog/modal.tsx";
import { requestChange } from "../events/events.ts";
import { useLabels } from "../provider/locale.tsx";
import { command as commandLabels } from "../provider/locales/en-US/command.ts";

import { DialogContext, Root } from "./root.tsx";
import type { Callback, RootProps } from "./root.tsx";
import styles from "./command.module.css";

type Reason = "outside-press" | "escape-key" | "item-press" | "none";

export interface DialogProps
  extends
    Omit<ComponentProps<"dialog">, "open" | "id">,
    Pick<RootProps, "inputValue" | "defaultInputValue" | "onInputValueChange" | "filter"> {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Called before the change commits; `details.cancel()` keeps the dialog as it is. */
  onOpenChange?: Callback<boolean, Reason>;
  /** The app's opener (the ⌘K button), focused on close when the browser would leave focus on `<body>`. */
  finalFocus?: RefObject<HTMLElement | null>;
  /** Overrides the Provider's locale for the dialog's accessible name. */
  labels?: { dialog?: string };
}

function handleClose(
  event: SyntheticEvent<HTMLDialogElement>,
  { onClose, onInputValueChange, finalFocus }: DialogProps,
) {
  onClose?.(event);
  if ((event.currentTarget.querySelector("input")?.value ?? "") !== "") {
    requestChange(onInputValueChange, "", "input-clear", event.nativeEvent);
  }
  if (document.activeElement === document.body && finalFocus?.current?.isConnected === true) {
    finalFocus.current.focus();
  }
}

/** The ⌘K palette: a top-anchored modal Command. The app binds ⌘K / Ctrl K and holds `open`. */
export function Dialog(props: DialogProps) {
  const { open, defaultOpen = false, onOpenChange, finalFocus: _, labels, ...rest } = props;
  const { inputValue, defaultInputValue, onInputValueChange, filter, children, ...native } = rest;
  const [own, setOwn] = useState(defaultOpen);
  const [closes, setCloses] = useState(0);
  const close = (reason: Exclude<Reason, "none">, event: Event) => {
    const accepted = requestChange(onOpenChange, false, reason, event);
    if (accepted) setOwn(false);
    return accepted;
  };
  return (
    <ModalRoot
      open={open ?? own}
      styles={styles}
      component="Dialog"
      onOpenChange={(_open, details) => {
        const { reason, event } = details;
        if ((reason === "outside-press" || reason === "escape-key") && !close(reason, event))
          details.cancel();
      }}
    >
      <Content
        aria-label={useLabels("command", commandLabels, labels).dialog}
        {...native}
        onClose={(event) => {
          handleClose(event, props);
          setCloses((count) => count + 1);
        }}
      >
        <DialogContext
          value={(event, option) => {
            if (close("item-press", event)) option.closest("dialog")?.close();
          }}
        >
          <Root
            key={closes}
            inputValue={inputValue}
            defaultInputValue={closes === 0 ? defaultInputValue : ""}
            onInputValueChange={onInputValueChange}
            filter={filter}
          >
            {children}
          </Root>
        </DialogContext>
      </Content>
    </ModalRoot>
  );
}
