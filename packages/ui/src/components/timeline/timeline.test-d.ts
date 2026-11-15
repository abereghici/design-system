import { expectTypeOf } from "vitest";

import type * as Timeline from "./timeline.tsx";

// How far it has been reached is a position, not a flag.
expectTypeOf<{ active: true }>().not.toExtend<Timeline.RootProps>();
expectTypeOf<{ active: 2 }>().toExtend<Timeline.RootProps>();
// A marker is any node, such as an icon.
expectTypeOf<{ marker: "◆"; children: "2024" }>().toExtend<Timeline.ItemProps>();
expectTypeOf<{ marker: () => null }>().not.toExtend<Timeline.ItemProps>();
