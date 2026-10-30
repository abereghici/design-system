import { SearchIcon } from "@abereghici/ui/icons/search";
import { TextField } from "@abereghici/ui/text-field";

import styles from "./explorer.module.css";

interface SearchProps {
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
}

/** The explorers' search field. */
export function Search(props: SearchProps) {
  const { label, ...rest } = props;

  return (
    <TextField
      {...rest}
      aria-label={label}
      type="search"
      startElement={<SearchIcon size="sm" />}
      className={styles["search"]}
    />
  );
}

const plural = new Intl.PluralRules("en-US");

/** How many items the filters show, announced as it changes. */
export function Count({ count, noun }: { count: number; noun: string }) {
  return (
    <output className={styles["count"]}>
      {count} {plural.select(count) === "one" ? noun : `${noun}s`}
    </output>
  );
}

export { styles as explorer };
