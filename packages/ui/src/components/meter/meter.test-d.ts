import { expectTypeOf } from "vitest";

import type { MeterProps } from "./meter.tsx";

// Thresholds need a valueLabel that states the judgement in words.
expectTypeOf<{ value: 92; label: "Storage"; high: 90 }>().not.toExtend<MeterProps>();
