import { expectTypeOf } from "vitest";

import type { OTPFieldProps } from "./otp-field.tsx";

// The code lives in the app's state or the field's, not both.
expectTypeOf<{
  label: "Code";
  value: "4827";
  defaultValue: "4827";
}>().not.toExtend<OTPFieldProps>();
