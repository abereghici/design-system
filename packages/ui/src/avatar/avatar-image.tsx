"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import type { ComponentProps, SyntheticEvent } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./avatar.module.css";

export type LoadingStatus = "loading" | "loaded" | "error";

export interface ImageProps extends ComponentProps<"img"> {
  /** The person's name, or `""` when the name is written beside the avatar. */
  alt: string;
  onLoadingStatusChange?: (status: LoadingStatus) => void;
}

function useLoadingStatus(src: ImageProps["src"], onChange: ImageProps["onLoadingStatusChange"]) {
  const [status, setStatus] = useState<LoadingStatus>("loading");
  const [currentSrc, setCurrentSrc] = useState(src);
  if (src !== currentSrc) {
    setCurrentSrc(src);
    setStatus("loading");
  }
  const report = useEffectEvent((next: LoadingStatus) => onChange?.(next));
  useEffect(() => {
    report(status);
  }, [status]);
  return [status, setStatus] as const;
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
  const [status, setStatus] = useLoadingStatus(src, onLoadingStatusChange);
  const attach = useCallback(
    (image: HTMLImageElement | null) => {
      // The image may have settled before hydration attached the load and error listeners.
      if (image?.complete === true) setStatus(image.naturalWidth > 0 ? "loaded" : "error");
      if (typeof ref === "function") return ref(image);
      if (ref !== undefined && ref !== null) ref.current = image;
    },
    [ref, setStatus],
  );

  return (
    <img
      {...props}
      ref={attach}
      src={src}
      alt={alt}
      data-loading={status === "loading" ? "" : undefined}
      data-error={status === "error" ? "" : undefined}
      className={join(styles["image"], className)}
      onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
        setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event: SyntheticEvent<HTMLImageElement>) => {
        setStatus("error");
        onError?.(event);
      }}
    />
  );
}
