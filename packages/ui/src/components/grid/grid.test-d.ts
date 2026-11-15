import { expectTypeOf } from "vitest";

import type * as Grid from "./grid.tsx";

// The minimum is a size token, never a length.
expectTypeOf<{ min: "200px" }>().not.toExtend<Grid.RootProps>();

// Columns and areas change only at the breakpoints the tokens define.
expectTypeOf<{ columns: { initial: 1; sm: 2; lg: 4 } }>().toExtend<Grid.RootProps>();
expectTypeOf<{ columns: { xl: 4 } }>().not.toExtend<Grid.RootProps>();
expectTypeOf<{ areas: { wide: readonly ["hero hero"] } }>().not.toExtend<Grid.RootProps>();

const bento = { initial: ["hero", "about"], sm: ["hero hero", "about ."] } as const;

// An Item takes only an area the areas declare.
expectTypeOf<{ area: "about" }>().toExtend<Grid.ItemProps<typeof bento>>();
expectTypeOf<{ area: "contact" }>().not.toExtend<Grid.ItemProps<typeof bento>>();
expectTypeOf<{ area: "." }>().not.toExtend<Grid.ItemProps<typeof bento>>();
