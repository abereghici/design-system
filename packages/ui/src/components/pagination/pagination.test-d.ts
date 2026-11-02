import { expectTypeOf } from "vitest";

import type { PaginationProps } from "./pagination.tsx";

// The landmark and the Previous and Next buttons need names.
expectTypeOf<{
  page: 1;
  count: 2;
  getPageUrl: (page: number) => string;
}>().not.toExtend<PaginationProps>();
