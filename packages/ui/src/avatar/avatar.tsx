import type { ComponentProps } from "react";

import { UserIcon } from "../icon/icons/user.tsx";
import { join } from "../slot/slot.tsx";

import styles from "./avatar.module.css";

export { Image } from "./avatar-image.tsx";
export type { ImageProps, LoadingStatus } from "./avatar-image.tsx";

export interface RootProps extends ComponentProps<"span"> {
  /** sm 24 · md 32 px. */
  size?: "sm" | "md";
}

/**
 * A person's picture, with their initials (or a generic glyph) while it loads or when it fails. The
 * Image's `alt` is the avatar's one accessible name, whichever Part shows; the Fallback is never
 * announced. When the name is written beside it, use `alt=""` and `aria-hidden` on Root. For the
 * brand sign, use the Logo.
 */
export function Root({ size = "md", className, ...props }: RootProps) {
  return <span {...props} data-size={size} className={join(styles["root"], className)} />;
}

export interface FallbackProps extends ComponentProps<"span"> {
  /**
   * The person's name, for the initials (first and last word). Never an accessible name: the
   * Fallback is hidden from assistive technology, so name the avatar through the Image's `alt`.
   */
  name?: string;
}

const graphemes = new Intl.Segmenter();
const firstGrapheme = (word = "") => graphemes.segment(word).containing(0)?.segment ?? "";

function initials(name: string) {
  const words = name.split(/\s+/v).filter(Boolean);
  return firstGrapheme(words[0]) + (words.length > 1 ? firstGrapheme(words.at(-1)) : "");
}

export function Fallback({ name, className, children, ...props }: FallbackProps) {
  const text = name === undefined ? "" : initials(name);
  return (
    <span dir="auto" {...props} aria-hidden className={join(styles["fallback"], className)}>
      {children ?? (text === "" ? <UserIcon /> : text)}
    </span>
  );
}
