"use client";

import { useState } from "react";
import type { ComponentProps, SyntheticEvent } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./avatar.module.css";

export type LoadingStatus = "loading" | "loaded" | "error";

export interface ImageProps extends ComponentProps<"img"> {
  /** The person's name, or `""` when the name is written beside the avatar. */
  alt: string;
  onLoadingStatusChange?: (status: LoadingStatus) => void;
}

export function Image({
  src,
  alt,
  ref,
  className,
  onLoad,
  onError,
  onLoadingStatusChange,
  ...props
}: ImageProps) {
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
    if (typeof ref === "function") return ref(image);
    if (ref !== undefined && ref !== null) ref.current = image;
  }

  return (
    <img
      {...props}
      ref={attach}
      src={src}
      alt={alt}
      data-loading={status === "loading" || undefined}
      data-error={status === "error" || undefined}
      className={join(styles["image"], className)}
      onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
        settle("loaded");
        onLoad?.(event);
      }}
      onError={(event: SyntheticEvent<HTMLImageElement>) => {
        settle("error");
        onError?.(event);
      }}
    />
  );
}
