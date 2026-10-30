import type { ComponentType } from "react";
import { Source } from "@storybook/addon-docs/blocks";

import { Button } from "@abereghici/ui/button";
import { Sheet } from "@abereghici/ui/sheet";
import type { IconProps } from "@abereghici/ui/icon";

import { useScheme } from "../../globals.tsx";

import { CopyButton } from "./copy-button.tsx";
import styles from "./icon-explorer.module.css";

export const sizes = ["sm", "md", "lg", "xl"] as const;

export interface Glyph {
  readonly path: string;
  readonly name: string;
  readonly Icon: ComponentType<IconProps>;
}

const importOf = ({ name, path }: Glyph) =>
  `import { ${name} } from "@abereghici/ui/icons/${path}";`;

/** One icon at every size, with the code to use it. */
export function Details({ glyph }: { glyph: Glyph }) {
  const scheme = useScheme();

  return (
    <>
      <Sheet.Title>{glyph.name}</Sheet.Title>
      <Sheet.Description>Decorative unless you give it a label.</Sheet.Description>
      <Sheet.Body>
        <div className={styles["sizes"]}>
          {sizes.map((key) => (
            <figure key={key} className={styles["size"]}>
              <glyph.Icon size={key} />
              <figcaption>{key}</figcaption>
            </figure>
          ))}
        </div>
        <div className={styles["source"]}>
          <Source
            dark={scheme === "dark"}
            language="tsx"
            code={`${importOf(glyph)}\n\n<${glyph.name} size="md" />`}
          />
        </div>
      </Sheet.Body>
      <Sheet.Footer>
        <CopyButton text={importOf(glyph)}>Copy import</CopyButton>
        <Sheet.Close asChild>
          <Button variant="primary">Done</Button>
        </Sheet.Close>
      </Sheet.Footer>
      <Sheet.Close aria-label="Close" />
    </>
  );
}
