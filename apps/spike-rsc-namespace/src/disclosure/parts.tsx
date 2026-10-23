"use client";

// SPIKE: a minimal stateful compound component. Each Part is its own named export of a
// `'use client'` module, so each one is its own client reference on the server.
import { createContext, use, useId, useState, type ReactNode } from "react";

interface DisclosureContextValue {
  open: boolean;
  contentId: string;
  toggle: () => void;
}

const DisclosureContext = createContext<DisclosureContextValue | null>(null);

function useDisclosureContext(): DisclosureContextValue {
  const context = use(DisclosureContext);
  if (context === null) {
    throw new Error("Disclosure Parts must be rendered inside Disclosure.Root");
  }
  return context;
}

export function Root({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return (
    <DisclosureContext
      value={{
        open,
        contentId,
        toggle: () => {
          setOpen((previous) => !previous);
        },
      }}
    >
      {children}
    </DisclosureContext>
  );
}

export function Trigger({ children }: { children: ReactNode }) {
  const { open, contentId, toggle } = useDisclosureContext();
  return (
    <button type="button" aria-expanded={open} aria-controls={contentId} onClick={toggle}>
      {children}
    </button>
  );
}

export function Content({ children }: { children: ReactNode }) {
  const { open, contentId } = useDisclosureContext();
  return (
    <div id={contentId} hidden={!open}>
      {children}
    </div>
  );
}
