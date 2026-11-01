import { useEffect, useEffectEvent } from "react";

type EventMap = GlobalEventHandlersEventMap;

interface Listenable {
  addEventListener<Type extends keyof EventMap>(
    type: Type,
    listener: (event: EventMap[Type]) => void,
    options: AddEventListenerOptions,
  ): void;
}

/**
 * Where `useEvent` listens: a target, or a function that finds it once, after mount (`document`
 * doesn't exist during server rendering; a control's `form` only once it is in the DOM). `null`
 * listens nowhere.
 */
export type EventTargetSource = Listenable | (() => Listenable | null | undefined) | null;

/** Finds `document` after mount. */
export const getDocument = () => document;

/**
 * Listens to `type` on `target` while mounted, as react-use's `useEvent` does; `handler` always
 * sees the latest render, so a new handler doesn't re-subscribe.
 */
export function useEvent<Type extends keyof EventMap>(
  type: Type,
  handler: (event: EventMap[Type]) => void,
  target: EventTargetSource,
  capture = false,
) {
  const listener = useEffectEvent(handler);
  const find = useEffectEvent(() => (typeof target === "function" ? target() : target));
  const fixed = typeof target === "function" ? undefined : target;

  useEffect(() => {
    const controller = new AbortController();

    (fixed ?? find())?.addEventListener(
      type,
      (event) => {
        listener(event);
      },
      { capture, signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, [type, fixed, capture]);
}
