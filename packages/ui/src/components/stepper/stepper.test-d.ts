import { expectTypeOf } from "vitest";

import type * as Stepper from "./stepper.tsx";

// A completed step needs the word screen readers announce.
expectTypeOf<{ status: "complete"; children: "Account" }>().not.toExtend<Stepper.StepProps>();
