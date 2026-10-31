import type { ReactNode } from "react";

/** A name from `aria-label`, `aria-labelledby` or both, for an element no visible label names. */
export type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string | undefined }
  | { "aria-label"?: string | undefined; "aria-labelledby": string };

/** A visible name in the `Key` prop, such as `label` or `children`, or else an accessible name. */
export type Labelled<Key extends string> =
  | { [Name in Key]: ReactNode }
  | ({ [Name in Key]?: undefined } & AccessibleName);
