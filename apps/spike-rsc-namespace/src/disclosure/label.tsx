// SPIKE: a Part with no directive and no state, so it stays a Server Component.
// `server-only` makes `next build` fail if this module is ever pulled into the client graph.
import "server-only";
import type { ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return <h2>{children}</h2>;
}
