import type { ReactNode } from "react";
import { AnchorMdx } from "@storybook/addon-docs/blocks";

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

/** A grid of LinkCard. */
export function LinkCards({ children }: { children: ReactNode }) {
  return <ul className={`sb-unstyled ${styles["cards"]}`}>{children}</ul>;
}

/** A link to a docs page, `?path=` as in Markdown, and a line on what is there. */
export function LinkCard({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className={styles["card"]}>
      <AnchorMdx href={href} target="_self">
        <span className={styles["title"]}>{title}</span>
      </AnchorMdx>
      {children}
    </li>
  );
}

/** The range of a peer dependency, from the package's own manifest. */
export function Peer({ name }: { name: keyof typeof packageJson.peerDependencies }) {
  return <code>{packageJson.peerDependencies[name]}</code>;
}
