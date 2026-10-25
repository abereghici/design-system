"use client";

import { useState } from "react";
import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./avatar.module.css";

export type LoadingStatus = "loading" | "loaded" | "error";

export interface ImageProps extends ComponentProps<"img"> {
  /** The person's name, or `""` when the name is written beside the avatar. */
  alt: string;
  onLoadingStatusChange?: (status: LoadingStatus) => void;
}

export function Image({ src, alt, onLoadingStatusChange, ...props }: ImageProps) {
  const [status, setStatus] = useState<LoadingStatus>("loading");
  const [currentSrc, setCurrentSrc] = useState(src);
  if (src !== currentSrc) {
    setCurrentSrc(src);
    setStatus("loading");
  }

  function settle(next: LoadingStatus) {
    if (next === status) return;
    setStatus(next);
    onLoadingStatusChange?.(next);
  }

  function attach(image: HTMLImageElement | null) {
    // The image may have settled before hydration attached the load and error listeners.
    if (image?.complete === true) settle(image.naturalWidth > 0 ? "loaded" : "error");
  }

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
