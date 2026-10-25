import type { ReactNode } from "react";

import { Toaster } from "@platform/ui/toaster";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <Toaster aria-label="Notifications" closeLabel="Dismiss" />
    </>
  );
}
