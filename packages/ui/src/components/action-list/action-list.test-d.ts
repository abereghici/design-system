import { expectTypeOf } from "vitest";

import type * as ActionList from "./action-list.tsx";

// A row goes somewhere: its href, or its router link's with asChild.
expectTypeOf<{ href: "/posts"; children: "Posts" }>().toExtend<ActionList.LinkItemProps>();
expectTypeOf<{ children: "Posts" }>().not.toExtend<ActionList.LinkItemProps>();
expectTypeOf<{ asChild: true; children: "Posts" }>().toExtend<ActionList.LinkItemProps>();
expectTypeOf<{ asChild: false; children: "Posts" }>().not.toExtend<ActionList.LinkItemProps>();
// Parts are plain elements that take their own props.
expectTypeOf<{ id: "handle"; children: "@abereghici" }>().toExtend<ActionList.DescriptionProps>();
expectTypeOf<{ href: "/" }>().not.toExtend<ActionList.LeadingVisualProps>();
