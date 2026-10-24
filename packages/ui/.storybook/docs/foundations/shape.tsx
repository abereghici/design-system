import { cssVar, InEachTheme, Rules, Section, TokenTable } from "./docs.tsx";
import styles from "./shape.module.css";
import { field, resolve, token, tokens, type Token } from "./tokens.ts";

const px = (tier: "semantic" | "component", name: string): number => {
  const resolved = resolve(token(tier, name).value, "light");
  const value = field(resolved, "value");
  if (typeof value !== "number") throw new Error(`${name} is not a px dimension`);
  return value;
};

const bar = (row: Token) => (
  <span aria-hidden="true" className={styles["bar"]} style={{ "--bar": cssVar(row.name) }} />
);

export function Space() {
  return (
    <>
      <Section
        title="Space"
        lead="In-flow content separates with space, hairlines and surface steps. Inline is a horizontal gap, inset is padding, stack is a vertical gap, section is the gap between page sections."
      >
        <TokenTable caption="Semantic space" rows={tokens("semantic", /^space-/v)} preview={bar} />
      </Section>
      <Section
        title="Size"
        lead="Compact on a fine pointer. Under a finger the same controls grow, so no component needs a touch variant."
      >
        <TokenTable caption="Sizes" rows={tokens("semantic", /^size-/v)} preview={bar} />
      </Section>
      <Section title="Layout">
        <TokenTable caption="Layout" rows={tokens("semantic", /^(?:layout|breakpoint)-/v)} />
      </Section>
    </>
  );
}

const corner = (row: Token) => (
  <span aria-hidden="true" className={styles["corner"]} style={{ "--corner": cssVar(row.name) }} />
);

const CONCENTRIC = [
  [
    "DropdownMenu → item",
    "dropdown-menu-border-radius",
    "dropdown-menu-padding",
    "dropdown-menu-item-border-radius",
  ],
  [
    "ContextMenu → item",
    "context-menu-border-radius",
    "context-menu-padding",
    "context-menu-item-border-radius",
  ],
  [
    "SegmentedControl → indicator",
    "segmented-control-border-radius",
    "segmented-control-padding",
    "segmented-control-item-border-radius",
  ],
  ["Command → item", "command-border-radius", "command-list-padding", "command-item-border-radius"],
] as const;

export function Radius() {
  return (
    <>
      <Section title="Radius">
        <TokenTable caption="Radius" rows={tokens("semantic", /^radius-/v)} preview={corner} />
      </Section>
      <Section
        title="Concentric radius"
        lead="Nested corners share a centre: inner radius = outer radius − the padding between them. Use the pair that satisfies the equation; never eyeball it."
      >
        <table className={styles["concentric"]}>
          <caption>Concentric pairs</caption>
          <thead>
            <tr>
              <th scope="col">Nesting</th>
              <th scope="col">Outer − padding = inner</th>
              <th scope="col">Rule</th>
            </tr>
          </thead>
          <tbody>
            {CONCENTRIC.map(([label, outer, padding, inner]) => {
              const [o, p, i] = [
                px("component", outer),
                px("component", padding),
                px("component", inner),
              ];
              return (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>
                    <span className={styles["equation"]}>{`${o} − ${p} = ${i}`}</span>
                    <code className={styles["names"]}>
                      --ab-{outer} − --ab-{padding} = --ab-{inner}
                    </code>
                  </td>
                  <td>{o - p === i ? "Holds" : `Broken: ${o} − ${p} is ${o - p}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    </>
  );
}

const elevated = (row: Token) => (
  <InEachTheme>
    <span
      aria-hidden="true"
      className={styles["elevated"]}
      style={{ "--elevation": cssVar(row.name) }}
    />
  </InEachTheme>
);

export function Elevation() {
  return (
    <>
      <Section
        title="Elevation"
        lead="Flat in flow, lifted when floating. Only floating layers (menus, popovers, toasts, dialogs) get elevation and material."
      >
        <Rules
          items={[
            [
              "1 · Hairline ring",
              "Separates the layer on any background, including from other floating layers.",
            ],
            ["2 · Inner highlight", "A top highlight shows in dark only."],
            ["3 · Soft shadow", "Tinted with moss in light, so it reads as warm, not grey."],
          ]}
        />
        <TokenTable
          caption="Elevation"
          rows={tokens("semantic", /^elevation-(?:raised|overlay|toast|modal)$/v)}
          preview={elevated}
        />
        <TokenTable
          caption="Elevation layers and shadow colors"
          rows={[
            ...tokens("semantic", /^elevation-(?:ring|highlight)$/v),
            ...tokens("semantic", /^color-shadow-/v),
          ]}
        />
      </Section>
      <Section title="Stacking" lead="Stacking order, lowest to highest.">
        <TokenTable caption="Layers" rows={tokens("semantic", /^z-index-/v)} />
      </Section>
    </>
  );
}

const material = (row: Token) => {
  const thickness = row.name.replace("color-material-", "");
  return (
    <InEachTheme>
      <span aria-hidden="true" className={styles["backdrop"]}>
        <span
          className={styles["material"]}
          style={{
            "--material": cssVar(row.name),
            "--material-blur": cssVar(`material-blur-${thickness}`),
            "--material-saturate": cssVar(`material-saturate-${thickness}`),
          }}
        />
      </span>
    </InEachTheme>
  );
};

export function Material() {
  return (
    <Section
      title="Materials"
      lead="Translucent fills belong only on floating chrome above content, such as menus and the command palette. Never use them for in-flow content, and never for long text. Under reduced transparency every material turns solid."
    >
      <TokenTable
        caption="Material fills"
        rows={tokens("semantic", /^color-material-/v)}
        preview={material}
      />
      <TokenTable caption="Blur and saturation" rows={tokens("semantic", /^material-/v)} />
      <TokenTable caption="Backdrop" rows={tokens("semantic", /^color-backdrop$/v)} />
    </Section>
  );
}
