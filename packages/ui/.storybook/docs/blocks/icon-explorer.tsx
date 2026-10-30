import { useDeferredValue, useState } from "react";
import type { ComponentType } from "react";

import { SegmentedControl } from "@abereghici/ui/segmented-control";
import { Sheet } from "@abereghici/ui/sheet";
import type { IconProps } from "@abereghici/ui/icon";

import { Count, explorer, Search } from "./explorer.tsx";
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
    path: file.slice(file.lastIndexOf("/") + 1, -".tsx".length),
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
    <div className={`sb-unstyled ${explorer["root"]}`}>
      <div className={explorer["filters"]}>
        <Search
          label="Search icons"
          placeholder="Search by name"
          value={query}
          onValueChange={setQuery}
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
      <Count count={shown.length} noun="icon" />
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
