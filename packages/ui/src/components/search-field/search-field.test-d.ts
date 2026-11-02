import { expectTypeOf } from "vitest";

import type { SearchFieldProps } from "./search-field.tsx";

// The clear button shows only an icon, so it needs a name.
expectTypeOf<{ label: "Search invoices" }>().not.toExtend<SearchFieldProps>();

// The text lives in the app's state or the field's, not both.
expectTypeOf<{
  label: "Q";
  clearLabel: "Clear";
  value: "a";
  defaultValue: "b";
}>().not.toExtend<SearchFieldProps>();
