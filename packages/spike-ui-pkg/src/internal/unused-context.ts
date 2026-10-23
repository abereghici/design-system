import { createContext } from "react";

// A top-level call, as compound components will have: static analysis alone cannot prove it pure.
export const UnusedContext = createContext("SPIKE_MARKER_INTERNAL_CONTEXT");
