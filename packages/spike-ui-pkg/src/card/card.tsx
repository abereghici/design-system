import type { ReactNode } from "react";

import styles from "./card.module.css";

export function Card({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles["card"]} data-spike-marker="SPIKE_MARKER_CARD">
      {children}
    </div>
  );
}
