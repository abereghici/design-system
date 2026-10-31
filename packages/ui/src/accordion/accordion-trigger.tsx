"use client";

import { useDisclosure } from "../disclosure/disclosure-root.tsx";
import { Trigger as DisclosureTrigger } from "../disclosure/disclosure-trigger.tsx";
import type { TriggerProps } from "../disclosure/disclosure-trigger.tsx";

export type { TriggerProps };

/** The heading button that opens and closes its Item. */
export function Trigger(props: TriggerProps) {
  useDisclosure("Accordion.Trigger");

  return <DisclosureTrigger {...props} />;
}
