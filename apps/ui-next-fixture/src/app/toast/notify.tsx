"use client";

import { toast } from "@platform/ui/toast";

export function Notify() {
  return (
    <button
      type="button"
      onClick={() => {
        toast({ title: "Link copied" });
      }}
    >
      Copy link
    </button>
  );
}
