import { expectTypeOf } from "vitest";

import type { TextProps } from "./text.tsx";

expectTypeOf<{ as: "h2"; variant: "overline" }>().toExtend<TextProps>();
expectTypeOf<{ as: "section" }>().not.toExtend<TextProps>();

expectTypeOf<{ variant: "data"; size: "lg" }>().toExtend<TextProps>();
expectTypeOf<{ variant: "overline"; size: "lg" }>().not.toExtend<TextProps>();
expectTypeOf<{ variant: "code"; size: "lg" }>().not.toExtend<TextProps>();
