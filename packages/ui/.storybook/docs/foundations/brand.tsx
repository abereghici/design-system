import { Logo } from "@platform/ui/logo";
import { cssVar, Rules, Section, Swatch, TokenTable } from "./docs.tsx";
import styles from "./docs.module.css";
import { tokens, type Token } from "./tokens.ts";

export function Principles() {
  return (
    <Section title="Principles">
      <Rules
        items={[
          [
            "1 · Accessible by construction",
            "Every color pairing the roles permit must meet WCAG 2.2 AA, in every theme.",
          ],
          [
            "2 · Semantic first",
            "Product code expresses intent (text-subtle), never a raw value (palette-sage-700).",
          ],
          [
            "3 · Predictable names",
            "Tier 1 names state the value. Tiers 2 and 3 use only words defined in the dictionary.",
          ],
          [
            "4 · Rationed color",
            "Surfaces are neutral. Color signals action, state and one highlight per page.",
          ],
          [
            "5 · Flat in flow, lifted when floating",
            "In-flow content separates with space, hairlines and surface steps. Only floating layers (menus, popovers, toasts, dialogs) get elevation and material.",
          ],
          [
            "6 · Purposeful motion",
            "Fast, eased out, interruptible and optional. Springs only for direct manipulation and toggles.",
          ],
          [
            "7 · Keyboard first, pointer friendly",
            "Every action is reachable and discoverable from the keyboard; every control is comfortable by touch.",
          ],
          [
            "8 · Platform before script",
            "Native elements and CSS do the work; script only adds what the platform can't.",
          ],
        ]}
      />
    </Section>
  );
}

export function Direction() {
  return (
    <Section title="Direction">
      <Rules
        items={[
          [
            "Quiet",
            "Neutral surfaces. Color, elevation and motion are spent only where they mean something.",
          ],
          [
            "Compact",
            "Linear-class density on a fine pointer. Under a finger the same controls grow, so no component needs a touch variant.",
          ],
          [
            "Warm, not grey",
            "Moss and lichen in place of blue and grey; even the shadows carry a trace of moss in light.",
          ],
          [
            "Rooted",
            "Moldovan and Romanian folk signs, used as finishing touches rather than decoration (see Personality).",
          ],
          ["Still open", "Brand voice and imagery are not yet defined."],
        ]}
      />
    </Section>
  );
}

const INTERACTION = [
  [
    "Reduce the distance to frequent targets",
    "Fitts's law",
    "Shortcut hints, ⌘K for everything, whole-row hit areas on checks and menu items, large targets on touch",
  ],
  [
    "Cut choices at each step",
    "Hick's law",
    "One primary button per view. Menus group related actions; destructive actions sit last, behind a separator. The command palette pre-selects the best match.",
  ],
  [
    "Respond under 400ms",
    "Doherty threshold",
    "Press feedback is immediate. Interface motion stays short. Spinners only for waits over 400ms.",
  ],
  [
    "Stay where users already are",
    "Jakob's law",
    "⌘K, Esc and arrow-key conventions. Native controls wherever the platform has them.",
  ],
  [
    "Keep the reference point still",
    "Apple HIG",
    "The command palette is top-anchored, so the input never moves. Busy buttons keep their width. Locking scroll never shifts the layout.",
  ],
  [
    "Teach shortcuts in place",
    "Linear, Raycast",
    "Tooltips and menu items show the key, and the palette footer teaches navigation. Nothing requires memorising.",
  ],
  [
    "Validate after intent",
    "NN/g error prevention",
    "Errors show only after interaction. They replace the helper text, never stack on it.",
  ],
  [
    "Prefer undo to confirm",
    "NN/g, Gmail",
    "Reversible actions run immediately and offer Undo in a toast. Dialogs are reserved for irreversible ones.",
  ],
  [
    "One layer closes at a time",
    "Top layer",
    "Esc closes only the topmost popover or dialog, then focus returns to its invoker.",
  ],
  [
    "Honour system settings",
    "Apple HIG",
    "Reduced motion, reduced transparency, color scheme and coarse pointers are all respected.",
  ],
] as const;

export function InteractionPrinciples() {
  return (
    <Section
      title="Interaction principles"
      lead="These rules come from Apple's Human Interface Guidelines, Nielsen Norman Group's heuristics, the Laws of UX, the WAI-ARIA Authoring Practices, and close study of Linear, Raycast, Vercel and Things. They govern placement and behaviour in every component."
    >
      <table className={styles["table"]}>
        <caption className={styles["caption"]}>Interaction principles</caption>
        <thead>
          <tr>
            <th scope="col">Principle</th>
            <th scope="col">Basis</th>
            <th scope="col">Applied</th>
          </tr>
        </thead>
        <tbody>
          {INTERACTION.map(([principle, basis, applied]) => (
            <tr key={principle}>
              <th scope="row">{principle}</th>
              <td>{basis}</td>
              <td>{applied}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

export function Personality() {
  return (
    <Section
      title="Personality"
      lead="Moldovan and Romanian folk motifs (the stitched signs of the ie and the carved signs of wood), applied as finishing touches rather than decoration. Every motif is functional, and none is figurative."
    >
      <Rules
        items={[
          [
            "The stave",
            "A single carved upright, as on the shepherd's răboj: the Spinner's turning staves.",
          ],
          [
            "The bob",
            "The grain: the stitched diamond (also called ochi). The radio's selected indicator, the single-choice indicator in menus, the diamond dots in the more, info and warning glyphs, and the optional Separator ornament.",
          ],
          [
            "Carved geometry",
            "Straight cuts, 45° chamfers. Every icon, including the octagonal search, info and danger glyphs. Checks have square ends.",
          ],
          ["Moss and lichen", "Brand green as the primary action, and moss-tinted shadows."],
          [
            "Rule",
            "One motif per surface at most. Keep them out of copy, names and illustrations unless the brand voice later calls for it.",
          ],
        ]}
      />
    </Section>
  );
}

const LOGO_SIZES = [16, 24, 32, 48] as const;

export function LogoSpecimen() {
  return (
    <Section
      title="Logo"
      lead="One color: the interface's Logo color in UI (it follows the Theme), brand moss or brand lichen on imagery."
    >
      <div className={styles["specimens"]}>
        {LOGO_SIZES.map((size) => (
          <Logo key={size} style={{ fontSize: size }} label={`Bereghici Logo, ${size}px`} />
        ))}
      </div>
      <div className={styles["specimens"]}>
        <span
          className={styles["ground"]}
          style={{ backgroundColor: cssVar("color-brand-lichen") }}
        >
          <Logo
            label="Bereghici Logo, brand moss"
            style={{ fontSize: 48, color: cssVar("color-brand-moss") }}
          />
        </span>
        <span className={styles["ground"]} style={{ backgroundColor: cssVar("color-brand-moss") }}>
          <Logo
            label="Bereghici Logo, brand lichen"
            style={{ fontSize: 48, color: cssVar("color-brand-lichen") }}
          />
        </span>
      </div>
    </Section>
  );
}

const swatch = (row: Token) => (row.type === "color" ? <Swatch name={row.name} /> : null);

export function LogoGuidelines() {
  return (
    <Section
      title="Logo"
      lead="Stâlpul cerului, the pillar of the sky. In Romanian folklore a column holds up the sky, and Brâncuși's Endless Column grew out of the carved pillars of village architecture. Here the column is a zigzag, the old sign for lightning, held between two angles. It stands for the link between ground and sky, and a coder also reads it as < / >."
    >
      <Rules
        items={[
          ["Construction", "Straight cuts only, square caps, miter joins."],
          ["Size", "Never below its minimum size."],
          ["Clear space", "Half the Logo's width."],
          [
            "Color",
            "One color. The interface's Logo color in UI; brand moss or brand lichen on imagery.",
          ],
        ]}
      />
      <TokenTable
        caption="Logo tokens"
        rows={[
          ...tokens("component", /^logo-/v),
          ...tokens("semantic", /^(?:size-mark-min|color-brand-(?:moss|lichen))$/v),
        ]}
        preview={swatch}
      />
    </Section>
  );
}

export function IconographyGuidelines() {
  return (
    <Section
      title="Iconography"
      lead="Every icon is cut on a 24-unit grid from straight strokes with 45° chamfers, square caps and miter joins, and takes the color of the text around it. New glyphs follow the same construction."
    >
      <Rules
        items={[
          ["Labels", "Pair every icon with a visible label or an accessible name."],
          ["Hit area", "Icon-only controls keep at least the minimum target size."],
        ]}
      />
      <TokenTable
        caption="Icon tokens"
        rows={[
          ...tokens("component", /^icon-(?:sm|md|lg|xl|color)/v),
          ...tokens("semantic", /^(?:size-icon-|stroke-width-)/v),
        ]}
        preview={swatch}
      />
    </Section>
  );
}
