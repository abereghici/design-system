import type { DetailedHTMLProps, HTMLAttributes } from "react";

// @types/react 19.3 doesn't list the customizable select's <selectedcontent> yet.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      selectedcontent: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
