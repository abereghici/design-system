import { Wrapper, splitWrapperProps } from "../field/field-wrapper.tsx";
import type { Naming, SizedWrapperProps } from "../field/field-wrapper.tsx";

import { Control } from "./search-field-control.tsx";
import type { ControlProps } from "./search-field-control.tsx";

export type { SearchFieldChangeEventDetails } from "./search-field-control.tsx";

export type SearchFieldProps = Naming &
  SizedWrapperProps &
  ControlProps &
  ({ value: string; defaultValue?: never } | { value?: never; defaultValue?: string });

/**
 * A TextField for search terms, with a button that clears them. Put its form in a `<search>`
 * element, so screen readers list it as a search landmark.
 *
 * Tier 1: works before hydration, except the clear button (Tier 2), which works after it.
 */
export function SearchField(props: SearchFieldProps) {
  const [wrapper, control] = splitWrapperProps(props);

  return (
    <Wrapper {...wrapper}>
      <Control {...control} />
    </Wrapper>
  );
}
