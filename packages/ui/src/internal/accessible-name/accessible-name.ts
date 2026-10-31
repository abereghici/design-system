/** A name from `aria-label`, `aria-labelledby` or both, for an element no visible label names. */
export type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };
