import type { ReactNode } from "react";

import packageJson from "../../../package.json" with { type: "json" };

import styles from "./prose.module.css";

/** What to do and what to avoid, side by side; write a Markdown list inside each. */
export function Guidance({ children }: { children: ReactNode }) {
  return <div className={styles["guidance"]}>{children}</div>;
}

const verdict = (label: string, className: string | undefined) =>
  function Verdict({ children }: { children: ReactNode }) {
    return (
      <div className={className}>
        <p className={styles["verdict"]}>{label}</p>
        {children}
      </div>
    );
  };

export const Do = verdict("Do", styles["do"]);

export const Dont = verdict("Don’t", styles["dont"]);

/** Lays out a Markdown list of links as cards; write each item as a link and a line on what is there. */
export function LinkCards({ children }: { children: ReactNode }) {
  return <div className={styles["cards"]}>{children}</div>;
}

/** The range of a peer dependency, from the package's own manifest. */
export function Peer({ name }: { name: keyof typeof packageJson.peerDependencies }) {
  return <code>{packageJson.peerDependencies[name]}</code>;
}
