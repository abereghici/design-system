import { useEffect, useState } from "react";

import { mark, progressOf } from "../toast/toast.ts";
import type { ToastRecord } from "../toast/toast.ts";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

function useAnnounced(toasts: readonly ToastRecord[]) {
  const [heard, setHeard] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const fresh = toasts.filter(({ id }) => progressOf(id).announced !== true).map(({ id }) => id);
    // A live region announces changes, not content it was inserted with: fill it a task later:
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
    const timer = setTimeout(() => {
      for (const id of fresh) mark(id, { announced: true });

      if (fresh.length > 0) setHeard((ids) => ids.union(new Set(fresh)));
    });

    return () => {
      clearTimeout(timer);
    };
  }, [toasts]);

  return heard;
}

function Region({ toasts, assertive }: { toasts: readonly ToastRecord[]; assertive: boolean }) {
  return (
    <VisuallyHidden asChild>
      <div role={assertive ? "alert" : "status"} aria-atomic="false">
        {toasts
          .filter(({ variant }) => (variant === "danger") === assertive)
          .map(({ id, title, description }) => (
            <p key={id}>{description === undefined ? title : `${title} ${description}`}</p>
          ))}
      </div>
    </VisuallyHidden>
  );
}

/** Reads each toast once to screen readers: danger ones assertively, the rest politely. */
export function Announcer({ toasts }: { toasts: readonly ToastRecord[] }) {
  const heard = useAnnounced(toasts);
  const announced = toasts.filter(({ id }) => heard.has(id));

  return (
    <>
      <Region toasts={announced} assertive={false} />
      <Region toasts={announced} assertive />
    </>
  );
}
