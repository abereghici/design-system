import type { ComponentProps } from "react";

export function Header(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}
