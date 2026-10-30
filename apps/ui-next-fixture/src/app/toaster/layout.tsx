import type { ReactNode } from "react";

import { Toaster } from "@abereghici/ui/toaster";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <Toaster aria-label="Notifications" closeLabel="Dismiss" />
    </>
  );
}
