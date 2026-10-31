import { expectTypeOf } from "vitest";

import type { PasswordFieldProps } from "./password-field.tsx";

// The show-password toggle shows only an icon, so it needs a name.
expectTypeOf<{ label: "Password" }>().not.toExtend<PasswordFieldProps>();
