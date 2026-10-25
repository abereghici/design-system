import { IconButton } from "../icon-button/icon-button.tsx";
import { XIcon } from "../icon/icons/x.tsx";

import styles from "./file-trigger.module.css";

interface SelectionProps {
  readonly names: string[];
  readonly label: string;
  readonly disabled: boolean;
  readonly onClear: () => void;
}

/** The chosen file names, announced as they change, and the Clear IconButton while files are chosen. */
export function Selection({ names, label, disabled, onClear }: SelectionProps) {
  return (
    <span className={styles["selection"]}>
      {/* Always rendered: a live region must exist before its text changes. */}
      <output className={styles["names"]}>{names.join(", ")}</output>
      {names.length > 0 && (
        <IconButton size="sm" aria-label={label} disabled={disabled} onClick={onClear}>
          <XIcon />
        </IconButton>
      )}
    </span>
  );
}
