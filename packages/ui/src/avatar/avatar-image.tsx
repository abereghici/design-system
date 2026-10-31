"use client";

import { useCallback, useState } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/avatar.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./avatar.module.css";

export type LoadingStatus = "loading" | "loaded" | "error";

export interface ImageProps extends ComponentProps<"img"> {
  /** The person's name, or `""` when the name is written beside the avatar. */
  alt: string;
  /** Called as the photo starts loading, loads or fails, so you can show your own state. */
  onLoadingStatusChange?: (status: LoadingStatus) => void;
}

/** The photo; the Fallback shows until it loads or if it fails. */
export function Image({ src, alt, onLoadingStatusChange, ...props }: ImageProps) {
  const [status, setStatus] = useState<LoadingStatus>("loading");

  // The parent hears of each status where it is set, not from an Effect:
  // https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes
  const settle = useCallback(
    (next: LoadingStatus) => {
      setStatus(next);
      onLoadingStatusChange?.(next);
    },
    [onLoadingStatusChange],
  );
  // A new src makes a new ref, so each photo reports from "loading" again, before paint.
  const attach = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return;

      // Without a src there is nothing to load, as in Radix Avatar.
      if (src === undefined || src === "") settle("error");
      // The image may have settled before hydration attached the load and error listeners:
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/complete
      else if (image.complete) settle(image.naturalWidth > 0 ? "loaded" : "error");
      else settle("loading");
    },
    [src, settle],
  );

  return (
    <img
      {...mergeProps(
        {
          ref: attach,
          className: styles["image"],
          onLoad: () => {
            settle("loaded");
          },
          onError: () => {
            settle("error");
          },
        },
        props,
      )}
      src={src}
      alt={alt}
      data-loading={status === "loading" ? "" : undefined}
      data-error={status === "error" ? "" : undefined}
    />
  );
}
