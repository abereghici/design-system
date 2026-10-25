"use client";

import { useState } from "react";
import type { ComponentProps, RefObject, SyntheticEvent } from "react";

import { Content, ModalRoot } from "../dialog/modal.tsx";
import { requestChange } from "../events/events.ts";
import { useLabels } from "../ui-provider/locale.tsx";
import { command as commandLabels } from "../ui-provider/locales/en-US/command.ts";

import { DialogContext, Root } from "./root.tsx";
import type { Callback, RootProps } from "./root.tsx";
import styles from "./command.module.css";

type Reason = "outside-press" | "escape-key" | "item-press" | "none";

export interface DialogProps
  extends
    Omit<ComponentProps<"dialog">, "open" | "id">,
    Pick<RootProps, "inputValue" | "defaultInputValue" | "onInputValueChange" | "filter"> {
  /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
  open?: boolean;
  /** Opens it on the first render when it holds its own state. */
  defaultOpen?: boolean;
  /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
  onOpenChange?: Callback<boolean, Reason>;
  /**
   * Your opener (the ⌘K button), which gets focus back on close, so keyboard users keep their
   * place.
   */
  finalFocus?: RefObject<HTMLElement | null>;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
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
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const [closes, setCloses] = useState(0);
  const close = (reason: Exclude<Reason, "none">, event: Event) => {
    const accepted = requestChange(onOpenChange, false, reason, event);
    if (accepted) setUncontrolled(false);
    return accepted;
  };
  return (
    <ModalRoot
      open={open ?? uncontrolled}
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
