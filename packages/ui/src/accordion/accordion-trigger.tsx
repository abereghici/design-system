"use client";

import { use } from "react";

import { DisclosureContext } from "../disclosure/disclosure-root.tsx";
import { Trigger as DisclosureTrigger } from "../disclosure/disclosure-trigger.tsx";
import type { TriggerProps } from "../disclosure/disclosure-trigger.tsx";

export type { TriggerProps };

/** The heading button that opens and closes its Item. */
export function Trigger(props: TriggerProps) {
  if (use(DisclosureContext) === null) {
    throw new Error("Accordion.Trigger must be inside Accordion.Item");
  }

  return <DisclosureTrigger {...props} />;
}
