import { expectTypeOf } from "vitest";

import type { ToasterProps } from "./toaster.tsx";

// The region is a landmark, so it needs a name.
expectTypeOf<{ closeLabel: "Dismiss" }>().not.toExtend<ToasterProps>();

// Each toast's close button shows only an icon, so it needs a name.
expectTypeOf<{ "aria-label": "Notifications" }>().not.toExtend<ToasterProps>();
