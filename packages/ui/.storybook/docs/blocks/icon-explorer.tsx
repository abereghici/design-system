import { useDeferredValue, useState } from "react";
import type { ComponentType } from "react";

import { SearchIcon } from "@abereghici/ui/icons/search";
import { SegmentedControl } from "@abereghici/ui/segmented-control";
import { Sheet } from "@abereghici/ui/sheet";
import { TextField } from "@abereghici/ui/text-field";
import type { IconProps } from "@abereghici/ui/icon";

import { Details, sizes } from "./icon-details.tsx";
import type { Glyph } from "./icon-details.tsx";
import styles from "./icon-explorer.module.css";

type Size = (typeof sizes)[number];

const icons: readonly Glyph[] = Object.entries(
  import.meta.glob<Record<string, ComponentType<IconProps>>>("../../../src/icon/icons/*.tsx", {
    eager: true,
  }),
).flatMap(([file, module]) =>
  Object.entries(module).map(([name, Icon]) => ({
    path: file.split("/").at(-1)?.replace(".tsx", "") ?? "",
    name,
    Icon,
  })),
);

function Grid({
  icons: shown,
  size,
  onSelect,
}: {
  icons: readonly Glyph[];
  size: Size;
  onSelect: (glyph: Glyph) => void;
}) {
  return (
    <ul className={styles["grid"]}>
      {shown.map((glyph) => (
        <li key={glyph.name}>
          <button
            type="button"
            className={styles["tile"]}
            onClick={() => {
              onSelect(glyph);
            }}
          >
            <glyph.Icon size={size} />
            <span className={styles["name"]}>{glyph.path}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Searches every icon in `@abereghici/ui/icons`, and gives the import for the one selected. */
export function IconExplorer() {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<Size>("lg");
  const [selected, setSelected] = useState<Glyph>();
  const search = useDeferredValue(query.trim().toLowerCase().replaceAll(" ", "-"));
  const shown = icons.filter(({ path }) => path.includes(search));

  return (
    <div className={`sb-unstyled ${styles["root"]}`}>
      <div className={styles["filters"]}>
        <TextField
          aria-label="Search icons"
          type="search"
          placeholder="Search by name"
          startElement={<SearchIcon size="sm" />}
          value={query}
          onValueChange={setQuery}
          className={styles["search"]}
        />
        <SegmentedControl.Root
          aria-label="Size"
          value={size}
          onValueChange={(value) => {
            setSize(sizes.find((key) => key === value) ?? "lg");
          }}
        >
          {sizes.map((key) => (
            <SegmentedControl.Item key={key} value={key}>
              {key}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </div>
      <output className={styles["count"]}>
        {shown.length === 1 ? "1 icon" : `${shown.length} icons`}
      </output>
      <Grid icons={shown} size={size} onSelect={setSelected} />
      <Sheet.Root
        open={selected !== undefined}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined);
        }}
      >
        <Sheet.Content>{selected && <Details glyph={selected} />}</Sheet.Content>
      </Sheet.Root>
    </div>
  );
}
