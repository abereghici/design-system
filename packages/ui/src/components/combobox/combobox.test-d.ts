import { expectTypeOf } from "vitest";

import type * as Combobox from "./combobox.tsx";

// The empty list is announced, so it needs its text.
expectTypeOf<{ label: "Assignee" }>().not.toExtend<Combobox.RootProps>();

// While loading, the list announces its loading text.
expectTypeOf<{
  label: "Assignee";
  noOptionsText: "No results";
  loading: true;
}>().not.toExtend<Combobox.RootProps>();

// Several choices need the label their remove buttons read.
expectTypeOf<{
  label: "Tags";
  noOptionsText: "None";
  selectionMode: "multiple";
}>().not.toExtend<Combobox.RootProps>();

// Either the app holds the choices or the Combobox does, not both.
expectTypeOf<{ selectionMode: "multiple"; value: []; defaultValue: [] }>().not.toExtend<
  Partial<Combobox.RootProps>
>();
