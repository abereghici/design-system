import type { ButtonHTMLAttributes } from "react";

// Invoker commands are Baseline but not yet in @types/react.
declare module "react" {
  interface ButtonHTMLAttributes<T> {
    command?: string | undefined;
    commandfor?: string | undefined;
  }
}

/** A button's invoker commands: the element it controls (`commandfor`) and what it asks of it (`command`). */
export type InvokerCommands = Pick<ButtonHTMLAttributes<HTMLElement>, "command" | "commandfor">;
