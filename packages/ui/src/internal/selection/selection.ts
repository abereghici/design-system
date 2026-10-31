/** The values as a list: none for `undefined`, `null` or `""`, else one or several. */
export const valuesOf = (value: string | null | ReadonlyArray<string> | undefined) =>
  value === undefined || value === null || value === ""
    ? []
    : typeof value === "string"
      ? [value]
      : value;

/** The list with `item` added, or removed if it was there. */
export const toggled = (list: ReadonlyArray<string>, item: string) =>
  list.includes(item) ? list.filter((each) => each !== item) : [...list, item];
