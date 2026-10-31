import { useRef, useSyncExternalStore } from "react";
import type { ComponentProps } from "react";

import { composeRefs } from "../internal/compose-refs/compose-refs.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { snapshot, subscribe } from "../toast/toast.ts";
import type { ToastRecord } from "../toast/toast.ts";

import { Announcer } from "./toaster-announcer.tsx";
import { Toast } from "./toaster-toast.tsx";
import { useFocusReturn } from "./use-focus-return.ts";
import { useRegion } from "./use-region.ts";
import { useTimers } from "./use-timers.ts";
import styles from "./toaster.module.css";

const none: readonly ToastRecord[] = [];

interface LayerProps extends ComponentProps<"section"> {
  readonly closeLabel: string;
}

/** The region of toasts, with the live regions that read them out. */
export function Layer({ closeLabel, ref, ...props }: LayerProps) {
  const toasts = useSyncExternalStore(subscribe, snapshot, () => none);
  const region = useRef<HTMLElement>(null);
  const focusReturn = useFocusReturn(region);
  const pause = useTimers(region, toasts);

  useRegion(region, toasts);

  const position = (at: number) => toasts.slice(0, at).filter(({ exiting }) => !exiting).length;

  return (
    <>
      <Announcer toasts={toasts} />
      <section
        {...mergeProps(
          mergeProps({ className: styles["region"], ...focusReturn.handlers }, pause),
          props,
        )}
        ref={composeRefs(region, ref)}
        popover="manual"
        tabIndex={-1}
        aria-keyshortcuts="Alt+T"
      >
        <ol className={styles["list"]}>
          {toasts.map((record, at) => (
            <Toast
              key={record.id}
              record={record}
              index={position(at)}
              closeLabel={closeLabel}
              restore={focusReturn.restore}
            />
          ))}
        </ol>
      </section>
    </>
  );
}
